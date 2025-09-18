import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

const SetAvailabilityPage = () => {
  const navigate = useNavigate();
  const [availability, setAvailability] = useState({
    monday: true,
    tuesday: false,
    wednesday: true,
    thursday: false,
    friday: true,
    saturday: false,
    sunday: false,
    repeatWeekly: true
  });
  const [isLoading, setIsLoading] = useState(false);

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
      [day]: !prev[day]
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

    try {
      // Here you would save the availability data
      console.log('Saving availability:', availability);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
       // Navigate to cleaner location page
       navigate('/set-cleaner-location');
    } catch (error) {
      console.error('Error saving availability:', error);
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
      <Header />
      
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
                      isOn={availability[day.key]}
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
              <button
                type="submit"
                disabled={isLoading}
                className="bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-xl transition-colors duration-200 text-sm sm:text-base cursor-pointer"
              >
                {isLoading ? 'Saving...' : 'Continue & Set Location'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SetAvailabilityPage;
