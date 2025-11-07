import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { paymentService } from '../../services/paymentService';
import { Header, Button } from '../../components';

const PaymentSuccessCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        setLoading(true);
        
        // Get parameters from URL
        const sessionId = searchParams.get('session_id');
        const jobId = searchParams.get('job_id');

        if (!sessionId || !jobId) {
          setError('Missing payment information. Please contact support.');
          setLoading(false);
          return;
        }

        // Verify payment status
        const response = await paymentService.getPaymentStatus(jobId);
        
        if (response.success && response.data) {
          const paymentStatus = response.data.status;
          
          // Check if payment is successful
          if (paymentStatus === 'succeeded' || paymentStatus === 'completed' || paymentStatus === 'pending_capture') {
            setVerificationStatus('success');
            
            // Wait a moment to show success message, then redirect
            setTimeout(() => {
              navigate(`/booking-confirmation/${jobId}`, { replace: true });
            }, 2000);
          } else if (paymentStatus === 'processing' || paymentStatus === 'pending') {
            setVerificationStatus('processing');
            
            // Retry after 3 seconds
            setTimeout(() => {
              window.location.reload();
            }, 3000);
          } else {
            // Payment failed
            setVerificationStatus('failed');
            setError(`Payment ${paymentStatus}. Please try again or contact support.`);
          }
        } else {
          setError('Unable to verify payment status. Please try again.');
        }
      } catch (err) {
        console.error('Error verifying payment:', err);
        setError('Failed to verify payment. Please try again or contact support.');
        setVerificationStatus('error');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  const handleRetryPayment = () => {
    const jobId = searchParams.get('job_id');
    if (jobId) {
      navigate(`/job-details/${jobId}`);
    } else {
      navigate('/my-jobs');
    }
  };

  const handleContactSupport = () => {
    navigate('/help-support');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-2xl mx-auto px-4 py-8">
        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-500"></div>
              <h2 className="text-xl font-semibold text-gray-900">Verifying Payment...</h2>
              <p className="text-gray-600 text-center">
                Please wait while we confirm your payment with our secure payment processor.
              </p>
            </div>
          </div>
        ) : verificationStatus === 'success' ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex flex-col items-center space-y-6">
              {/* Success Icon */}
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-gray-900">Payment Successful! 🎉</h1>
                <p className="text-gray-600">
                  Your payment has been confirmed. Redirecting to booking details...
                </p>
              </div>
              
              {/* Loading indicator */}
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
                <span>Redirecting...</span>
              </div>
            </div>
          </div>
        ) : verificationStatus === 'processing' ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex flex-col items-center space-y-6">
              {/* Processing Icon */}
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-gray-900">Payment Processing...</h1>
                <p className="text-gray-600">
                  Your payment is being processed. This usually takes a few seconds.
                </p>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="animate-pulse">⏱️</div>
                <span>Checking status again...</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex flex-col items-center space-y-6">
              {/* Error Icon */}
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-gray-900">Payment Verification Failed</h1>
                <p className="text-red-600 font-medium">{error}</p>
                <p className="text-gray-600 text-sm">
                  Don't worry, if your payment went through, you can check your booking in "My Jobs"
                </p>
              </div>
              
              <div className="w-full space-y-3">
                <Button onClick={handleRetryPayment} variant="primary" fullWidth>
                  Try Again
                </Button>
                <Button onClick={() => navigate('/my-jobs')} variant="secondary" fullWidth>
                  Go to My Jobs
                </Button>
                <button 
                  onClick={handleContactSupport}
                  className="w-full px-4 py-3 text-gray-600 font-medium hover:text-gray-900 transition-colors text-sm"
                >
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccessCallbackPage;

