import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader, JobOverviewCard } from '../../components';
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

  const serviceDetail = getServiceDetail(job);
  const scheduledDateLabel = job?.scheduledDate ? formatDate(job.scheduledDate) : 'Date not set';
  const jobFrequencyLabel = getJobFrequency(job);

  const handleChatWithCustomer = () => {
    navigate(`/chat/${jobId}`);
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50" />
    );
  }

  if (error || !job) {
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
          title={getJobTitle(job)}
          onBack={() => navigate(-1)}
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
            />
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
