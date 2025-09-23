import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authAPI } from '../services/api';
import logo from '../assets/logo.png';
import EyeIcon from '../assets/eye 1.svg';
import EyeOffIcon from '../assets/eye-off 1.svg';

const ResetPasswordPage = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState('');

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setError('Invalid or missing reset token. Please request a new password reset.');
    }
  }, [searchParams]);

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
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setIsLoading(false);
        return;
      }

      if (!token) {
        setError('Invalid reset token. Please request a new password reset.');
        setIsLoading(false);
        return;
      }

      await authAPI.resetPassword(token, formData.password, formData.confirmPassword);
      setIsSubmitted(true);
    } catch (error) {
      setError(error.message || 'Failed to reset password. Please try again.');
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
            <h2 className="text-2xl sm:text-3xl font-bold text-primary-500 mb-2">Password Reset Successfully!</h2>
            <p className="text-sm sm:text-base text-primary-200 font-medium px-2">
              Your password has been updated successfully. You can now log in with your new password.
            </p>
          </div>

          {/* Success Message */}
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-primary-250 mb-2">Password Updated!</h3>
              <p className="text-sm text-primary-200 font-medium mb-6">
                Your password has been successfully reset. You can now log in with your new password.
              </p>
              <Link
                to="/"
                className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200 text-sm sm:text-base inline-block"
              >
                Continue to Login
              </Link>
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
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Reset Password</h2>
          <p className="text-sm sm:text-base text-gray-600 px-2">
            Enter your new password below to complete the reset process.
          </p>
        </div>

        {/* Reset Password Form */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder=" "
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 pt-6 pb-2 pr-12 border border-gray-300 rounded-xl focus:outline-none transition-all duration-200 peer"
                required
              />
              <label className="absolute left-4 top-2 text-base text-gray-400 transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-primary-500">
                New Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <img 
                  src={showPassword ? EyeOffIcon : EyeIcon} 
                  alt={showPassword ? "Hide password" : "Show password"}
                  className="w-5 h-5"
                />
              </button>
            </div>
            
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder=" "
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-4 pt-6 pb-2 pr-12 border border-gray-300 rounded-xl focus:outline-none transition-all duration-200 peer"
                required
              />
              <label className="absolute left-4 top-2 text-base text-gray-400 transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-primary-500">
                Confirm New Password
              </label>
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <img 
                  src={showConfirmPassword ? EyeOffIcon : EyeIcon} 
                  alt={showConfirmPassword ? "Hide password" : "Show password"}
                  className="w-5 h-5"
                />
              </button>
            </div>
            
            <button
              type="submit"
              disabled={isLoading || !token}
              className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200 mt-4 text-sm sm:text-base"
            >
              {isLoading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>
          
          <div className="text-center mt-4 sm:mt-6">
            <p className="text-xs sm:text-sm text-gray-600">
              Remember your password?{' '}
              <Link to="/" className="text-primary-500 hover:text-primary-600 font-semibold">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
