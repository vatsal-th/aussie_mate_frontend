import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Button from '../components/Button';
import ArrowLeftIcon from '../assets/arrow-left.svg';
import StarIcon from '../assets/rating.svg';
import SilverBadgeIcon from '../assets/silverBadge.svg';
import UserIcon from '../assets/user.svg';

const ConfirmYourCleanerPage = () => {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const location = useLocation();
  
  // Get cleaner data from location state or use default for demo
  const cleanerData = location.state?.cleanerData || {
    id: '1047',
    name: 'Cleaner #1047',
    distance: '3.2 km from your location',
    rating: 4.8,
    tier: 'Silver Tier',
    baseQuote: 140,
    addOns: 30,
    addOnName: 'Carpet Cleaning',
    total: 170
  };

  const [selectedPayment, setSelectedPayment] = useState('cash');
  const [showCashBreakdown, setShowCashBreakdown] = useState(true);
  const [showOnlineBreakdown, setShowOnlineBreakdown] = useState(false);
  const [useWalletBalance, setUseWalletBalance] = useState(false);

  const walletBalance = 45;
  const onlinePaymentPercentage = 10;
  const onlineNowAmount = Math.round(cleanerData.total * (onlinePaymentPercentage / 100));
  const cashAmount = cleanerData.total - onlineNowAmount;

  const handleProceedToPay = () => {
    // Navigate to booking confirmation page
    navigate(`/booking-confirmation/${jobId}`, {
      state: {
        cleanerData,
        paymentMethod: selectedPayment,
        amount: selectedPayment === 'cash' ? onlineNowAmount : cleanerData.total,
        totalAmount: cleanerData.total,
        useWallet: useWalletBalance
      }
    });
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
                {cleanerData.name}
              </h2>
              <p className="text-sm text-primary-200 font-medium mb-3">
                {cleanerData.distance}
              </p>
              
              {/* Rating and Tier Badges */}
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-[#FFF2DE] px-2 py-1 rounded-full">
                  <img src={StarIcon} alt="Rating" className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium text-primary-500">
                    {cleanerData.rating}
                  </span>
                </div>
                
                <div className="flex items-center bg-[linear-gradient(94.49deg,#FDFDFD_0%,#E9E9E9_100%)] px-2 py-1 rounded-full border border-[#E5E7EB]">
                  <img src={SilverBadgeIcon} alt="Tier" className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium text-primary-500">
                    {cleanerData.tier}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quote Summary */}
        <div className="bg-white rounded-2xl shadow-custom p-4 sm:p-6 mb-6">
          <h3 className="text-lg font-semibold text-primary-500 mb-4">Quote Summary</h3>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <span className="text-sm text-primary-200 font-medium">Base Quote: <span className="text-sm font-semibold text-primary-500">${cleanerData.baseQuote}</span></span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-primary-200 font-medium">
                Add-ons: <span className="text-[#1F6FEB] font-semibold">+${cleanerData.addOns}</span> ({cleanerData.addOnName})
              </span>
            </div>
            
            <div className="border-t border-gray-200 pt-3">
              <div className="flex items-center">
                <span className="text-base font-semibold text-primary-500">Total: <span className="text-lg font-bold text-primary-500"> ${cleanerData.total}</span> </span>
                
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
                        <span className="font-semibold text-primary-500">${cleanerData.total}</span>
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

        {/* Proceed Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleProceedToPay}
            size="md"
            className="px-4 py-3 mb-6"
          >
            Proceed to Pay ${selectedPayment === 'cash' ? onlineNowAmount : cleanerData.total}
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

