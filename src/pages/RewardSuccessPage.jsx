import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import ArrowLeftIcon from '../assets/arrow-left.svg';
import CopyIcon from '../assets/copy.svg';
import JobLiveGif from '../assets/joblive.gif';
import CardBG7 from '../assets/CardBG7.png';

const RewardSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [voucherCode, setVoucherCode] = useState('');
  const [reward, setReward] = useState(null);

  useEffect(() => {
    // Get reward data from navigation state or generate default
    if (location.state?.reward) {
      setReward(location.state.reward);
      const code = `AM-DIS${location.state.reward.pointsRequired === 500 ? '10' : '20'}-2025`;
      setVoucherCode(code);
    } else {
      // Default data if no state passed
      setReward({
        title: '$10 Discount Voucher',
        pointsRequired: 500
      });
      setVoucherCode('AM-DIS10-2025');
    }
  }, [location.state]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(voucherCode);
    // You could add a toast notification here
  };

  const handleUseReward = () => {
    console.log('Using reward:', reward);
    // Navigate to where the reward can be used
    navigate('/customer-dashboard');
  };

  const handleBackToRewards = () => {
    navigate('/rewards');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-custom mt-5 relative overflow-hidden">
          {/* Background Image - Top Right */}
          <div className="absolute top-0 right-0 w-32 h-32 sm:w-56 sm:h-56">
            <img 
              src={CardBG7} 
              alt="Background" 
              className="w-full h-full object-cover"
            />
          </div>
          {/* Success Animation - GIF */}
          <div className="flex justify-center mb-8">
            <img 
              src={JobLiveGif} 
              alt="Success Animation" 
              className="w-32 h-32 sm:w-40 sm:h-40 object-contain"
            />
          </div>

          {/* Success Message */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-semibold text-primary-500 mb-4">
              Reward Redeemed Successfully!
            </h1>
          </div>

          {/* Voucher Card */}
          <div 
            className="rounded-xl p-4 sm:p-6 mb-8 border border-[#D5DEFA]"
            style={{
              background: 'linear-gradient(120.74deg, #E9EEFC 0.11%, #FFFFFF 100.11%)'
            }}
          >
            <h2 className="text-lg sm:text-xl font-semibold text-primary-500 mb-4">
              {reward?.title || '$10 Discount Voucher'}
            </h2>
            
            {/* Voucher Code */}
            <div className="bg-white rounded-full px-4 py-3 mb-2 flex items-center justify-between border border-[#E5E7EB]">
              <span className="text-sm sm:text-base font-semibold text-primary-500">
                {voucherCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="bg-primary-500 hover:bg-primary-600 text-white p-2 rounded-full transition-colors cursor-pointer"
              >
                <img src={CopyIcon} alt="Copy" className="w-4 h-4" />
              </button>
            </div>

            {/* Valid Till */}
            <p className="text-sm text-primary-200 font-medium mb-4">
              Valid Till: 30 Sep, 2025
            </p>

            {/* Balance */}
            <p className="text-sm text-primary-500 font-semibold mb-2">
              Your MatePoints Balance: 45
            </p>

            {/* Use Reward Button */}
            <button
              onClick={handleUseReward}
              className="w-full bg-[#111827] hover:bg-gray-900 text-white font-medium py-3 px-4 rounded-lg! transition-colors cursor-pointer"
            >
              Use Reward Now
            </button>
          </div>

          {/* Back to Rewards */}
          <div className="text-center">
            <button
              onClick={handleBackToRewards}
              className="flex items-center justify-center space-x-2 text-primary-500 hover:text-primary-600 transition-colors mx-auto"
            >
              <img src={ArrowLeftIcon} alt="Back" className="w-6 h-6" />
              <span className="font-medium text-primary-500 text-lg cursor-pointer">Back to Rewards</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RewardSuccessPage;
