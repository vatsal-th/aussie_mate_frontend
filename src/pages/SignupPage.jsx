import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo.png';
import EyeIcon from '../assets/eye 1.svg';
import EyeOffIcon from '../assets/eye-off 1.svg';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const roleOptions = [
    'Customer',
    'Student Cleaner',
    'Professional Cleaner',
    'NDIS Assistant',
    'Retail Auditor',
    'Pet Sitter',
    'Housekeeper'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
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

      // Validate required fields
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.role || !formData.password) {
        setError('Please fill in all required fields');
        setIsLoading(false);
        return;
      }

      // Validate terms agreement
      if (!formData.agreeToTerms) {
        setError('Please agree to the Terms & Conditions');
        setIsLoading(false);
        return;
      }

      // Prepare data for API
      const { agreeToTerms, ...userData } = formData;
      
      await register(userData);
      navigate('/location');
    } catch (error) {
      console.error('Registration error in component:', error);
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleSelect = (role) => {
    setFormData({
      ...formData,
      role: role
    });
    setShowRoleDropdown(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <img src={logo} alt="Aussie Mate" className="h-12 sm:h-16 w-auto" />
          </div>
        </div>
        {/* Signup Form */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary-500 mb-2 text-center">Let's get started</h2>
          <p className="text-sm sm:text-base text-primary-200 font-medium px-2 text-center">
            Please provide the following details to set up your Aussie Mate account.
          </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="relative">
                <input
                  type="text"
                  name="firstName"
                  placeholder=""
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 pt-6 pb-2 border border-gray-300 rounded-xl focus:ring-1 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200 peer text-base"
                  required
                />
                <label className="absolute left-4 top-1 text-base text-primary-500 transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-primary-500">
                  First Name
                </label>
              </div>
              <div className="relative">
                <input
                  type="text"
                  name="lastName"
                  placeholder=""
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 pt-6 pb-2 border border-gray-300 rounded-xl focus:ring-1 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200 peer text-base"
                  required
                />
                <label className="absolute left-4 top-1 text-base text-primary-500 transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-primary-500">
                  Last Name
                </label>
              </div>
            </div>
            
            <div className="relative">
              <input
                type="email"
                name="email"
                placeholder=""
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 pt-6 pb-2 border border-gray-300 rounded-xl focus:ring-1 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200 peer"
                required
              />
              <label className="absolute left-4 top-1 text-base text-primary-500 transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-primary-500">
                Email Address
              </label>
            </div>
            
            <div className="relative">
              <input
                type="tel"
                name="phone"
                placeholder=""
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 pt-6 pb-2 border border-gray-300 rounded-xl focus:ring-1 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200 peer"
                required
              />
              <label className="absolute left-4 top-1 text-base text-primary-500 transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-primary-500">
                Phone Number
              </label>
            </div>
            
            {/* Role Selection */}
            <div className="relative">
              <div
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="w-full px-4 border border-gray-300 rounded-[36px] focus:ring-1 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200 cursor-pointer bg-white min-h-[56px] flex items-center text-base peer"
              >
                <span className={`${formData.role ? 'text-primary-500' : 'text-primary-500'}`}>
                  {formData.role || 'Select your role'}
                </span>
              </div>
              {/* Custom dropdown arrow */}
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <svg 
                  className={`w-5 h-5 text-primary-500 transition-transform duration-200 ${showRoleDropdown ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              
              {/* Dropdown Options */}
              {showRoleDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-48 sm:max-h-60 overflow-y-auto">
                  {roleOptions.map((role, index) => (
                    <div
                      key={index}
                      onClick={() => handleRoleSelect(role)}
                      className="px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-200 first:rounded-t-xl last:rounded-b-xl text-sm sm:text-base"
                    >
                      <span className="text-primary-500">{role}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder=""
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 pt-6 pb-2 pr-12 border border-gray-300 rounded-xl focus:ring-1 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200 peer"
                required
              />
              <label className="absolute left-4 top-2 text-base text-primary-500 transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-primary-500">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-primary-500 hover:text-gray-600 transition-colors duration-200 cursor-pointer"
              >
                <img 
                  src={showPassword ? EyeIcon :  EyeOffIcon} 
                  alt={showPassword ? "Hide password" : "Show password"}
                  className="w-5 h-5"
                />
              </button>
            </div>
            
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder=""
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-4 pt-6 pb-2 pr-12 border border-gray-300 rounded-xl focus:ring-1 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200 peer"
                required
              />
              <label className="absolute left-4 top-1 text-base text-primary-500 transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-primary-500">
                Confirm Password
              </label>
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 cursor-pointer"
              >
                <img 
                  src={showConfirmPassword ? EyeIcon :  EyeOffIcon} 
                  alt={showConfirmPassword ? "Hide password" : "Show password"}
                  className="w-5 h-5"
                />
              </button>
            </div>
            
            {/* Terms & Conditions Checkbox */}
            <div className="flex items-center space-x-2 sm:space-x-3 mt-4 sm:mt-6">
              <div className="flex items-center justify-center">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-primary-500 bg-white border-gray-300 rounded focus:ring-primary-500 focus:ring-1 accent-primary-500 cursor-pointer"
                  required
                />
              </div>
              <div className="text-xs sm:text-base leading-relaxed">
                <label className="cursor-pointer text-primary-200 font-medium" >
                  I agree to the{' '}
                  <Link to="/terms" className="text-primary-500 hover:text-primary-600 font-medium underline cursor-pointer">
                    Terms & Conditions
                  </Link>
                </label>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200 mt-4 text-sm sm:text-base cursor-pointer"
            >
              {isLoading ? 'Creating Account...' : 'Continue & Set My Location'}
            </button>
          </form>
          
          <div className="text-center mt-4 sm:mt-6">
            <p className="text-xs sm:text-base text-primary-200 font-medium">
              Already have an account?{' '}
              <Link to="/" className="text-primary-500 hover:text-primary-600 font-semibold cursor-pointer">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
