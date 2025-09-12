import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import ArrowLeftIcon from '../assets/arrow-left.svg';
import JobLiveGif from '../assets/joblive.gif';
import CardBG6 from '../assets/CardBG6.png';
import CardBG7 from '../assets/CardBG7.png';

const JobSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get job ID from navigation state
  const jobId = location.state?.jobId;

  const handleViewMyJob = () => {
    if (jobId) {
      // Navigate to specific job details
      navigate(`/job-details/${jobId}`);
    } else {
      // Navigate to job list
      navigate('/customer-dashboard');
    }
  };

  const handleReturnHome = () => {
    // Navigate back to home
    navigate('/customer-dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-custom mt-5 relative overflow-hidden">
          {/* Background Image - Left Bottom */}
          <div className="absolute bottom-0 left-0 w-60 h-60">
            <img 
              src={CardBG6} 
              alt="Background" 
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Background Image - Top Right */}
          <div className="absolute top-0 right-0 w-60 h-60 ">
            <img 
              src={CardBG7} 
              alt="Background" 
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Main Content */}
          <div className="relative flex flex-col items-center justify-center text-center z-20">
            {/* Success Message - Text behind (z-0) */}
            <div className="absolute inset-0 flex flex-col justify-center text-center z-0">
              <div className="mb-12 w-full">
                <h1 className="text-3xl sm:text-4xl font-bold text-primary-500 mb-4 text-center">
                  Your job request is live!
                </h1>
                <p className="text-sm text-gray-600 text-center">
                  Nearby cleaners will start sending quotes shortly. You'll be notified.
                </p>
              </div>
            </div>

            {/* Success Animation - GIF above text (z-10) */}
            <div className="relative z-10 mb-12">
              <img 
                src={JobLiveGif} 
                alt="Job Live Animation" 
                className="w-80 h-80 mx-auto object-contain"
              />
            </div>

            {/* Action Buttons */}
            <div className="relative z-10 w-full space-y-4 mt-8">
              {/* View My Job Button */}
              <button
                onClick={handleViewMyJob}
                className="w-full bg-primary-500 text-white font-medium py-3 px-6 rounded-lg hover:bg-primary-600 transition-colors focus:outline-none cursor-pointer"
              >
                View My Job
              </button>

              {/* Return Home Link */}
              <button
                onClick={handleReturnHome}
                className="flex items-center justify-center space-x-2 text-primary-500 hover:text-gray-800 transition-colors mx-auto cursor-pointer"
              >
                <img src={ArrowLeftIcon} alt="Back" className="w-4 h-4" />
                <span className="text-primary-500 font-medium text-md ">Return Home</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobSuccessPage;