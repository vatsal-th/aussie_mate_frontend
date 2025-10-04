import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Button from '../components/Button';
import ArrowLeftIcon from '../assets/arrow-left.svg';
import CalendarIcon from '../assets/Calendar.svg';
import MapPinIcon from '../assets/map-pin 1.png';
import MessageIcon from '../assets/message2.svg';
import CallIcon from '../assets/call.svg';
import InfoIcon from '../assets/info.svg';
import JobLiveIcon from '../assets/joblive.gif';

const JobBookedSuccessfullyPage = () => {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState(null);
  const [cleaner, setCleaner] = useState(null);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        // For now, using mock data - replace with actual API call
        setJob({
          jobId: 'AM10432',
          title: 'Bond Cleaning - 2 Bed Apartment',
          scheduledDate: '23 Aug, 2:00 PM',
          location: '12 King Street, Sydney',
          baseQuote: 140,
          addOns: 30,
          total: 170,
          onlinePaid: 34,
          cashAmount: 136,
          status: 'booked'
        });

        setCleaner({
          name: 'John Doe',
          phone: '07 3803 6136',
          avatar: '', // Will use placeholder
          status: 'Booked'
        });

        setLoading(false);
      } catch (error) {
        console.error('Error fetching job details:', error);
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId]);

  const handleChatWithCleaner = () => {
    navigate(`/customer-chat/${jobId}`);
  };

  const handleCallCleaner = () => {
    window.open(`tel:${cleaner?.phone}`);
  };

  const handleViewBooking = () => {
    navigate('/my-jobs');
  };

  const handleReturnHome = () => {
    navigate('/customer-dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-sm mx-auto sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-sm mx-auto sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl px-4 py-6">
        {/* Confirmation Header */}
        <div className="text-center mb-8">
          {/* Confetti/Stars Animation */}
          <div className="mb-4">
            <img src={JobLiveIcon} alt="Success Animation" className="w-16 h-16 mx-auto" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-primary-500 mb-2">
            Your job is booked successfully with {cleaner?.name}
          </h1>
        </div>

        {/* Job Details Card */}
        <div className="bg-white rounded-2xl shadow-custom p-4 sm:p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm text-primary-200 font-medium">{job?.jobId}</span>
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-primary-500 mb-4">
            {job?.title}
          </h2>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img src={CalendarIcon} alt="Date" className="w-5 h-5 text-primary-200" />
              <span className="text-sm text-primary-500 font-medium">{job?.scheduledDate}</span>
            </div>

            <div className="flex items-center gap-3">
              <img src={MapPinIcon} alt="Location" className="w-5 h-5 text-primary-200" />
              <span className="text-sm text-primary-500 font-medium">{job?.location}</span>
            </div>
          </div>

          {/* Payment Information */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-[#1F6FEB] mb-2">Payment</h3>
            <p className="text-sm text-primary-500">
              ${job?.onlinePaid} paid online, pay ${job?.cashAmount} cash to cleaner after job
            </p>
          </div>
        </div>

        {/* Your Cleaner Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-primary-500 mb-4">Your cleaner</h3>

          {/* Cleaner Card */}
          <div className="bg-white rounded-2xl shadow-custom p-4 sm:p-6">
            <div className="flex items-center gap-4 mb-4">
              {/* Cleaner Avatar */}
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>

              {/* Cleaner Details */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-lg font-bold text-primary-500">{cleaner?.name}</h4>
                  <span className="bg-blue-100 text-[#1F6FEB] text-xs font-medium px-2 py-1 rounded-full">
                    {cleaner?.status}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <img src={CallIcon} alt="Phone" className="w-4 h-4 text-primary-200" />
                  <span className="text-sm text-primary-500 font-medium">{cleaner?.phone}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleChatWithCleaner}
                variant="secondary"
                size="md"
                icon={MessageIcon}
                className="flex"
              >
                Chat
              </Button>

              <Button
                onClick={handleCallCleaner}
                variant="secondary"
                size="md"
                icon={CallIcon}
                className="flex"
              >
                Call
              </Button>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <img src={InfoIcon} alt="Info" className="w-5 h-5 text-primary-200" />
              <p className="text-sm text-primary-200 font-medium">
                We'll notify you when your cleaner updates job status.
              </p>
            </div>
          </div>
        </div>

        {/* Notification */}


        {/* Main Action Buttons */}
        <div className="flex gap-4 flex-col sm:flex-row justify-end">
          <Button
            onClick={handleReturnHome}
            variant="secondary"
            className="flex"
          >
            Return Home
          </Button>
          <Button
            onClick={handleViewBooking}
            className="flex"
          >
            View Booking
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JobBookedSuccessfullyPage;
