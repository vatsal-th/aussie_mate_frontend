import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Header from '../components/Header';
import CardBG from '../assets/CardBG.svg';
import CardBG2 from '../assets/CardBG2.png';
import CardBG3 from '../assets/CardBG3.png';
import CardBG4 from '../assets/CardBG4.png';
import CardBG5 from '../assets/CardBG5.png';
import RewardImage from '../assets/Reward.jpg';
import CoinImage from '../assets/coin.png';
import CalendarIcon from '../assets/Calendar.svg';
import PersonIcon from '../assets/user-check.svg';
import SearchIcon from '../assets/search.svg';
import PlusIcon from '../assets/plus.svg';
import CleaningImage from '../assets/Cleaning.png';
import HandymanImage from '../assets/Handyman.png';
import HousekeepingImage from '../assets/Housekeeping.png';
import PetSittingImage from '../assets/Pet Sitting.png';
import NDISSupportImage from '../assets/NDIS Support.png';
import RetailAuditorImage from '../assets/Retail Auditor.png';

const CustomerDashboard = () => {
  const [activeTab, setActiveTab] = useState('messages');
  const swiperRef = useRef(null);

  const goToPrev = () => {
    if (swiperRef.current) {
      swiperRef.current.swiper.slidePrev();
    }
  };

  const goToNext = () => {
    if (swiperRef.current) {
      swiperRef.current.swiper.slideNext();
    }
  };

  const serviceCategories = [
    {
      id: 'cleaning',
      name: 'Cleaning',
      image: CleaningImage,
      description: 'Professional cleaning services'
    },
    {
      id: 'housekeeping',
      name: 'Housekeeping',
      image: HousekeepingImage,
      description: 'Complete housekeeping solutions'
    },
    {
      id: 'ndis',
      name: 'NDIS Support',
      image: NDISSupportImage,
      description: 'NDIS support services'
    },
    {
      id: 'retail',
      name: 'Retail Auditor',
      image: RetailAuditorImage,
      description: 'Retail auditing services'
    },
    {
      id: 'petsitting',
      name: 'Pet Sitting',
      image: PetSittingImage,
      description: 'Pet care and sitting'
    },
    {
      id: 'handyman',
      name: 'Handyman',
      image: HandymanImage,
      description: 'Repair and maintenance'
    }
  ];

  const ongoingJobs = [
    {
      id: 'AM10432',
      title: 'Bond Cleaning - 2 Bed Apartment',
      status: 'Pending Quotes',
      date: '23 Aug, 2:00 PM',
      action: 'View Quotes',
      assignedTo: null
    },
    {
      id: 'AM10411',
      title: 'Pet Sitting - Dog Walking',
      status: 'In Progress',
      date: '23 Aug, 2:00 PM',
      action: 'Track Job',
      assignedTo: 'Emily K.'
    },
    {
      id: 'AM10399',
      title: 'Carpet Cleaning - Living Room & 2 B...',
      status: 'Completed',
      date: '18 Aug, 11:00 AM',
      action: 'Rate & Review',
      assignedTo: 'Robert P.'
    },
    {
      id: 'AM10433',
      title: 'Housekeeping - Full Service',
      status: 'In Progress',
      date: '24 Aug, 10:00 AM',
      action: 'Track Job',
      assignedTo: 'Sarah M.'
    },
    {
      id: 'AM10434',
      title: 'Handyman - Door Repair',
      status: 'Pending Quotes',
      date: '25 Aug, 3:00 PM',
      action: 'View Quotes',
      assignedTo: null
    },
    {
      id: 'AM10435',
      title: 'NDIS Support - Personal Care',
      status: 'Completed',
      date: '20 Aug, 9:00 AM',
      action: 'Rate & Review',
      assignedTo: 'Michael T.'
    },
    {
      id: 'AM10436',
      title: 'Retail Audit - Store Check',
      status: 'In Progress',
      date: '26 Aug, 1:00 PM',
      action: 'Track Job',
      assignedTo: 'Lisa R.'
    },
    {
      id: 'AM10437',
      title: 'Deep Cleaning - Kitchen & Bathroom',
      status: 'Pending Quotes',
      date: '27 Aug, 11:00 AM',
      action: 'View Quotes',
      assignedTo: null
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Component */}
      <Header />

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto">
        {/* Search Section */}
        <div className="bg-white px-6 sm:px-6 py-4 rounded-2xl mb-6 mt-4 shadow-custom">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center justify-center">
                <img src={SearchIcon} alt="Search" className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <input
                type="text"
                placeholder="Search services, e.g. bond clean..."
                className="w-full pl-9 sm:pl-10 pr-4 py-3 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 sm:py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors text-sm whitespace-nowrap">
              <img src={PlusIcon} alt="Plus" className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Post New Job</span>
              <span className="sm:hidden">Post Job</span>
            </button>
          </div>
        </div>

        {/* Book a cleaner section */}
        <div className="bg-white px-4 sm:px-6 py-4 rounded-2xl shadow-custom mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">Book a cleaner in minutes</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4">Post job → Receive quotes → Choose & pay securely</p>
          
          {/* Service Categories Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-6    ">
            {serviceCategories.map((service) => (
              <div
                key={service.id}
                className="relative bg-white border border-gray-200 rounded-3xl p-3 sm:p-6 text-center hover:shadow-custom-5 transition-shadow cursor-pointer overflow-hidden shadow-custom"
              >
                {/* Top-left background image */}
                <div className="absolute top-0 left-0 w-20 h-24 overflow-hidden rounded-tl-2xl">
                  <img src={CardBG3} alt="Card Background" className="w-full h-full object-cover" />
                </div>
                
                {/* Top-right background image */}
                <div className="absolute top-0 right-0 w-20 h-24 overflow-hidden rounded-tr-2xl">
                  <img src={CardBG2} alt="Card Background" className="w-full h-full object-cover" />
                </div>
                
                {/* Bottom-left background image */}
                <div className="absolute bottom-0 left-0 w-20 h-24 overflow-hidden rounded-bl-2xl">
                  <img src={CardBG4} alt="Card Background" className="w-full h-full object-cover" />
                </div>
                
                {/* Service Image */}
                <div className="relative z-10 mb-2 flex justify-center">
                  <img 
                    src={service.image} 
                    alt={service.name}
                    className="w-12 h-12 sm:w-20 sm:h-20 object-contain"
                  />
                </div>
                
                {/* Service Name */}
                <div className="relative z-10 text-xs sm:text-lg font-medium text-gray-900">{service.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* MatePoints Section */}
        <div className="my-6 rounded-2xl shadow-custom">
          <div className="relative rounded-xl p-4 sm:p-6 overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0">
              <img src={RewardImage} alt="Reward Background" className="w-full h-full object-cover" />
            </div>
            
            {/* Content Overlay */}
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-lg sm:text-xl font-semibold text-[#111827] mb-1">Earn MatePoints with Every Booking</h3>
                <p className="text-sm sm:text-base text-[#111827] mb-3">Collect points on each job completed and redeem them for discounts & perks.</p>
                <button className="bg-[#111827] text-white px-4 py-2 rounded-[8px] text-sm font-medium">
                  View Rewards
                </button>
              </div>
            </div>
            
            {/* Coin in right bottom corner */}
            <div className="absolute bottom-4 right-4 z-10">
              <img src={CoinImage} alt="Coin" className="w-16 h-16 sm:w-24 sm:h-24" />
            </div>
          </div>
        </div>

        {/* Ongoing Jobs Section */}
        <div className="bg-white px-4 sm:px-6 py-6 rounded-2xl shadow-custom">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Ongoing Jobs</h3>
            
            {/* Navigation Buttons */}
            <div className="flex space-x-2">
              <button 
                onClick={goToPrev}
                className="bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-all"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button 
                onClick={goToNext}
                className="bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-all"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          
          <Swiper
            ref={swiperRef}
            modules={[Autoplay]}
            spaceBetween={16}
            slidesPerView={1}
            breakpoints={{
              640: {
                slidesPerView: 2,
                spaceBetween: 16,
              },
                1024: {
                  slidesPerView: 3,
                  spaceBetween: 16,
                },
            }}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            speed={800}
            effect="slide"
            loop={true}
            className="!pb-4"
          >
            {ongoingJobs.map((job) => (
              <SwiperSlide key={job.id}>
                <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-custom h-48">
                  <div className="flex flex-col justify-between h-full">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-xs text-[#6B7280]">{job.id}</div>
                        {job.status && (
                          <span className={`inline-block font-semibold text-xs px-2 py-1 rounded-full ${
                            job.status === 'Pending Quotes' 
                              ? 'bg-[#E5F3FF] text-[#0088FF] border border-[#DDEFFF]'
                              : job.status === 'In Progress'
                              ? 'bg-[#FFEBCA] text-[#F59E0B] border border-[#FFEBCA]'
                              : job.status === 'Completed'
                              ? 'bg-[#E4FBED] text-[#10B981] border border-[#D2F8E0]'
                              : 'bg-[#E5F3FF] text-[#0088FF] border border-[#E5F3FF]'
                          }`}>
                            {job.status}
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-medium text-[#111827] mb-2">{job.title}</h4>
                      <div className="flex items-center text-xs text-[#6B7280] mb-1">
                        <img src={CalendarIcon} alt="Calendar" className="w-4 h-4 mr-1" />
                        {job.date}
                      </div>
                      {job.assignedTo && (
                        <div className="flex items-center text-xs text-[#6B7280]">
                          <img src={PersonIcon} alt="Person" className="w-4 h-4 mr-1" />
                          Assigned to: {job.assignedTo}
                        </div>
                      )}
                    </div>
                    <button className="text-[#1F6FEB] text-sm font-medium hover:text-[#0088FF] border border-[#1F6FEB] rounded-full px-4 py-2 mt-3 w-full">
                      {job.action}
                    </button>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
