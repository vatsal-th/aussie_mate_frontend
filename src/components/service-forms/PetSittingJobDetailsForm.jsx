import React, { useState, useEffect, useRef } from 'react';
import { FloatingLabelInput } from '../form-controls';

const PetSittingJobDetailsForm = ({ 
  formData, 
  onInputChange
}) => {
  const [services, setServices] = useState([
    'House Sitting',
    'Walking',
    'Boarding',
    'Play Time',
    'Cleaning',
    'Grooming',
  ]);
  const [selectedService, setSelectedService] = useState('');
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsServiceDropdownOpen(false);
      }
    };

    if (isServiceDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isServiceDropdownOpen]);

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setIsServiceDropdownOpen(false);
    onInputChange('service', service);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Pet Details Section */}
      <div>
        <h2 className="text-base sm:text-lg lg:text-xl font-medium text-primary-500 mb-2">
          Which pet do you need care for?
        </h2>

        {/* Pet Type */}
        <div className="mb-4">
          <FloatingLabelInput
            id="petType"
            name="petType"
            label="Enter Your Pet Type"
            type="text"
            value={formData.petType || ''}
            onChange={(e) => onInputChange('petType', e.target.value)}
            placeholder=" "
          />
        </div>

        {/* Pet Breed */}
        <div className="mb-4">
          <FloatingLabelInput
            id="petBreed"
            name="petBreed"
            label="Enter Your Pet Breed"
            type="text"
            value={formData.petBreed || ''}
            onChange={(e) => onInputChange('petBreed', e.target.value)}
            placeholder=" "
          />
        </div>

        {/* Number of Pets */}
        <div className="mb-4">
          <FloatingLabelInput
            id="numberOfPets"
            name="numberOfPets"
            label="Number of Pets"
            type="number"
            value={formData.numberOfPets || ''}
            onChange={(e) => onInputChange('numberOfPets', e.target.value)}
            placeholder=" "
          />
        </div>
      </div>

      {/* Services Section */}
      <div className="mb-4">
        <label className="block text-xs sm:text-sm font-medium text-primary-500 mb-2">
          Services
        </label>
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsServiceDropdownOpen(!isServiceDropdownOpen)}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-[#E5E7EB] rounded-lg focus:outline-none text-xs sm:text-sm lg:text-base bg-white text-primary-500 flex items-center justify-between"
          >
            <span className={selectedService ? 'text-primary-500' : 'text-primary-200'}>
              {selectedService || 'Select Service'}
            </span>
            <svg
              className={`w-4 h-4 transition-transform ${isServiceDropdownOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown */}
          {isServiceDropdownOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
              {services.map((service, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleServiceSelect(service)}
                  className="w-full px-4 py-2.5 sm:py-3 text-left text-xs sm:text-sm lg:text-base hover:bg-gray-50 flex items-center justify-between"
                >
                  <span className="text-primary-500">{service}</span>
                  {selectedService === service && (
                    <svg className="w-4 h-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Time Selection Section */}
      {selectedService !== 'Boarding' && (
        <div className="mb-4">
          <h2 className="text-base sm:text-lg font-medium text-primary-500 mb-3">
            Select Time
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Start Time */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-primary-500 mb-2">
                Start time
              </label>
              <input
                type="time"
                value={formData.startTime || ''}
                onChange={(e) => onInputChange('startTime', e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-[#E5E7EB] rounded-lg focus:outline-none text-xs sm:text-sm lg:text-base bg-white text-primary-500 cursor-pointer"
              />
            </div>

            {/* End Time */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-primary-500 mb-2">
                End time
              </label>
              <input
                type="time"
                value={formData.endTime || ''}
                onChange={(e) => onInputChange('endTime', e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-[#E5E7EB] rounded-lg focus:outline-none text-xs sm:text-sm lg:text-base bg-white text-primary-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Instructions Section */}
      <div>
        <h2 className="text-base sm:text-lg font-medium text-primary-500 mb-3 sm:mb-4">
          Anything specific we should know? <span className="text-primary-200 font-medium text-xs sm:text-base"> (Optional)</span>
        </h2>
        <div className="relative">
          <textarea
            value={formData.instructions || ''}
            onChange={(e) => onInputChange('instructions', e.target.value)}
            placeholder="Write your instructions here in any..."
            rows={4}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#E5E7EB] rounded-xl! focus:outline-none text-xs sm:text-sm lg:text-base resize-none"
          />
        </div>
      </div>
    </div>
  );
};

export default PetSittingJobDetailsForm;

