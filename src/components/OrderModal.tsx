import React, { useState } from 'react';
import { X, ShoppingCart, CheckCircle, AlertTriangle } from 'lucide-react';
import { Product, OrderData } from '../types';

interface OrderModalProps {
  product: Product;
  onClose: () => void;
}

const OrderModal: React.FC<OrderModalProps> = ({ product, onClose }) => {
  const [orderData, setOrderData] = useState<OrderData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    quantity: 1,
    notes: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setOrderData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) || 1 : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmation(true);
  };

  const confirmOrder = () => {
    console.log('Order submitted:', { product, orderData });
    setIsSubmitted(true);
    setShowConfirmation(false);
    
    // Auto-close after 3 seconds
    setTimeout(() => {
      onClose();
    }, 3000);
  };

  const handleCloseConfirmation = () => {
    const confirmLeave = window.confirm(
      'Are you sure you want to cancel this order? All entered information will be lost.'
    );
    if (confirmLeave) {
      setShowConfirmation(false);
    }
  };

  const totalPrice = product.price * orderData.quantity;

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-8 max-w-md w-full text-center animate-scale-in">
          <div className="text-green-600 mb-4">
            <CheckCircle className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h3>
          <p className="text-gray-600 mb-4">
            Thank you for your order. We'll contact you shortly to confirm the details and arrange delivery.
          </p>
          <button
            onClick={onClose}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (showConfirmation) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 z-60 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
            <h3 className="text-xl font-bold text-gray-900">Confirm Your Order</h3>
          </div>
          
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              You are about to place an order for <strong>{orderData.quantity}</strong> unit(s) of{' '}
              <strong>{product.name}</strong> with a total amount of{' '}
              <strong>KES {totalPrice.toLocaleString()}</strong>.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Product:</span>
                <span className="font-medium">{product.name}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Unit Price:</span>
                <span className="font-medium">KES {product.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Quantity:</span>
                <span className="font-medium">{orderData.quantity}</span>
              </div>
              <div className="border-t pt-2 flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total:</span>
                <span className="text-2xl font-bold text-green-600">KES {totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleCloseConfirmation}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={confirmOrder}
              className="flex-1 bg-gradient-to-r from-green-600 to-navy-800 hover:from-green-500 hover:to-navy-700 text-white py-2 rounded-lg font-semibold transition-all duration-300"
            >
              Confirm Order
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-screen overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-green-600 to-navy-800 text-white rounded-t-xl">
          <h2 className="text-2xl font-bold">Order Product</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors duration-200 hover:scale-110"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Product Info */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex items-center space-x-4">
            <img
              src={product.image}
              alt={product.name}
              className="w-20 h-20 object-cover rounded-lg shadow-md"
            />
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900">{product.name}</h3>
              <p className="text-gray-600">{product.description}</p>
              <p className="text-2xl font-bold text-green-600 mt-2">KES {product.price.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Order Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={orderData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={orderData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                value={orderData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300"
              />
            </div>
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                Quantity *
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                min="1"
                required
                value={orderData.quantity}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300"
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Address *
            </label>
            <input
              type="text"
              id="address"
              name="address"
              required
              value={orderData.address}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              value={orderData.notes}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300"
              placeholder="Any special instructions or requirements..."
            />
          </div>

          {/* Order Summary */}
          <div className="bg-gradient-to-r from-green-50 to-navy-50 p-4 rounded-lg mb-6 border border-green-200">
            <h4 className="font-semibold text-gray-900 mb-2">Order Summary</h4>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Product:</span>
              <span className="font-medium">{product.name}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Unit Price:</span>
              <span className="font-medium">KES {product.price.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Quantity:</span>
              <span className="font-medium">{orderData.quantity}</span>
            </div>
            <div className="border-t pt-2 flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total:</span>
              <span className="text-2xl font-bold text-green-600">KES {totalPrice.toLocaleString()}</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-600 to-navy-800 hover:from-green-500 hover:to-navy-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <ShoppingCart className="h-5 w-5" />
            <span>Place Order</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default OrderModal;