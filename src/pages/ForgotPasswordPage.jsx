import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import logo from '../assets/logo.png';
import ForgotSuccessIcon from '../assets/forgot success.svg';

const ForgotPasswordPage = () => {
  const [formData, setFormData] = useState({
    email: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await authAPI.forgotPassword(formData.email);
      setIsSubmitted(true);
    } catch (error) {
      setError(error.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-0 sm:p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex items-center justify-center mb-4 sm:mb-6">
              <img src={logo} alt="Aussie Mate" className="h-12 sm:h-16 w-auto" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Check Your Email</h2>
            <p className="text-sm sm:text-base text-gray-600 px-2">
              We've sent a password reset link to your email address.
            </p>
          </div>

          {/* Success Message */}
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-8">
             <div className="text-center">
               <div className="flex items-center justify-center mx-auto mb-4">
                 <img src={ForgotSuccessIcon} alt="Success" className="w-40 h-40" />
               </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Check your mail</h3>
              <p className="text-sm text-gray-600 mb-6">
              We have sent a password recover instructions to your email.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 px-4 rounded-xl transition-colors duration-200 text-sm sm:text-base"
                >
                  Send Another Email
                </button>
                <Link
                  to="/"
                  className="block w-full text-center text-primary-500 hover:text-primary-600 font-bold py-3 px-4 rounded-3xl border border-primary-500 hover:bg-primary-50 transition-colors duration-200 text-sm sm:text-base"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <img src={logo} alt="Aussie Mate" className="h-12 sm:h-16 w-auto" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Forgot Password?</h2>
          <p className="text-sm sm:text-base text-gray-600 px-2">
            No worries! Enter your email address and we'll send you a reset link.
          </p>
        </div>

        {/* Forgot Password Form */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="relative">
              <input
                type="email"
                name="email"
                placeholder=" "
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 pt-6 pb-2 border border-gray-300 rounded-xl focus:outline-none transition-all duration-200 peer"
                required
              />
              <label className="absolute left-4 top-2 text-base text-gray-400 transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-primary-500">
                Email Address
              </label>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl transition-colors duration-200 mt-4 text-sm sm:text-base"
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
          
          <div className="text-center mt-4 sm:mt-6">
            <p className="text-xs sm:text-sm text-gray-600">
              Remember your password?{' '}
              <Link to="/ " className="text-primary-500 hover:text-primary-600 font-bold">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
