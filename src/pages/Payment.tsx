import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Smartphone, CheckCircle, AlertTriangle, Copy } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { initiateSTKPush } from '../lib/mpesa';
import { generateInvoiceNumber, downloadInvoice, emailInvoice, updateInvoiceStatus, type InvoiceData } from '../lib/invoice';
import { sendPaymentConfirmationSMS } from '../lib/sms';
import { supabase } from '../lib/supabase';

interface CheckoutData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  notes: string;
  cartItems: any[];
  totalAmount: number;
  orderNumber: string;
  timestamp: string;
  guestToken?: string;
}
type EmailDocumentType = 'invoice' | 'receipt';

const Payment: React.FC = () => {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [mpesaNumber, setMpesaNumber] = useState('');
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceGenerated, setInvoiceGenerated] = useState(false);
  const [documentMessage, setDocumentMessage] = useState('');
  const [failedEmails, setFailedEmails] = useState<Partial<Record<EmailDocumentType, InvoiceData>>>({});
  const [retryingEmail, setRetryingEmail] = useState<EmailDocumentType | null>(null);
  // Removed unused paymentData state

  useEffect(() => {
    const storedData = sessionStorage.getItem('checkoutData');
    if (storedData) {
      const data = JSON.parse(storedData);
      setCheckoutData(data);
      setMpesaNumber(data.phone);
      
      // Keep the same invoice number when the page is refreshed or generation is retried.
      const newInvoiceNumber = sessionStorage.getItem('checkoutInvoiceNumber') || generateInvoiceNumber();
      sessionStorage.setItem('checkoutInvoiceNumber', newInvoiceNumber);
      setInvoiceNumber(newInvoiceNumber);
    } else {
      navigate('/checkout');
    }
  }, [navigate]);

  const generateInvoice = async () => {
    if (!checkoutData) return false;

    try {
      const invoiceData: InvoiceData = {
        invoiceNumber,
        customerName: checkoutData.name,
        customerEmail: checkoutData.email,
        customerPhone: checkoutData.phone,
        customerAddress: `${checkoutData.address}, ${checkoutData.city}`,
        items: checkoutData.cartItems.map(item => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          total: item.product.price * item.quantity,
        })),
        totalAmount: checkoutData.totalAmount,
        status: 'pending' as const,
      };

      // Create the invoice and order together through the idempotent server endpoint.
      const { error: saveError } = await supabase.functions.invoke('create-checkout', {
        body: { invoice: invoiceData, orderNumber: checkoutData.orderNumber, guestToken: checkoutData.guestToken },
      });
      if (saveError) {
        let message = saveError.message || 'Could not save your order';
        try { const responseBody = await saveError.context.json(); message = responseBody.error || message; } catch { /* use the SDK error message */ }
        throw new Error(message);
      }

      try {
        await emailInvoice(invoiceData, 'invoice', checkoutData.guestToken);
        setFailedEmails(current => { const next = { ...current }; delete next.invoice; return next; });
        setDocumentMessage(`Invoice sent to ${checkoutData.email}. Check your inbox and spam folder.`);
      } catch (emailError) {
        console.error('Invoice email failed:', emailError);
        setFailedEmails(current => ({ ...current, invoice: invoiceData }));
        const reason = emailError instanceof Error ? emailError.message : 'unknown email delivery error';
        setDocumentMessage(`Invoice downloaded, but email delivery to ${checkoutData.email} failed: ${reason}`);
      }
      
      // Download invoice PDF
      downloadInvoice(invoiceData, 'invoice');
      
      setInvoiceGenerated(true);
      return true;
    } catch (error) {
      console.error('Failed to generate invoice:', error);
      alert(error instanceof Error ? error.message : 'Could not prepare your order. Please try again.');
      return false;
    }
  };

  const retryDocumentEmail = async (type: EmailDocumentType) => {
    const invoiceData = failedEmails[type];
    if (!invoiceData || !checkoutData) return;
    setRetryingEmail(type);
    try {
      await emailInvoice(invoiceData, type, checkoutData.guestToken);
      setFailedEmails(current => { const next = { ...current }; delete next[type]; return next; });
      setDocumentMessage(`${type === 'receipt' ? 'Receipt' : 'Invoice'} sent to ${checkoutData.email}. Check your inbox and spam folder.`);
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'unknown email delivery error';
      setDocumentMessage(`${type === 'receipt' ? 'Receipt' : 'Invoice'} email failed: ${reason}`);
    } finally {
      setRetryingEmail(null);
    }
  };

  const handlePayment = async () => {
    if (!checkoutData) return;

    setIsProcessing(true);
    
    try {
      if (!invoiceGenerated) {
        const prepared = await generateInvoice();
        if (!prepared) { setIsProcessing(false); return; }
      }
      // Format phone number (remove + and ensure it starts with 254)
      let formattedPhone = mpesaNumber.replace(/\+/g, '');
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '254' + formattedPhone.substring(1);
      }
      if (!formattedPhone.startsWith('254')) {
        formattedPhone = '254' + formattedPhone;
      }

      // Initiate STK Push
      const stkResponse = await initiateSTKPush(
        formattedPhone,
        checkoutData.totalAmount,
        invoiceNumber,
        `Payment for invoice ${invoiceNumber}`,
        checkoutData.guestToken,
      );

      if (stkResponse.ResponseCode === '0') {
        // The server-side PayHero function has already saved the payment record.
        setIsProcessing(false);
        setShowPinPrompt(true);
        
        // Start polling for payment status
        pollPaymentStatus(stkResponse.CheckoutRequestID);
      } else {
        throw new Error(stkResponse.ResponseDescription || 'Failed to initiate payment');
      }
    } catch (error) {
      console.error('Payment initiation failed:', error);
      setIsProcessing(false);
      alert(error instanceof Error ? error.message : 'Failed to initiate payment. Please try again.');
    }
  };

  const pollPaymentStatus = async (checkoutRequestId: string) => {
    // Poll every 5 seconds for 2 minutes
    const maxAttempts = 24;
    let attempts = 0;

    const poll = setInterval(async () => {
      attempts++;
      
      try {
        // Check payment status in database
        const { data: payment, error } = await supabase.functions.invoke('payment-status', { body: { transactionId: checkoutRequestId } });
        if (error) throw error;

        if (payment?.status === 'completed') {
          clearInterval(poll);
          handlePaymentSuccess(payment);
        } else if (payment?.status === 'failed' || attempts >= maxAttempts) {
          clearInterval(poll);
          handlePaymentFailure();
        }
      } catch (error) {
        console.error('Error polling payment status:', error);
      }
    }, 5000);
  };

  const handlePaymentSuccess = async (payment: any) => {
    setShowPinPrompt(false);
    setPaymentComplete(true);
    
    try {
      // Only a trusted payment callback should mark an invoice as paid. Keep receipt delivery working if that server-side update is still pending.
      try { await updateInvoiceStatus(invoiceNumber, 'paid'); }
      catch (statusError) { console.warn('Invoice status must be updated by the trusted payment callback:', statusError); }
      
      // Send SMS confirmation
      await sendPaymentConfirmationSMS(
        checkoutData!.phone,
        invoiceNumber,
        checkoutData!.totalAmount,
        payment.mpesa_receipt_number || 'N/A'
      );
      
      // Generate and download receipt
      const receiptData = {
        invoiceNumber,
        customerName: checkoutData!.name,
        customerEmail: checkoutData!.email,
        customerPhone: checkoutData!.phone,
        customerAddress: `${checkoutData!.address}, ${checkoutData!.city}`,
        items: checkoutData!.cartItems.map(item => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          total: item.product.price * item.quantity,
        })),
        totalAmount: checkoutData!.totalAmount,
        status: 'paid' as const,
      };
      
      downloadInvoice(receiptData, 'receipt');
      try {
        await emailInvoice(receiptData, 'receipt', checkoutData!.guestToken);
        setFailedEmails(current => { const next = { ...current }; delete next.receipt; return next; });
        setDocumentMessage(`Payment confirmed. Receipt sent to ${checkoutData!.email}.`);
      } catch (emailError) {
        console.error('Receipt email failed:', emailError);
        setFailedEmails(current => ({ ...current, receipt: receiptData }));
        const reason = emailError instanceof Error ? emailError.message : 'unknown email delivery error';
        setDocumentMessage(`Payment confirmed. Receipt email to ${checkoutData!.email} failed: ${reason}`);
      }
      
      // Clear cart and checkout data
      clearCart();
      sessionStorage.removeItem('checkoutData');
      sessionStorage.removeItem('checkoutInvoiceNumber');
    } catch (error) {
      console.error('Error processing payment success:', error);
    }
  };

  const handlePaymentFailure = () => {
    setShowPinPrompt(false);
    setIsProcessing(false);
    alert('Payment failed or timed out. Please try again.');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!checkoutData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading...</h2>
        </div>
      </div>
    );
  }

  if (paymentComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">
            Your payment has been confirmed and your order will be processed shortly. {documentMessage}
          </p>
          {(failedEmails.invoice || failedEmails.receipt) && <div className="mb-6 space-y-2">
            {failedEmails.invoice && <button disabled={retryingEmail !== null} onClick={() => void retryDocumentEmail('invoice')} className="w-full rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 disabled:opacity-50">{retryingEmail === 'invoice' ? 'Retrying invoice email…' : 'Retry invoice email'}</button>}
            {failedEmails.receipt && <button disabled={retryingEmail !== null} onClick={() => void retryDocumentEmail('receipt')} className="w-full rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 disabled:opacity-50">{retryingEmail === 'receipt' ? 'Retrying receipt email…' : 'Retry receipt email'}</button>}
          </div>}
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Invoice Number:</span>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-gray-900">{invoiceNumber}</span>
                <button
                  onClick={() => copyToClipboard(invoiceNumber)}
                  className="text-green-600 hover:text-green-700"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-bold text-green-600">KES {checkoutData.totalAmount.toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate(`/track-order?reference=${encodeURIComponent(invoiceNumber)}`)}
              className="w-full rounded-lg border border-green-200 bg-green-50 py-3 font-semibold text-green-800 hover:bg-green-100 transition-colors duration-200"
            >
              Track delivery
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              Continue Shopping
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors duration-200"
            >
              View Order History
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/checkout')}
            className="flex items-center space-x-2 text-green-600 hover:text-green-700 transition-colors duration-200 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Checkout</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Payment</h1>
          <p className="text-gray-600">Complete your payment to confirm your order</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">M-Pesa Payment</h2>
            
            {invoiceGenerated && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">Invoice Generated</h3>
                <p className="text-green-700 text-sm">
                  Invoice #{invoiceNumber} is ready. {documentMessage}
                </p>
                {failedEmails.invoice && <button disabled={retryingEmail !== null} onClick={() => void retryDocumentEmail('invoice')} className="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900 disabled:opacity-50">{retryingEmail === 'invoice' ? 'Retrying invoice email…' : 'Retry invoice email'}</button>}
              </div>
            )}

            {/* M-Pesa Payment Form */}
            <div className="space-y-4">
              <div>
                <label htmlFor="mpesaNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  M-Pesa Phone Number
                </label>
                <input
                  type="tel"
                  id="mpesaNumber"
                  value={mpesaNumber}
                  onChange={(e) => setMpesaNumber(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 transition-colors duration-200"
                  placeholder="+254 xxx xxx xxx"
                />
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">Payment Instructions:</h4>
                <ol className="text-sm text-green-700 space-y-1">
                  <li>1. Select Pay with M-Pesa. Your order and invoice will be prepared automatically.</li>
                  <li>2. An STK prompt will be sent to the phone number above.</li>
                  <li>3. Enter your M-Pesa PIN to confirm payment.</li>
                  <li>4. We’ll email your receipt to {checkoutData.email} after confirmation.</li>
                </ol>
              </div>

              <button
                onClick={handlePayment}
                disabled={isProcessing || !mpesaNumber}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-4 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-all duration-300"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Smartphone className="h-5 w-5" />
                    <span>Pay with M-Pesa</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Invoice Number:</span>
                <span className="font-bold text-gray-900">{invoiceNumber || 'Not generated'}</span>
              </div>
            </div>

            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
              {checkoutData.cartItems.map((item: any) => (
                <div key={item.product.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm">{item.product.name}</h3>
                    <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 text-sm">
                      KES {(item.product.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Delivery Information */}
            <div className="border-t pt-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Delivery Address</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>{checkoutData.name}</p>
                <p>{checkoutData.address}</p>
                <p>{checkoutData.city} {checkoutData.postalCode}</p>
                <p>{checkoutData.phone}</p>
              </div>
            </div>

            {/* Total */}
            <div className="border-t pt-6">
              <div className="flex justify-between text-xl font-bold text-gray-900">
                <span>Total Amount:</span>
                <span className="text-green-600">KES {checkoutData.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* M-Pesa PIN Prompt Modal */}
      {showPinPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <Smartphone className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-4">M-Pesa Payment Request</h3>
              <p className="text-gray-600 mb-6">
                A payment request has been sent to <strong>{mpesaNumber}</strong>. 
                Please check your phone and enter your M-Pesa PIN to complete the payment.
              </p>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <p className="text-sm text-yellow-800">
                    Please enter your PIN within 60 seconds
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="text-sm text-gray-600">Waiting for payment confirmation...</p>
                <button
                  onClick={() => setShowPinPrompt(false)}
                    className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                >
                  Cancel Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payment;
