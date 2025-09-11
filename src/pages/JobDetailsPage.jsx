import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import UploadIcon from '../assets/upload.svg';
import MinusIcon from '../assets/minus.svg';
import UploadCloudIcon from '../assets/upload-cloud.svg';
import PlusIcon from '../assets/plus.svg';
import ArrowLeftIcon from '../assets/arrow-left.svg';

const JobDetailsPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
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

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const propertyTypes = [
    { value: 'house', label: 'House' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'office', label: 'Office' }
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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Navigate to job posting page
    navigate('/job-posting');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Header Section */}
        <div className="flex items-center mb-6">
          <Link to="/post-new-job" className="mr-4">
            <img src={ArrowLeftIcon} alt="Back" className="w-6 h-6" />
          </Link>
          <h1 className="text-xl sm:text-2xl font-semibold text-primary-500">Post New Job</h1>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-custom">
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
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
                          className={`w-full px-4 py-3 text-left text-sm sm:text-base hover:bg-primary-200 transition-colors first:rounded-t-lg last:rounded-b-lg cursor-pointer ${
                            formData.propertyType === type.value 
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
                  <label key={addon.id} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.addons[addon.id]}
                      onChange={() => handleAddonChange(addon.id)}
                      className="w-5 h-5 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
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
              <div className="border-2 border-dashed border-primary-200 rounded-lg p-6 sm:p-8 text-center hover:border-primary-200 transition-colors">
                <div className="flex flex-col items-center space-y-4 ">
                    <div className="bg-primary-200 rounded-full p-4 cursor-pointer">

                  <img src={UploadCloudIcon} alt="Upload" className="w-8 h-8 sm:w-10 sm:h-10" />
                    </div>
                  <div>
                    <p className="text-sm sm:text-base text-primary-200 mb-2">
                      Select photos/videos to upload
                    </p>
                    <button
                      type="button"
                      className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 mx-auto transition-colors cursor-pointer"
                    >
                      <span className="text-sm sm:text-base cursor-pointer">Upload Here</span>
                      <img src={UploadIcon} alt="Upload" className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions Section */}
            <div>
              <h3 className="text-lg font-semibold text-primary-500 mb-4">
                Anything specific we should know? (Optional)
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
    </div>
  );
};

export default JobDetailsPage;
