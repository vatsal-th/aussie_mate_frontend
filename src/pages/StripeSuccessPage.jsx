import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { paymentService } from '../services/paymentService';
import Button from '../components/Button';
import Header from '../components/Header';

const StripeSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyStripeAccount = async () => {
      try {
        setLoading(true);
        
        // Get Stripe account status
        const response = await paymentService.getStripeAccountStatus();
        
        if (response.success && response.data) {
          setStatus(response.data);
        } else {
          setError('Unable to verify Stripe account status');
        }
      } catch (err) {
        console.error('Error verifying Stripe account:', err);
        setError('Failed to verify Stripe account. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    verifyStripeAccount();
  }, []);

  const handleContinue = () => {
    // Dispatch event to notify PaymentsPayoutsPage to refresh
    window.dispatchEvent(new CustomEvent('stripeAccountUpdated'));
    navigate('/payments');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-2xl mx-auto px-4 py-8">
        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
              <p className="text-gray-600 font-medium">Verifying your Stripe account...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex flex-col items-center space-y-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-gray-900">Verification Failed</h1>
                <p className="text-gray-600">{error}</p>
              </div>
              
              <Button onClick={handleContinue} fullWidth>
                Go to Payments
              </Button>
            </div>
          </div>
        ) : status?.status === 'active' ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex flex-col items-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-gray-900">Stripe Account Connected!</h1>
                <p className="text-gray-600">
                  Your Stripe account has been successfully verified and connected.
                </p>
              </div>
              
              <div className="w-full bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Account Status:</span>
                  <span className="text-green-600 font-medium">✓ Active</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Charges:</span>
                  <span className={`font-medium ${status.chargesEnabled ? 'text-green-600' : 'text-orange-600'}`}>
                    {status.chargesEnabled ? '✓ Enabled' : '⚠ Pending'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Payouts:</span>
                  <span className={`font-medium ${status.payoutsEnabled ? 'text-green-600' : 'text-orange-600'}`}>
                    {status.payoutsEnabled ? '✓ Enabled' : '⚠ Pending'}
                  </span>
                </div>
              </div>
              
              <div className="w-full space-y-3">
                <Button onClick={handleContinue} fullWidth>
                  Continue to Payments
                </Button>
                <button 
                  onClick={() => navigate('/cleaner-dashboard')}
                  className="w-full px-4 py-3 text-gray-600 font-medium hover:text-gray-900 transition-colors"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex flex-col items-center space-y-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-gray-900">Account Setup In Progress</h1>
                <p className="text-gray-600">
                  Your Stripe account is being set up. This may take a few minutes.
                </p>
              </div>
              
              <div className="w-full bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Account Status:</span>
                  <span className="text-yellow-600 font-medium">⚠ {status?.status || 'Pending'}</span>
                </div>
              </div>
              
              <Button onClick={handleContinue} fullWidth>
                Go to Payments
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StripeSuccessPage;

