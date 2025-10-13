import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Button from '../../components/Button';
import ArrowLeftIcon from '../../assets/arrow-left.svg';
import RatingIcon from '../../assets/rating.svg';
import Rating2Icon from '../../assets/rating2.svg';
import PdfIcon from '../../assets/pdf.svg';
import DownloadIcon from '../../assets/download.svg';
import GoldBadgeIcon from '../../assets/goldBadge.svg';
import CalendarIcon from '../../assets/Calendar.svg';
import MapPinIcon from '../../assets/map-pin 1.png';
import { jobDetailsAPI, reviewsAPI } from '../../services/api';
import { handleAPIError } from '../../services/api';

const JobDetailsCompletedPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [selectedRating, setSelectedRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [jobData, setJobData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [invoiceData, setInvoiceData] = useState(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  const feedbackTags = [
    'Punctual', 'Professional', 'Quality Work', 'Friendly', 'Good Communication'
  ];

  const handleTagSelect = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Fetch job details and invoice data
  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch job details
        const jobResponse = await jobDetailsAPI.getCompletedJobDetails(jobId);
        if (jobResponse.success) {
          setJobData(jobResponse.data);
          
          // Fetch invoice data if available
          try {
            const invoiceResponse = await jobDetailsAPI.getStripeInvoice(jobId);
            if (invoiceResponse.success) {
              setInvoiceData(invoiceResponse.data);
            }
          } catch (invoiceError) {
            console.warn('Invoice not available:', invoiceError.message);
          }
        }
      } catch (error) {
        console.error('Error fetching job details:', error);
        setError(handleAPIError(error));
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId]);

  const handleSubmitReview = async () => {
    if (!selectedRating) {
      alert('Please select a rating before submitting');
      return;
    }

    try {
      setSubmittingReview(true);
      
      const response = await reviewsAPI.createReview(
        jobId,
        selectedRating,
        selectedTags,
        feedback
      );

      if (response.success) {
        alert('Review submitted successfully!');
        navigate('/customer-dashboard');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(handleAPIError(error));
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!invoiceData) {
      alert('Invoice not available');
      return;
    }

    try {
      const blob = await jobDetailsAPI.downloadInvoice(jobId);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice_${jobId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert(handleAPIError(error));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg text-gray-600">Loading job details...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg text-red-600 mb-4">{error}</div>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!jobData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg text-gray-600">Job not found</div>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto min-h-screen">
        {/* Header */}
        <div className="flex items-center p-4 ">
          <button
            onClick={() => navigate(-1)}
            className="mr-3 p-1 hover:bg-gray-100 rounded-full"
          >
            <img src={ArrowLeftIcon} alt="Back" className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold text-gray-900 truncate">
            Job #{jobData.jobId} - {jobData.title}
          </h1>
        </div>

        {/* Completed Banner */}
        <div className="bg-[#E4FBED] border border-[#DBF9E7] px-4 py-2 mx-4 mt-2 rounded-xl">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-[#1EB154] rounded-full mr-3"></div>
            <span className="text-[#1EB154] font-medium">
              Completed on {jobData.completedAt}
            </span>
          </div>
        </div>

        {/* Cleaner Info Card */}
        <div className="bg-white mx-4 mt-4 p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            {/* Avatar */}
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-primary-500">Cleaner #{jobData.cleaner.id}</h3>
              </div>
              
              <div className="flex items-center mt-1 space-x-2">
                <div className="flex items-center space-x-1 bg-[#FFF2DE] px-2 py-1 rounded-full" >
                  <img src={RatingIcon} alt="Rating" className="w-4 h-4" />
                  <span className="text-sm font-medium text-primary-500 font-medium">{jobData.cleaner.rating}</span>
                </div>
                <div className="flex items-center space-x-1 bg-gradient-to-r from-white to-[#FFDBAE] px-2 py-1 rounded-full border border-[#FFDBAE]">
                <img src={GoldBadgeIcon} alt="Badge" className="w-5 h-5" />
                <span className="text-sm text-primary-500 font-medium ml-1">{jobData.cleaner.tier} Tier</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Job Details */}
        <div className="bg-white mx-4 mt-4 p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="space-y-1">
            <div>
              <span className="text-sm text-primary-200 font-medium">Job ID: {jobData.jobId}</span>
            </div>
            
            <h2 className="text-lg font-semibold text-primary-500">{jobData.title}</h2>
            
            <div className="flex items-center text-primary-200 font-medium">
              <img src={CalendarIcon} alt="Calendar" className="w-4 h-4 mr-2" />
              <span className="text-sm">{jobData.completedAt}</span>
            </div>
            
            <div className="flex items-center text-primary-200 font-medium">
              <img src={MapPinIcon} alt="Location" className="w-4 h-4 mr-2" />
              <span className="text-sm">{jobData.location}</span>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-white mx-4 mt-4 p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="mb-3">
          <h3 className="text-primary-500 font-semibold text-lg">Payment</h3>
          <p className="text-primary-200 font-medium text-sm">
            ${jobData.payment.paidOnline} paid online, pay ${jobData.payment.cashToPay} cash to cleaner after job
          </p>  
          </div>
          
          <div className="">
            <h4 className="font-semibold text-primary-500 mb-1">Payment Summary</h4>
            <div className="">
              <div className="flex ">
                <span className="text-primary-200 font-medium mr-2">Total Paid:</span>
                <span className="font-bold text-[#1F6FEB]">${jobData.payment.totalPaid}</span>
              </div>
              <div className="flex ">
                <span className="text-primary-200 font-medium mr-2">Payment Mode:</span>
                <span className="text-primary-500 font-medium">{jobData.payment.mode}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice */}
        {invoiceData && (
          <div className="bg-white mx-4 mt-4 p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-primary-200 font-medium mr-2">Invoice:</span>
                <img src={PdfIcon} alt="PDF" className="w-5 h-5 mr-2" />
                <span className="text-gray-700">Invoice_{jobData.jobId}.pdf</span>
              </div>
              <button 
                onClick={handleDownloadInvoice}
                className="cursor-pointer hover:opacity-75"
              >
                <img src={DownloadIcon} alt="Download" className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            {/* Stripe Invoice Status */}
            <div className="mt-2 text-xs text-gray-500">
              Status: <span className={`font-medium ${
                invoiceData.status === 'paid' ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {invoiceData.status?.toUpperCase()}
              </span>
            </div>
          </div>
        )}

        {/* Completion Proof */}
        <div className="bg-white mx-4 mt-4 p-4 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-semibold text-primary-500 mb-1">Completion Proof</h3>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Before Images */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-600 mb-2">Before Photos</div>
              {jobData.completionProof?.beforeImages?.length > 0 ? (
                jobData.completionProof.beforeImages.map((image, index) => (
                  <div key={index} className="relative">
                    <div className="aspect-square bg-gray-200 rounded-xl overflow-hidden">
                      <img 
                        src={image} 
                        alt={`Before ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute top-2 right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
                      Before
                    </div>
                  </div>
                ))
              ) : (
                <div className="aspect-square bg-gray-200 rounded-xl flex items-center justify-center">
                  <span className="text-gray-500 text-sm">No before photos</span>
                </div>
              )}
            </div>
            
            {/* After Images */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-600 mb-2">After Photos</div>
              {jobData.completionProof?.afterImages?.length > 0 ? (
                jobData.completionProof.afterImages.map((image, index) => (
                  <div key={index} className="relative">
                    <div className="aspect-square bg-gray-200 rounded-xl overflow-hidden">
                      <img 
                        src={image} 
                        alt={`After ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute top-2 right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
                      After
                    </div>
                  </div>
                ))
              ) : (
                <div className="aspect-square bg-gray-200 rounded-xl flex items-center justify-center">
                  <span className="text-gray-500 text-sm">No after photos</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Rate Your Cleaner */}
        <div className="bg-white mx-4 mt-4 p-4 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <h3 className="font-semibold text-primary-500 mb-1">Rate Your Cleaner</h3>
          
          {/* Star Rating */}
          <div className="flex space-x-1 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setSelectedRating(star)}
                className="focus:outline-none cursor-pointer" 
              >
                <img 
                  src={star <= selectedRating ? RatingIcon : Rating2Icon} 
                  alt={`Star ${star}`} 
                  className="w-8 h-8"
                />
              </button>
            ))}
          </div>
          
          {/* Feedback Question */}
          <p className="text-gray-700 mb-3">What did you like about your cleaner?</p>
          
          {/* Feedback Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {feedbackTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagSelect(tag)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                  selectedTags.includes(tag)
                    ? 'bg-[#EBF2FD] text-[#1F6FEB] border border-[#9CC0F6]'
                    : 'bg-[#F9FAFB] text-[#374151] border border-[#E5E7EB]'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          
          {/* Feedback Text Area */}
          <div className="text-primary-500 font-semibold text-sm mb-1"> Anything specific we should know? <span className="text-primary-200 font-medium text-sm">(Optional)</span></div>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Write your feedback here..."
            className="w-full p-3 border border-[#E5E7EB] rounded-xl! resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />
          
          {/* Submit Button */}
          <div className="flex justify-end mt-4">
          <Button
            onClick={handleSubmitReview}
            disabled={submittingReview || !selectedRating}
          >
            {submittingReview ? 'Submitting...' : 'Submit Review'}
          </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsCompletedPage;
