import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { PageHeader, JobOverviewCard, ContactCustomerModal } from '../../components';
import ChatIcon from '../../assets/message2.svg';
import { jobsAPI } from '../../services/api';
import { Wallet, Clock3, Home as HomeIcon, Ruler, AlertTriangle, CalendarDays } from 'lucide-react';

const JobDetailsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showContactModal, setShowContactModal] = useState(false);
  const [isContacting, setIsContacting] = useState(false);
  const [isContacted, setIsContacted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

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

          // Check if current cleaner has already contacted or is connected
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
          const currentUserId = currentUser.id || currentUser._id;
          
          const contacted = (jobData.contactedCleaners || []).some(c => 
            (c.cleanerId?._id || c.cleanerId) === currentUserId
          );
          setIsContacted(contacted);

          const connected = (jobData.contactedCleaners || []).some(c => 
            ((c.cleanerId?._id || c.cleanerId) === currentUserId) && c.isConnected
          );
          setIsConnected(connected || jobData.status === 'assigned' || jobData.status === 'accepted');
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


  const resolveImageSrc = (image) => {
    if (!image) return '';
    if (typeof image === 'string') return image;
    return image.url || image.path || image.secureUrl || '';
  };

  const jobPhotos = useMemo(() => {
    if (!job) return [];
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

  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === '') return '';
    const numeric = Number(value);
    if (Number.isNaN(numeric)) return value;
    return `$${numeric.toLocaleString('en-AU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: numeric % 1 === 0 ? 0 : 2,
    })}`;
  };

  const serviceDetail = getServiceDetail(job);
  const scheduledDateLabel = job?.scheduledDate ? formatDate(job.scheduledDate) : 'Date not set';
  const jobFrequencyLabel = getJobFrequency(job);

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

    const priorityValue = job.priority || job.priorityLevel;
    if (priorityValue) {
      meta.push({
        label: 'Priority',
        value: priorityValue,
        icon: <AlertTriangle className="w-4 h-4 text-primary-400" strokeWidth={2.2} />,
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

    // Show customer contact info ONLY if connected
    if (isConnected && job.customerId) {
      if (job.customerId.phone) {
        meta.push({
          label: 'Customer Phone',
          value: job.customerId.phone,
          icon: <span className="text-primary-400">📞</span>,
        });
      }
      if (job.customerId.email) {
        meta.push({
          label: 'Customer Email',
          value: job.customerId.email,
          icon: <span className="text-primary-400">📧</span>,
        });
      }
    }

    return meta;
  }, [job]);

  const handleChatWithCustomer = () => {
    if (isContacted) {
      navigate(`/chat/${jobId}`);
    } else {
      setShowContactModal(true);
    }
  };

  const handleConfirmContact = async (message) => {
    try {
      setIsContacting(true);
      const response = await jobsAPI.contactJob(jobId, { message });
      if (response.success) {
        setIsContacted(true);
        setShowContactModal(false);
        navigate(`/chat/${jobId}`);
      } else {
        setError(response.message || 'Failed to send message');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsContacting(false);
    }
  };


  if (loading) {
    return null;
  }

  if (error || !job) {
    return (
      <>
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
      </>
    );
  }

  return (
    <>
      <div className="max-w-sm mx-auto sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl">
        <PageHeader
          title={getJobTitle(job)}
          onBack={() => {
            const savedTab = localStorage.getItem('cleanerActiveTab');
            navigate('/cleaner-jobs', { state: { tab: savedTab || 'live-jobs' }, replace: true });
          }}
          className="px-4 sm:px-6 lg:px-8 py-2 sm:py-4"
          titleClassName="text-lg sm:text-xl font-semibold text-primary-500 truncate"
        />

        <div className="px-4 sm:px-6 lg:px-8 pb-6">
          {/* Job Overview Card */}
          <div className="mb-4">
            <JobOverviewCard
              jobId={job?.jobId || job?.referenceId || job?._id?.slice(-6)}
              title={getJobTitle(job)}
              serviceType={job?.serviceType || job?.category || job?.service}
              serviceDetail={serviceDetail}
              instructions={
                job?.specialInstructions ||
                job?.instructions ||
                job?.additionalNotes ||
                ''
              }
              scheduledDate={scheduledDateLabel}
              frequency={jobFrequencyLabel}
              location={job?.location?.address || job?.address || job?.locationDescription || 'Location not specified'}
              photos={jobPhotos}
              viewerRole="cleaner"
              metaInfo={jobOverviewMeta}
            />
          </div>

          {/* Posted By Section (from mockup) */}
          {job.customerId && (
            <div className="bg-white rounded-2xl p-4 mb-4 border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src={job.customerId.profileImage || `https://ui-avatars.com/api/?name=${job.customerId.firstName}+${job.customerId.lastName}&background=random`} 
                  alt="Customer" 
                  className="w-12 h-12 rounded-full border border-gray-200 object-cover" 
                />
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Posted by</p>
                  <p className="text-lg font-bold text-primary-500">{job.customerId.firstName} {job.customerId.lastName}.</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleChatWithCustomer}
                  className="flex items-center gap-2 px-4 py-2 bg-[#F1F6FF] text-primary-600 rounded-full font-semibold text-sm border border-[#E0EAFF] hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  <img src={ChatIcon} alt="Chat" className="w-4 h-4" />
                   Chat
                </button>
                {/* Call button - only if phone is available (usually hidden until booking) */}
                {job.status === 'assigned' && job.customerId.phone && (
                   <button
                    onClick={() => window.open(`tel:${job.customerId.phone}`)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#F1F6FF] text-primary-600 rounded-full font-semibold text-sm border border-[#E0EAFF] hover:bg-blue-50 transition-colors cursor-pointer"
                  >
                    <span className="text-primary-600">📞</span>
                    Call
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            {/* Show "I'm on the way" button only if assigned to me */}
            {(() => {
              const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
              const currentUserId = currentUser.id || currentUser._id;
              const isAssigned = job.status === 'assigned' || job.status === 'accepted' || job.status === 'in_progress';
              const isAssignedToMe = job.assignedCleanerId === currentUserId || 
                                    job.assignedCleanerId?._id === currentUserId ||
                                    job.cleanerId === currentUserId ||
                                    job.cleanerId?._id === currentUserId;
              
              if (isAssigned && isAssignedToMe) {
                return (
                  <button
                    onClick={() => {
                      // Logic for "I'm on the way"
                      console.log('Sending "On the way" status for job:', job._id);
                      alert('Status updated: You are on the way!');
                    }}
                    className="bg-green-600 text-white cursor-pointer shadow-custom border border-green-100 font-medium py-2 px-4 sm:py-3 sm:px-6 rounded-xl transition-colors duration-200 flex items-center gap-2 hover:bg-green-700"
                  >
                    I'm On The Way
                  </button>
                );
              }
              return null;
            })()}
          </div>
        </div>
      </div>

      <ContactCustomerModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        onConfirm={handleConfirmContact}
        customerName={job.customerId?.firstName}
        isLoading={isContacting}
      />
    </>
  );
};

export default JobDetailsPage;
