import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Header from '../../components/Header';
import Button from '../../components/Button';
import { paymentService, handlePaymentError } from '../../services/paymentService';
import ArrowLeftIcon from '../../assets/arrow-left.svg';
import StarIcon from '../../assets/rating.svg';
import SilverBadgeIcon from '../../assets/silverBadge.svg';
import GoldBadgeIcon from '../../assets/goldBadge.svg';
import BronzeBadgeIcon from '../../assets/bronzeBadge.svg';
import UserIcon from '../../assets/user.svg';

const ConfirmYourCleanerPage = () => {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const location = useLocation();
  
  // Get data from location state
  const cleanerData = location.state?.cleanerData;
  const quoteData = location.state?.quoteData;
  const jobData = location.state?.jobData;
  
  
  // Extract dynamic data from quote if available, otherwise use cleanerData
  const finalCleanerData = quoteData ? {
    id: quoteData.cleanerId?._id || quoteData.cleanerId?.id || quoteData.cleanerId || 'Unknown',
    name: quoteData.cleanerId ? 
      `${quoteData.cleanerId.firstName || ''} ${quoteData.cleanerId.lastName || ''}`.trim() || 
      `Cleaner #${(quoteData.cleanerId._id || quoteData.cleanerId.id || quoteData.cleanerId).slice(-4)}` : 
      'Cleaner',
    distance: 'Distance not available', // This should be calculated based on locations
    rating: quoteData.cleanerId?.averageRating !== undefined ? quoteData.cleanerId.averageRating : (quoteData.cleanerId?.rating || 0),
    tier: quoteData.cleanerId?.tier || 'none',
    baseQuote: quoteData.basePrice || quoteData.price || 0,
    addOns: quoteData.addOns || 0,
    addOnName: quoteData.addOnName || 'Additional Services',
    total: quoteData.totalPrice || quoteData.price || 0
  } : (cleanerData || null);

  // Redirect if no data is available
  useEffect(() => {
    if (!finalCleanerData) {
      navigate('/my-jobs');
    }
  }, [finalCleanerData, navigate]);

  // Don't render if no data is available
  if (!finalCleanerData) {
    return null;
  }

  const [selectedPayment, setSelectedPayment] = useState('online');
  const [showCashBreakdown, setShowCashBreakdown] = useState(false);
  const [showOnlineBreakdown, setShowOnlineBreakdown] = useState(false);
  const [useWalletBalance, setUseWalletBalance] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Calculate amounts based on final data
  const walletBalance = 45; // This should come from user API
  const onlinePaymentPercentage = 10;
  const onlineNowAmount = Math.round(finalCleanerData.total * (onlinePaymentPercentage / 100));
  const cashAmount = finalCleanerData.total - onlineNowAmount;

  const handleProceedToPay = async () => {
    if (selectedPayment === 'cash') {
      // For cash payment, create payment with cash method
      try {
        setProcessing(true);
        setError(null);

        const response = await paymentService.createPayment(jobId, 'cash');

        if (response.success) {
          // Verify payment was created successfully before redirecting
          try {
            const paymentStatus = await paymentService.getPaymentStatus(jobId);
            
            if (paymentStatus.success && paymentStatus.data) {
              // Payment verified, navigate to booking confirmation
              navigate(`/booking-confirmation/${jobId}`, { replace: true });
            } else {
              setError('Payment created but verification failed. Please check "My Jobs" to confirm.');
              setTimeout(() => {
                navigate('/my-jobs');
              }, 3000);
            }
          } catch (verifyErr) {
            console.error('Payment verification error:', verifyErr);
            // Even if verification fails, payment might have succeeded
            // Navigate to My Jobs as fallback
            setError('Payment created but verification failed. Redirecting to My Jobs...');
            setTimeout(() => {
              navigate('/my-jobs');
            }, 3000);
          }
        }
      } catch (err) {
        console.error('Cash payment error:', err);
        setError(handlePaymentError(err));
      } finally {
        setProcessing(false);
      }
    } else {
      // For online payment, redirect to Stripe Checkout
      try {
        setProcessing(true);
        setError(null);

        // Create payment with Stripe Checkout (useCheckout = true)
        const response = await paymentService.createPayment(jobId, 'online', true);

        if (response.success && response.data.url) {
          // Redirect to Stripe Checkout page
          window.location.href = response.data.url;
        } else {
          setError('Failed to initialize payment. Please try again.');
          setProcessing(false);
        }
      } catch (err) {
        console.error('Payment initialization error:', err);
        setError(handlePaymentError(err));
        setProcessing(false);
      }
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Header */}
      <div className="max-w-sm mx-auto sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl px-4 py-4">
        <div className="flex items-center gap-3 mb-6">
          <Button
            onClick={() => navigate(-1)}
            variant=""
            size="sm"
            icon={ArrowLeftIcon}
            className="p-2"
          />
          <h1 className="text-xl font-semibold text-primary-500">Confirm Your Cleaner</h1>
        </div>

        {/* Cleaner Information Card */}
        <div className="bg-white rounded-2xl shadow-custom p-4 sm:p-6 mb-6">
          <div className="flex items-center gap-4">
            {/* Cleaner Avatar */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
              <img src={UserIcon} alt="User" className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
            </div>

            {/* Cleaner Details */}
            <div className="flex-1">
              <h2 className="text-lg sm:text-xl font-semibold text-primary-500 mb-1">
                {finalCleanerData.name}
              </h2>
              <p className="text-sm text-primary-200 font-medium mb-3">
                {finalCleanerData.distance}
              </p>
              
              {/* Rating and Tier Badges */}
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-[#FFF2DE] px-2 py-1 rounded-full">
                  <img src={StarIcon} alt="Rating" className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium text-primary-500">
                    {finalCleanerData.rating}
                  </span>
                </div>
                
                {finalCleanerData.tier && finalCleanerData.tier !== 'none' && (
                  <div className={`flex items-center px-2 py-1 rounded-full border ${
                    finalCleanerData.tier === 'gold'
                      ? 'bg-[linear-gradient(94.49deg,#FFDBAE_0%,#FFE7C4_100%)] border-[#FFDBAE]'
                      : finalCleanerData.tier === 'silver'
                      ? 'bg-[linear-gradient(94.49deg,#FDFDFD_0%,#E9E9E9_100%)] border-[#E5E7EB]'
                      : finalCleanerData.tier === 'bronze'
                      ? 'bg-[linear-gradient(94.49deg,#D4A574_0%,#E6C7A3_100%)] border-[#CD7F32]'
                      : 'bg-gray-100 border-gray-300'
                  }`}>
                    <img 
                      src={
                        finalCleanerData.tier === 'gold' 
                          ? GoldBadgeIcon 
                          : finalCleanerData.tier === 'silver'
                          ? SilverBadgeIcon
                          : BronzeBadgeIcon
                      } 
                      alt="Tier" 
                      className="w-4 h-4 mr-1" 
                    />
                    <span className="text-sm font-medium text-primary-500 capitalize">
                      {finalCleanerData.tier}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quote Summary */}
        <div className="bg-white rounded-2xl shadow-custom p-4 sm:p-6 mb-6">
          <h3 className="text-lg font-semibold text-primary-500 mb-4">Quote Summary</h3>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <span className="text-sm text-primary-200 font-medium">Base Quote: <span className="text-sm font-semibold text-primary-500">${finalCleanerData.baseQuote}</span></span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-primary-200 font-medium">
                Add-ons: <span className="text-[#1F6FEB] font-semibold">+${finalCleanerData.addOns}</span> ({finalCleanerData.addOnName})
              </span>
            </div>
            
            <div className="border-t border-gray-200 pt-3">
              <div className="flex items-center">
                <span className="text-base font-semibold text-primary-500">Total: <span className="text-lg font-bold text-primary-500"> ${finalCleanerData.total}</span> </span>
                
              </div>
            </div>
          </div>
        </div>

        {/* Payment Options */}
        <div className="bg-white rounded-2xl shadow-custom p-4 sm:p-6 mb-6">
          <h3 className="text-lg font-semibold text-primary-500 mb-4">Choose Your Payment Option</h3>
          
          <div className="space-y-4">
            {/* Cash Payment Option */}
            <div className={`border rounded-xl p-4 transition-all cursor-pointer ${
              selectedPayment === 'cash' 
                ? 'border-[#1F6FEB] bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedPayment('cash')}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedPayment === 'cash' 
                    ? 'border-[#1F6FEB] bg-[#1F6FEB]' 
                    : 'border-gray-300'
                }`}>
                  {selectedPayment === 'cash' && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
                
                <div className="flex-1">
                  <h4 className="text-base font-semibold text-primary-500">Cash Payment</h4>
                  <p className="text-sm text-primary-200 font-medium mt-1">
                    Pay 10% online now and give the rest directly to your cleaner in cash.
                  </p>
                  
                  {/* Breakdown Toggle */}
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCashBreakdown(!showCashBreakdown);
                    }}
                    variant="link"
                    size="sm"
                    className="flex items-center gap-1 mt-2 text-sm text-[#1F6FEB] font-medium"
                  >
                    View Breakdown
                    <svg 
                      className={`w-4 h-4 transition-transform ${
                        showCashBreakdown ? 'rotate-180' : ''
                      }`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </Button>
                  
                  {/* Breakdown Details */}
                  {showCashBreakdown && (
                    <div className="mt-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-primary-200 font-medium">Online Now:</span>
                        <span className="font-semibold text-primary-500">${onlineNowAmount} (10%)</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-primary-200 font-medium">Pay Later in Cash:</span>
                        <span className="font-semibold text-primary-500">${cashAmount}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Online Payment Option */}
            <div className={`border rounded-xl p-4 transition-all cursor-pointer ${
              selectedPayment === 'online' 
                ? 'border-[#1F6FEB] bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedPayment('online')}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedPayment === 'online' 
                    ? 'border-[#1F6FEB] bg-[#1F6FEB]' 
                    : 'border-gray-300'
                }`}>
                  {selectedPayment === 'online' && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
                
                <div className="flex-1">
                  <h4 className="text-base font-semibold text-primary-500">
                    Online Payment <span className="text-primary-200 font-medium">(Recommended)</span>
                  </h4>
                  <p className="text-sm text-primary-200 font-medium mt-1">
                    Pay the full amount online securely with your card.
                  </p>
                  
                  {/* Breakdown Toggle */}
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowOnlineBreakdown(!showOnlineBreakdown);
                    }}
                    variant="link"
                    size="sm"
                    className="flex items-center gap-1 mt-2 text-sm text-[#1F6FEB] font-medium"
                  >
                    View Breakdown
                    <svg 
                      className={`w-4 h-4 transition-transform ${
                        showOnlineBreakdown ? 'rotate-180' : ''
                      }`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </Button>
                  
                  {/* Breakdown Details */}
                  {showOnlineBreakdown && (
                    <div className="mt-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-primary-200 font-medium">Full Amount:</span>
                        <span className="font-semibold text-primary-500">${finalCleanerData.total}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Aussie Mate Wallet */}
        <div className="bg-white rounded-2xl shadow-custom p-4 sm:p-6 mb-6">
          <h3 className="text-lg font-semibold text-primary-500 mb-4">Aussie Mate Wallet</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-primary-200 font-medium">Available Balance:</span>
              <span className="text-sm font-semibold text-[#1F6FEB]">${walletBalance}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="useWallet"
                checked={useWalletBalance}
                onChange={(e) => setUseWalletBalance(e.target.checked)}
                className="w-4 h-4 text-[#1F6FEB] border-gray-300 rounded focus:ring-[#1F6FEB]"
              />
              <label htmlFor="useWallet" className="text-sm text-primary-500 font-medium cursor-pointer">
                Use Wallet Balance
              </label>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <svg 
              className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path 
                fillRule="evenodd" 
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                clipRule="evenodd" 
              />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-red-800">Error</h4>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Proceed Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleProceedToPay}
            size="md"
            className="px-4 py-3 mb-6"
            loading={processing}
            disabled={processing}
          >
            {selectedPayment === 'cash' 
              ? `Proceed to Pay $${onlineNowAmount}` 
              : `Proceed to Pay $${finalCleanerData.total}`}
          </Button>
        </div>

        {/* Footer Disclaimer */}
        <div className="text-center">
          <p className="text-xs text-primary-200">
            All payments are secured. Your cleaner's contact details will unlock once booking is confirmed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConfirmYourCleanerPage;

