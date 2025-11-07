import React, { useState, useRef, useEffect } from 'react';
import AlertModal from './AlertModal';
import arrowDownIcon from '../../../assets/down2.svg';

const FrequencySelect = ({
  frequency,
  preferredDays = {},
  customDates = [],
  onFrequencyChange,
  onPreferredDaysChange,
  onCustomDatesChange
}) => {
  const [isFrequencyOpen, setIsFrequencyOpen] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  
  const frequencyRef = useRef(null);

  // Frequency Options
  const frequencyOptions = [
    'One-time',
    'Weekly',
    'Custom'
  ];

  // Days of Week
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (frequencyRef.current && !frequencyRef.current.contains(event.target)) {
        setIsFrequencyOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle frequency selection
  const handleFrequencySelect = (option) => {
    setIsFrequencyOpen(false);
    onFrequencyChange(option);
    
    // Clear data when switching away from Weekly or Custom
    if (option !== 'Weekly') {
      onPreferredDaysChange({});
    }
    if (option !== 'Custom') {
      onCustomDatesChange([]);
    }
  };

  // Handle day selection
  const handleDayToggle = (day) => {
    const updatedDays = {
      ...preferredDays,
      [day]: !preferredDays[day]
    };
    onPreferredDaysChange(updatedDays);
  };

  // Handle custom date selection
  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    if (selectedDate) {
      // Get current month's dates only
      const selected = new Date(selectedDate);
      const now = new Date();

      // Check if date is in current month
      if (selected.getMonth() === now.getMonth() && selected.getFullYear() === now.getFullYear()) {
        const dateString = selectedDate;
        if (!customDates.includes(dateString)) {
          const updatedDates = [...customDates, dateString].sort();
          onCustomDatesChange(updatedDates);
        } else {
          setAlertMessage('This date is already selected.');
          setShowAlertModal(true);
        }
      } else {
        setAlertMessage('Please select a date from the current month only.');
        setShowAlertModal(true);
      }
      // Reset input
      e.target.value = '';
    }
  };

  // Remove custom date
  const handleRemoveDate = (date) => {
    const updatedDates = customDates.filter(d => d !== date);
    onCustomDatesChange(updatedDates);
  };

  // Get current month start and end dates for date picker
  const getCurrentMonthDates = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return {
      min: firstDay.toISOString().split('T')[0],
      max: lastDay.toISOString().split('T')[0]
    };
  };

  const monthDates = getCurrentMonthDates();

  return (
    <>
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-primary-500 mb-3">
          Frequency
        </h3>
        <div className="relative" ref={frequencyRef}>
          <div
            onClick={() => setIsFrequencyOpen(!isFrequencyOpen)}
            className="flex items-center justify-between w-full px-4 py-3 border border-gray-300 rounded-full bg-white cursor-pointer hover:border-primary-500 transition-colors"
          >
            <span className="text-gray-900">{frequency}</span>
            <img 
              src={arrowDownIcon} 
              alt="Dropdown" 
              className={`w-5 h-5 transition-transform ${isFrequencyOpen ? 'rotate-180' : ''}`} 
            />
          </div>
          {isFrequencyOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
              {frequencyOptions.map((option) => (
                <div
                  key={option}
                  onClick={() => handleFrequencySelect(option)}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-900 text-sm sm:text-base"
                >
                  {option}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preferred Days - Only show for Weekly */}
        {frequency === 'Weekly' && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-primary-500 mb-3">
              Preferred Days
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {daysOfWeek.map((day) => (
                <label key={day} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferredDays[day] || false}
                    onChange={() => handleDayToggle(day)}
                    className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500 border-gray-300 rounded cursor-pointer"
                  />
                  <span className="ml-2 text-sm text-gray-900 font-medium">{day}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Custom Date Picker - Only show for Custom */}
        {frequency === 'Custom' && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-primary-500 mb-3">
              Select Dates (Current Month Only)
            </label>
            <input
              type="date"
              min={monthDates.min}
              max={monthDates.max}
              onChange={handleDateChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {customDates.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-xs text-gray-600 font-medium">Selected Dates:</p>
                <div className="flex flex-wrap gap-2">
                  {customDates.map((date, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg text-[#1F6FEB]"
                    >
                      <span className="text-sm text-[#1F6FEB] font-medium">
                        {new Date(date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDate(date)}
                        className="text-primary-600 hover:text-primary-800 cursor-pointer"
                      >
                        <span className="text-lg leading-none">×</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        title="Alert"
        message={alertMessage}
        buttonText="OK"
      />
    </>
  );
};

export default FrequencySelect;

