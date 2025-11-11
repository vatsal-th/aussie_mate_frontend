import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../../components';
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
      serviceDetail: apiJob.serviceDetail || '',
      petType: apiJob.petType || '',
      petBreed: apiJob.petBreed || '',
      numberOfPets: apiJob.numberOfPets || '',
      frequency: apiJob.frequency || 'One-time',
      preferredDays: apiJob.preferredDays || {},
      customDates: Array.isArray(apiJob.customDates) ? apiJob.customDates : [],
      repeatWeeks: apiJob.repeatWeeks || '',
      customerName: apiJob.customerId?.firstName || apiJob.customerId?.lastName || apiJob.customer?.firstName || apiJob.customer?.name || apiJob.customerName || apiJob.postedBy || 'Customer',
      customerPhone: '+61 412 345 678', 
      images: apiJob.photos?.map(photo => photo.url) || [],
      budget: 'Price not specified', 
      status: apiJob.status || 'posted',
      serviceType: apiJob.serviceType || 'general',
      isUrgent: apiJob.isUrgent || false,
      coordinates: apiJob.location?.coordinates || null
    };
  };

  const jobData = job ? transformJobData(job) : null;

  const handleChatWithCustomer = () => {
    navigate(`/chat/${jobId}`);
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50" />
    );
  }

  if (error || !jobData) {
    return (
      <div className="min-h-screen bg-gray-50">
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
      <div className="max-w-sm mx-auto sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl">
        <PageHeader
          title={jobData.title}
          onBack={() => navigate(-1)}
          className="px-4 sm:px-6 lg:px-8 py-2 sm:py-4"
          titleClassName="text-lg sm:text-xl font-semibold text-primary-500 truncate"
        />

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

            {jobData.serviceDetail && (
              <div className="mb-3">
                <h3 className="text-lg font-semibold text-primary-500">Type of Service</h3>
                <p className="text-sm text-primary-200 font-medium">
                  {jobData.serviceDetail}
                </p>
              </div>
            )}

            {(jobData.petType || jobData.petBreed || jobData.numberOfPets) && (
              <div className="mb-3">
                <h3 className="text-lg font-semibold text-primary-500">Pet Details</h3>
                <div className="space-y-1 text-sm text-primary-200 font-medium">
                  {jobData.petType && <div>Pet Type: {jobData.petType}</div>}
                  {jobData.petBreed && <div>Breed: {jobData.petBreed}</div>}
                  {jobData.numberOfPets && <div>Number of Pets: {jobData.numberOfPets}</div>}
                </div>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-primary-500 mb-2">Schedule</h3>
              <div className="space-y-2">
                <div className="text-sm text-primary-200 font-medium">
                  Frequency: {jobData.frequency}
                </div>
                {jobData.frequency === 'Weekly' && (
                  <div className="text-sm text-primary-200 font-medium">
                    Preferred Days:{' '}
                    {Object.entries(jobData.preferredDays)
                      .filter(([, selected]) => selected)
                      .map(([day]) => day)
                      .join(', ') || 'Any'}
                  </div>
                )}
                {jobData.frequency === 'Custom' && jobData.customDates.length > 0 && (
                  <div className="text-sm text-primary-200 font-medium">
                    Selected Dates:{' '}
                    {jobData.customDates
                      .map(date => new Date(date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }))
                      .join(', ')}
                  </div>
                )}
                {jobData.repeatWeeks && jobData.frequency === 'Weekly' && (
                  <div className="text-sm text-primary-200 font-medium">
                    Repeat for {jobData.repeatWeeks} week(s)
                  </div>
                )}
              </div>
            </div>
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
