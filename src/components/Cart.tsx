import React from 'react';
import { X, ShoppingCart, Plus, Minus, Trash2, CreditCard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Cart: React.FC = () => {
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getTotalPrice, 
    isCartOpen, 
    setIsCartOpen 
  } = useCart();
  
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) {
      alert('Please login to proceed with checkout');
      navigate('/login');
      return;
    }
    setIsCartOpen(false);
    navigate('/checkout');
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-green-600 to-navy-800 text-white">
          <h2 className="text-xl font-bold flex items-center space-x-2">
            <ShoppingCart className="h-6 w-6" />
            <span>Shopping Cart</span>
          </h2>
          <button
            onClick={() => setIsCartOpen(false)}
            className="text-white hover:text-gray-200 transition-colors duration-200 hover:scale-110"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {!user ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-4">Please login to view your cart</p>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  navigate('/login');
                }}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                Login
              </button>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Your cart is empty</p>
              <p className="text-gray-400 text-sm">Add some products to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.product.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-sm">{item.product.name}</h3>
                      <p className="text-green-600 font-bold">KES {item.product.price.toLocaleString()}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-red-500 hover:text-red-700 transition-colors duration-200 hover:scale-110"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="font-semibold text-gray-900 w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        KES {(item.product.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {user && cartItems.length > 0 && (
          <div className="border-t p-6 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold text-gray-900">Total:</span>
              <span className="text-2xl font-bold text-green-600">
                KES {getTotalPrice().toLocaleString()}
              </span>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={handleCheckout}
                className="w-full bg-gradient-to-r from-green-600 to-navy-800 hover:from-green-500 hover:to-navy-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-all duration-300 transform hover:scale-105"
              >
                <CreditCard className="h-5 w-5" />
                <span>Proceed to Checkout</span>
              </button>
              
              <button
                onClick={clearCart}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Clear Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;