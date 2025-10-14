import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/Header';
import Button from '../../components/Button';
import ConfirmationModal from '../../components/ConfirmationModal';
import ArrowLeftIcon from '../../assets/arrow-left.svg';
import ThreeDotIcon from '../../assets/3dot.svg';
import CalendarIcon from '../../assets/Calendar.svg';
import MapPinIcon from '../../assets/map-pin 1.png';
import UserIcon from '../../assets/user.svg';
import RatingIcon from '../../assets/rating.svg';
import SilverBadgeIcon from '../../assets/silverBadge.svg';
import GoldBadgeIcon from '../../assets/goldBadge.svg';
import BronzeBadgeIcon from '../../assets/bronzeBadge.svg';
import MessageIcon from '../../assets/message2.svg';
import CloseIcon from '../../assets/close.svg';
import { jobsAPI, quotesAPI } from '../../services/api';
import { chatAPI } from '../../services/chatAPI';

const CustomerJobDetailsPage = () => {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [quoteToAccept, setQuoteToAccept] = useState(null);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [quoteToDecline, setQuoteToDecline] = useState(null);
  const [cleanerQuotes, setCleanerQuotes] = useState([]);
  const [chatRooms, setChatRooms] = useState([]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch job details
        const response = await jobsAPI.getJobById(jobId);

        if (response.success && response.data) {
          setJob(response.data);
          
          // Extract quotes from job data
          if (response.data.quotes && response.data.quotes.length > 0) {
            setCleanerQuotes(response.data.quotes);
          }
        } else {
          setError('Job not found');
        }
      } catch (err) {
        setError('Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    const fetchChatRooms = async () => {
      try {
        const chatResponse = await chatAPI.getChatRooms();
        if (chatResponse.success) {
          // Filter chat rooms for this specific job
          const jobChatRooms = chatResponse.data.filter(room => 
            room.jobId._id === jobId || room.jobId === jobId
          );
          setChatRooms(jobChatRooms);
        }
      } catch (err) {
        // Don't show error for chat rooms, just continue without them
      }
    };

    if (jobId) {
      fetchJobDetails();
      fetchChatRooms();
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

  const handleCancelJob = () => {
    setShowDropdown(false);
    setShowCancelModal(true);
  };

  const handleAcceptQuote = (quoteId) => {
    const quote = cleanerQuotes.find(q => q._id === quoteId);
    if (quote) {
      setQuoteToAccept(quote);
      setShowAcceptModal(true);
    }
  };

  const handleDeclineQuote = (quoteId) => {
    const quote = cleanerQuotes.find(q => q._id === quoteId);
    if (quote) {
      setQuoteToDecline(quote);
      setShowDeclineModal(true);
    }
  };

  const handleConfirmAcceptQuote = async () => {
    if (!quoteToAccept) return;
    
    try {
      setIsAccepting(true);
      
      const response = await quotesAPI.acceptQuote(jobId, quoteToAccept._id);

      if (response.success) {
        const updatedQuotes = cleanerQuotes.map(quote => 
          quote._id === quoteToAccept._id 
            ? { ...quote, status: 'accepted' }
            : { ...quote, status: 'rejected' } // Reject all other quotes
        );
        setCleanerQuotes(updatedQuotes);
        
        // Close modal
        setShowAcceptModal(false);
        setQuoteToAccept(null);
      } else {
        setError(response.error || 'Failed to accept quote');
        setShowAcceptModal(false);
      }
    } catch (err) {
      setError('Failed to accept quote. Please try again.');
      setShowAcceptModal(false);
    } finally {
      setIsAccepting(false);
    }
  };

  const handleCancelAcceptQuote = () => {
    setShowAcceptModal(false);
    setQuoteToAccept(null);
  };

  const handleConfirmDeclineQuote = async () => {
    if (!quoteToDecline) return;
    
    try {
      setIsDeclining(true);
      
      // Call API to reject quote
      const response = await quotesAPI.rejectQuote(jobId, quoteToDecline._id);
      
      if (response.success) {
        // Update the quote status locally
        const updatedQuotes = cleanerQuotes.map(quote => 
          quote._id === quoteToDecline._id 
            ? { ...quote, status: 'rejected' }
            : quote
        );
        setCleanerQuotes(updatedQuotes);
        
        // Close modal
        setShowDeclineModal(false);
        setQuoteToDecline(null);
      } else {
        setError(response.error || 'Failed to decline quote');
        setShowDeclineModal(false);
      }
    } catch (err) {
      setError('Failed to decline quote. Please try again.');
      setShowDeclineModal(false);
    } finally {
      setIsDeclining(false);
    }
  };

  const handleCancelDeclineQuote = () => {
    setShowDeclineModal(false);
    setQuoteToDecline(null);
  };

  const handleConfirmCancel = async () => {
    try {
      setIsCancelling(true);
      
      const response = await jobsAPI.cancelJob(jobId);
      
      if (response.success) {
        navigate('/my-jobs');
      } else {
        setError('Failed to cancel job. Please try again.');
        setShowCancelModal(false);
      }
    } catch (error) {
      setError('Failed to cancel job. Please try again.');
      setShowCancelModal(false);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleCancelModalClose = () => {
    setShowCancelModal(false);
  };

  // Helper function to check if customer has chatted with a cleaner
  const getChatRoomForCleaner = (cleanerId) => {
    return chatRooms.find(room => 
      room.cleanerId._id === cleanerId || room.cleanerId === cleanerId
    );
  };

  // Helper function to get chat status for a cleaner
  const getChatStatus = (cleanerId) => {
    const chatRoom = getChatRoomForCleaner(cleanerId);
    if (chatRoom) {
      if (chatRoom.lastMessageAt) {
        const lastMessageDate = new Date(chatRoom.lastMessageAt);
        const timeAgo = getTimeAgo(lastMessageDate);
        return {
          hasChat: true,
          lastMessage: timeAgo,
          unreadCount: chatRoom.unreadCount || 0
        };
      }
      return { hasChat: true, lastMessage: 'No messages yet', unreadCount: 0 };
    }
    return { hasChat: false, lastMessage: null, unreadCount: 0 };
  };

  // Helper function to format time ago
  const getTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  // Helper function to format cleaner data from quotes
  const formatCleanerData = (quote) => {
    const cleaner = quote.cleanerId || quote.cleaner;
    const cleanerId = cleaner?._id || cleaner?.id || quote.cleanerId || quote._id || quote.id;
    
    return {
      id: cleanerId,
      quoteId: quote._id || quote.id,
      name: cleaner ? `${cleaner.firstName || ''} ${cleaner.lastName || ''}`.trim() || `Cleaner #${cleanerId?.slice(-4)}` : 'Cleaner',
      rating: cleaner?.averageRating !== undefined ? cleaner.averageRating : (cleaner?.rating || 0),
      reviews: cleaner?.reviewCount || 0,
      tier: cleaner?.tier || 'Standard',
      quoteAmount: quote.price || quote.amount || 0,
      distance: quote.distance || cleaner?.distance || 'Distance unknown',
      isVerified: cleaner?.isVerified || false,
      estimatedDuration: quote.estimatedDuration || '2 hours',
      status: quote.status || 'pending'
    };
  };

  // Helper function to check if there's an accepted quote
  const getAcceptedQuote = () => {
    return cleanerQuotes.find(quote => quote.status === 'accepted');
  };

  // Helper function to get accepted cleaner data
  const getAcceptedCleaner = () => {
    const acceptedQuote = getAcceptedQuote();
    if (acceptedQuote) {
      return formatCleanerData(acceptedQuote);
    }
    return null;
  };

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
              <Button
                onClick={() => navigate(-1)}
                size="md"
                className="mt-4"
              >
                Go Back
              </Button>
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
          <Button
            onClick={() => navigate(-1)}
            variant=""
            size="sm"
            icon={ArrowLeftIcon}
            className="p-0"
          >
            <h1 className="text-sm sm:text-base md:text-lg font-semibold text-primary-500 truncate">
              Job Details - {job.serviceType || 'Cleaning'}
            </h1>
          </Button>
          <div className="relative" ref={dropdownRef}>
            <Button 
              onClick={handleDropdownToggle}
              variant=""
              size="sm"
              icon={ThreeDotIcon}
              className="p-1 sm:p-2"
            />
            
            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                <div className="py-2">
                  {/* Cancel Job Option */}
                  <Button
                    onClick={handleCancelJob}
                    variant=""
                    size="sm"
                    icon={CloseIcon}
                    className="w-full justify-start px-4 py-3 text-gray-700"
                  >
                    Cancel Job
                  </Button>
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
          </div>
        </div>


        {/* Cleaner Quotes Section */}
        <div className="bg-white rounded-2xl shadow-custom p-3 sm:p-4 md:p-6">
          <div className="mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg md:text-xl font-semibold text-primary-500 mb-1 sm:mb-2">
              Cleaner Quotes ({cleanerQuotes.filter(quote => quote.status !== 'rejected').length})
            </h3>
            <p className="text-xs sm:text-sm text-primary-200 font-medium">
              {cleanerQuotes.filter(quote => quote.status !== 'rejected').length > 0 
                ? "Cleaners nearby have sent their offers. Review and chat before choosing."
                : "No quotes yet. Cleaners will send quotes soon."
              }
            </p>
          </div>

          {cleanerQuotes.filter(quote => quote.status !== 'rejected').length > 0 && (
            <div className="space-y-2 sm:space-y-3">
              {cleanerQuotes.filter(quote => quote.status !== 'rejected').map((quote, index) => {
                const cleaner = formatCleanerData(quote);
                const chatStatus = getChatStatus(cleaner.id);
                
                return (
                  <div key={quote._id || quote.id || `quote-${index}`} className="border border-[#E5E7EB] shadow-custom rounded-xl p-3 sm:p-4">
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
                          {cleaner.tier && cleaner.tier !== 'none' && (
                            <div className={`flex items-center space-x-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border-[0.6px] ${
                              cleaner.tier === 'gold'
                                ? 'bg-[linear-gradient(94.49deg,#FFDBAE_0%,#FFE7C4_100%)] border-[#FFDBAE]'
                                : cleaner.tier === 'silver'
                                ? 'bg-[linear-gradient(94.49deg,#FDFDFD_0%,#E9E9E9_100%)] border-[#E5E7EB]'
                                : cleaner.tier === 'bronze'
                                ? 'bg-[linear-gradient(94.49deg,#D4A574_0%,#E6C7A3_100%)] border-[#CD7F32]'
                                : 'bg-gray-100 border-gray-300'
                            }`}>
                              <img 
                                src={
                                  cleaner.tier === 'gold' 
                                    ? GoldBadgeIcon 
                                    : cleaner.tier === 'silver'
                                    ? SilverBadgeIcon
                                    : BronzeBadgeIcon
                                } 
                                alt="Badge" 
                                className="w-3 h-3 sm:w-4 sm:h-4" 
                              />
                              <span className="text-xs text-primary-500 font-medium capitalize">
                                {cleaner.tier}
                              </span>
                            </div>
                          )}
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
                            {cleaner.estimatedDuration && (
                              <span className="text-xs text-gray-500 ml-2">({cleaner.estimatedDuration})</span>
                            )}
                          </div>
                          <div className="text-xs text-primary-500 font-medium">
                            {cleaner.distance}
                          </div>
                          
                          {/* Chat Status */}
                          {chatStatus.hasChat && (
                            <div className="flex items-center space-x-2 mt-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-xs text-green-600 font-medium">
                                {chatStatus.lastMessage}
                              </span>
                              {chatStatus.unreadCount > 0 && (
                                <span className="bg-[#FFE4E4] text-[#EF4444] font-medium border border-[#FFDDDD] text-xs px-1.5 py-0.5 rounded-full">
                                  {chatStatus.unreadCount}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto mt-2 sm:mt-0 sm:ml-4">
                        {/* For pending quotes - show Accept and Decline buttons */}
                        {quote.status === 'pending' && (
                          <>
                            <Button
                              onClick={() => handleAcceptQuote(quote._id)}
                              variant="success"
                              size="sm"
                              className="px-3 sm:px-4 py-2"
                            >
                              Accept
                            </Button>
                            <Button
                              onClick={() => handleDeclineQuote(quote._id)}
                              variant="danger"
                              size="sm"
                              className="px-3 sm:px-4 py-2"
                            >
                              Decline
                            </Button>
                          </>
                        )}
                        
                        {/* For accepted quotes - show Start Chat button */}
                        {quote.status === 'accepted' && (
                          <Button
                            onClick={() => {
                              if (cleaner.id && cleaner.id !== 'undefined' && cleaner.id !== 'null') {
                                navigate(`/customer-chat/${jobId}?cleaner=${cleaner.id}`);
                              } else {
                                setError('Unable to start chat - cleaner information not available. Please try refreshing the page.');
                              }
                            }}
                            variant="secondary"
                            size="sm"
                            icon={MessageIcon}
                            className="px-3 sm:px-4 py-2 shadow-custom"
                          >
                            Start Chat
                          </Button>
                        )}
                        
                        {/* Quote Status for rejected quotes */}
                        {quote.status === 'rejected' && (
                          <div className="bg-[#FFE4E4] text-[#EF4444] border border-[#FFDDDD] px-3 sm:px-4 py-2 rounded-xl flex items-center justify-center shadow-custom">
                            <span className="text-xs sm:text-sm font-medium">Rejected</span>
                          </div>
                        )}

                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {cleanerQuotes.filter(quote => quote.status !== 'rejected').length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-500 text-sm">
                Waiting for cleaners to send quotes...
              </div>
            </div>
          )}
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

      {/* Accept Quote Confirmation Modal */}
      <ConfirmationModal
        isOpen={showAcceptModal}
        onClose={handleCancelAcceptQuote}
        onConfirm={handleConfirmAcceptQuote}
        title="Accept Quote?"
        message={
          quoteToAccept ? 
            `Are you sure you want to accept this quote for $${quoteToAccept.price}? This will reject all other quotes and confirm this cleaner for your job.` :
            "Are you sure you want to accept this quote?"
        }
        confirmText="Accept Quote"
        cancelText="Cancel"
        confirmButtonColor="bg-[#E4FBED] text-[#1EB154]! hover:text-[#00832D]! border border-[#DBF9E7]"
        isLoading={isAccepting}
      />

      {/* Decline Quote Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeclineModal}
        onClose={handleCancelDeclineQuote}
        onConfirm={handleConfirmDeclineQuote}
        title="Decline Quote?"
        message={
          quoteToDecline ? 
            `Are you sure you want to decline this quote for $${quoteToDecline.price}? This action cannot be undone.` :
            "Are you sure you want to decline this quote?"
        }
        confirmText="Decline Quote"
        cancelText="Cancel"
        confirmButtonColor="bg-[#FFE4E4] hover:bg-[#EF4444] text-[#EF4444]! hover:text-white! border border-[#FFDDDD]"
        isLoading={isDeclining}
      />
    </div>
  );
};

export default CustomerJobDetailsPage;
