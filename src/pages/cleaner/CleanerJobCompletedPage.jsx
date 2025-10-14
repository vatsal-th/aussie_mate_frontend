import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Button from '../../components/Button';
import ArrowLeftIcon from '../../assets/arrow-left.svg';
import CalendarIcon from '../../assets/Calendar.svg';
import MapPinIcon from '../../assets/map-pin 1.png';
import { jobsAPI, jobPhotosAPI } from '../../services/api';

const CleanerJobCompletedPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [jobData, setJobData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [invoiceData, setInvoiceData] = useState(null);

  // Fetch job details
  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch job details and photos in parallel
        const [jobResponse, photosResponse] = await Promise.all([
          jobsAPI.getJobById(jobId),
          jobPhotosAPI.getJobPhotos(jobId).catch(() => ({ data: { beforePhotos: [], afterPhotos: [] } }))
        ]);
        
        if (jobResponse.success && jobResponse.data) {
          const job = jobResponse.data;
          const photosData = photosResponse.data || photosResponse;
          
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

  const handleDownloadInvoice = () => {
    if (!invoiceData) return;
    
    const invoiceText = `
INVOICE
========================================
Job ID: ${invoiceData.jobId}
Customer: ${invoiceData.customerName}
Completed: ${invoiceData.completedAt}
----------------------------------------
Total Amount: $${invoiceData.totalPaid}
Paid Online: $${invoiceData.paidOnline}
Cash Payment: $${invoiceData.cashToPay}
========================================
Thank you for using Aussie Mate!
    `;
    
    const blob = new Blob([invoiceText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${invoiceData.jobId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  if (error || !jobData) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-red-500">{error || 'Job not found'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <Header />

      <div className="max-w-sm mx-auto sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl px-4">
        {/* Top Navigation */}
        <div className="flex items-center gap-3 py-4">
          <button
            onClick={() => navigate('/cleaner-jobs')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <img src={ArrowLeftIcon} alt="Back" className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold text-primary-500">Job Completed</h1>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl p-6 shadow-custom mb-6">
          {/* Job ID and Status Badge */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-primary-200 font-medium">{jobData.jobId}</div>
            <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
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

