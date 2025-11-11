import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, PageHeader, Loader } from '../../components';
import CalendarIcon from '../../assets/Calendar.svg';
import MapPinIcon from '../../assets/map-pin 1.png';
import { jobsAPI, jobPhotosAPI, reviewsAPI } from '../../services/api';
import StarFullIcon from '../../assets/rating.svg';

const CleanerJobCompletedPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [jobData, setJobData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [invoiceData, setInvoiceData] = useState(null);
  const [customerReview, setCustomerReview] = useState(null);

  // Fetch job details
  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch job details, photos, and reviews in parallel
        const [jobResponse, photosResponse, reviewResponse] = await Promise.all([
          jobsAPI.getJobById(jobId),
          jobPhotosAPI.getJobPhotos(jobId).catch(() => ({ data: { beforePhotos: [], afterPhotos: [] } })),
          reviewsAPI.getMyReviews().catch(() => null)
        ]);
        
        if (jobResponse.success && jobResponse.data) {
          const job = jobResponse.data;
          const photosData = photosResponse.data || photosResponse;
          
          // If job is NOT completed, redirect to appropriate page
          if (job.status === 'in_progress' || job.status === 'in-progress' || job.status === 'started') {
            navigate(`/cleaner/complete-job/${jobId}`, { replace: true });
            return;
          }
          if (job.status === 'accepted') {
            navigate(`/cleaner/in-progress-job/${jobId}`, { replace: true });
            return;
          }
          
          // Transform job data to match expected format
          const acceptedQuote = job.quotes?.find(q => q.status === 'accepted');
          const customer = job.customerId;
          
          // Get photos from multiple possible sources
          const beforeImages = photosData.beforePhotos || job.beforePhotos || [];
          const afterImages = photosData.afterPhotos || job.afterPhotos || [];
          
          const transformedData = {
            jobId: job.jobId || job._id,
            title: job.title || job.serviceType,
            completedAt: job.completedAt ? new Date(job.completedAt).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }) : 'Recently',
            location: job.location?.address || job.location?.fullAddress || 'Location',
            customer: {
              id: customer?._id || customer?.id || 'N/A',
              name: customer ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim() : 'Customer'
            },
            payment: {
              totalPaid: acceptedQuote?.price || job.estimatedPrice || 0,
              paidOnline: Math.round((acceptedQuote?.price || job.estimatedPrice || 0) * 0.1),
              cashToPay: Math.round((acceptedQuote?.price || job.estimatedPrice || 0) * 0.9),
              mode: job.paymentMethod || 'Cash'
            },
            completionProof: {
              beforeImages: beforeImages,
              afterImages: afterImages
            }
          };
          
          setJobData(transformedData);
          
          // Create invoice data
          setInvoiceData({
            jobId: transformedData.jobId,
            customerName: transformedData.customer.name,
            completedAt: transformedData.completedAt,
            totalPaid: transformedData.payment.totalPaid,
            paidOnline: transformedData.payment.paidOnline,
            cashToPay: transformedData.payment.cashToPay
          });
          
          // Set review data if available
          if (reviewResponse && reviewResponse.success && reviewResponse.data) {
            // Find review for this specific job
            const reviews = reviewResponse.data.reviews || reviewResponse.data;
            
            const jobReview = Array.isArray(reviews) 
              ? reviews.find(r => 
                  r.jobId === jobId || 
                  r.jobId?._id === jobId || 
                  r.job === jobId ||
                  r.job?._id === jobId ||
                  r.job?.jobId === jobId
                )
              : null;
            
            if (jobReview) {
              setCustomerReview({ review: jobReview });
            }
          }
        }
      } catch (err) {
        setError('Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId]);


  if (loading) {
    return <Loader fullscreen message="Loading job details..." />;
  }

  if (error || !jobData) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center py-20">
          <div className="text-red-500">{error || 'Job not found'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="max-w-sm mx-auto sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl px-4">
        <PageHeader title="Job Completed" onBack={() => navigate('/cleaner-jobs')} />

        {/* Main Content */}
        <div className="bg-white rounded-2xl p-6 shadow-custom mb-6">
          {/* Job ID and Status Badge */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-primary-200 font-medium">{jobData.jobId}</div>
            <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium ">
              Completed
            </div>
          </div>

          {/* Job Title */}
          <h2 className="text-2xl font-bold text-primary-500 mb-4">{jobData.title}</h2>

          {/* Job Details */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center">
              <img src={CalendarIcon} alt="Calendar" className="w-4 h-4 mr-3" />
              <span className="text-sm text-primary-200 font-medium">
                Completed: {jobData.completedAt}
              </span>
            </div>
            <div className="flex items-center">
              <img src={MapPinIcon} alt="Location" className="w-4 h-4 mr-3" />
              <span className="text-sm text-primary-200 font-medium">{jobData.location}</span>
            </div>
          </div>

          {/* Customer Review Section */}
          {customerReview && customerReview.review && (
            <div className="border-t border-gray-200 pt-4 mb-6">
              <h3 className="text-lg font-semibold text-primary-500 mb-3 flex items-center gap-2">
                Customer Review
              </h3>
              
              <div className="shadow-custom rounded-xl p-4 border border-primary-200">
                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                     <img src={StarFullIcon} alt="Star" className="w-5 h-5" />  
                    ))}
                  </div>
                  <span className="text-base font-semibold text-gray-900">
                    {customerReview.review.rating}/5
                  </span>
                </div>

                {/* Feedback */}
                {customerReview.review.feedback && (
                  <p className="text-sm text-primary-500  mb-3 font-medium">
                    "{customerReview.review.feedback}"
                  </p>
                )}

                {/* Liked Aspects */}
                {customerReview.review.likedAspects && customerReview.review.likedAspects.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {customerReview.review.likedAspects.map((aspect, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-[#EBF2FD] text-primary-600 text-xs font-medium rounded-full border border-[#9CC0F6]"
                      >
                        {aspect}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Payment Summary */}
          <div className="border-t border-gray-200 pt-4 mb-6">
            <h3 className="text-lg font-semibold text-primary-500 mb-3">Payment Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-primary-200 font-medium">Total Amount</span>
                <span className="text-sm font-semibold text-primary-500">${jobData.payment.totalPaid}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-primary-200 font-medium">Paid Online</span>
                <span className="text-sm font-semibold text-green-600">${jobData.payment.paidOnline}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-primary-200 font-medium">Cash Payment</span>
                <span className="text-sm font-semibold text-orange-600">${jobData.payment.cashToPay}</span>
              </div>
            </div>
          </div>

          {/* Completion Proof */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-semibold text-primary-500 mb-3">Completion Proof</h3>
            
            {/* Before Photos */}
            {jobData.completionProof.beforeImages.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-primary-200 font-medium mb-2">Before Photos</p>
                <div className="grid grid-cols-3 gap-2">
                  {jobData.completionProof.beforeImages.map((photo, index) => {
                    const photoUrl = typeof photo === 'string' ? photo : (photo.url || photo.path || '');
                    return (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={photoUrl}
                          alt={`Before ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* After Photos */}
            {jobData.completionProof.afterImages.length > 0 && (
              <div>
                <p className="text-sm text-primary-200 font-medium mb-2">After Photos</p>
                <div className="grid grid-cols-3 gap-2">
                  {jobData.completionProof.afterImages.map((photo, index) => {
                    const photoUrl = typeof photo === 'string' ? photo : (photo.url || photo.path || '');
                    return (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={photoUrl}
                          alt={`After ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {jobData.completionProof.beforeImages.length === 0 && 
             jobData.completionProof.afterImages.length === 0 && (
              <p className="text-sm text-gray-500">No photos uploaded</p>
            )}
          </div>
        </div>


        {/* Back to Jobs Button */}
        <div className="flex justify-end mt-6">
          <Button
            text="Back to My Jobs"
            onClick={() => navigate('/cleaner-jobs')}
          >
            Back to My Jobs
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CleanerJobCompletedPage;

