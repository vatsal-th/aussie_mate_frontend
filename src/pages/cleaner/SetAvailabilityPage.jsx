import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../../services/api';
import { Button } from '../../components';

const SetAvailabilityPage = () => {
  const navigate = useNavigate();
  const [availability, setAvailability] = useState({
    monday: { isAvailable: true, startTime: '09:00', endTime: '17:00', breaks: [] },
    tuesday: { isAvailable: false, startTime: null, endTime: null, breaks: [] },
    wednesday: { isAvailable: true, startTime: '09:00', endTime: '17:00', breaks: [] },
    thursday: { isAvailable: false, startTime: null, endTime: null, breaks: [] },
    friday: { isAvailable: true, startTime: '09:00', endTime: '17:00', breaks: [] },
    saturday: { isAvailable: false, startTime: null, endTime: null, breaks: [] },
    sunday: { isAvailable: false, startTime: null, endTime: null, breaks: [] },
    repeatWeekly: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];

  const handleDayToggle = (day) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        isAvailable: !prev[day].isAvailable,
        startTime: !prev[day].isAvailable ? '09:00' : null,
        endTime: !prev[day].isAvailable ? '17:00' : null,
        breaks: !prev[day].isAvailable ? [] : prev[day].breaks
      }
    }));
  };

  const handleRepeatToggle = () => {
    setAvailability(prev => ({
      ...prev,
      repeatWeekly: !prev.repeatWeekly
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Prepare schedule data for API
      const scheduleData = {
        schedule: {
          monday: availability.monday,
          tuesday: availability.tuesday,
          wednesday: availability.wednesday,
          thursday: availability.thursday,
          friday: availability.friday,
          saturday: availability.saturday,
          sunday: availability.sunday
        },
        repeatWeekly: availability.repeatWeekly,
        timezone: 'Australia/Melbourne'
      };

      // Save availability via API
      const response = await userAPI.setAvailability(scheduleData);
      
      if (response.success) {
        // Navigate to cleaner location page
        navigate('/set-cleaner-location');
      } else {
        setError(response.message || 'Failed to save availability. Please try again.');
      }
    } catch (error) {
      console.error('Error saving availability:', error);
      setError('Failed to save availability. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const ToggleSwitch = ({ isOn, onToggle, disabled = false }) => (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
        isOn ? 'bg-primary-500' : 'bg-gray-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          isOn ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-custom mt-5">
          {/* Header */}
          <div className=" mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-primary-500 mb-2">
              Set Your Availability
            </h1>
            <p className="text-sm sm:text-base text-primary-200 font-medium">
              Tell us when you are available for work. This helps customers book you easily.
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Weekly Availability */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-primary-500 mb-4">
                Weekly Availability
              </h2>
              <div className="space-y-4">
                {days.map((day) => (
                  <div key={day.key} className="flex items-center justify-between border-b border-[#F3F3F3] pb-4">
                    <span className="text-sm sm:text-base font-medium text-primary-500">
                      {day.label}
                    </span>
                    <ToggleSwitch
                      isOn={availability[day.key].isAvailable}
                      onToggle={() => handleDayToggle(day.key)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Repeat Weekly */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-primary-500 mb-2">
                Repeat weekly
              </h2>
              <p className="text-sm text-primary-200 mb-4 font-medium">
                Your schedule will auto-repeat every week. You can edit anytime.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm sm:text-base font-medium text-primary-500">
                  Enable auto-repeat
                </span>
                <ToggleSwitch
                  isOn={availability.repeatWeekly}
                  onToggle={handleRepeatToggle}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end mt-5">
              <Button
                type="submit"
                disabled={isLoading}
                loading={isLoading}
                size="md"
                className="px-6"
              >
                Continue & Set Location
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SetAvailabilityPage;
