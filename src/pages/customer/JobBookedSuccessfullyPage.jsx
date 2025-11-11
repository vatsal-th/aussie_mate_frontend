import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Loader } from '../../components';
import CalendarIcon from '../../assets/Calendar.svg';
import MapPinIcon from '../../assets/map-pin 1.png';
import MessageIcon from '../../assets/message2.svg';
import CallIcon from '../../assets/phone2.svg';
import CallIcon2 from '../../assets/phone.svg';
import InfoIcon from '../../assets/info.svg';
import JobLiveIcon from '../../assets/joblive.gif';
import { jobsAPI } from '../../services/api';
import { paymentService } from '../../services/paymentService';

const JobBookedSuccessfullyPage = () => {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState(null);
  const [cleaner, setCleaner] = useState(null);
  const [error, setError] = useState('');
  // Show animation only once per booking (check sessionStorage)
  const [showAnimation, setShowAnimation] = useState(() => {
    const hasSeenAnimation = sessionStorage.getItem(`animation-seen-${jobId}`);
    return !hasSeenAnimation;
  });

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);


        const response = await jobsAPI.getJobById(jobId);

        if (response.success && response.data) {
          const jobData = response.data;


          const acceptedQuote = jobData.quotes?.find(q => q.status === 'accepted');
          if (!acceptedQuote) {
            setError('No accepted quote found');
            setLoading(false);
            return;
          }

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


          let cleanerInfo = acceptedQuote.cleanerId;

          if (typeof cleanerInfo === 'string') {
            cleanerInfo = jobData.cleanerId || {};
          }
          if (!cleanerInfo || !cleanerInfo.firstName) {
            cleanerInfo = acceptedQuote.cleaner || acceptedQuote.cleanerId || {};
          }

          const cleanerName = cleanerInfo.firstName && cleanerInfo.lastName
            ? `${cleanerInfo.firstName} ${cleanerInfo.lastName}`
            : cleanerInfo.name || 'Cleaner';

          let paymentMethod = 'cash';
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


          let avatarUrl = '';
          if (cleanerInfo.profilePhoto) {

            avatarUrl = typeof cleanerInfo.profilePhoto === 'object'
              ? cleanerInfo.profilePhoto.url
              : cleanerInfo.profilePhoto;
          } else if (cleanerInfo.profilePicture) {
            avatarUrl = typeof cleanerInfo.profilePicture === 'object'
              ? cleanerInfo.profilePicture.url
              : cleanerInfo.profilePicture;
          } else {
            avatarUrl = cleanerInfo.avatar || '';
          }


          // Extract cleaner ID - try multiple possible field names
          const cleanerId = cleanerInfo._id || 
                           cleanerInfo.id || 
                           cleanerInfo.userId || 
                           acceptedQuote.cleanerId?._id ||
                           (typeof acceptedQuote.cleanerId === 'string' ? acceptedQuote.cleanerId : null);

          setCleaner({
            id: cleanerId,
            name: cleanerName,
            phone: cleanerInfo.phone || cleanerInfo.phoneNumber || cleanerInfo.mobile || 'Not available',
            email: cleanerInfo.email || '',
            avatar: avatarUrl,
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

  // Hide animation after 3 seconds and mark as seen
  useEffect(() => {
    if (showAnimation) {
      const timer = setTimeout(() => {
        setShowAnimation(false);
        // Mark animation as seen for this booking
        sessionStorage.setItem(`animation-seen-${jobId}`, 'true');
      }, 3000); // Hide after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [showAnimation, jobId]);

  const handleChatWithCleaner = () => {
    if (cleaner?.id) {
      navigate(`/customer-chat/${jobId}?cleaner=${cleaner.id}`);
    } else {
      navigate(`/customer-chat/${jobId}`);
    }
  };

  const handleCallCleaner = () => {
    if (cleaner?.phone && cleaner.phone !== 'Not available') {
      window.location.href = `tel:${cleaner.phone}`;
    }
  };

  const handleViewBooking = () => {
    navigate('/my-jobs');
  };

  const handleReturnHome = () => {
    navigate('/customer-dashboard');
  };

  if (loading) {
    return <Loader fullscreen message="Loading booking details..." />;
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50">
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
      {/* Full Screen Animation Overlay - Shows once then disappears */}
      {showAnimation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white animate-fadeIn">
          <div className="text-center animate-scaleIn">
            <img 
              src={JobLiveIcon} 
              alt="Success Animation" 
              className="w-64 h-64 sm:w-80 sm:h-80 mx-auto object-contain drop-shadow-2xl" 
            />
            <h1 className="text-2xl sm:text-3xl font-bold text-primary-500 mt-6 animate-pulse">
              Booking Successful! 🎉
            </h1>
          </div>
        </div>
      )}

      <div className="max-w-sm mx-auto sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl px-4 py-6">
        {/* Confirmation Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-primary-500 mb-2">
            Your job is booked successfully with {cleaner?.name}
          </h1>
        </div>

        {/* Job Details Card */}
        <div className="bg-white rounded-2xl shadow-custom p-4 sm:p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm text-primary-200 font-medium">{job?.jobId}</span>
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-primary-500 mb-2">
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
            <h3 className="text-sm font-semibold text-primary-600 mb-2">Payment Summary</h3>
            <div className="space-y-2">
              <div className="flex text-sm">
                <span className="text-primary-200 font-medium mr-2">Total Amount:</span>
                <span className="font-semibold text-primary-500">${job?.total}</span>
              </div>

              {job?.paymentMethod === 'online' && (
                <div className="flex text-sm">
                  <span className="text-primary-200 font-medium mr-2">Paid Online:</span>
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
                      <span className="font-medium text-primary-600">${job?.cashAmount}</span>
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
            <div className="flex items-center gap-4 justify-between flex-col sm:flex-row ">
              <div className="flex items-center gap-4 ">
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
                <div className="flex-2">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-bold text-primary-500">{cleaner?.name}</h4>
                    <span className="bg-[#FFF1D9] text-[#F59E0B] text-xs font-medium px-2 py-1 rounded-full border border-[#FFEBCA]">
                      {job?.status === 'in_progress' ? 'In Progress' : 'Booked'}
                    </span>
                  </div>

                  {cleaner?.phone && cleaner.phone !== 'Not available' && (
                    <div className="flex items-center gap-2">
                      <img src={CallIcon2} alt="Phone" className="w-4 h-4 text-primary-200" />
                      <span className="text-sm text-primary-500 font-medium">{cleaner.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                {/* Chat Button */}
                <Button
                  onClick={handleChatWithCleaner}
                  variant="secondary"
                  size="md"
                  icon={MessageIcon}
                >

                </Button>
                
                {/* Call Button */}
                <Button
                  onClick={handleCallCleaner}
                  variant="secondary"
                  size="md"
                  icon={CallIcon}
                  disabled={!cleaner?.phone || cleaner.phone === 'Not available'}
                >

                </Button>
              </div>
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
