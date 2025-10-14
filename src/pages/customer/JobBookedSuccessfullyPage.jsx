import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Header from '../../components/Header';
import Button from '../../components/Button';
import CalendarIcon from '../../assets/Calendar.svg';
import MapPinIcon from '../../assets/map-pin 1.png';
import MessageIcon from '../../assets/message2.svg';
import CallIcon from '../../assets/call.svg';
import InfoIcon from '../../assets/info.svg';
import JobLiveIcon from '../../assets/joblive.gif';
import { jobsAPI } from '../../services/api';
import { paymentService } from '../../services/paymentService';

const JobBookedSuccessfullyPage = () => {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState(null);
  const [cleaner, setCleaner] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch job details from API
        const response = await jobsAPI.getJobById(jobId);
        
        if (response.success && response.data) {
          const jobData = response.data;
          
          console.log('Job Data:', jobData); // Debug log
          
          // Find accepted quote
          const acceptedQuote = jobData.quotes?.find(q => q.status === 'accepted');
          
          if (!acceptedQuote) {
            setError('No accepted quote found');
            setLoading(false);
            return;
          }

          console.log('Accepted Quote:', acceptedQuote); // Debug log

          // Format date
          const formatDate = (dateString) => {
            if (!dateString) return 'Date not set';
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'short',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            });
          };

          // Extract cleaner info - handle both nested and direct references
          let cleanerInfo = acceptedQuote.cleanerId;
          
          // If cleanerId is just an ID string, fetch from job's populated data
          if (typeof cleanerInfo === 'string') {
            cleanerInfo = jobData.cleanerId || {};
          }
          
          // If still not found, try to get from quote object directly
          if (!cleanerInfo || !cleanerInfo.firstName) {
            cleanerInfo = acceptedQuote.cleaner || acceptedQuote.cleanerId || {};
          }

          console.log('Cleaner Info:', cleanerInfo); // Debug log

          const cleanerName = cleanerInfo.firstName && cleanerInfo.lastName 
            ? `${cleanerInfo.firstName} ${cleanerInfo.lastName}` 
            : cleanerInfo.name || 'Cleaner';

          // Get payment method - check if there's a payment record
          let paymentMethod = 'cash'; // default
          let onlineAmount = 0;
          let cashAmount = acceptedQuote.price || 0;

          try {
            const paymentResponse = await paymentService.getPaymentStatus(jobId);
            if (paymentResponse.success && paymentResponse.data) {
              paymentMethod = paymentResponse.data.paymentMethod;
              
              if (paymentMethod === 'online') {
                onlineAmount = paymentResponse.data.amount;
                cashAmount = 0;
              }
            }
          } catch (paymentError) {
            console.log('Payment info not available, using default');
            // If payment info not available, calculate based on quote
            onlineAmount = Math.round((acceptedQuote.price || 0) * 0.1);
            cashAmount = Math.round((acceptedQuote.price || 0) * 0.9);
          }

          // Set job data
          setJob({
            jobId: jobData.jobId || jobId,
            title: jobData.title || `${jobData.serviceType} - ${jobData.bedrooms} Bed ${jobData.propertyType}`,
            scheduledDate: formatDate(jobData.scheduledDate),
            location: jobData.location?.address || jobData.location?.fullAddress || 'Location not specified',
            baseQuote: acceptedQuote.basePrice || acceptedQuote.price || 0,
            addOns: acceptedQuote.addOns || 0,
            total: acceptedQuote.price || 0,
            paymentMethod: paymentMethod,
            onlinePaid: onlineAmount,
            cashAmount: cashAmount,
            status: jobData.status || 'accepted'
          });

          // Set cleaner data
          setCleaner({
            id: cleanerInfo._id || cleanerInfo.id,
            name: cleanerName,
            phone: cleanerInfo.phone || cleanerInfo.phoneNumber || cleanerInfo.mobile || 'Not available',
            email: cleanerInfo.email || '',
            avatar: cleanerInfo.profilePhoto || cleanerInfo.profilePicture || cleanerInfo.avatar || '',
            rating: cleanerInfo.averageRating !== undefined ? cleanerInfo.averageRating : (cleanerInfo.rating || 0),
            status: 'Booked'
          });

        } else {
          setError('Failed to load job details');
        }
      } catch (error) {
        console.error('Error fetching job details:', error);
        setError('Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId]);

  const handleChatWithCleaner = () => {
    if (cleaner?.id) {
      navigate(`/customer-chat/${jobId}?cleaner=${cleaner.id}`);
    }
  };

  const handleViewBooking = () => {
    navigate('/my-jobs');
  };

  const handleReturnHome = () => {
    navigate('/customer-dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-sm mx-auto sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading booking details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-sm mx-auto sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl px-4 py-8">
          <div className="text-center">
            <div className="text-red-500 text-lg font-medium mb-4">{error || 'Job not found'}</div>
            <Button onClick={() => navigate('/my-jobs')} size="md">
              Go to My Jobs
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-sm mx-auto sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl px-4 py-6">
        {/* Confirmation Header */}
        <div className="text-center mb-8">
          {/* Confetti/Stars Animation */}
          <div className="mb-4">
            <img src={JobLiveIcon} alt="Success Animation" className="w-16 h-16 mx-auto" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-primary-500 mb-2">
            Your job is booked successfully with {cleaner?.name}
          </h1>
        </div>

        {/* Job Details Card */}
        <div className="bg-white rounded-2xl shadow-custom p-4 sm:p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm text-primary-200 font-medium">{job?.jobId}</span>
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-primary-500 mb-4">
            {job?.title}
          </h2>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img src={CalendarIcon} alt="Date" className="w-5 h-5 text-primary-200" />
              <span className="text-sm text-primary-500 font-medium">{job?.scheduledDate}</span>
            </div>

            <div className="flex items-center gap-3">
              <img src={MapPinIcon} alt="Location" className="w-5 h-5 text-primary-200" />
              <span className="text-sm text-primary-500 font-medium">{job?.location}</span>
            </div>
          </div>

          {/* Payment Information */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-[#1F6FEB] mb-2">Payment Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-primary-200">Total Amount:</span>
                <span className="font-semibold text-primary-500">${job?.total}</span>
              </div>
              
              {job?.paymentMethod === 'online' && (
                <div className="flex justify-between text-sm">
                  <span className="text-primary-200">Paid Online:</span>
                  <span className="font-medium text-green-600">
                    ${job?.onlinePaid} ✓
                  </span>
                </div>
              )}
              
              {job?.paymentMethod === 'cash' && (
                <>
                  {job?.onlinePaid > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-primary-200">Paid Online (10%):</span>
                      <span className="font-medium text-green-600">${job?.onlinePaid} ✓</span>
                    </div>
                  )}
                  {job?.cashAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-primary-200">Pay Cash After Job (90%):</span>
                      <span className="font-medium text-[#1F6FEB]">${job?.cashAmount}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Your Cleaner Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-primary-500 mb-4">Your cleaner</h3>

          {/* Cleaner Card */}
          <div className="bg-white rounded-2xl shadow-custom p-4 sm:p-6">
            <div className="flex items-center gap-4 mb-4">
              {/* Cleaner Avatar */}
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                {cleaner?.avatar ? (
                  <img 
                    src={cleaner.avatar} 
                    alt={cleaner.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </div>

              {/* Cleaner Details */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-lg font-bold text-primary-500">{cleaner?.name}</h4>
                  <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full">
                    {job?.status === 'in_progress' ? 'In Progress' : 'Booked'}
                  </span>
                </div>

                {cleaner?.phone && cleaner.phone !== 'Not available' && (
                  <div className="flex items-center gap-2">
                    <img src={CallIcon} alt="Phone" className="w-4 h-4 text-primary-200" />
                    <span className="text-sm text-primary-500 font-medium">{cleaner.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div>
              <Button
                onClick={handleChatWithCleaner}
                variant="secondary"
                size="md"
                icon={MessageIcon}
                fullWidth
              >
                Chat with Cleaner
              </Button>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <img src={InfoIcon} alt="Info" className="w-5 h-5 text-primary-200" />
              <p className="text-sm text-primary-200 font-medium">
                We'll notify you when your cleaner updates job status.
              </p>
            </div>
          </div>
        </div>

        {/* Notification */}


        {/* Main Action Buttons */}
        <div className="flex gap-4 flex-col sm:flex-row justify-end">
          <Button
            onClick={handleReturnHome}
            variant="secondary"
            className="flex"
          >
            Return Home
          </Button>
          <Button
            onClick={handleViewBooking}
            className="flex"
          >
            View Booking
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JobBookedSuccessfullyPage;
