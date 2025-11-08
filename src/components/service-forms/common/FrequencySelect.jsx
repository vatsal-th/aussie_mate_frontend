import React, { useMemo, useState } from 'react';
import AlertModal from './AlertModal';
import { Checkbox, CustomSelect } from '../../form-controls';

const FrequencySelect = ({
  frequency,
  preferredDays = {},
  customDates = [],
  repeatWeeks = '',
  onFrequencyChange,
  onPreferredDaysChange,
  onCustomDatesChange,
  onRepeatWeeksChange
}) => {
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [dateInput, setDateInput] = useState('');

  const frequencyOptions = useMemo(() => (
    [
      { value: 'One-time', label: 'One-time' },
      { value: 'Weekly', label: 'Weekly' },
      { value: 'Custom', label: 'Custom' }
    ]
  ), []);

  // Days of Week
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Handle frequency selection
  const handleFrequencySelect = (optionValue) => {
    onFrequencyChange(optionValue);

    // Clear data when switching away from Weekly or Custom
    if (optionValue !== 'Weekly') {
      onPreferredDaysChange({});
      if (onRepeatWeeksChange) {
        onRepeatWeeksChange('');
      }
    }
    if (optionValue !== 'Custom') {
      onCustomDatesChange([]);
      setDateInput('');
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
  const handleDateSelect = (selectedDate) => {
    if (!selectedDate) return;

    if (!customDates.includes(selectedDate)) {
      const updatedDates = [...customDates, selectedDate].sort();
      onCustomDatesChange(updatedDates);
    } else {
      setAlertMessage('This date is already selected.');
      setShowAlertModal(true);
    }
  };

  // Remove custom date
  const handleRemoveDate = (date) => {
    const updatedDates = customDates.filter(d => d !== date);
    onCustomDatesChange(updatedDates);
  };

  return (
    <>
      <div>
        <h3 className="text-base text-primary-500 font-medium   mb-3">
          Frequency
        </h3>
        <CustomSelect
          value={frequency}
          onChange={handleFrequencySelect}
          options={frequencyOptions}
          placeholder="Select frequency"
        />

        {/* Preferred Days - Only show for Weekly */}
        {frequency === 'Weekly' && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-primary-500 mb-3">
              Preferred Days
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {daysOfWeek.map((day) => (
                <Checkbox
                  key={day}
                  name={`preferred-day-${day}`}
                  checked={preferredDays[day] || false}
                  onChange={() => handleDayToggle(day)}
                  label={day}
                  className="items-center"
                  labelClassName="ml-2 text-sm text-gray-900 font-medium"
                  checkboxSize="w-4 h-4 sm:w-5 sm:h-5"
                />
              ))}
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-primary-500 mb-2">
                Number of weeks do you want to repeat
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={repeatWeeks}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  onRepeatWeeksChange?.(value);
                }}
                placeholder='e.g "1"'
                className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm text-gray-900"
              />
            </div>
          </div>
        )}

        {/* Custom Date Picker - Only show for Custom */}
        {frequency === 'Custom' && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-primary-500 mb-3">
              Select Dates (Current Month Only)
            </label>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <input
                type="date"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                className="flex-1 rounded-full border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  handleDateSelect(dateInput);
                  setDateInput('');
                }}
                disabled={!dateInput}
                className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition cursor-pointer ${
                  dateInput
                    ? 'bg-primary-500 text-white hover:bg-primary-600'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                Add Date
              </button>
            </div>
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

