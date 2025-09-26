import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import logo from '../assets/logo.png';
import FloatingLabelInput from '../components/FloatingLabelInput';
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
              <div className="space-x-3 flex flex-col md:flex-row">
                <Link
                  to="/"
                  className="block w-full text-center text-primary-500 hover:text-primary-600 font-medium py-3 px-4 rounded-3xl border border-primary-500 hover:bg-primary-50 transition-colors duration-200 text-sm sm:text-base cursor-pointer"
                >
                  Back to Login
                </Link>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200 text-sm sm:text-base cursor-pointer"
                >
                  Send Another Email
                </button>
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
          
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4"> 
            <FloatingLabelInput
              label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />  
              {error && (
            <div className="mb-4 text-[#EF4444] font-medium rounded-lg text-sm leading-4">
              {error}
            </div>
          )}
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200 mt-4 text-sm sm:text-base cursor-pointer"
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
            
          </form>
          
          <div className="text-center mt-4 sm:mt-6">
            <p className="text-xs sm:text-sm text-gray-600">
              Remember your password?{' '}
              <Link to="/ " className="text-primary-500 hover:text-primary-600 font-semibold cursor-pointer">
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
