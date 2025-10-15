import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Button from '../../components/Button';
import JobCompleteModal from '../../components/JobCompleteModal';
import MapWithPolyline from '../../components/MapWithPolyline';
import ArrowLeftIcon from '../../assets/arrow-left.svg';
import CalendarIcon from '../../assets/Calendar.svg';
import MapPinIcon from '../../assets/location.svg';
import PhoneIcon from '../../assets/phone2.svg?react';
import PhoneIcon2 from '../../assets/phone.svg';
import ChatIcon from '../../assets/message2.svg';
import StarIcon from '../../assets/rating.svg';
import SilverBadgeIcon from '../../assets/silverBadge.svg';
import GoldBadgeIcon from '../../assets/goldBadge.svg';
import BronzeBadgeIcon from '../../assets/bronzeBadge.svg';
import { jobsAPI, userAPI } from '../../services/api';
import { paymentService } from '../../services/paymentService';
import { socketService } from '../../services/socketService';

const CustomerInProgressJobDetailsPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [cleaner, setCleaner] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [showArrivalStatus, setShowArrivalStatus] = useState(false);
  const [arrivalTime, setArrivalTime] = useState(8);
  const [routeInfo, setRouteInfo] = useState(null);
  const [cleanerLocation, setCleanerLocation] = useState(null);
  const [customerLocation, setCustomerLocation] = useState(null);
  const [isCleanerLocationLive, setIsCleanerLocationLive] = useState(false);
  const [showJobCompleteModal, setShowJobCompleteModal] = useState(false);
  const [completedJobInfo, setCompletedJobInfo] = useState(null);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch job details and payment history in parallel
        const [jobResponse, paymentResponse] = await Promise.all([
          jobsAPI.getJobById(jobId),
          paymentService.getPaymentHistory().catch(() => null)
        ]);

        if (jobResponse.success && jobResponse.data) {
          setJob(jobResponse.data);

          // Check if job is completed - show modal
          if (jobResponse.data.status === 'completed') {
            setCompletedJobInfo({
              jobId: jobId,
              cleanerName: jobResponse.data.quotes?.find(q => q.status === 'accepted')?.cleanerId?.firstName || "Cleaner",
              jobTitle: jobResponse.data.title || jobResponse.data.serviceType || "Cleaning Service"
            });
            setShowJobCompleteModal(true);
          }

          // Set customer location from job data
          const coords = jobResponse.data.location?.coordinates;
          if (coords) {
            let lat, lng;
            if (typeof coords === 'string') {
              const coordsArr = coords.split(',').map(coord => parseFloat(coord.trim()));
              lat = coordsArr[1];
              lng = coordsArr[0];
            } else if (coords.lat && coords.lng) {
              lat = coords.lat;
              lng = coords.lng;
            } else if (Array.isArray(coords)) {
              lat = coords[1];
              lng = coords[0];
            }
            
            if (lat && lng && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
              setCustomerLocation({ lat, lng });
            } else if (lat && lng && (lat > 90 || lat < -90)) {
              setCustomerLocation({ lat: lng, lng: lat });
            }
          }

          // Find accepted quote and cleaner info
          const acceptedQuote = jobResponse.data.quotes?.find(quote => quote.status === 'accepted');

          if (acceptedQuote) {
            const cleanerData = acceptedQuote.cleanerId || acceptedQuote.cleaner;

            // Check if cleanerData is an object with user details or just an ID string
            if (cleanerData && typeof cleanerData === 'object' && cleanerData.firstName) {
              // It's already a cleaner object
              setCleaner(cleanerData);
            } else {
              // It's just an ID string, need to fetch cleaner details
              const cleanerId = acceptedQuote.cleanerId?._id || acceptedQuote.cleanerId;

              if (cleanerId) {
                try {
                  const cleanerResponse = await userAPI.getUserById(cleanerId);

                  if (cleanerResponse.success) {
                    setCleaner(cleanerResponse.data.user || cleanerResponse.data);
                  }
                } catch (cleanerError) {
                  console.error('Error fetching cleaner details:', cleanerError);
                }
              }
            }
          }
        } else {
          setError('Job not found');
        }

        if (paymentResponse) {
          setPaymentStatus(paymentResponse);
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

  // Socket connection and real-time location tracking
  useEffect(() => {
    if (!jobId || !job) return;

    // Connect to socket
    const token = localStorage.getItem('authToken');
    if (token && !socketService.isConnected) {
      socketService.connect(token);
    }

    // Wait for socket connection before joining room
    const connectionTimeout = setTimeout(() => {
      if (socketService.isConnected) {
        socketService.joinJobRoom(jobId);
      }
    }, 1000);

    // Listen for cleaner location updates
    const handleCleanerLocationUpdate = (data) => {
      
      const newCleanerLocation = {
        lat: data.latitude,
        lng: data.longitude
      };
      
      setCleanerLocation(newCleanerLocation);
      setIsCleanerLocationLive(true);
      
      // Check if job status changed to completed (optional - for real-time update)
      if (data.jobStatus === 'completed') {
        setCompletedJobInfo({
          jobId: jobId,
          cleanerName: cleaner?.firstName || "Cleaner",
          jobTitle: job?.title || job?.serviceType || "Cleaning Service"
        });
        setShowJobCompleteModal(true);
      }
      
      // Calculate distance if customer location exists
      if (customerLocation) {
        const R = 6371e3;
        const φ1 = customerLocation.lat * Math.PI / 180;
        const φ2 = newCleanerLocation.lat * Math.PI / 180;
        const Δφ = (newCleanerLocation.lat - customerLocation.lat) * Math.PI / 180;
        const Δλ = (newCleanerLocation.lng - customerLocation.lng) * Math.PI / 180;
        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
      }
      
      // Update arrival time based on route info if available
      if (routeInfo && routeInfo.duration) {
        const mins = parseInt(routeInfo.duration);
        if (!isNaN(mins)) {
          setArrivalTime(mins);
        }
      }
    };

    // Register event listener
    socketService.on('cleanerLocationUpdate', handleCleanerLocationUpdate);

    // Cleanup
    return () => {
      clearTimeout(connectionTimeout);
      socketService.off('cleanerLocationUpdate', handleCleanerLocationUpdate);
      
      if (socketService.isConnected && jobId) {
        socketService.leaveJobRoom(jobId);
      }
    };
  }, [jobId, job, customerLocation]); // Added customerLocation to dependencies

  // Update arrival time when route info changes
  useEffect(() => {
    if (routeInfo && routeInfo.durationValue) {
      const mins = Math.round(routeInfo.durationValue / 60);
      setArrivalTime(mins);
    }
  }, [routeInfo]);

  const handleGetDirections = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!showMap) {
      setShowMap(true);
    } else {
      // Closing map - hide arrival status
      setShowMap(false);
      setShowArrivalStatus(false);
    }
  };

  const startArrivalCountdown = () => {
    // Using real-time route info instead of countdown
  };

  const handleChatWithCleaner = () => {
    // Try multiple possible ID locations
    const cleanerId = cleaner?._id || cleaner?.id;
    
    if (cleanerId) {
      navigate(`/customer-chat/${jobId}?cleaner=${cleanerId}`);
    } else {
      console.error('Cleaner ID not available');
    }
  };

  const handleCallCleaner = () => {
    // Try multiple possible phone number locations
    const phoneNumber = cleaner?.phone || 
                      cleaner?.phoneNumber || 
                      cleaner?.mobile;
    
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
    } else {
      console.error('Cleaner phone number not available');
    }
  };

  const handleCloseJobCompleteModal = () => {
    setShowJobCompleteModal(false);
    setCompletedJobInfo(null);
  };

  const getCoordinates = (coordinates) => {
    if (!coordinates) return null;

    let lat, lng;

    // Handle different coordinate formats
    if (typeof coordinates === 'string') {
      // If it's a string like "21.236941, 72.862925"
      const coords = coordinates.split(',').map(coord => parseFloat(coord.trim()));
      lat = coords[0];
      lng = coords[1];
    } else if (coordinates.lat && coordinates.lng) {
      // If it's an object like { lat: 21.236941, lng: 72.862925 }
      lat = coordinates.lat;
      lng = coordinates.lng;
    } else if (Array.isArray(coordinates)) {
      // If it's an array like [21.236941, 72.862925]
      lat = coordinates[0];
      lng = coordinates[1];
    }

    // Validate coordinates (lat should be between -90 and 90, lng between -180 and 180)
    if (lat && lng && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng };
    }

    // If coordinates seem swapped (lat > 90 or lat < -90), try swapping them
    if (lat && lng && (lat > 90 || lat < -90)) {
      return { lat: lng, lng: lat };
    }

    return null;
  };

  // Helper functions for payment display (same as cleaner page)
  const getPaymentMethod = () => {
    // Find payment for this job from payment history (try different field names)
    const jobPayment = paymentStatus?.data?.payments?.find(payment =>
      payment.jobId === jobId ||
      payment.jobId === job?.jobId ||
      payment.jobId === job?._id ||
      payment._id === jobId
    );

    if (jobPayment?.paymentMethod === 'online') {
      return 'Online';
    }
    return 'Cash';
  };

  const getPaymentSummary = () => {
    // Find accepted quote for payment calculation
    const acceptedQuote = job?.quotes?.find(quote => quote.status === 'accepted');
    const totalAmount = acceptedQuote?.price || job?.estimatedPrice || 0;

    // Find payment for this job from payment history (try different field names)
    const jobPayment = paymentStatus?.data?.payments?.find(payment =>
      payment.jobId === jobId ||
      payment.jobId === job?.jobId ||
      payment.jobId === job?._id ||
      payment._id === jobId
    );

    if (jobPayment?.paymentMethod === 'online') {
      // For online payments, show the breakdown
      const paidAmount = jobPayment?.amount || totalAmount;
      const platformFee = Math.round(paidAmount * 0.1); // 10% platform fee
      const cleanerAmount = paidAmount - platformFee; // 90% to cleaner


      return `Cleaner receives $${cleanerAmount}, platform fee $${platformFee} (10%)`;
    } else {
      // For cash payments, show the breakdown
      const platformFee = Math.round(totalAmount * 0.1); // 10% platform fee
      const cleanerAmount = totalAmount - platformFee; // 90% to cleaner

      return `$${platformFee} (10%) paid online to platform. Cleaner receives $${cleanerAmount} (90%) cash after job.`;
    }
  };

  const getCleanerDistance = () => {
    // Use route info from Google Maps for accurate distance
    if (routeInfo && routeInfo.distance) {
      return routeInfo.distance;
    }
    return 'Calculating distance...';
  };

  const getArrivalTime = () => {
    // Use route info from Google Maps for accurate arrival time
    if (routeInfo && routeInfo.duration) {
      return routeInfo.duration;
    }
    return 'Calculating...';
  };

  const getCleanerTier = () => {
    return cleaner?.tier || 'none';
  };

  const getCleanerRating = () => {
    return cleaner?.averageRating !== undefined ? cleaner.averageRating : (cleaner?.rating || 0);
  };

  if (loading) {
    return (
      <div className="bg-gray-50">
        <Header />
        <div className="max-w-sm mx-auto sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl p-4">
          <div className="bg-white rounded-2xl p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
            <div className="space-y-4">
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="bg-gray-50">
        <Header />
        <div className="max-w-sm mx-auto sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl p-4">
          <div className="bg-white rounded-2xl p-6 text-center">
            <p className="text-red-500">{error || 'Job not found'}</p>
            <Button
              onClick={() => navigate(-1)}
              variant="primary"
              className="mt-4"
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Find accepted quote for this job
  const acceptedQuote = job.quotes?.find(quote => quote.status === 'accepted');

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Recently posted';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Posted just now';
    if (diffInHours === 1) return 'Posted 1h ago';
    if (diffInHours < 24) return `Posted ${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `Posted ${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  // customerLocation is now a state variable set in useEffect

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />

      <div className="max-w-sm mx-auto sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl">
        {/* Top Navigation */}
        <div className="flex items-center justify-between py-4 px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <img src={ArrowLeftIcon} alt="Back" className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-primary-500 truncate">
              #{job.jobId || job._id?.slice(-6)} - {job.title}
            </h1>
          </div>
        </div>

        <div className="px-4">
          {/* Job Details Card */}
          <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
            <h2 className="text-xl font-bold text-primary-500 mb-2">
              {job.title || `${job.serviceType}`}
            </h2>
            <p className="text-sm text-gray-500 mb-2">{getTimeAgo(job.createdAt)}</p>

            {/* Scheduled Time */}
            <div className="flex items-center mb-1">
              <img src={CalendarIcon} alt="Calendar" className="w-4 h-4 mr-3" />
              <span className="text-sm text-primary-200 font-medium">
                {job.scheduledDate ? formatDate(job.scheduledDate) : 'Date not specified'}
              </span>
            </div>

            {/* Location */}
            <div className="flex items-center">
              <img src={MapPinIcon} alt="Location" className="w-4 h-4 mr-3" />
              <span className="text-sm text-primary-200 font-medium">
                {job.location?.address || job.location?.fullAddress || 'Location not specified'}
              </span>
            </div>
          </div>

          {/* Map Section */}
          {showMap && (
            <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-primary-500">Track Cleaner</h3>
                <button
                  type="button"
                  onClick={handleGetDirections}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer "
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <MapWithPolyline
                customerLocation={customerLocation}
                cleanerLocation={cleanerLocation}
                onRouteInfo={(info) => {
                  setRouteInfo(info);
                  // Update arrival time based on real route info
                  if (info && info.durationValue) {
                    const mins = Math.round(info.durationValue / 60);
                    setArrivalTime(mins);
                  }
                  // Show arrival status now that we have real route data
                  if (info) {
                    setShowArrivalStatus(true);
                  }
                }}
              />
            </div>
          )}

          {/* Arrival Status Card */}
          {showArrivalStatus && (
            <div className="mb-4">
              <div className="bg-white rounded-2xl p-4 shadow-custom border border-[#F3F3F3] ">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-green-600 font-semibold text-sm">ARRIVING</div>
                      <div className="text-lg font-bold text-gray-900">
                        Arriving in {routeInfo ? routeInfo.duration : `${arrivalTime} ${arrivalTime === 1 ? 'min' : 'mins'}`}
                      </div>
                      <div className="text-sm text-primary-200 font-medium">
                        {cleaner?.firstName} is {routeInfo ? `${routeInfo.distance} away` : 'reaching your doorstep shortly'}
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#1EB154] text-white rounded-xl w-12 h-16   flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-lg font-bold">
                        {routeInfo ? Math.round(routeInfo.durationValue / 60) : arrivalTime}
                      </div>
                      <div className="text-xs">mins</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Your Cleaner Section */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-primary-500 mb-3">Your cleaner</h3>
            {cleaner ? (
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full mr-3 overflow-hidden">
                      {cleaner.profilePhoto?.url ? (
                        <img
                          src={cleaner.profilePhoto.url}
                          alt="Cleaner"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary-500">{cleaner.firstName} {cleaner.lastName}</h4>
                      <div className="flex items-center text-sm text-primary-200 font-medium">
                      <img src={PhoneIcon2} alt="Phone" className="w-4 h-4 mr-1" />
                        {cleaner.phone || cleaner.phoneNumber || cleaner.mobile || 'Phone not available'}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center bg-[#FFF2DE] text-primary-500 font-medium px-2 py-1 rounded-full text-xs">
                          <img src={StarIcon} alt="Rating" className="w-4 h-4 mr-1" />
                          {getCleanerRating()}
                        </div>
                        {getCleanerTier() && getCleanerTier() !== 'none' && (
                          <div className={`flex items-center text-primary-500 font-medium px-2 py-1 rounded-full text-xs border-[0.6px] ${
                            getCleanerTier() === 'gold'
                              ? 'bg-gradient-to-r from-[#FFDBAE] to-[#FFE7C4] border-[#FFDBAE]'
                              : getCleanerTier() === 'silver'
                              ? 'bg-gradient-to-r from-[#FDFDFD] to-[#E9E9E9] border-[#E9E9E9]'
                              : getCleanerTier() === 'bronze'
                              ? 'bg-gradient-to-r from-[#D4A574] to-[#E6C7A3] border-[#CD7F32]'
                              : 'bg-gray-100 border-gray-300'
                          }`}>
                            <img 
                              src={
                                getCleanerTier() === 'gold' 
                                  ? GoldBadgeIcon 
                                  : getCleanerTier() === 'silver'
                                  ? SilverBadgeIcon
                                  : BronzeBadgeIcon
                              } 
                              alt="Badge" 
                              className="w-4 h-4 mr-1" 
                            />
                            <span className="capitalize">{getCleanerTier()} Tier</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-[#FFEBCA] border border-[#FFEBCA] text-[#F59E0B]">
                    In Progress
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleGetDirections}
                    className="flex items-center text-[#1F6FEB] text-sm font-medium cursor-pointer"
                  >
                    <img src={MapPinIcon} alt="Directions" className="w-4 h-4 mr-1" />
                    {showMap ? 'Hide Tracking' : 'Track Cleaner'}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleChatWithCleaner}
                      className="w-8 h-8 shadow-custom rounded-lg! flex items-center justify-center transition-colors cursor-pointer border border-[#9CC0F6]"
                    >
                      <img src={ChatIcon} alt="Chat" className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleCallCleaner}
                      className="w-8 h-8 shadow-custom rounded-lg! flex items-center justify-center transition-colors cursor-pointer border border-[#9CC0F6]"
                    >
                     <PhoneIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm">Loading cleaner information...</p>
                </div>
              </div>
            )}
          </div>

          {/* Payment Summary Section */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-primary-500 mb-3">Payment Summary</h3>
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="mb-2">
                <span className="text-sm text-primary-200 font-medium">Quoted Price: </span>
                <span className="text-lg font-semibold text-[#1F6FEB]">${acceptedQuote?.price || job.estimatedPrice || '0'}</span>
              </div>

              <div className="mb-2">
                <span className="text-sm text-primary-200 font-medium">Payment Method: </span>
                <span className="text-sm font-medium">{getPaymentMethod()}</span>
              </div>

              <div className="mb-3">
                <p className="text-sm text-primary-200 font-medium">
                  {getPaymentSummary()}
                </p>
              </div>

              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-[#FFF1D9] border border-[#FFEBCA] text-[#F59E0B] font-medium">
                Pending Release
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Job Complete Modal */}
      <JobCompleteModal
        isOpen={showJobCompleteModal}
        onClose={handleCloseJobCompleteModal}
        cleanerName={completedJobInfo?.cleanerName || cleaner?.firstName || "Cleaner"}
        jobTitle={completedJobInfo?.jobTitle || job?.title || "Cleaning Service"}
        jobId={jobId}
      />
    </div>
  );
};

export default CustomerInProgressJobDetailsPage;
