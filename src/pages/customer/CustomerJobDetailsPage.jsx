import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Wallet,
  Clock3,
  Home as HomeIcon,
  Ruler,
  CalendarDays,
  Phone,
} from 'lucide-react';
import { Button, ConfirmationModal, PageHeader, JobOverviewCard } from '../../components';
import ThreeDotIcon from '../../assets/3dot.svg';
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
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [quoteToConnect, setQuoteToConnect] = useState(null);
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

        const response = await jobsAPI.getJobById(jobId);

        if (response.success && response.data) {
          setJob(response.data);

          const cleaners = response.data.contactedCleaners || response.data.quotes || [];
          if (cleaners.length > 0) {
            setCleanerQuotes(cleaners);
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
          const jobChatRooms = chatResponse.data.filter(room =>
            room.jobId._id === jobId || room.jobId === jobId
          );
          setChatRooms(jobChatRooms);
        }
      } catch (err) {
      }
    };

    if (jobId) {
      fetchJobDetails();
      fetchChatRooms();
    }
  }, [jobId]);

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
    return `${serviceType} `;
  };

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

  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === '') return '';
    const numeric = Number(value);
    if (Number.isNaN(numeric)) return value;
    return `$${numeric.toLocaleString('en-AU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: numeric % 1 === 0 ? 0 : 2,
    })}`;
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

  const getPreferredDaysDisplay = (preferredDays) => {
    if (!preferredDays || typeof preferredDays !== 'object') return '';

    const days = Object.keys(preferredDays).filter(day => preferredDays[day] === true);
    if (days.length === 0) return '';

    return days.join(', ');
  };

  const getRepeatWeeksDisplay = (repeatWeeks) => {
    if (!repeatWeeks) return '';
    return `${repeatWeeks} week${repeatWeeks === '1' ? '' : 's'}`;
  };

  const getFrequencyDisplay = (job) => {
    const frequency = getJobFrequency(job);
    const preferredDays = getPreferredDaysDisplay(job?.preferredDays);
    const repeatWeeks = getRepeatWeeksDisplay(job?.repeatWeeks);

    let display = frequency;

    if (preferredDays && repeatWeeks) {
      display += ` • ${preferredDays} • ${repeatWeeks}`;
    } else if (preferredDays) {
      display += ` • ${preferredDays}`;
    } else if (repeatWeeks) {
      display += ` • ${repeatWeeks}`;
    }

    return display;
  };

  const handleDropdownToggle = () => {
    setShowDropdown(!showDropdown);
  };

  const handleCancelJob = () => {
    setShowDropdown(false);
    setShowCancelModal(true);
  };

  const handleConnect = (quoteId) => {
    const quote = cleanerQuotes.find(q => q._id === quoteId);
    if (quote) {
      setQuoteToConnect(quote);
      setShowConnectModal(true);
    }
  };

  const handleAcceptQuote = (quoteId) => {
    const quote = cleanerQuotes.find(q => q._id === quoteId);
    if (quote) {
      setQuoteToConnect(quote);
      setShowConnectModal(true);
    }
  };

  const handleDeclineQuote = (quoteId) => {
    const quote = cleanerQuotes.find(q => q._id === quoteId);
    if (quote) {
      setQuoteToDecline(quote);
      setShowDeclineModal(true);
    }
  };

  const handleConfirmConnect = async () => {
    if (!quoteToConnect) return;
    const cleanerId = quoteToConnect.cleanerId?._id || quoteToConnect.cleanerId || quoteToConnect.id;

    try {
      setIsConnecting(true);
      // Connect with cleaner via job endpoint
      const response = await jobsAPI.connectCleaner(jobId, cleanerId);

      // If success OR if already connected, we can proceed to chat
      if (response.success || response.error === 'Already connected with this cleaner') {
        setShowConnectModal(false);
        navigate(`/customer-chat/${jobId}?cleaner=${cleanerId}`);
      } else {
        setError(response.message || response.error || 'Failed to connect with cleaner');
        setShowConnectModal(false);
      }
    } catch (err) {
      // Check if error message indicates already connected
      if (err.message && err.message.includes('Already connected')) {
        setShowConnectModal(false);
        navigate(`/customer-chat/${jobId}?cleaner=${cleanerId}`);
      } else {
        setError('Failed to connect. Please try again.');
        setShowConnectModal(false);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConfirmAcceptQuote = async () => {
    if (!quoteToConnect) return;

    try {
      setIsConnecting(true);

      const response = await quotesAPI.acceptQuote(jobId, quoteToConnect._id);

      if (response.success) {
        const updatedQuotes = cleanerQuotes.map(quote =>
          quote._id === quoteToConnect._id
            ? { ...quote, status: 'accepted' }
            : { ...quote, status: 'rejected' }
        );
        setCleanerQuotes(updatedQuotes);

        // Close modal
        setShowConnectModal(false);
        setQuoteToConnect(null);
      } else {
        setError(response.error || 'Failed to accept quote');
        setShowConnectModal(false);
      }
    } catch (err) {
      setError('Failed to accept quote. Please try again.');
      setShowConnectModal(false);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleCancelConnect = () => {
    setShowConnectModal(false);
    setQuoteToConnect(null);
  };

  const handleCancelAcceptQuote = () => {
    setShowConnectModal(false);
    setQuoteToConnect(null);
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

  const serviceDetail = getServiceDetail(job);
  const scheduledDateLabel = job?.scheduledDate ? formatDate(job.scheduledDate) : 'Date not set';
  const jobFrequencyLabel = getFrequencyDisplay(job);
  const jobOverviewMeta = useMemo(() => {
    if (!job) return [];
    const meta = [];

    const budgetValue = job.budget || job.estimatedPrice || job.priceEstimate || job.priceRange;
    if (budgetValue) {
      meta.push({
        label: 'Budget',
        value: formatCurrency(budgetValue),
        icon: <Wallet className="w-4 h-4 text-primary-400" strokeWidth={2.2} />,
      });
    }

    const durationValue = job.estimatedDuration || job.duration || job.timeEstimate;
    if (durationValue) {
      meta.push({
        label: 'Duration',
        value: typeof durationValue === 'number' ? `${durationValue} hrs` : durationValue,
        icon: <Clock3 className="w-4 h-4 text-primary-400" strokeWidth={2.2} />,
      });
    }

    const propertyTypeValue = job.propertyType || job.propertyCategory;
    if (propertyTypeValue) {
      meta.push({
        label: 'Property Type',
        value: propertyTypeValue,
        icon: <HomeIcon className="w-4 h-4 text-primary-400" strokeWidth={2.2} />,
      });
    }

    const propertySizeValue = job.propertySize || job.squareFootage || job.propertyArea;
    if (propertySizeValue) {
      meta.push({
        label: 'Property Size',
        value: propertySizeValue,
        icon: <Ruler className="w-4 h-4 text-primary-400" strokeWidth={2.2} />,
      });
    }

    // Add preferred days if available
    const preferredDaysDisplay = getPreferredDaysDisplay(job?.preferredDays);
    if (preferredDaysDisplay) {
      meta.push({
        label: 'Preferred Days',
        value: preferredDaysDisplay,
        icon: <CalendarDays className="w-4 h-4 text-primary-400" strokeWidth={2.2} />,
      });
    }

    // Add repeat weeks if available
    const repeatWeeksDisplay = getRepeatWeeksDisplay(job?.repeatWeeks);
    if (repeatWeeksDisplay) {
      meta.push({
        label: 'Duration',
        value: repeatWeeksDisplay,
        icon: <Clock3 className="w-4 h-4 text-primary-400" strokeWidth={2.2} />,
      });
    }

    return meta;
  }, [job, getPreferredDaysDisplay, getRepeatWeeksDisplay]);

  const roleSections = useMemo(() => {
    if (!job) return {};

    const getPersonName = (person) => {
      if (!person) return '';
      const { firstName, lastName, name, fullName } = person;
      const combined = `${firstName || ''} ${lastName || ''}`.trim();
      return combined || fullName || name || '';
    };

    const getPersonPhone = (person) => {
      if (!person) return '';
      return (
        person.phone ||
        person.phoneNumber ||
        person.mobile ||
        person.contactNumber ||
        ''
      );
    };

    const assignedCleaner =
      job.assignedCleaner ||
      job.cleaner ||
      job.acceptedCleaner ||
      job.assignedCleanerInfo ||
      job.assignedTo ||
      job.assignedCleanerId;

    const assignedCleanerName =
      typeof assignedCleaner === 'string'
        ? assignedCleaner
        : getPersonName(assignedCleaner);

    const assignedCleanerPhone =
      typeof assignedCleaner === 'string' ? '' : getPersonPhone(assignedCleaner);

    const assignedCleanerRating =
      typeof assignedCleaner === 'object'
        ? assignedCleaner?.averageRating || assignedCleaner?.rating
        : '';

    const customer =
      job.customer ||
      job.customerId ||
      job.postedBy ||
      job.createdBy;

    const customerName = getPersonName(customer);
    const customerPhone = getPersonPhone(customer);

    const sections = {};

    const customerItems = [
      assignedCleanerName
        ? { label: 'Assigned Cleaner', value: assignedCleanerName }
        : null,
      assignedCleanerPhone
        ? { label: 'Cleaner Contact', value: assignedCleanerPhone }
        : null,
      assignedCleanerRating
        ? { label: 'Cleaner Rating', value: `${assignedCleanerRating}⭐` }
        : null,
      job.specialInstructions ||
        job.instructions ||
        job.additionalNotes ||
        ''
        ? { label: 'Special Instructions', value: job.specialInstructions || job.instructions || job.additionalNotes }
        : null,
    ].filter(Boolean);

    if (customerItems.length > 0) {
      sections.customer = customerItems;
    }

    const cleanerItems = [
      customerName
        ? { label: 'Customer', value: customerName }
        : null,
      customerPhone
        ? { label: 'Customer Contact', value: customerPhone }
        : null,
      job.accessInstructions
        ? { label: 'Access Notes', value: job.accessInstructions }
        : null,
    ].filter(Boolean);

    if (cleanerItems.length > 0) {
      sections.cleaner = cleanerItems;
    }

    return sections;
  }, [job]);

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
    const cleaner = quote.cleaner || quote.cleanerId;
    const cleanerId = cleaner?._id || cleaner?.id || quote.cleanerId || quote._id || quote.id;

    // Handle distance/searchRadius
    const distanceVal = quote.distance || cleaner?.distance;
    const searchRadius = cleaner?.location?.searchRadius || cleaner?.searchRadius;
    const displayDistance = distanceVal 
      ? (String(distanceVal).includes('km') ? distanceVal : `${distanceVal} km away`)
      : (searchRadius ? `${searchRadius} km away` : 'Distance not available');

    return {
      id: cleanerId,
      quoteId: quote._id || quote.id,
      name: cleaner ? `${cleaner.firstName || ''} ${cleaner.lastName || ''}`.trim() || `Cleaner #${cleanerId?.slice(-4)}` : 'Cleaner',
      phone: cleaner?.phone || '',
      photo: resolveImageSrc(cleaner?.profilePhoto),
      rating: cleaner?.averageRating !== undefined ? cleaner.averageRating : (cleaner?.rating || 0),
      reviews: cleaner?.totalReviews || cleaner?.reviewCount || 0,
      tier: (cleaner?.tier || 'none').toLowerCase(),
      quoteAmount: quote.price || quote.amount || 0,
      isVerified: cleaner?.isVerified || false,
      status: quote.status || 'pending',
      isConnected: quote.isConnected || false,
      distance: displayDistance,
      message: quote.introMessage || quote.message || quote.proposal || 'Hi, I can do this job. I have experience in cleaning.',
    };
  };


  if (loading) {
    return (
      <>
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
      </>
    );
  }

  if (error || !job) {
    return (
      <>
        <div className="max-w-sm mx-auto min-h-screen sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="text-center py-8">
              <div className="text-red-500 text-lg font-medium">{error || 'Job not found'}</div>
              <Button
                onClick={() => {
                  const savedTab = localStorage.getItem('customerActiveTab');
                  navigate('/my-jobs', { state: { tab: savedTab || 'all' }, replace: true });
                }}
                size="md"
                className="mt-4"
              >
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="max-w-6xl mx-auto py-3 sm:py-4 px-3 sm:px-4 md:px-4">
        <PageHeader
          title={serviceDetail || `Job Details - ${job.serviceType || 'Cleaning'}`}
          onBack={() => {
            const savedTab = localStorage.getItem('customerActiveTab');
            navigate('/my-jobs', { state: { tab: savedTab || 'all' }, replace: true });
          }}
          titleClassName="text-sm sm:text-base md:text-lg font-semibold text-primary-500 truncate"
          backButtonClassName="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          rightSlot={
            <div className="relative" ref={dropdownRef}>
              <Button
                onClick={handleDropdownToggle}
                variant=""
                size="sm"
                icon={ThreeDotIcon}
                className="p-1 sm:p-2"
              />

              {showDropdown && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                  <div className="py-2">
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
          }
        />
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6">
        <div className="mb-3 sm:mb-4">
          <JobOverviewCard
            jobId={job.jobId || job.referenceId || job._id?.slice(-6)}
            title={serviceDetail}
            propertyType={job.propertyType}
            quoteCount={cleanerQuotes.length}
            serviceType={job.serviceType || job.category || job.service}
            serviceDetail=""
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
            metaInfo={jobOverviewMeta}
            roleSections={roleSections}
          />
        </div>

        {/* Custom Job Dates Section */}


        {/* Service Provider Quotes Section */}
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
                  <div key={quote._id || quote.id || `quote-${index}`} className="bg-white rounded-[24px] border border-gray-100 p-4 sm:p-5">
                    {/* Upper Header: Avatar, Name, Phone, and Tier Badge */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full overflow-hidden flex-shrink-0 bg-gray-50 border border-gray-100">
                          {cleaner.photo ? (
                            <img src={cleaner.photo} alt={cleaner.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary-50 text-primary-300">
                              <img src={UserIcon} className="w-6 h-6 sm:w-8 sm:h-8" alt="User" />
                            </div>
                          )}
                        </div>
                        <div className="pt-0.5 sm:pt-1">
                          <h4 className="text-[18px] sm:text-x font-semibold text-text-primary-500 mb-1">
                            {cleaner.name}
                          </h4>
                          <div className="flex items-center gap-1.5 text-[#374151] mb-1">
                            <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#374151]" strokeWidth={2} />
                            <span className="text-sm sm:text-base font-semibold leading-none">
                              {cleaner.phone || '07 3803 6136'}
                            </span>
                          </div>
                          <div className="text-xs sm:text-sm text-gray-400 font-normal">
                            {cleaner.distance} — En route
                          </div>
                        </div>
                      </div>

                      {/* Tier Badge Pill */}
                      {cleaner.tier && (
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-100 bg-[gray-50/50] shadow-sm`}>
                          {cleaner.tier !== 'none' && (
                            <img
                              src={
                                cleaner.tier === 'gold'
                                  ? GoldBadgeIcon
                                  : cleaner.tier === 'silver'
                                    ? SilverBadgeIcon
                                    : BronzeBadgeIcon
                              }
                              alt="Badge"
                              className="w-4 h-4 sm:w-5 sm:h-5"
                            />
                          )}
                          <span className="text-xs sm:text-sm text-[#374151] font-semibold capitalize whitespace-nowrap">
                            {cleaner.tier} Tier
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Proposal Message Bubble */}
                    <div className="bg-[#EBF2FD] rounded-[20px] p-4 mb-4">
                      <p className="text-[#111827] text-sm font-medium leading-[1.45]">
                        {cleaner.message}
                      </p>
                    </div>

                    {/* Footer Action Button */}
                    <div className="space-y-3">
                      <div className='flex justify-end'>
                        <Button
                          onClick={() => {
                            if (quote.status === 'accepted' || quote.isConnected) {
                              navigate(`/customer-chat/${job._id || jobId}?cleaner=${cleaner._id || cleaner.id}`);
                            } else {
                              handleAcceptQuote(quote._id);
                            }
                          }}
                          variant=""
                          className="px-7 py-2 text-sm sm:text-lg font-semibold rounded-full border border-[#DCE4FF] bg-white text-[#1F6FEB] hover:bg-[#1F6FEB] hover:text-white hover:border-[#1F6FEB] shadow-sm transition-all"
                        >
                          { (quote.status === 'accepted' || quote.isConnected) ? 'Message Cleaner' : 'Connect & Message'}
                        </Button>
                      </div>

                      {quote.status === 'pending' && (
                        <button
                          onClick={() => handleDeclineQuote(quote._id)}
                          className="w-full text-xs sm:text-sm font-semibold text-gray-400 hover:text-red-500 transition-colors py-1"
                        >
                          Not interested? Decline Quote
                        </button>
                      )}
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

      {/* Connect Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConnectModal}
        onClose={handleCancelConnect}
        onConfirm={handleConfirmConnect}
        title={
          quoteToConnect
            ? `Connect with ${quoteToConnect.cleaner?.firstName || quoteToConnect.cleanerId?.firstName || 'Cleaner'}?`
            : "Connect with Cleaner?"
        }
        message={
          quoteToConnect ?
            `We'll notify ${quoteToConnect.cleaner?.firstName || quoteToConnect.cleanerId?.firstName || 'the cleaner'} that you want to connect about the job.` :
            "We'll notify the cleaner that you want to connect about the job."
        }
        confirmText="Connect"
        cancelText="Not Now"
        confirmButtonColor="bg-blue-600 hover:bg-blue-700"
        isLoading={isConnecting}
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
        confirmButtonColor="bg-red-500 hover:bg-[#EF4444] text-red-500! hover:text-white! border border-red-500"
        isLoading={isDeclining}
      />
    </>
  );
};

export default CustomerJobDetailsPage;
