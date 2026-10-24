import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Package, Edit, Save, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });

  const orders = JSON.parse(localStorage.getItem('userOrders') || '[]');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    updateProfile(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || ''
    });
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view your profile.</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">Manage your account information and view your orders</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 text-green-600 hover:text-green-700 transition-colors duration-200"
                  >
                    <Edit className="h-5 w-5" />
                    <span>Edit</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
                    >
                      <Save className="h-4 w-4" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center space-x-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                    >
                      <X className="h-4 w-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg transition-colors duration-200 ${
                        isEditing 
                          ? 'focus:outline-none focus:border-green-500' 
                          : 'bg-gray-50 cursor-not-allowed'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg transition-colors duration-200 ${
                        isEditing 
                          ? 'focus:outline-none focus:border-green-500' 
                          : 'bg-gray-50 cursor-not-allowed'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg transition-colors duration-200 ${
                        isEditing 
                          ? 'focus:outline-none focus:border-green-500' 
                          : 'bg-gray-50 cursor-not-allowed'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg transition-colors duration-200 ${
                        isEditing 
                          ? 'focus:outline-none focus:border-green-500' 
                          : 'bg-gray-50 cursor-not-allowed'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/products')}
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={logout}
                  className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Orders:</span>
                  <span className="font-semibold text-gray-900">{orders.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Member Since:</span>
                  <span className="font-semibold text-gray-900">2024</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order History */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <Package className="h-6 w-6 text-green-600" />
            <span>Order History</span>
          </h2>

          {orders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No orders yet</p>
              <p className="text-gray-400 text-sm">Start shopping to see your orders here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order: any, index: number) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">Order #{order.orderNumber}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(order.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        KES {order.totalAmount.toLocaleString()}
                      </p>
                      <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        {order.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Account Number: {order.accountNumber}</p>
                      <p className="text-gray-600">Payment: {order.paymentMethod}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Items: {order.cartItems.length}</p>
                      <p className="text-gray-600">Delivery: {order.address}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;