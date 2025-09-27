import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import ConfirmationModal from '../components/ConfirmationModal';
import ArrowLeftIcon from '../assets/arrow-left.svg';
import ThreeDotIcon from '../assets/3dot.svg';
import CalendarIcon from '../assets/Calendar.svg';
import MapPinIcon from '../assets/map-pin 1.png';
import UserIcon from '../assets/user.svg';
import RatingIcon from '../assets/rating.svg';
import SilverBadgeIcon from '../assets/silverBadge.svg';
import MessageIcon from '../assets/message2.svg';
import CloseIcon from '../assets/close.svg';
import { jobsAPI } from '../services/api';

const CustomerJobDetailsPage = () => {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await jobsAPI.getJobById(jobId);

        if (response.success && response.data) {
          setJob(response.data);
        } else {
          setError('Job not found');
        }
      } catch (err) {
        console.error('Error fetching job details:', err);
        setError('Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId]);

  // Handle outside clicks to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getJobTitle = (job) => {
    if (!job) return 'Job Details';
    const serviceType = job.serviceType?.charAt(0).toUpperCase() + job.serviceType?.slice(1) || 'Service';
    const propertyType = job.propertyType?.charAt(0).toUpperCase() + job.propertyType?.slice(1) || 'Property';
    return `${serviceType} - ${job.bedrooms || 0} Bed, ${job.bathrooms || 0} Bath ${propertyType}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'Time not set';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleDropdownToggle = () => {
    setShowDropdown(!showDropdown);
  };

  const handleEditJob = () => {
    setShowDropdown(false);
    // Navigate to edit job page
    navigate(`/edit-job/${jobId}`);
  };

  const handleCancelJob = () => {
    setShowDropdown(false);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    try {
      setIsCancelling(true);
      
      // Call API to cancel/delete the job
      const response = await jobsAPI.cancelJob(jobId);
      
      if (response.success) {
        // Show success message briefly before navigating
        console.log('Job cancelled successfully');
        // Navigate back to jobs list after successful cancellation
        navigate('/my-jobs');
      } else {
        console.error('Failed to cancel job:', response.message);
        // Show error message or handle failure
        setError('Failed to cancel job. Please try again.');
        setShowCancelModal(false);
      }
    } catch (error) {
      console.error('Error cancelling job:', error);
      setError('Failed to cancel job. Please try again.');
      setShowCancelModal(false);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleCancelModalClose = () => {
    setShowCancelModal(false);
  };

  // Mock cleaner quotes data
  const cleanerQuotes = [
    {
      id: '1047',
      name: 'Cleaner #1047',
      rating: 4.8,
      reviews: 120,
      tier: 'Silver Tier',
      quoteAmount: 160,
      distance: '3.2 km away',
      isVerified: true
    },
    {
      id: '1049',
      name: 'Cleaner #1049',
      rating: 4.8,
      reviews: 95,
      tier: 'Silver Tier',
      quoteAmount: 160,
      distance: '3.2 km away',
      isVerified: true
    },
    {
      id: '1051',
      name: 'Cleaner #1051',
      rating: 4.8,
      reviews: 87,
      tier: 'Silver Tier',
      quoteAmount: 160,
      distance: '3.2 km away',
      isVerified: true
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-sm mx-auto min-h-screen sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-sm mx-auto min-h-screen sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="text-center py-8">
              <div className="text-red-500 text-lg font-medium">{error || 'Job not found'}</div>
              <button
                onClick={() => navigate(-1)}
                className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Job Details Header */}
      <div className="max-w-6xl mx-auto py-3 sm:py-4 px-3 sm:px-4 md:px-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="rounded-lg transition-colors cursor-pointer flex items-center space-x-1 sm:space-x-2"
          >
            <img src={ArrowLeftIcon} alt="Back" className="w-4 h-4 sm:w-5 sm:h-5" />
            <h1 className="text-sm sm:text-base md:text-lg font-semibold text-primary-500 truncate">
              Job Details - {job.serviceType || 'Cleaning'}
            </h1>
          </button>
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={handleDropdownToggle}
              className="cursor-pointer p-1 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <img src={ThreeDotIcon} alt="More options" className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            
            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                <div className="py-2">
                  {/* Cancel Job Option */}
                  <button
                    onClick={handleCancelJob}
                    className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <img src={CloseIcon} alt="Cancel" className="w-5 h-5" />
                    <span className="text-sm font-medium text-gray-700">Cancel Job</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6">
        {/* Job Information Card */}
        <div className="bg-white rounded-2xl shadow-custom p-3 sm:p-4 md:p-6 mb-3 sm:mb-4">
          <div className="space-y-2 sm:space-y-3">
            {/* Job ID */}
            <div className="text-xs sm:text-sm text-primary-200 font-medium">
              {job.jobId}
            </div>

            {/* Job Title */}
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-primary-500 leading-tight">
              {getJobTitle(job)}
            </h2>

            {/* Job Schedule */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <img src={CalendarIcon} alt="Calendar" className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm md:text-base text-primary-200 font-medium">
                {formatDate(job.scheduledDate)} – {formatTime(job.scheduledTime)}
              </span>
            </div>

            {/* Job Location */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <img src={MapPinIcon} alt="Location" className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm md:text-base text-primary-200 font-medium">
                {job.location?.address || job.address || 'Location not specified'}
              </span>
            </div>

            {/* Job Status */}
            <div className="flex justify-start">
              <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs sm:text-sm font-medium">
                Awaiting Quotes
              </span>
            </div>
          </div>
        </div>

        {/* Cleaner Quotes Section */}
        <div className="bg-white rounded-2xl shadow-custom p-3 sm:p-4 md:p-6">
          <div className="mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg md:text-xl font-semibold text-primary-500 mb-1 sm:mb-2">
              Cleaner Quotes ({cleanerQuotes.length})
            </h3>
            <p className="text-xs sm:text-sm text-primary-200 font-medium">
              Cleaners nearby have sent their offers. Review and chat before choosing.
            </p>
          </div>

          <div className="space-y-2 sm:space-y-3">
            {cleanerQuotes.map((cleaner, index) => (
              <div key={cleaner.id} className="border border-[#E5E7EB] shadow-custom rounded-xl p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
                  <div className="flex-1">
                    {/* Top row: Cleaner ID, Badge, Rating */}
                    <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-3">
                      <div className="flex items-center space-x-1">
                        <img src={UserIcon} alt="User" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="text-xs sm:text-sm font-medium text-primary-500">
                          {cleaner.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 bg-[linear-gradient(94.49deg,#FDFDFD_0%,#E9E9E9_100%)] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border-[0.6px] border-[#E5E7EB]">
                        <img src={SilverBadgeIcon} alt="Silver Badge" className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="text-xs text-primary-500 font-medium">
                          {cleaner.tier}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 bg-[#FFF2DE] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                        <img src={RatingIcon} alt="Rating" className="w-3 h-3" />
                        <span className="text-xs font-medium text-primary-500">
                          {cleaner.rating}
                        </span>
                      </div>
                    </div>

                    {/* Quote details */}
                    <div className="space-y-1">
                      <div className="text-xs sm:text-sm text-[#374151] font-medium">
                        Quote Amount: <span className="font-bold text-[#1F6FEB]">${cleaner.quoteAmount}</span>
                      </div>
                      <div className="text-xs text-primary-500 font-medium">
                        {cleaner.distance}
                      </div>
                    </div>
                  </div>

                  {/* Action button */}
                  <button
                    onClick={() => navigate(`/customer-chat/${jobId}?cleaner=${cleaner.id}`)}
                    className="text-[#1F6FEB] px-3 sm:px-4 py-2 rounded-xl! flex items-center justify-center space-x-1 sm:space-x-2 transition-colors cursor-pointer w-full sm:w-auto mt-2 sm:mt-0 sm:ml-4 border border-[#9CC0F6] shadow-custom cursor-pointer" 
                  >
                    <img src={MessageIcon} alt="Message" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm font-medium">View & Chat</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cancel Job Confirmation Modal */}
      <ConfirmationModal
        isOpen={showCancelModal}
        onClose={handleCancelModalClose}
        onConfirm={handleConfirmCancel}
        title="Cancel Job?"
        message="Are you sure you want to cancel this job? This action cannot be undone and all cleaner quotes will be lost."
        confirmText="Cancel Job"
        cancelText="Keep Job"
        confirmButtonColor="bg-[#EF4444] hover:bg-red-600"
        isLoading={isCancelling}
      />
    </div>
  );
};

export default CustomerJobDetailsPage;
