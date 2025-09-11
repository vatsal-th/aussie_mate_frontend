import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import ArrowLeftIcon from '../assets/arrow-left.svg';
import CalendarIcon from '../assets/Calendar.svg';
import SwitchIcon from '../assets/Switch.svg';
import MapPinIcon from '../assets/map-pin 1.png';

const JobPostingPage = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState('Aug 20, 2025');
  const [instructions, setInstructions] = useState('');
  const [isUrgent, setIsUrgent] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState({
    address: '123 Example Street',
    city: 'Sydney NSW 200, Australia'
  });

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleInstructionsChange = (e) => {
    setInstructions(e.target.value);
  };

  const handleUrgencyToggle = () => {
    setIsUrgent(!isUrgent);
  };

  const handlePostJob = () => {
    // Handle job posting logic here
    console.log('Posting job with:', {
      date: selectedDate,
      instructions,
      isUrgent,
      location: selectedLocation
    });
    // Navigate to success page
    navigate('/job-success');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-md mx-auto px-4 py-6 sm:px-2">
        {/* Header Section */}
        <div className="flex items-center mb-6">
          <Link to="/job-details/cleaning" className="mr-4">
            <img src={ArrowLeftIcon} alt="Back" className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-semibold text-primary-500">Post New Job</h1>
        </div>

        {/* Main Content */}
        <div className="space-y-6 bg-white rounded-2xl p-6 sm:p-8 shadow-custom">
          {/* When do you need the service? */}
          <div>
            <label className="block text-primary-500 text-lg font-semibold mb-3">
              When do you need the service?
            </label>
            <div className="relative">
              <input
                type="text"
                value={selectedDate}
                onChange={handleDateChange}
                className="w-full bg-white rounded-lg px-4 py-3 pr-10 text-primary-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-[#E5E7EB]"
                placeholder="Select date"
              />
              <img 
                src={CalendarIcon} 
                alt="Calendar" 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6"
              />
            </div>
          </div>

          {/* Anything specific we should know? */}
          <div className="mb-1" >
            <label className="block text-primary-500 text-sm font-medium mb-3">
              Anything specific we should know?
            </label>
            <textarea
              value={instructions}
              onChange={handleInstructionsChange}
              placeholder="Write your instructions here in any..."
              className="w-full bg-white rounded-[8px]! px-4 py-3 text-gray-900 placeholder-primary-200 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-[#E5E7EB] resize-none"
              rows={4}
            />
          </div>

          {/* Urgency Toggle */}
          <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-6" >
            <span className="text-primary-500 text-sm font-medium">
              This is urgent (Extra Fee may apply)
            </span>
            <button
              onClick={handleUrgencyToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-blue-500 focus:ring-offset-2 ${
                isUrgent ? 'bg-primary-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isUrgent ? 'translate-x-6' : 'translate-x-1'
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
            <div className="bg-white rounded-lg py-2 flex items-center">
                <div className="mr-3 bg-white rounded-[8px] p-3 border border-[#E5E7EB]">
              <img 
                src={MapPinIcon} 
                alt="Location" 
                className="w-6 h-6"
              />
                </div>
              <div className="flex-1">
                <div className="text-gray-900 font-medium text-sm">
                  {selectedLocation.address}
                </div>
                <div className="text-gray-600 text-xs">
                  {selectedLocation.city}
                </div>
              </div>
              <button className="text-[#1F6FEB] text-sm font-medium border border-[#E5E7EB] rounded-[8px]! px-4 py-2">
                Change
              </button>
            </div>
          </div>

           {/* Post Job Button */}
           <div className="flex justify-end">
             <button
               onClick={handlePostJob}
               className="bg-primary-500 text-white font-medium py-2 px-6 rounded-lg hover:bg-primary-600 transition-colors focus:outline-none"
             >
               Post Job
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default JobPostingPage;
