import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { userAPI } from '../../services/api';
import EditIcon from '../../assets/edit.svg';
import ArrowLeftIcon from '../../assets/arrow-left.svg';
import MailIcon from '../../assets/mail.svg';
import PhoneIcon from '../../assets/phone.svg';
import HeaderLocationIcon from '../../assets/headerlocation.svg';
import InfoIcon from '../../assets/info.svg';
import Header from '../../components/Header';
import FloatingLabelInput from '../../components/FloatingLabelInput';
import Button from '../../components/Button';
import ProfileBG from '../../assets/CardBG7.png';

const EditProfilePage = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    countryCode: '+61'
  });
  const [userLocation, setUserLocation] = useState({
    address: '',
    city: ''
  });
  const [loading, setLoading] = useState(false);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoError, setPhotoError] = useState('');


  useEffect(() => {
    if (user) {   
      setFormData({
        firstName: user.firstName || user.name || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phoneNumber || user.phone || '',
        countryCode: '+61'
      });
    }

    // Load user location from API first, then fallback to localStorage
    const fetchUserLocation = async () => {
      try {
        const userProfile = await userAPI.getProfile();
        
        const userData = userProfile.data?.user || userProfile.data || userProfile;
        const location = userData?.location;
        
        if (location) {
          const fullAddress = location.fullAddress || location.address || '';
          const addressParts = fullAddress.split(',');
          const address = addressParts[0]?.trim() || 'Location not set';
          const city = addressParts.length > 1 ? addressParts[addressParts.length - 2]?.trim() : (location.city || 'Please set your location');
          
          setUserLocation({
            address: address,
            city: city,
            fullAddress: fullAddress
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
            address: locationData.address || 'Location not set',
            city: locationData.city || 'Please set your location',
            fullAddress: locationData.fullAddress || locationData.address || 'Location not set'
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

  // Listen for user updates
  useEffect(() => {
    const handleUserUpdate = () => {
      const updatedUser = JSON.parse(localStorage.getItem('user') || 'null');
      if (updatedUser) {
        updateUser(updatedUser);
      }
    };

    window.addEventListener('userUpdated', handleUserUpdate);

    return () => {
      window.removeEventListener('userUpdated', handleUserUpdate);
    };
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isCountryDropdownOpen && !event.target.closest('.country-dropdown')) {
        setIsCountryDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCountryDropdownOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Photo upload handlers
  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (!allowedTypes.includes(file.type)) {
      setPhotoError('Invalid file type. Only JPG, PNG, GIF, and WebP are allowed.');
      return;
    }

    if (file.size > maxSize) {
      setPhotoError('File size too large. Maximum size is 50MB.');
      return;
    }

    setPhotoError('');
    setPhotoLoading(true);

    try {
      const data = await userAPI.uploadProfilePhoto(file);

      if (data.success) {
        // Update user context with new photo
        const updatedUser = {
          ...user,
          profilePhoto: data.data.profilePhoto,
          profilePicture: data.data.profilePhoto?.secureUrl || data.data.profilePhoto?.url
        };
        
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Dispatch custom event to update other components
        window.dispatchEvent(new CustomEvent('userUpdated'));

        // Update form data to trigger re-render
        setFormData(prev => ({ ...prev }));
      } else {
        setPhotoError(data.message || 'Failed to upload photo');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      setPhotoError(error.message || 'Failed to upload photo. Please try again.');
    } finally {
      setPhotoLoading(false);
    }
  };

  const handleEditPhotoClick = () => {
    document.getElementById('photo-upload').click();
  };

  const handleDeletePhoto = async () => {
    if (!user?.profilePhoto?.url && !user?.profilePhoto?.secureUrl && !user?.profilePicture) {
      setPhotoError('No profile photo to delete');
      return;
    }

    setPhotoError('');
    setPhotoLoading(true);

    try {
      const data = await userAPI.deleteProfilePhoto();

      if (data.success) {
        // Update user context to remove photo
        const updatedUser = {
          ...user,
          profilePhoto: null,
          profilePicture: null
        };
        
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Force update the user context immediately
        updateUser(updatedUser);
        
        // Dispatch custom event to update other components
        window.dispatchEvent(new CustomEvent('userUpdated'));

        // Update form data to trigger re-render
        setFormData(prev => ({ ...prev }));
      } else {
        setPhotoError(data.message || 'Failed to delete photo');
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      // If API fails, still remove the photo locally
      if (error.message.includes('400')) {
        setPhotoError('Photo may not exist on server, removing locally...');
        
        // Remove photo locally
        const updatedUser = {
          ...user,
          profilePhoto: null,
          profilePicture: null
        };
        
        localStorage.setItem('user', JSON.stringify(updatedUser));
        updateUser(updatedUser);
        window.dispatchEvent(new CustomEvent('userUpdated'));
        setFormData(prev => ({ ...prev }));
        
        // Clear error after a moment
        setTimeout(() => setPhotoError(''), 2000);
      } else {
        setPhotoError(error.message || 'Failed to delete photo. Please try again.');
      }
    } finally {
      setPhotoLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Update profile using userAPI
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
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
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              <img src={ArrowLeftIcon} alt="Back" className="w-6 h-6" />
            </button>
            <h1 className="ml-4 text-xl font-semibold text-gray-900">Edit Profile</h1>
          </div>
        </div>

      <div className="max-w-7xl mx-auto py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8 pt-0!">
        {/* Hidden file input for photo upload */}
        <input
          id="photo-upload"
          type="file"
          accept="image/*"
          onChange={handlePhotoUpload}
          className="hidden"
        />

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
                {user?.profilePhoto?.url || user?.profilePhoto?.secureUrl || user?.profilePicture ? (
                  <img
                    src={user?.profilePhoto?.url || user?.profilePhoto?.secureUrl || user?.profilePicture}
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
                {photoLoading && (
                  <div className="absolute inset-0 bg-[#1F6FEB] bg-opacity-50 flex items-center justify-center rounded-full">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              <button 
                onClick={handleEditPhotoClick}
                disabled={photoLoading}
                className="absolute bottom-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <img src={EditIcon} alt="Edit" className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-6 md:h-6" />
              </button>
              
              {/* Delete Photo Button - Only show if photo exists */}
              {(user?.profilePhoto?.url || user?.profilePhoto?.secureUrl || user?.profilePicture) && (
                <button 
                  onClick={handleDeletePhoto}
                  disabled={photoLoading}
                  className="absolute top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 bg-red-500 rounded-full shadow-md flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Delete photo"
                >
                  <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* User Details Preview */}
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-primary-500 mb-2 sm:mb-3 capitalize">
                {`${formData.firstName || user?.firstName || user?.name || 'User'} ${formData.lastName || user?.lastName || ''}`.trim()}
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
          
          {/* Photo Upload Error */}
          {photoError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{photoError}</p>
            </div>
          )}
        </div>

        {/* Form Fields */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* First Name */}
            <div>
              <FloatingLabelInput
                id="firstName"
                name="firstName"
                label="First Name"
                type="text"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder=""
                required
              />
            </div>

            {/* Last Name */}
            <div>
              <FloatingLabelInput
                id="lastName"
                name="lastName"
                label="Last Name"
                type="text"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder=""
                required
              />
            </div>

            {/* Email */}
            <div>
              <FloatingLabelInput
                id="email"
                name="email"
                label="Email address"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder=""
                required
              />
            </div>

            {/* Phone Number - Read Only */}
            <div>
              <div className="relative">
                <input
                  type="tel"
                  value={`${formData.phone}`}
                  readOnly
                  disabled
                  className="w-full px-4 py-4 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                  placeholder="Phone number"
                />
                <label className="absolute left-3 px-1 bg-white text-gray-500 text-xs top-0 -translate-y-1/2">
                  Phone number
                </label>
              </div>
              <div className="flex items-center mt-2">
                <div className="flex-shrink-0">
                  <img src={InfoIcon} alt="Info" className="w-4 h-4 text-blue-600" />
                </div>
                <p className="ml-2 text-xs sm:text-sm text-primary-200 font-medium">
                  Phone number can't be changed once verified. Contact support if required.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Default Location */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6">
          <label className="block text-base font-medium text-primary-500 font-semibold mb-3">
            Your default location
          </label>
          <div className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-3">
              <img src={HeaderLocationIcon} alt="Location" className="w-10 h-10" />
              <div>
                <p className="text-sm sm:text-base font-medium text-primary-200 font-medium">
                  {userLocation.fullAddress || userLocation.address || 'No address set'}
                </p>
                <p className="text-xs sm:text-sm text-primary-200 font-medium">
                  {userLocation.city || 'No city set'}
                </p>
              </div>
            </div>
            <button
              onClick={handleChangeLocation}
              className="text-[#1F6FEB] hover:text-primary-600 font-medium text-sm sm:text-base transition-colors cursor-pointer"
            >
              Change
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            loading={loading}
            size="md"
            className="px-10"
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;
