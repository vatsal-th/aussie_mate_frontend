import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Loader2, X } from 'lucide-react';
import { paymentService } from '../../services/paymentService';
import { Button, Loader } from '../../components';

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
      <div className="max-w-2xl mx-auto px-4 py-8">
        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <Loader message="Verifying payment..." />
          </div>
        ) : verificationStatus === 'success' ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex flex-col items-center space-y-6">
              {/* Success Icon */}
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-10 h-10 text-green-600" strokeWidth={3} />
              </div>
              
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-gray-900">Payment Successful! 🎉</h1>
                <p className="text-gray-600">
                  Your payment has been confirmed. Redirecting to booking details...
                </p>
              </div>
              
              {/* Loading indicator */}
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 text-primary-500 animate-spin" strokeWidth={2} />
                <span>Redirecting...</span>
              </div>
            </div>
          </div>
        ) : verificationStatus === 'processing' ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex flex-col items-center space-y-6">
              {/* Processing Icon */}
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" strokeWidth={2} />
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
                <X className="w-10 h-10 text-red-600" strokeWidth={2} />
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

