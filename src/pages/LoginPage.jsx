import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo.png';
import eyeIcon from '../assets/eye 1.svg';
import eyeOffIcon from '../assets/eye-off 1.svg';

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
      // Navigate based on user role
      if (response.data.user.role === 'Customer') {
        navigate('/customer-dashboard');
      } else {
        // For other roles, navigate to home or appropriate dashboard
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
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
          <p className="text-sm md:text-base text-gray-600">
            Log in to continue booking and managing your cleaning services with ease.
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl p-6 md:p-8 border-2 border-[#8B92A620]">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone or email
              </label>
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-1 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200 text-base"
                placeholder="johndoe08@gmail.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-1 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200 text-base"
                  placeholder="JohnDoe@123"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? (
                    <img src={eyeIcon} alt="Show password" className="w-5 h-5" />
                  ) : (
                    <img src={eyeOffIcon} alt="Hide password" className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="text-right">
              <Link to="/forgot-password" className="text-primary-500 hover:text-primary-600 font-medium">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-xl transition-colors duration-200 text-base touch-manipulation"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary-500 hover:text-primary-600 font-bold">
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
