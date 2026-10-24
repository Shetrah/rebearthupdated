import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, KeyRound, Lock, LogIn, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, resetPassword } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(current => ({ ...current, [name]: value }));
    setError('');
    setNotice('');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    setNotice('');
    try {
      const success = await login(formData.email, formData.password);
      if (!success) {
        setError('Unable to sign in with those credentials. Check your email and password, then try again.');
        return;
      }
      const destination = (location.state as { from?: string } | null)?.from;
      navigate(destination || '/profile', { replace: true });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email.trim()) {
      setError('Enter your email address first and we’ll send you a password reset link.');
      return;
    }
    setIsLoading(true);
    setError('');
    setNotice('');
    try {
      await resetPassword(formData.email);
      setNotice('If an account exists for that email, a password reset link has been sent.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not send a reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <img src="/WhatsApp Image 2025-06-11 at 3.06.35 PM.jpeg" alt="Rebearth Solutions Logo" className="h-16 w-16 object-contain" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {notice && <div role="status" className="bg-green-50 border border-green-200 rounded-lg p-4"><p className="text-green-800 text-sm">{notice}</p></div>}
            {error && <div role="alert" className="bg-red-50 border border-red-200 rounded-lg p-4"><p className="text-red-800 text-sm">{error}</p></div>}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input type="email" id="email" name="email" autoComplete="email" required value={formData.email} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 transition-colors duration-200" placeholder="your.email@example.com" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input type={showPassword ? 'text' : 'password'} id="password" name="password" autoComplete="current-password" required value={formData.password} onChange={handleInputChange} className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 transition-colors duration-200" placeholder="Enter your password" />
                <button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <div className="flex justify-end -mt-2">
              <button type="button" onClick={handleForgotPassword} disabled={isLoading} className="text-sm font-semibold text-green-700 hover:text-green-800 inline-flex items-center gap-2 disabled:opacity-50"><KeyRound className="h-4 w-4" />Forgot password?</button>
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-green-600 to-slate-800 hover:from-green-500 hover:to-slate-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-all duration-300">
              {isLoading ? <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" /><span>Signing In...</span></> : <><LogIn className="h-5 w-5" /><span>Sign In</span></>}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">Don&apos;t have an account?{' '}<Link to="/register" className="text-green-600 hover:text-green-700 font-semibold">Sign up</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
