import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '../../components';
import ArrowLeftIcon from '../../assets/arrow-left.svg';
import CalendarIcon from '../../assets/Calendar.svg';
import MapPinIcon from '../../assets/map-pin 1.png';
import ChatIcon from '../../assets/message2.svg';
import { jobsAPI } from '../../services/api';

const JobDetailsPage = () => {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch job details from API
        const response = await jobsAPI.getJobById(jobId);
        
        
        if (response.success && response.data) {
          const jobData = response.data;
          setJob(jobData);
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

  // Helper function to calculate time ago
  const getTimeAgo = (date) => {
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Posted just now';
    } else if (diffInHours === 1) {
      return 'Posted 1h ago';
    } else if (diffInHours < 24) {
      return `Posted ${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Posted ${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  // Transform API data to UI format
  const transformJobData = (apiJob) => {
    if (!apiJob) return null;
    
    return {
      _id: apiJob._id,
      id: apiJob._id, // Use _id as the main ID
      title: `${apiJob.serviceType?.charAt(0).toUpperCase() + apiJob.serviceType?.slice(1)} - ${apiJob.propertyType?.charAt(0).toUpperCase() + apiJob.propertyType?.slice(1)}`,
      postedAgo: apiJob.createdAt ? getTimeAgo(new Date(apiJob.createdAt)) : 'Recently posted',
      scheduledDate: apiJob.scheduledDate ? new Date(apiJob.scheduledDate).toLocaleDateString('en-AU', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) : 'Date not specified',
      location: apiJob.location?.address || 'Location not specified',
      description: apiJob.instructions || 'No specific instructions provided.',
      propertySize: `${apiJob.propertySize}`,
      customerName: apiJob.customerId?.firstName || apiJob.customerId?.lastName || apiJob.customer?.firstName || apiJob.customer?.name || apiJob.customerName || apiJob.postedBy || 'Customer',
      customerPhone: '+61 412 345 678', // Will be updated when customer data is available
      images: apiJob.photos?.map(photo => photo.url) || [],
      budget: 'Price not specified', // Will be updated when budget is available
      status: apiJob.status || 'posted',
      serviceType: apiJob.serviceType || 'general',
      addons: apiJob.addons || {},
      isUrgent: apiJob.isUrgent || false,
      coordinates: apiJob.location?.coordinates || null
    };
  };

  const jobData = job ? transformJobData(job) : null;

  const handleChatWithCustomer = () => {
    // Navigate to chat page
    navigate(`/chat/${jobId}`);
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
      </div>
    );
  }

  if (error || !jobData) {
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
    <div className="bg-gray-50 min-h-screen">
      <Header />

      <div className="max-w-sm mx-auto sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-2 sm:py-4" >
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              <img src={ArrowLeftIcon} alt="Back" className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-primary-500 truncate">
                {jobData.title}
              </h1>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 pb-6">
          {/* Job Overview */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm mb-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl sm:text-2xl font-semibold text-primary-500">
                {jobData.title}
              </h2>
              {jobData.isUrgent && (
                <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                  URGENT
                </span>
              )}
            </div>
            <p className="text-sm text-primary-500 mb-4">{jobData.postedAgo}</p>

            {/* Job Details */}
            <div className="space-y-1 mb-2">
              {/* Date & Time */}
              <div className="flex items-center space-x-3">
                <img src={CalendarIcon} alt="Calendar" className="w-4 h-4" />
                <span className="text-sm text-primary-200 font-medium">{jobData.scheduledDate}</span>
              </div>

              {/* Location */}
              <div className="flex items-center space-x-3">
                <img src={MapPinIcon} alt="Location" className="w-4 h-4" />
                <span className="text-sm text-primary-200 font-medium">{jobData.location}</span>
              </div>

            </div>

            {/* Images Gallery */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              {jobData.images?.map((image, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden">
                  <img
                    src={image}
                    alt={`Property image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>

            {/* Job Description */}
            <div className="mb-3">
              <h3 className="text-lg font-semibold text-primary-500">Job Description</h3>
              <p className="text-sm text-primary-200">
                {jobData.description}
              </p>
            </div>

            {/* Property Size */}
            <div className="mb-3">
              <h3 className="text-lg font-semibold text-primary-500">Property Size</h3>
              <p className="text-sm text-primary-200 font-medium">
                {jobData.propertySize}
              </p>
            </div>

            {/* Add-ons */}
            {jobData.addons && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-primary-500 mb-2">Add-ons</h3>
                <div className="space-y-2">
                  {Object.entries(jobData.addons).map(([key, value]) => (
                    value && (
                      <div key={key} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-primary-200 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end">
            <button
              onClick={handleChatWithCustomer}
              className="bg-primary-500  text-white  cursor-pointer shadow-custom border border-[#EBF2FD] font-medium py-2 px-3 sm:py-3 sm:px-4 rounded-xl transition-colors duration-200 flex items-center gap-2 "
            >
            <img src={ChatIcon} alt="Chat" className="w-5 h-5 brightness-0 invert" />
              Chat with Customer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsPage;
