import React, { useState, useEffect } from 'react';
import { Button } from '../form-controls';
import AddTaskModal from './common/AddTaskModal';
import PlusIcon from '../../assets/plus2.svg';
import DeleteIcon from '../../assets/trash-red.svg';
import uploadIcon from '../../assets/upload-cloud.svg';

const HandymanJobDetailsForm = ({ 
  formData, 
  onInputChange,
  selectedFiles = [],
  onDrag,
  onDrop,
  dragActive,
  uploadError,
  onFileInputChange,
  onRemoveFile
}) => {
  const [customRequests, setCustomRequests] = useState([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestInput, setRequestInput] = useState('');
  const [selectedServiceType, setSelectedServiceType] = useState('Electrical Repairs');
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);

  // Service types with their repair options
  const serviceTypes = {
    'Electrical Repairs': ['Switchboard Repair', 'Light / Fan Installation', 'Doorbell Fix', 'Minor Wiring Fix', 'Socket Replacement'],
    'Plumbing': ['Repair leaks', 'Taps replacement', 'Flush tank repair', 'Pipe fitting', 'Water pressure fix'],
    'Carpentry': ['Door repair', 'Furniture fixing', 'Shelf installation', 'Cabinet repair', 'Wooden structure fix'],
    'Wall & Painting Jobs': ['Wall touch-ups', 'Wall hanging', 'Paint fixing', 'Wall patch repair', 'Color matching'],
    'Appliance Mounting': ['TV mounting', 'AC installation', 'Geyser mounting', 'Fan installation', 'Security system installation'],
    'Miscellaneous Jobs': ['Minor fixes', 'General adjustments', 'Quick repairs', 'Assembly jobs', 'Other services']
  };

  const predefinedRepairs = serviceTypes[selectedServiceType] || [];

  const [selectedRepairs, setSelectedRepairs] = useState({});

  const handleRepairToggle = (repair) => {
    setSelectedRepairs(prev => ({
      ...prev,
      [repair]: !prev[repair]
    }));
  };

  const handleAddCustomRequest = () => {
    setShowRequestModal(true);
  };

  const handleCloseRequestModal = () => {
    setShowRequestModal(false);
    setRequestInput('');
  };

  const handleRequestInputChange = (e) => {
    const value = e.target.value;
    setRequestInput(value);
    
    if (value.includes(',')) {
      const requests = value.split(',').map(request => request.trim()).filter(request => request);
      if (requests.length > 0) {
        setCustomRequests([...customRequests, ...requests]);
        const lastPart = value.split(',').pop().trim();
        setRequestInput(lastPart);
      }
    }
  };

  const handleSaveRequests = () => {
    if (requestInput.trim()) {
      setCustomRequests([...customRequests, requestInput.trim()]);
      setRequestInput('');
      setShowRequestModal(false);
    } else {
      setShowRequestModal(false);
    }
  };

  const handleRemoveRequest = (index) => {
    setCustomRequests(customRequests.filter((_, i) => i !== index));
  };

  const handleServiceTypeSelect = (serviceType) => {
    setSelectedServiceType(serviceType);
    setIsServiceDropdownOpen(false);
    setSelectedRepairs({}); // Reset selections when changing service type
    onInputChange('handymanServiceType', serviceType);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.service-dropdown')) {
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

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Service Selection Section */}
      <div>
        <h2 className="text-base sm:text-lg font-medium text-primary-500 mb-2">
          What type of service do you need?
        </h2>
        <p className="text-xs sm:text-sm text-primary-200 font-medium mb-4">
          Any job. Any time. The right help, fast.
        </p>
        <label className="block text-xs sm:text-sm font-medium text-primary-500 mb-2">
          Services
        </label>
        <div className="relative service-dropdown">
          <button
            type="button"
            onClick={() => setIsServiceDropdownOpen(!isServiceDropdownOpen)}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-[#E5E7EB] rounded-lg focus:outline-none text-xs sm:text-sm lg:text-base bg-white text-primary-500 flex items-center justify-between cursor-pointer"
          >
            <span>{selectedServiceType}</span>
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
              {Object.keys(serviceTypes).map((serviceType, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleServiceTypeSelect(serviceType)}
                  className="w-full px-4 py-2.5 sm:py-3 text-left text-xs sm:text-sm lg:text-base hover:bg-gray-50 flex items-center justify-between cursor-pointer"
                >
                  <span className="text-primary-500">{serviceType}</span>
                  {selectedServiceType === serviceType && (
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

      {/* Repairs Section */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="text-base sm:text-lg font-semibold text-primary-500">{selectedServiceType}</h2>
          <button
            type="button"
            onClick={handleAddCustomRequest}
            className="flex items-center gap-1 sm:gap-2 text-[#1F6FEB] font-medium cursor-pointer text-xs sm:text-sm"
          >
            <img src={PlusIcon} alt="Add" className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Add Custom Request</span>
            <span className="sm:hidden">Add Request</span>
          </button>
        </div>

        {/* Predefined Repairs Checkboxes */}
        <div className="space-y-3">
          {predefinedRepairs.map((repair, index) => (
            <div key={index} className="flex items-center">
              <input
                type="checkbox"
                id={`repair-${index}`}
                checked={selectedRepairs[repair] || false}
                onChange={() => handleRepairToggle(repair)}
                className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500 border-gray-300 rounded cursor-pointer"
              />
              <label
                htmlFor={`repair-${index}`}
                className="ml-3 text-xs sm:text-sm lg:text-base text-primary-500 font-medium cursor-pointer"
              >
                {repair}
              </label>
            </div>
          ))}
        </div>

        {/* Display Added Custom Requests */}
        {customRequests.length > 0 && (
          <div className="mt-4 space-y-2">
            {customRequests.map((request, index) => (
              <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-xs sm:text-sm text-primary-500 font-medium pr-2 break-words flex-1">{request}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveRequest(index)}
                  className="text-red-500 hover:text-red-600 cursor-pointer flex-shrink-0"
                >
                  <img src={DeleteIcon} alt="Delete" className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Section */}
      <div>
        <h3 className="text-base sm:text-lg font-medium text-primary-500 mb-3 sm:mb-4">
          Upload Photos <span className="text-primary-200 font-medium text-xs sm:text-base"> (Optional)</span>
        </h3>

        {uploadError && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded text-xs sm:text-sm">
            {uploadError}
          </div>
        )}

        <div
          className={`border-2 border-dashed rounded-lg p-4 sm:p-6 lg:p-8 text-center transition-colors cursor-pointer ${
            dragActive ? 'border-primary-500 bg-primary-50' : 'border-[#D1D3D8] hover:border-primary-500'
          }`}
          onDragEnter={onDrag}
          onDragLeave={onDrag}
          onDragOver={onDrag}
          onDrop={onDrop}
          onClick={() => document.getElementById('handymanFileInput').click()}
        >
          <input
            id="handymanFileInput"
            type="file"
            accept="image/*"
            multiple
            onChange={onFileInputChange}
            className="hidden"
          />
          
          <div className="flex flex-col items-center space-y-3 sm:space-y-4">
            <div className={`rounded-full p-3 sm:p-4 ${dragActive ? 'bg-primary-500' : 'bg-primary-200'}`}>
              <img
                src={uploadIcon}
                alt="Upload"
                className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10"
              />
            </div>
            <div>
              <p className="text-xs sm:text-sm lg:text-base text-primary-500 font-medium mb-2">
                {dragActive ? 'Drop files here' : 'Select photos to upload'}
              </p>
              <button
                type="button"
                className="px-4 sm:px-6 py-2 sm:py-3 bg-primary-500 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-primary-600 transition-colors"
              >
                Click Here to Upload
              </button>
            </div>
          </div>
        </div>

        {selectedFiles.length > 0 && (
          <div className="mt-4">
            <h4 className="text-xs sm:text-sm font-medium text-primary-500 mb-2 sm:mb-3">
              Selected Files ({selectedFiles.length}/10)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
              {selectedFiles.map((file, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-20 sm:h-24 object-cover rounded-lg border border-gray-200"
                  />
                  <Button
                    type="button"
                    onClick={() => onRemoveFile(index)}
                    variant="danger"
                    size="xs"
                    className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </Button>
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
        <h3 className="text-base sm:text-lg font-medium text-primary-500 mb-3 sm:mb-4">
          Anything specific we should know? <span className="text-primary-200 font-medium text-xs sm:text-base"> (Optional)</span>
        </h3>
        <div className="relative">
          <textarea
            value={formData.instructions || ''}
            onChange={(e) => onInputChange('instructions', e.target.value)}
            placeholder="Write your instructions here in any...."
            rows={4}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#E5E7EB] rounded-xl! focus:outline-none text-xs sm:text-sm lg:text-base resize-none"
          />
        </div>
      </div>

      {/* Add Request Modal */}
      <AddTaskModal
        isOpen={showRequestModal}
        onClose={handleCloseRequestModal}
        onSave={handleSaveRequests}
        value={requestInput}
        onChange={handleRequestInputChange}
        title="Add Custom Request"
        description="List requests by using a comma (,) between each one. e.g. Request 1, Request 2, Request 3"
        placeholder="Enter Request"
        saveButtonText="Add"
      />
    </div>
  );
};

export default HandymanJobDetailsForm;

