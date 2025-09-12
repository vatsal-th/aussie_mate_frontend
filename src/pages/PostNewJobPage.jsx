import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import CardBG2 from '../assets/CardBG2.png';
import CardBG3 from '../assets/CardBG3.png';
import CardBG4 from '../assets/CardBG4.png';
import CleaningImage from '../assets/Cleaning.png';
import HandymanImage from '../assets/Handyman.png';
import HousekeepingImage from '../assets/Housekeeping.png';
import PetSittingImage from '../assets/Pet Sitting.png';
import NDISSupportImage from '../assets/NDIS Support.png';
import RetailAuditorImage from '../assets/Retail Auditor.png';
import ArrowLeftIcon from '../assets/arrow-left.svg';
import UploadIcon from '../assets/upload.svg';
import MinusIcon from '../assets/minus.svg';
import UploadCloudIcon from '../assets/upload-cloud.svg';
import PlusIcon from '../assets/plus.svg';

import MapPinIcon from '../assets/map-pin 1.png';
import { jobsAPI, handleAPIError, userAPI } from '../services/api';

const PostNewJobPage = () => {
  const navigate = useNavigate();

  // Step management
  const [currentStep, setCurrentStep] = useState(1); // 1: Service Selection, 2: Job Details, 3: Final Details

  // Service selection
  const [selectedService, setSelectedService] = useState(null);

  // Job details form data
  const [formData, setFormData] = useState({
    serviceType: '',
    propertyType: '',
    bedrooms: 1,
    bathrooms: 1,
    addons: {
      carpetCleaning: false,
      windowCleaning: false,
      ovenCleaning: false
    },
    instructions: ''
  });

  // File upload states
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Final details
  const [selectedDate, setSelectedDate] = useState('Aug 20, 2025');
  const [finalInstructions, setFinalInstructions] = useState('');
  const [isUrgent, setIsUrgent] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState({
    address: 'Location not set',
    city: 'Please set your location'
  });

  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [addressError, setAddressError] = useState('');

  // UI states
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const propertyTypes = [
    { value: 'house', label: 'House' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'office', label: 'Office' }
  ];

  const serviceCategories = [
    {
      id: 'cleaning',
      name: 'Cleaning',
      image: CleaningImage,
      description: 'Professional cleaning services'
    },
    {
      id: 'housekeeping',
      name: 'Housekeeping',
      image: HousekeepingImage,
      description: 'Complete housekeeping solutions'
    },
    {
      id: 'ndis',
      name: 'NDIS Support',
      image: NDISSupportImage,
      description: 'NDIS support services'
    },
    {
      id: 'retail',
      name: 'Retail Auditor',
      image: RetailAuditorImage,
      description: 'Retail auditing services'
    },
    {
      id: 'petsitting',
      name: 'Pet Sitting',
      image: PetSittingImage,
      description: 'Pet care and sitting'
    },
    {
      id: 'handyman',
      name: 'Handyman',
      image: HandymanImage,
      description: 'Repair and maintenance'
    }
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Load user location
  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        const userProfile = await userAPI.getProfile();
        if (userProfile.success && userProfile.data && userProfile.data.location) {
          const location = userProfile.data.location;
          setSelectedLocation({
            address: location.address?.split(',')[0] || 'Location not set',
            city: location.city || 'Please set your location'
          });
          return;
        }
      } catch (error) {
        console.error('Error fetching location from backend:', error);
      }

      // Fallback to localStorage
      const storedLocation = localStorage.getItem('userLocation');
      if (storedLocation) {
        try {
          const location = JSON.parse(storedLocation);
          setSelectedLocation({
            address: location.address?.split(',')[0] || 'Location not set',
            city: location.city || 'Please set your location'
          });
        } catch (error) {
          console.error('Error parsing stored location:', error);
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
  }, []);

  // Service selection handler
  const handleServiceClick = (serviceId) => {
    setSelectedService(serviceId);
    setFormData(prev => ({ ...prev, serviceType: serviceId }));
    setCurrentStep(2);
  };

  // Form handlers
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePropertyTypeSelect = (value) => {
    handleInputChange('propertyType', value);
    setIsDropdownOpen(false);
  };

  const getSelectedPropertyType = () => {
    const selected = propertyTypes.find(type => type.value === formData.propertyType);
    return selected ? selected.label : 'Select property type';
  };

  const handleAddonChange = (addon) => {
    setFormData(prev => ({
      ...prev,
      addons: {
        ...prev.addons,
        [addon]: !prev.addons[addon]
      }
    }));
  };

  const handleNumberChange = (field, operation) => {
    setFormData(prev => ({
      ...prev,
      [field]: operation === 'increment'
        ? Math.min(prev[field] + 1, 10)
        : Math.max(prev[field] - 1, 1)
    }));
  };

  // File validation
  const validateFile = (file) => {
    const maxSize = 50 * 1024 * 1024; // 50MB
    const supportedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/webm'
    ];

    if (file.size > maxSize) {
      return { valid: false, error: `File ${file.name} is too large. Maximum size is 50MB.` };
    }

    if (!supportedTypes.includes(file.type)) {
      return { valid: false, error: `File ${file.name} is not a supported format.` };
    }

    return { valid: true };
  };

  // Handle file selection
  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    const validFiles = [];
    const errors = [];

    fileArray.forEach(file => {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        errors.push(validation.error);
      }
    });

    if (errors.length > 0) {
      setUploadError(errors.join(' '));
    } else {
      setUploadError('');
    }

    setSelectedFiles(prev => {
      const newFiles = [...prev, ...validFiles];
      return newFiles.slice(0, 10);
    });
  };

  // Handle drag and drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files);
    }
  };

  // Final details handlers
  const handleDatePickerChange = (e) => {
    const date = new Date(e.target.value);
    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    setSelectedDate(formattedDate);
  };

  const handleFinalInstructionsChange = (e) => {
    setFinalInstructions(e.target.value);
  };

  const handleUrgencyToggle = () => {
    setIsUrgent(!isUrgent);
  };

  const handleChangeLocation = () => {
    navigate('/location');
  };

  const handleGoToProfile = () => {
    navigate('/location');
  };

  // Navigation handlers
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleContinue = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Final job posting
  const handlePostJob = async () => {
    setIsLoading(true);
    setError('');
    setAddressError('');

    // Determine effective location: prefer current selection; otherwise, fall back to saved localStorage location
    let effectiveLocation = selectedLocation;
    try {
      const storedLocationStr = localStorage.getItem('userLocation');
      if (storedLocationStr) {
        const storedLocation = JSON.parse(storedLocationStr);

        // Prefer a more complete address from localStorage when current selection is missing or looks too short
        const shouldUseStored =
          !effectiveLocation?.address ||
          effectiveLocation.address === 'Location not set' ||
          (effectiveLocation.address && effectiveLocation.address.length < 10); 

        if (shouldUseStored) {
          // Parse coordinates if they are stored as "lat, lng" string → [lng, lat]
          let parsedCoordinates = undefined;
          if (typeof storedLocation.coordinates === 'string') {
            const parts = storedLocation.coordinates.split(',').map((s) => s.trim());
            if (parts.length === 2) {
              const lat = Number(parts[0]);
              const lng = Number(parts[1]);
              if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
                parsedCoordinates = [lng, lat];
              }
            }
          } else if (Array.isArray(storedLocation.coordinates)) {
            parsedCoordinates = storedLocation.coordinates;
          }

          effectiveLocation = {
            address: storedLocation.fullAddress || storedLocation.address || 'Location not set',
            city: storedLocation.city || 'Location',
            coordinates: parsedCoordinates,
          };
        }
      }
    } catch (_) {
      // noop - if parsing fails, we'll validate below
    }

    // Validate location before posting
    if (!effectiveLocation?.address || effectiveLocation.address === 'Location not set') {
      setAddressError('Please set your address in profile before posting jobs');
      setIsLoading(false);
      return;
    }

    try {
      // Convert date to ISO string
      const scheduledDate = new Date(selectedDate).toISOString();

      // Prepare job data
      // Include customerId from localStorage
      const userStr = localStorage.getItem('user');
      const storedLocationStrForLog = localStorage.getItem('userLocation');

      // Debug logs for request context
      
      const user = userStr ? JSON.parse(userStr) : null;
      const customerId = user?.id || user?._id;

      const jobData = {
        serviceType: formData.serviceType,
        propertyType: formData.propertyType,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        addons: formData.addons,
        scheduledDate,
        instructions: finalInstructions || formData.instructions,
        isUrgent,
        location: {
          address: effectiveLocation.address,
          city: effectiveLocation.city,
          coordinates: effectiveLocation.coordinates,
        },
        customerId,
      };

      const files = {
        photos: selectedFiles,
        videos: []
      };
      

      // Create job
      const response = await jobsAPI.createJobWithFiles(jobData, files);
      

      if (response.success) {
        // Navigate to success page with job ID
        navigate('/job-success', { state: { jobId: response.data._id } });
      } else {  
        setError(response.message || 'Failed to post job');
      }
    } catch (error) {
      console.error('Error posting job:', error);
      setError(handleAPIError(error));
    } finally {
      
      setIsLoading(false);
    }
  };

  // Render different steps
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderServiceSelection();
      case 2:
        return renderJobDetails();
      case 3:
        return renderFinalDetails();
      default:
        return renderServiceSelection();
    }
  };

  const renderServiceSelection = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header Section */}
      <div className="flex items-center mb-6">
        <Link to="/customer-dashboard" className="mr-4">
          <img src={ArrowLeftIcon} alt="Back" className="w-6 h-6" />
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Post New Job</h1>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-custom">
        {/* Title and Description */}
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            What do you need help with today?
          </h2>
          <p className="text-gray-600 text-base sm:text-lg">
            Pick a service to get started with hassle-free cleaning today.
          </p>
        </div>

        {/* Service Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {serviceCategories.map((service) => (
            <div
              key={service.id}
              onClick={() => handleServiceClick(service.id)}
              className="relative bg-white border border-gray-200 rounded-3xl p-3 sm:p-6 text-center hover:shadow-custom-5 transition-shadow cursor-pointer overflow-hidden shadow-custom"
            >
              {/* Top-left background image */}
              <div className="absolute top-0 left-0 w-20 h-24 overflow-hidden rounded-tl-2xl">
                <img src={CardBG3} alt="Card Background" className="w-full h-full object-cover" />
              </div>

              {/* Top-right background image */}
              <div className="absolute top-0 right-0 w-20 h-24 overflow-hidden rounded-tr-2xl">
                <img src={CardBG2} alt="Card Background" className="w-full h-full object-cover" />
              </div>

              {/* Bottom-left background image */}
              <div className="absolute bottom-0 left-0 w-20 h-24 overflow-hidden rounded-bl-2xl">
                <img src={CardBG4} alt="Card Background" className="w-full h-full object-cover" />
              </div>

              {/* Service Image */}
              <div className="relative z-10 mb-2 flex justify-center">
                <img
                  src={service.image}
                  alt={service.name}
                  className="w-12 h-12 sm:w-20 sm:h-20 object-contain"
                />
              </div>

              {/* Service Name */}
              <div className="relative z-10 text-xs sm:text-lg font-medium text-gray-900">{service.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderJobDetails = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header Section */}
      <div className="flex items-center mb-6">
        <button onClick={handleBack} className="mr-4">
          <img src={ArrowLeftIcon} alt="Back" className="w-6 h-6" />
        </button>
        <h1 className="text-xl sm:text-2xl font-semibold text-primary-500">Post New Job</h1>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-custom">
        <form onSubmit={(e) => { e.preventDefault(); handleContinue(); }} className="space-y-6 sm:space-y-8">
          {/* Property Details Section */}
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-primary-500 mb-2">
              Tell us about your property
            </h2>
            <p className="text-sm sm:text-base text-primary-200 mb-6">
              Add property details to ensure the best cleaning plan for you.
            </p>

            {/* Property Type */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-primary-500 mb-2">
                Property Type
              </label>
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm sm:text-base text-left flex justify-between items-center bg-white cursor-pointer"
                >
                  <span className={formData.propertyType ? 'text-primary-500' : 'text-primary-200'}>
                    {getSelectedPropertyType()}
                  </span>
                  <svg
                    className={`w-5 h-5 text-primary-200 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute z-10 w-full mt-[1px] bg-white border border-gray-300 rounded-lg shadow-lg py-2 px-4">
                    {propertyTypes.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => handlePropertyTypeSelect(type.value)}
                        className={`w-full px-4 py-3 text-left text-sm sm:text-base hover:bg-primary-200 transition-colors first:rounded-t-lg last:rounded-b-lg cursor-pointer ${formData.propertyType === type.value
                            ? 'bg-primary-200 text-primary-500'
                            : 'text-primary-200'
                          }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bedrooms and Bathrooms */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Bedrooms */}
              <div>
                <label className="block text-sm font-medium text-primary-500 mb-2">
                  Bedrooms
                </label>
                <div className="flex items-center border border-gray-300 rounded-full">
                  <button
                    type="button"
                    onClick={() => handleNumberChange('bedrooms', 'decrement')}
                    className="p-1 transition-colors bg-primary-200 ml-3 cursor-pointer"
                  >
                    <img src={MinusIcon} alt="Minus" className="w-5 h-5" />
                  </button>
                  <input
                    type="number"
                    value={formData.bedrooms}
                    onChange={(e) => handleInputChange('bedrooms', parseInt(e.target.value) || 1)}
                    className="flex-1 px-4 py-3 text-center border-0 focus:ring-0 text-sm sm:text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    min="1"
                    max="10"
                  />
                  <button
                    type="button"
                    onClick={() => handleNumberChange('bedrooms', 'increment')}
                    className="p-1 transition-colors bg-primary-500 mr-3 cursor-pointer"
                  >
                    <img src={PlusIcon} alt="Plus" className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Bathrooms */}
              <div>
                <label className="block text-sm font-medium text-primary-500 mb-2">
                  Bathrooms
                </label>
                <div className="flex items-center border border-gray-300 rounded-full">
                  <button
                    type="button"
                    onClick={() => handleNumberChange('bathrooms', 'decrement')}
                    className="p-1 transition-colors bg-primary-200 ml-3 cursor-pointer"
                  >
                    <img src={MinusIcon} alt="Minus" className="w-5 h-5" />
                  </button>
                  <input
                    type="number"
                    value={formData.bathrooms}
                    onChange={(e) => handleInputChange('bathrooms', parseInt(e.target.value) || 1)}
                    className="flex-1 px-4 py-3 text-center border-0 focus:ring-0 text-sm sm:text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    min="1"
                    max="10"
                  />
                  <button
                    type="button"
                    onClick={() => handleNumberChange('bathrooms', 'increment')}
                    className="p-1 transition-colors bg-primary-500 mr-3 cursor-pointer"
                  >
                    <img src={PlusIcon} alt="Plus" className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Add-ons Section */}
          <div>
            <h3 className="text-lg font-semibold text-primary-500 mb-4">Add-ons</h3>
            <div className="space-y-3">
              {[
                { id: 'carpetCleaning', label: 'Carpet cleaning' },
                { id: 'windowCleaning', label: 'Window cleaning' },
                { id: 'ovenCleaning', label: 'Oven cleaning' }
              ].map((addon) => (
                <label key={addon.id} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.addons[addon.id]}
                    onChange={() => handleAddonChange(addon.id)}
                    className="w-5 h-5 text-primary-500 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
                  />
                  <span className="text-sm sm:text-base text-[#374151]">{addon.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Upload Section */}
          <div>
            <h3 className="text-lg font-semibold text-primary-500 mb-4">
              Upload Photos/Videos <span className="text-primary-200 font-medium"> (Optional)</span>
            </h3>

            {/* Error Message */}
            {uploadError && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {uploadError}
              </div>
            )}

            <div
              className={`border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-colors cursor-pointer ${dragActive
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-primary-200 hover:border-primary-300'
                }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById('fileInput').click()}
            >
              <input
                id="fileInput"
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleFileInputChange}
                className="hidden"
              />

              <div className="flex flex-col items-center space-y-4">
                <div className={`rounded-full p-4 ${dragActive ? 'bg-primary-500' : 'bg-primary-200'}`}>
                  <img
                    src={UploadCloudIcon}
                    alt="Upload"
                    className="w-8 h-8 sm:w-10 sm:h-10"
                  />
                </div>
                <div>
                  <p className="text-sm sm:text-base text-primary-200 mb-2">
                    {dragActive ? 'Drop files here' : 'Select photos/videos to upload'}
                  </p>
                  <p className="text-xs text-gray-500 mb-3">
                    Max 10 files, 50MB each. Supported: Images (JPEG, PNG, GIF, WebP), Videos (MP4, AVI, MOV, WMV, FLV, WebM)
                  </p>
                  <button
                    type="button"
                    className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 mx-auto transition-colors"
                  >
                    <span className="text-sm sm:text-base">Upload Here</span>
                    <img src={UploadIcon} alt="Upload" className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* File Previews */}
            {selectedFiles.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-primary-500 mb-3">
                  Selected Files ({selectedFiles.length}/10)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      {file.type.startsWith('image/') ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200"
                        />
                      ) : (
                        <video
                          src={URL.createObjectURL(file)}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200"
                          muted
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                      <p className="text-xs text-gray-500 mt-1 truncate" title={file.name}>
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {(file.size / 1024 / 1024).toFixed(1)}MB
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Instructions Section */}
          <div>
            <h3 className="text-lg font-semibold text-primary-500 mb-4">
              Anything specific we should know? <span className="text-primary-200 font-medium"> (Optional)</span>
            </h3>
            <textarea
              value={formData.instructions}
              onChange={(e) => handleInputChange('instructions', e.target.value)}
              placeholder="Write your instructions here in any....."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-[10px]! focus:ring-primary-500 focus:border-primary-500 text-sm sm:text-base resize-none"
            />
          </div>

          {/* Continue Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 sm:py-3 px-6 rounded-lg text-sm sm:text-base transition-colors cursor-pointer"
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderFinalDetails = () => (
    <div className="max-w-md mx-auto px-4 py-6 sm:px-2">
      {/* Header Section */}
      <div className="flex items-center mb-6">
        <button onClick={handleBack} className="mr-4">
          <img src={ArrowLeftIcon} alt="Back" className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-semibold text-primary-500">Post New Job</h1>
      </div>

      {/* Main Content */}
      <div className="space-y-6 bg-white rounded-2xl p-6 sm:p-8 shadow-custom">
        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Address Error Message */}
        {addressError && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded">
            <div className="flex items-center justify-between">
              <span>{addressError}</span>
              <button
                onClick={handleGoToProfile}
                className="ml-4 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                Set Address
              </button>
            </div>
          </div>
        )}

        {/* Selected Files Display */}
        {selectedFiles.length > 0 && (
          <div className="mb-6">
            <h3 className="text-primary-500 text-lg font-medium mb-3">
              Selected Files ({selectedFiles.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {selectedFiles.map((file, index) => (
                <div key={index} className="relative">
                  {file.type.startsWith('image/') ? (
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg border border-gray-200"
                    />
                  ) : (
                    <video
                      src={URL.createObjectURL(file)}
                      className="w-full h-20 object-cover rounded-lg border border-gray-200"
                      muted
                    />
                  )}
                  <p className="text-xs text-gray-500 mt-1 truncate" title={file.name}>
                    {file.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* When do you need the service? */}
        <div>
          <label className="block text-primary-500 text-lg font-semibold mb-3">
            When do you need the service?
          </label>
          <div className="relative">
            <input
              type="date"
              value={selectedDate ? new Date(selectedDate).toISOString().split('T')[0] : ''}
              onChange={handleDatePickerChange}
              className="w-full bg-white rounded-lg px-4 py-3 pr-10 text-primary-200 placeholder-gray-500 focus:outline-none border border-[#E5E7EB] cursor-pointer"
              min={new Date().toISOString().split('T')[0]}
              style={{
                colorScheme: 'light',
                WebkitAppearance: 'none',
                MozAppearance: 'textfield'
              }}
            />
          </div>
        </div>

        {/* Anything specific we should know? */}
        <div className="mb-6">
          <label className="block text-primary-500 text-sm font-medium mb-3">
            Anything specific we should know?
          </label>
          <textarea
            value={finalInstructions}
            onChange={handleFinalInstructionsChange}
            placeholder="Write your instructions here in any..."
            className="w-full bg-white rounded-[8px]! px-4 py-3 text-gray-900 placeholder-primary-200 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-[#E5E7EB] resize-none"
            rows={4}
          />
        </div>

        {/* Urgency Toggle */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-6">
          <span className="text-primary-500 text-sm font-medium">
            This is urgent (Extra Fee may apply)
          </span>
          <button
            onClick={handleUrgencyToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-blue-500 focus:ring-offset-2 cursor-pointer ${isUrgent ? 'bg-primary-500' : 'bg-gray-300'
              }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isUrgent ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
          </button>
        </div>

        {/* Select location */}
        <div className="mb-15">
          <h3 className="text-primary-500 text-lg font-medium mb-2">
            Select location you want to clean
          </h3>
          <p className="text-gray-400 text-sm font-medium">Your default location</p>

          {/* Location Warning */}
          {(!selectedLocation.address || selectedLocation.address === 'Location not set') && (
            <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                ⚠️ Please set your address in profile before posting jobs
              </p>
            </div>
          )}

          <div className={`rounded-lg py-2 flex items-center ${(!selectedLocation.address || selectedLocation.address === 'Location not set')
              ? 'bg-yellow-50 border border-yellow-200'
              : 'bg-white'
            }`}>
            <div className={`mr-3 rounded-[8px] p-3 border ${(!selectedLocation.address || selectedLocation.address === 'Location not set')
                ? 'border-yellow-300 bg-yellow-100'
                : 'border-[#E5E7EB] bg-white'
              }`}>
              <img
                src={MapPinIcon}
                alt="Location"
                className="w-6 h-6"
              />
            </div>
            <div className="flex-1">
              <div className={`font-medium text-sm ${(!selectedLocation.address || selectedLocation.address === 'Location not set')
                  ? 'text-yellow-800'
                  : 'text-gray-900'
                }`}>
                {selectedLocation.address}
              </div>
              <div className={`text-xs ${(!selectedLocation.address || selectedLocation.address === 'Location not set')
                  ? 'text-yellow-600'
                  : 'text-gray-600'
                }`}>
                {selectedLocation.city}
              </div>
            </div>
            <button
              onClick={handleChangeLocation}
              className={`text-sm font-medium border rounded-[8px]! px-4 py-2 cursor-pointer transition-colors ${(!selectedLocation.address || selectedLocation.address === 'Location not set')
                  ? 'text-yellow-700 border-yellow-300 hover:bg-yellow-100'
                  : 'text-[#1F6FEB] border-[#E5E7EB] hover:bg-blue-50'
                }`}
            >
              {(!selectedLocation.address || selectedLocation.address === 'Location not set') ? 'Set Address' : 'Change'}
            </button>
          </div>
        </div>

        {/* Post Job Button */}
        <div className="flex justify-end">
          <button
            onClick={handlePostJob}
            disabled={isLoading || (!selectedLocation.address || selectedLocation.address === 'Location not set')}
            className={`bg-primary-500 text-white font-medium py-2 px-6 rounded-lg transition-colors focus:outline-none ${(isLoading || (!selectedLocation.address || selectedLocation.address === 'Location not set'))
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-primary-600 cursor-pointer'
              }`}
          >
            {isLoading ? 'Posting Job...' :
              (!selectedLocation.address || selectedLocation.address === 'Location not set')
                ? 'Set Address First' : 'Post Job'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {renderStepContent()}
    </div>
  );
};

export default PostNewJobPage;
