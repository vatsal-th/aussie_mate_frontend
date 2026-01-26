import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, UserRound, X } from 'lucide-react';
import { Button, MapWithPolyline, PageHeader, Loader, JobOverviewCard } from '../../components';
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
import { calculatePayoutAmounts } from '../../utils/paymentCalculations';

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
  const [showExtraTimeModal, setShowExtraTimeModal] = useState(false);
  const [extraTimeRequest, setExtraTimeRequest] = useState(null);
  const [processingRequest, setProcessingRequest] = useState(false);
  const scrollPositionRef = useRef(0);

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
            // Redirect to completed page if needed
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
      }

      // Update arrival time based on route info if available
      if (routeInfo && routeInfo.duration) {
        const mins = parseInt(routeInfo.duration);
        if (!isNaN(mins)) {
          setArrivalTime(mins);
        }
      }
    };

    // Listen for extra time requests
    const handleExtraTimeRequest = (data) => {
      console.log('Extra time request received:', data);
      setExtraTimeRequest(data);
      setShowExtraTimeModal(true);
    };

    // Register event listeners
    socketService.on('cleanerLocationUpdate', handleCleanerLocationUpdate);
    socketService.on('extraTimeRequest', handleExtraTimeRequest);

    // Cleanup
    return () => {
      clearTimeout(connectionTimeout);
      socketService.off('cleanerLocationUpdate', handleCleanerLocationUpdate);
      socketService.off('extraTimeRequest', handleExtraTimeRequest);

      if (socketService.isConnected && jobId) {
        socketService.leaveJobRoom(jobId);
      }
    };
  }, [jobId, job, customerLocation]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showExtraTimeModal) {
      // Save current scroll position
      scrollPositionRef.current = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollPositionRef.current}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      // Restore scroll position when modal closes
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      if (scrollPositionRef.current !== undefined) {
        window.scrollTo(0, scrollPositionRef.current);
      }
    }

    return () => {
      // Cleanup: restore scroll on unmount if modal was open
      if (showExtraTimeModal) {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        if (scrollPositionRef.current !== undefined) {
          window.scrollTo(0, scrollPositionRef.current);
        }
      }
    };
  }, [showExtraTimeModal]);

  // Update arrival time when route info changes
  useEffect(() => {
    if (routeInfo && routeInfo.durationValue) {
      const mins = Math.round(routeInfo.durationValue / 60);
      setArrivalTime(mins);
    }
  }, [routeInfo]);

  // For testing: Add test function to window object (remove in production)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      window.testExtraTimeModal = () => {
        setExtraTimeRequest({
          time: '1:00',
          amount: '40',
          reason: 'The kitchen requires deep cleaning and will take longer than expected.'
        });
        setShowExtraTimeModal(true);
      };
    }
    return () => {
      if (window.testExtraTimeModal) {
        delete window.testExtraTimeModal;
      }
    };
  }, []);

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


  const getPaymentSummary = () => {
    const acceptedQuote = job?.quotes?.find(quote => quote.status === 'accepted');
    const totalAmount = acceptedQuote?.price || job?.estimatedPrice || 0;

    // Extract the payment object. Handle root level, nested in data, or as part of a payments array.
    const paymentRecord = paymentStatus?.payment ||
      paymentStatus?.data?.payment ||
      paymentStatus?.data ||
      paymentStatus;

    let jobPayment = null;

    if (Array.isArray(paymentRecord?.payments)) {
      jobPayment = paymentRecord.payments.find(payment =>
        payment.jobId === jobId ||
        payment.jobId === job?.jobId ||
        payment.jobId === job?._id ||
        payment._id === jobId
      );
    } else if (paymentRecord && typeof paymentRecord === 'object' && !Array.isArray(paymentRecord)) {
      // If it's a single object, check if it matches the jobId
      const pId = paymentRecord.jobId || (typeof paymentRecord.jobId === 'object' ? paymentRecord.jobId._id : null);
      if (pId === jobId || pId === job?._id || paymentRecord._id === jobId) {
        jobPayment = paymentRecord;
      }
    }

    const paidAmount = jobPayment?.amount || totalAmount;

    // Use payment calculations utility with 10% commission rate
    const payout = calculatePayoutAmounts(paidAmount, 10, 10);

    return `Cleaner receives $${payout.cleanerAmount}, platform fee $${payout.adminCommission} (10%)`;
  };

  const getCleanerTier = () => {
    return cleaner?.tier || 'none';
  };

  const getCleanerRating = () => {
    return cleaner?.averageRating !== undefined ? cleaner.averageRating : (cleaner?.rating || 0);
  };

  const handleAcceptExtraTime = async () => {
    if (!extraTimeRequest) return;

    try {
      setProcessingRequest(true);

      await jobsAPI.acceptExtraTimeRequest(jobId, extraTimeRequest.requestId);

      setShowExtraTimeModal(false);
      setExtraTimeRequest(null);
      // Show success message
      alert('Extra time request accepted successfully!');
    } catch (error) {
      console.error('Error accepting extra time request:', error);
      alert('Failed to accept request. Please try again.');
    } finally {
      setProcessingRequest(false);
    }
  };

  const handleRejectExtraTime = async () => {
    if (!extraTimeRequest) return;

    try {
      setProcessingRequest(true);

      await jobsAPI.rejectExtraTimeRequest(jobId, extraTimeRequest.requestId);

      setShowExtraTimeModal(false);
      setExtraTimeRequest(null);
      // Show success message
      alert('Extra time request rejected.');
    } catch (error) {
      console.error('Error rejecting extra time request:', error);
      alert('Failed to reject request. Please try again.');
    } finally {
      setProcessingRequest(false);
    }
  };

  // Format time duration (e.g., "1:30" -> "1 Hour 30 Minutes" or "1 Hour")
  const formatTimeDuration = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const h = parseInt(hours) || 0;
    const m = parseInt(minutes) || 0;

    if (h === 1 && m === 0) return '1 Hour Extra';
    if (h > 1 && m === 0) return `${h} Hours Extra`;
    if (h === 0 && m > 0) return `${m} ${m === 1 ? 'Minute' : 'Minutes'} Extra`;
    if (h > 0 && m > 0) return `${h} ${h === 1 ? 'Hour' : 'Hours'} ${m} ${m === 1 ? 'Minute' : 'Minutes'} Extra`;
    return `${h} Hour${h !== 1 ? 's' : ''} Extra`;
  };

  const resolveImageSrc = (image) => {
    if (!image) return '';
    if (typeof image === 'string') return image;
    return image.url || image.path || image.secureUrl || '';
  };

  const jobPhotos = useMemo(() => {
    if (!job) return [];
    // Only show original job photos, not completion proof photos
    const photos = job.photos || [];
    return photos.map(resolveImageSrc).filter(Boolean);
  }, [job]);

  const getServiceDetail = (job) => {
    if (!job) return '';
    return (
      job.serviceDetail ||
      job.serviceDetailName ||
      job.service?.detail ||
      job.service?.name ||
      job.selectedServiceDetail ||
      ''
    );
  };

  const getJobFrequency = (job) => {
    if (!job) return 'One-time';
    return job.frequency || job.serviceFrequency || job.schedule?.frequency || 'One-time';
  };

  const getJobTitle = (job) => {
    if (!job) return 'Job Details';
    const serviceType = job.serviceType?.charAt(0).toUpperCase() + job.serviceType?.slice(1) || 'Service';
    return `${serviceType} `;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const serviceDetail = getServiceDetail(job);
  const scheduledDateLabel = job?.scheduledDate ? formatDate(job.scheduledDate) : 'Date not set';
  const jobFrequencyLabel = getJobFrequency(job);

  if (loading) {
    return <Loader fullscreen message="Updating your job details..." />;
  }

  if (error || !job) {
    return (
      <div className="bg-gray-50">
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

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-sm mx-auto sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl">
        <PageHeader
          title={`#${job.jobId || job._id?.slice(-6)} - ${getJobTitle(job)}`}
          onBack={() => navigate(-1)}
          className="py-4 px-4"
          titleClassName="text-lg font-semibold text-primary-500 truncate"
        />

        <div className="px-4">
          {/* Job Overview Card */}
          <div className="mb-4">
            <JobOverviewCard
              jobId={job.jobId || job.referenceId || job._id?.slice(-6)}
              title={getJobTitle(job)}
              serviceType={job.serviceType || job.category || job.service}
              serviceDetail={serviceDetail}
              instructions={
                job.specialInstructions ||
                job.instructions ||
                job.additionalNotes ||
                ''
              }
              scheduledDate={scheduledDateLabel}
              frequency={jobFrequencyLabel}
              location={job.location?.address || job.address || job.locationDescription || 'Location not specified'}
              photos={jobPhotos}
              viewerRole="customer"
            />
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
                  <X className="w-5 h-5" strokeWidth={2} />
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
                      <Check className="w-4 h-4 text-white" strokeWidth={2} />
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
                  <div className="bg-primary-500 text-white rounded-xl w-12 h-16   flex items-center justify-center">
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
                          <UserRound className="w-6 h-6 text-gray-400" strokeWidth={2} />
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
                          <div className={`flex items-center text-primary-500 font-medium px-2 py-1 rounded-full text-xs border-[0.6px] ${getCleanerTier() === 'gold'
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
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-[#FFEBCA] border border-yellow-500 text-yellow-500">
                    In Progress
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleGetDirections}
                    className="flex items-center text-primary-600 text-sm font-medium cursor-pointer"
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
                <Loader message="Loading cleaner information..." />
              </div>
            )}
          </div>

          {/* Payment Summary Section */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-primary-500 mb-3">Payment Summary</h3>
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="mb-2">
                <span className="text-sm text-primary-200 font-medium">Quoted Price: </span>
                <span className="text-lg font-semibold text-primary-600">${acceptedQuote?.price || job.estimatedPrice || '0'}</span>
              </div>

              <div className="mb-3">
                <p className="text-sm text-primary-200 font-medium">
                  {getPaymentSummary()}
                </p>
              </div>

              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-yellow-500 border border-yellow-500 text-yellow-500 font-medium">
                Pending Release
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Extra Time Request Modal */}
      {showExtraTimeModal && extraTimeRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Extra Hours Requested</h2>

            <p className="text-sm text-gray-600 mb-6">
              Your cleaner has requested <strong>{formatTimeDuration(extraTimeRequest.time || extraTimeRequest.extraTime)}</strong> for this job after reviewing the scope of work.
            </p>

            <div className="space-y-4 mb-6">
              {/* Reason */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">Reason</h3>
                <p className="text-sm text-primary-200 font-medium" >
                  {extraTimeRequest.reason || extraTimeRequest.extraReason || 'No reason provided'}
                </p>
              </div>

              {/* Time Duration */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">Time Duration</h3>
                <p className="text-sm text-primary-200 font-medium" >
                  {formatTimeDuration(extraTimeRequest.time || extraTimeRequest.extraTime)}
                </p>
              </div>

              {/* Payment Update */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">Payment Update</h3>
                <p className="text-sm text-primary-200 font-medium" >
                  ${extraTimeRequest.amount || extraTimeRequest.extraAmount || '0'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleRejectExtraTime}
                variant="secondary"
                disabled={processingRequest}
                className="flex-1 border border-blue-500 text-blue-500 bg-white hover:bg-gray-50"
              >
                Reject
              </Button>
              <Button
                onClick={handleAcceptExtraTime}
                variant="primary"
                disabled={processingRequest}
                className="flex-1"
              >
                {processingRequest ? 'Processing...' : 'Accept'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerInProgressJobDetailsPage;
