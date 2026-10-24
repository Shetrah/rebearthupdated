import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Smartphone, CheckCircle, AlertTriangle, Copy, FileText } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { initiateSTKPush } from '../lib/mpesa';
import { createInvoice, generateInvoiceNumber, downloadInvoice, emailInvoice, updateInvoiceStatus } from '../lib/invoice';
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
}

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
  // Removed unused paymentData state

  useEffect(() => {
    const storedData = sessionStorage.getItem('checkoutData');
    if (storedData) {
      const data = JSON.parse(storedData);
      setCheckoutData(data);
      setMpesaNumber(data.phone);
      
      // Generate invoice number
      const newInvoiceNumber = generateInvoiceNumber();
      setInvoiceNumber(newInvoiceNumber);
    } else {
      navigate('/checkout');
    }
  }, [navigate]);

  const generateInvoice = async () => {
    if (!checkoutData) return;

    try {
      const invoiceData = {
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

      // Save invoice and a corresponding customer order so the admin portal can track it.
      const invoiceRecord = await createInvoice(invoiceData);
      try { await emailInvoice(invoiceData, 'invoice'); }
      catch (emailError) { console.error('Invoice email failed:', emailError); alert('Invoice created. Email delivery failed; please verify the Resend setup or download the invoice here.'); }
      const { data: authData } = await supabase.auth.getUser();
      const { error: orderError } = await supabase.from('orders').upsert({
        order_number: checkoutData.orderNumber,
        user_id: authData.user?.id ?? null,
        customer_name: checkoutData.name,
        customer_email: checkoutData.email,
        customer_phone: checkoutData.phone,
        customer_address: `${checkoutData.address}, ${checkoutData.city}`,
        items: checkoutData.cartItems.map((item: any) => ({ id: item.product.id, name: item.product.name, price: Number(item.product.price), quantity: item.quantity, image_url: item.product.image_url || item.product.image || '' })),
        total_amount: checkoutData.totalAmount,
        status: 'pending',
        payment_status: 'pending',
        payment_method: 'M-Pesa',
        source: 'website',
        invoice_id: invoiceRecord.id,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'order_number', ignoreDuplicates: true });
      if (orderError) throw new Error(`Order could not be saved: ${orderError.message}`);
      
      // Download invoice PDF
      downloadInvoice(invoiceData, 'invoice');
      
      setInvoiceGenerated(true);
    } catch (error) {
      console.error('Failed to generate invoice:', error);
      alert('Failed to generate invoice. Please try again.');
    }
  };

  const handlePayment = async () => {
    if (!checkoutData || !invoiceGenerated) {
      alert('Please generate invoice first');
      return;
    }

    setIsProcessing(true);
    
    try {
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
        `Payment for invoice ${invoiceNumber}`
      );

      if (stkResponse.ResponseCode === '0') {
        // Create payment record in database
        const { data: paymentAuth } = await supabase.auth.getUser();
        const { data: invoiceRecord, error: invoiceLookupError } = await supabase.from('invoices').select('id').eq('invoice_number', invoiceNumber).single();
        if (invoiceLookupError || !invoiceRecord) throw new Error('Invoice record was not found for this payment.');
        const { error } = await supabase
          .from('payments')
          .insert({
            invoice_id: invoiceRecord.id,
            user_id: paymentAuth.user?.id,
            transaction_id: stkResponse.CheckoutRequestID,
            phone_number: formattedPhone,
            amount: checkoutData.totalAmount,
            status: 'pending',
          })
          .select()
          .single();

        if (error) {
          throw new Error('Failed to create payment record');
        }

        // setPaymentData(paymentRecord); // Removed unused paymentData state
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
      alert('Failed to initiate payment. Please try again.');
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
        const { data: payment } = await supabase
          .from('payments')
          .select('*')
          .eq('transaction_id', checkoutRequestId)
          .single();

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
      try { await emailInvoice(receiptData, 'receipt'); }
      catch (emailError) { console.error('Receipt email failed:', emailError); alert('Payment completed, but the receipt email could not be sent. Please contact support.'); }
      
      // Clear cart and checkout data
      clearCart();
      sessionStorage.removeItem('checkoutData');
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
            Your payment has been confirmed and your order will be processed shortly.
          </p>
          
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
            
            {/* Invoice Generation */}
            {!invoiceGenerated && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Step 1: Generate Invoice</h3>
                <p className="text-blue-700 text-sm mb-4">
                  Generate your invoice before proceeding with payment.
                </p>
                <button
                  onClick={generateInvoice}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
                >
                  <FileText className="h-4 w-4" />
                  <span>Generate Invoice</span>
                </button>
              </div>
            )}

            {invoiceGenerated && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">Invoice Generated</h3>
                <p className="text-green-700 text-sm">
                  Invoice #{invoiceNumber} has been generated and downloaded.
                </p>
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
                  <li>1. Generate invoice first (if not done)</li>
                  <li>2. Click "Pay with M-Pesa" below</li>
                  <li>3. You'll receive an STK push notification</li>
                  <li>4. Enter your M-Pesa PIN to complete payment</li>
                  <li>5. You'll receive a confirmation SMS and receipt</li>
                </ol>
              </div>

              <button
                onClick={handlePayment}
                disabled={isProcessing || !mpesaNumber || !invoiceGenerated}
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
