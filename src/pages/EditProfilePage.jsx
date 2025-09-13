import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../services/api';
import EditIcon from '../assets/edit.svg';
import ArrowLeftIcon from '../assets/arrow-left.svg';
import MailIcon from '../assets/mail.svg';
import PhoneIcon from '../assets/phone.svg';
import HeaderLocationIcon from '../assets/headerlocation.svg';
import InfoIcon from '../assets/info.svg';
import ProfileIcon from '../assets/Profile.svg';
import Header from '../components/Header';
import ProfileBG from '../assets/CardBG7.png';

const EditProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    countryCode: '+61'
  });
  const [userLocation, setUserLocation] = useState({
    address: '',
    city: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.firstName || user.name || '',
        email: user.email || '',
        phone: user.phoneNumber || user.phone || '',
        countryCode: '+61'
      });
    }

    // Load user location from API first, then fallback to localStorage
    const fetchUserLocation = async () => {
      try {
        const userProfile = await userAPI.getProfile();
        if (userProfile.success && userProfile.data && userProfile.data.location) {
          const location = userProfile.data.location;
          setUserLocation({
            address: location.address || '',
            city: location.city || ''
          });
          return;
        }
      } catch (error) {
        console.error('Error fetching location from API:', error);
      }

      // Fallback to localStorage
      const savedLocation = localStorage.getItem('userLocation');
      if (savedLocation) {
        try {
          const locationData = JSON.parse(savedLocation);
          setUserLocation({
            address: locationData.address || '',
            city: locationData.city || ''
          });
        } catch (error) {
          console.error('Error parsing saved location:', error);
        }
      }
    };

    fetchUserLocation();

    // Listen for location updates
    const handleLocationUpdate = () => {
      fetchUserLocation();
    };

    window.addEventListener('locationUpdated', handleLocationUpdate);

    return () => {
      window.removeEventListener('locationUpdated', handleLocationUpdate);
    };
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Update profile using userAPI
      const updateData = {
        firstName: formData.fullName,
        name: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phone,
        phone: formData.phone
      };

      const response = await userAPI.updateProfile(updateData);
      
      if (response.success) {
        // Update user context with new data
        const updatedUser = {
          ...user,
          ...updateData
        };
        
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Dispatch custom event to update other components
        window.dispatchEvent(new CustomEvent('userUpdated'));
        
        // Show success message (you can add a toast notification here)
        console.log('Profile updated successfully!');
        
        // Navigate back to profile page
        navigate('/profile');
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      // You can add error handling UI here
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeLocation = () => {
    navigate('/location', { 
      state: { 
        fromPage: 'edit-profile',
        step: 'edit-profile'
      } 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Edit Profile Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <img src={ArrowLeftIcon} alt="Back" className="w-6 h-6" />
            </button>
            <h1 className="ml-4 text-xl font-semibold text-gray-900">Edit Profile</h1>
          </div>
        </div>

      <div className="max-w-7xl mx-auto py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8 pt-0!">
        {/* Profile Picture Section */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8 relative overflow-hidden mb-4 sm:mb-6">
          {/* Background Image */}
          <div
            className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 bg-cover bg-center bg-no-repeat z-0"
            style={{ backgroundImage: `url(${ProfileBG})` }}
          ></div>

          <div className="relative z-10 flex flex-row items-center space-x-4 sm:space-x-6 lg:space-x-8">
            {/* Profile Picture */}
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-primary-500 flex items-center justify-center">
                    <span className="text-white text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold">
                      {(user?.firstName || user?.name || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <button className="absolute bottom-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors">
                <img src={EditIcon} alt="Edit" className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-6 md:h-6" />
              </button>
            </div>

            {/* User Details Preview */}
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-primary-500 mb-2 sm:mb-3 capitalize">
                {formData.fullName || user?.firstName || user?.name || 'User Name'}
              </h2>

              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <img src={MailIcon} alt="Email" className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm md:text-base text-primary-200 truncate font-medium">
                    {formData.email || user?.email || 'user@example.com'}
                  </span>
                </div>

                <div className="flex items-center space-x-2 sm:space-x-3">
                  <img src={PhoneIcon} alt="Phone" className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm md:text-base text-primary-200 font-medium">
                    {formData.phone || user?.phoneNumber || '+61 400 123 456'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Full Name */}
            <div>
              <label className="block text-base font-semibold text-primary-500 font-medium mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <img src={ProfileIcon} alt="Profile" className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base text-primary-200 font-medium"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-base font-semibold text-primary-500 font-medium mb-2">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <img src={MailIcon} alt="Email" className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base text-primary-200 font-medium"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="md:col-span-2">
              <label className="block text-base font-semibold text-primary-500 font-medium mb-2">
                Phone number
              </label>
              <div className="flex space-x-2">
                <div className="flex items-center px-3 py-2 sm:py-3 border border-gray-300 rounded-full bg-gray-50">
                  <span className="text-sm sm:text-base text-gray-700">{formData.countryCode}</span>
                  <svg className="w-4 h-4 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <img src={PhoneIcon} alt="Phone" className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base text-primary-200 font-medium"
                    placeholder="000 000 0000"
                  />
                </div>
              </div>
              <div className="flex items-start mt-2">
                <div className="flex-shrink-0">
                  <img src={InfoIcon} alt="Info" className="w-4 h-4 text-blue-600" />
                </div>
                <p className="ml-2 text-xs sm:text-sm text-gray-500">
                  Phone number can't be changed once verified. Contact support if required.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Default Location */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Your default location
          </label>
          <div className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-3">
              <img src={HeaderLocationIcon} alt="Location" className="w-10 h-10 text-gray-500" />
              <div>
                <p className="text-sm sm:text-base font-medium text-gray-900">
                  {userLocation.address || 'No address set'}
                </p>
                <p className="text-xs sm:text-sm text-gray-500">
                  {userLocation.city || 'No city set'}
                </p>
              </div>
            </div>
            <button
              onClick={handleChangeLocation}
              className="text-[#1F6FEB] hover:text-primary-600 font-medium text-sm sm:text-base transition-colors"
            >
              Change
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white font-medium py-2 sm:py-3 px-10 rounded-xl transition-colors text-sm sm:text-base"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;
