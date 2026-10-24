import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <img 
            src="/WhatsApp Image 2025-06-11 at 3.06.35 PM.jpeg" 
            alt="Rebearth Solutions Logo" 
            className="h-20 w-20 object-contain mx-auto mb-6"
          />
          <h1 className="text-9xl font-bold text-green-600 mb-4">404</h1>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h2>
          <p className="text-gray-600 mb-8">
            Sorry, we couldn't find the page you're looking for. It might have been moved, 
            deleted, or you entered the wrong URL.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            to="/"
            className="w-full bg-gradient-to-r from-green-600 to-navy-800 hover:from-green-500 hover:to-navy-700 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-all duration-300 transform hover:scale-105"
          >
            <Home className="h-5 w-5" />
            <span>Go Home</span>
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-all duration-300"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Go Back</span>
          </button>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>If you believe this is an error, please contact our support team.</p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;