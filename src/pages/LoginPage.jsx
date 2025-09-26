import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo.png';
import eyeIcon from '../assets/eye 1.svg';
import eyeOffIcon from '../assets/eye-off 1.svg';
import FloatingLabelInput from '../components/FloatingLabelInput';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await login(formData);

      // Get user data from response
      const userData = response.data?.user || response.user;
      const userRole = userData?.role || userData?.userType;

      // Navigate based on user role
      if (userRole === 'Customer') {
        navigate('/customer-dashboard');
      } else if (['Professional Cleaner', 'Student Cleaner', 'NDIS Assistant', 'Retail Auditor', 'Pet Sitter', 'Housekeeper'].includes(userRole)) {
        navigate('/cleaner-dashboard');
      } else {
        navigate('/');
      }
    } catch (error) {
      setError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <img src={logo} alt="Aussie Mate" className="h-16 w-auto" />
          </div>

        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl p-6 md:p-8 border-2 border-[#8B92A620]">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-primary-500 mb-2 text-center">Welcome Back</h2>
            <p className="text-sm md:text-base text-primary-200 font-medium text-center">
              Log in to continue booking and managing your cleaning services with ease.
            </p>
            <FloatingLabelInput
              id="email"
              name="email"
              label="Phone or email"
              type="text"
              value={formData.email}
              onChange={handleInputChange}
              required
            />

            <FloatingLabelInput
              id="password"
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleInputChange}
              required
            >
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
              >
                {showPassword ? (
                  <img src={eyeIcon} alt="Show password" className="w-5 h-5" />
                ) : (
                  <img src={eyeOffIcon} alt="Hide password" className="w-5 h-5" />
                )}
              </button>
            </FloatingLabelInput>
            
            <div className="text-right">
              <Link to="/forgot-password" className="text-primary-500 hover:text-primary-600 font-medium cursor-pointer">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-xl transition-colors duration-200 text-base touch-manipulation cursor-pointer"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-primary-200 font-medium">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary-500 hover:text-primary-600 font-medium">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
