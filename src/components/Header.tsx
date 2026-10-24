import React, { useState, useEffect } from 'react';
import { Menu, X, ShoppingCart, User, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import DigitalClock from './DigitalClock';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { getTotalItems, setIsCartOpen } = useCart();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const navigation = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Products', path: '/products' },
    { name: 'Services', path: '/services' },
    { name: 'Track order', path: '/track-order' },
    { name: 'Contact', path: '/contact' }
  ];

  const isActive = (path: string) => location.pathname === path;

  const headerBg = isScrolled || location.pathname !== '/' 
    ? 'bg-white shadow-lg backdrop-blur-sm' 
    : 'bg-white bg-opacity-95 backdrop-blur-sm shadow-sm';

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${headerBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <img 
                src="/WhatsApp Image 2025-06-11 at 3.06.35 PM.jpeg" 
                alt="Rebearth Solutions Logo" 
                className="h-12 w-12 object-contain group-hover:scale-110 transition-all duration-500 group-hover:rotate-3"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-navy-800 group-hover:text-green-600 transition-all duration-500 group-hover:scale-105">
                Rebearth
              </span>
              <span className="text-xs font-medium text-green-600 group-hover:text-navy-800 transition-colors duration-500">
                SOLUTIONS
              </span>
            </div>
          </Link>

          {/* Digital Clock - Hidden on mobile */}
          <div className="hidden md:block">
            <DigitalClock />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <nav className="flex space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`text-sm font-medium transition-all duration-500 hover:text-green-600 hover:scale-110 hover:-translate-y-1 relative group ${
                    isActive(item.path)
                      ? 'text-green-600 font-semibold'
                      : 'text-gray-700'
                  }`}
                >
                  {item.name}
                  <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-green-600 to-navy-800 transition-all duration-500 group-hover:w-full ${
                    isActive(item.path) ? 'w-full' : ''
                  }`}></span>
                  <span className="absolute inset-0 bg-green-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10 scale-75 group-hover:scale-100"></span>
                </Link>
              ))}
            </nav>

            {/* User Menu */}
            <div className="relative">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-navy-800 text-white px-4 py-2 rounded-full hover:from-green-500 hover:to-navy-700 transition-all duration-300"
                  >
                    <User className="h-4 w-4" />
                    <span className="text-sm">{user.name}</span>
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <Link
                        to="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200 flex items-center space-x-2"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="bg-gradient-to-r from-green-600 to-navy-800 text-white px-4 py-2 rounded-full hover:from-green-500 hover:to-navy-700 transition-all duration-300"
                >
                  Login
                </Link>
              )}
            </div>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative bg-gradient-to-r from-green-600 to-navy-800 hover:from-green-500 hover:to-navy-700 text-white p-2 rounded-full transition-all duration-300 transform hover:scale-110"
            >
              <ShoppingCart className="h-5 w-5" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {getTotalItems()}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-3">
            {user && (
              <Link
                to="/profile"
                className="bg-gradient-to-r from-green-600 to-navy-800 text-white p-2 rounded-full"
              >
                <User className="h-5 w-5" />
              </Link>
            )}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative bg-gradient-to-r from-green-600 to-navy-800 text-white p-2 rounded-full"
            >
              <ShoppingCart className="h-5 w-5" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md transition-all duration-500 text-gray-700 hover:text-green-600 hover:bg-green-50 hover:scale-110 hover:rotate-180"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
{isMenuOpen && (
  <div className="md:hidden bg-white shadow-lg rounded-lg mt-2 py-4 border border-gray-100 animate-fade-in-up">
    <div className="px-4 py-2 border-b border-gray-100 mb-2">
      <DigitalClock />
    </div>
    {navigation.map((item) => (
      <Link
        key={item.name}
        to={item.path}
        onClick={() => setIsMenuOpen(false)}
        className={`block w-full text-left px-4 py-3 transition-all duration-500 hover:bg-gradient-to-r hover:from-green-50 hover:to-navy-50 hover:text-green-600 hover:translate-x-4 hover:scale-105 ${
          isActive(item.path)
            ? 'bg-gradient-to-r from-green-50 to-navy-50 text-green-600 font-semibold border-r-4 border-green-600'
            : 'text-gray-700'
        }`}
      >
        {item.name}
      </Link>
    ))}
    {!user && (
      <Link
        to="/login"
        onClick={() => setIsMenuOpen(false)}
        className="block w-full text-left px-4 py-3 text-green-600 font-semibold"
      >
        Login
      </Link>
    )}
    {user && (
      <button
        onClick={() => {
          handleLogout();
          setIsMenuOpen(false);
        }}
        className="block w-full text-left px-4 py-3 text-red-600 font-semibold"
      >
        Logout
      </button>
    )}
  </div>
)}
      </div>
    </header>
  );
};

export default Header;
