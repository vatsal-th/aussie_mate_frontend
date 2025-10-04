import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import logo from '../assets/logo.png';
import eyeIcon from '../assets/eye 1.svg';
import eyeOffIcon from '../assets/eye-off 1.svg';
import FloatingLabelInput from '../components/FloatingLabelInput';
import Button from '../components/Button';
import InfoIcon from '../assets/info.svg';


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

    // Special handling for phone number - only allow digits, ignore leading 0, limit to 9 characters
    if (name === 'phone') {
      let digitsOnly = value.replace(/[^\d]/g, '');
      
      // Remove leading 0 if present
      if (digitsOnly.startsWith('0')) {
        digitsOnly = digitsOnly.substring(1);
      }
      
      // Limit to 9 characters maximum
      if (digitsOnly.length <= 9) {
        setFormData({
          ...formData,
          [name]: digitsOnly
        });
      }
      return;
    }

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

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address');
        setIsLoading(false);
        return;
      }

      // Validate password strength
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        setIsLoading(false);
        return;
      }

      // Validate phone number - only 9 digits allowed
      const cleanedPhone = formData.phone.replace(/[^\d]/g, '');
      if (cleanedPhone.length !== 9) {
        setError('Phone number must be exactly 9 digits');
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

      // Format phone number for backend - just return the 9 digits
      const formatPhoneNumber = (phone) => {
        const cleaned = phone.replace(/[^\d]/g, '');
        return cleaned; // Return just the 9 digits
      };

      // Map role to userType for backend compatibility
      const roleMapping = {
        'Customer': 'customer',
        'Student Cleaner': 'cleaner',
        'Professional Cleaner': 'cleaner',
        'NDIS Assistant': 'cleaner',
        'Retail Auditor': 'cleaner',
        'Pet Sitter': 'cleaner',
        'Housekeeper': 'cleaner'
      };

      // Create clean API data with only required fields
      const apiData = {
        firstName: userData.firstName.trim(),
        lastName: userData.lastName.trim(),
        email: userData.email.trim().toLowerCase(),
        phone: formatPhoneNumber(userData.phone.trim()),
        password: userData.password,
        confirmPassword: userData.confirmPassword,
        userType: roleMapping[userData.role] || userData.role.toLowerCase(),
        role: userData.role, // Keep the original role for backend
      };



      await register(apiData);

      // Navigate based on user role
      if (formData.role === 'Customer') {
        navigate('/location');
      } else {
        // For cleaner roles, navigate to document verification first
        navigate('/verify-documents');
      }
    } catch (error) {


      // Show more detailed error information
      let errorMessage = 'Registration failed. Please try again.';

      if (error.status === 400) {
        errorMessage = 'Invalid data provided. Please check all fields and try again.';
        if (error.response && error.response.errors) {
          // Handle different error formats
          const errors = error.response.errors;
          
          // Handle array format with objects containing msg, path, type
          if (Array.isArray(errors)) {
            const errorMessages = errors.map(errorObj => {
              if (errorObj.msg) {
                return errorObj.msg;
              } else if (errorObj.message) {
                return errorObj.message;
              } else if (typeof errorObj === 'string') {
                return errorObj;
              }
              return String(errorObj);
            });
            errorMessage = errorMessages.join('. ');
          } else if (typeof errors === 'object') {
            // Extract error messages from object
            const errorMessages = Object.entries(errors).map(([field, message]) => {
              if (Array.isArray(message)) {
                return `${field}: ${message.join(', ')}`;
              } else if (typeof message === 'string') {
                return `${field}: ${message}`;
              } else if (typeof message === 'object' && message.message) {
                return `${field}: ${message.message}`;
              }
              return `${field}: ${String(message)}`;
            });
            errorMessage = errorMessages.join('. ');
          } else if (typeof errors === 'string') {
            errorMessage = errors;
          }
        }
      } else if (error.status === 409) {
        errorMessage = 'An account with this email already exists. Please use a different email or try logging in.';
      } else if (error.status === 422) {
        errorMessage = 'Please check your information and try again.';
        if (error.response && error.response.message) {
          errorMessage = error.response.message;
        }
      } else if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
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
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary-500 mb-2 text-center">Let's get started</h2>
            <p className="text-sm sm:text-base text-primary-200 font-medium px-2 text-center">
              Please provide the following details to set up your Aussie Mate account.
            </p>
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FloatingLabelInput
                  id="firstName"
                  name="firstName"
                  label="First Name"
                  type="text"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
                <FloatingLabelInput
                  id="lastName"
                  name="lastName"
                  label="Last Name"
                  type="text"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <FloatingLabelInput
                id="email"
                name="email"
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              
              <FloatingLabelInput
                id="phone"
                name="phone"
                label="Phone Number"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="123456789"
                maxLength={9}
                required
              />

              {/* Role Selection */}
              <div className="relative">
                <div
                  onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  className="w-full px-4 border border-gray-300 rounded-[36px] focus:outline-none transition-all duration-200 cursor-pointer bg-white min-h-[56px] flex items-center text-base peer"
                >
                  <span className={`${formData.role ? 'text-primary-500' : 'text-gray-500 '}`}>
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

              {/* Student Info Message */}
              {formData.role === 'Student Cleaner' && (
                <div className="flex items-center gap-2">
                  <div className=" ">
                    <img src={InfoIcon} alt="Info" className="w-5 h-5" />
                  </div>
                  <p className="text-sm text-primary-200 font-medium">
                    A student is allowed to work only 20 hours per week.
                  </p>
                </div>
              )}

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
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                >
                  <img
                    src={showPassword ? eyeIcon : eyeOffIcon}
                    alt={showPassword ? "Hide password" : "Show password"}
                    className="w-5 h-5"
                  />
                </button>
              </FloatingLabelInput>

              <FloatingLabelInput
                id="confirmPassword"
                name="confirmPassword"
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              >
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                >
                  <img
                    src={showConfirmPassword ? eyeIcon : eyeOffIcon}
                    alt={showConfirmPassword ? "Hide password" : "Show password"}
                    className="w-5 h-5 cursor-pointer"
                  />
                </button>
              </FloatingLabelInput>
              {error && (
            <div className=" text-[#EF4444] font-medium rounded-lg text-sm leading-4 mt-0">
              {error}
            </div>
          )}
            </div>

            {/* Terms & Conditions Checkbox */}
            <div className="flex items-center space-x-2 sm:space-x-3 mt-4 sm:mt-6">
              <div className="flex items-center justify-center">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-primary-500 bg-white border-gray-300 rounded focus:outline-none accent-primary-500 cursor-pointer"
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

            <Button
              type="submit"
              loading={isLoading}
              fullWidth
              size="md"
              className="mt-4"
            >
              {formData.role === 'Customer'
                ? 'Continue & Set My Location'
                : 'Continue For Verification'
              }
            </Button>
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
