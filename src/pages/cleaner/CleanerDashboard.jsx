import React, { useMemo, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { Header, Button } from '../../components'
import UrgentIcon from '../../assets/urgent.svg'
import ScheduleIcon from '../../assets/schedule.svg'
import EquipmentIcon from '../../assets/equipment.svg'
import CleanerBG from '../../assets/cleanerBG.jpg'
import BoldJobIcon from '../../assets/boldJob.svg'
import Coin3 from '../../assets/coin3.svg'

const CleanerDashboard = () => {
  const navigate = useNavigate()
  const [isAvailable, setIsAvailable] = useState(true);
  const swiperRef = useRef(null);
  
  // Helper function to get status colors
  const getStatusColors = (status) => {
    switch (status?.toLowerCase()) {
      case 'booked':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-700',
          border: 'border-blue-200'
        };
      case 'in progress':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-700',
          border: 'border-yellow-200'
        };
      case 'scheduled':
        return {
          bg: 'bg-green-100',
          text: 'text-green-700',
          border: 'border-green-200'
        };
      case 'completed':
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-700',
          border: 'border-gray-200'
        };
      case 'pending':
        return {
          bg: 'bg-orange-100',
          text: 'text-orange-700',
          border: 'border-orange-200'
        };
      case 'cancelled':
        return {
          bg: 'bg-red-100',
          text: 'text-red-700',
          border: 'border-red-200'
        };
      default:
        return {
          bg: 'bg-primary-50',
          text: 'text-primary-500',
          border: 'border-primary-200'
        };
    }
  };

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

  const ToggleSwitch = ({ isOn, onToggle, disabled = false }) => (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
        isOn ? 'bg-primary-500' : 'bg-gray-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          isOn ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )

  const quickActions = useMemo(() => ([
    {
      id: 'schedule',
      title: 'Manage Schedule',
      icon: ScheduleIcon,
      onClick: () => navigate('/set-availability')
    },
    {
      id: 'urgent',
      title: 'Urgent Jobs',
      icon: UrgentIcon,
      onClick: () => navigate('/my-jobs')
    },
    {
      id: 'equipment',
      title: 'Equipment Status',
      icon: EquipmentIcon,
      onClick: () => navigate('/profile')
    },
    {
      id: 'myjobs',
      title: 'My Jobs',
      icon: BoldJobIcon,
      onClick: () => navigate('/cleaner-jobs')
    }
  ]), [navigate])

  const activeJobs = useMemo(() => ([
    {
      id: 'AM10432',
      title: 'House Cleaning – 3BHK',
      status: 'Booked',
      price: 200,
      note: 'pending release'
    },
    {
      id: 'AM10433',
      title: 'Office Cleaning – 2BHK',
      status: 'In Progress',
      price: 150,
      note: 'completed'
    },
    {
      id: 'AM10434',
      title: 'Deep Cleaning – 4BHK',
      status: 'Scheduled',
      price: 300,
      note: 'pending'
    },
    {
      id: 'AM10434',
      title: 'Deep Cleaning – 4BHK',
      status: 'Scheduled',
      price: 300,
      note: 'pending'
    },
  ]), [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
        {/* Top Greeting + Availability */}
        <div className="flex flex-row sm:items-center justify-between pt-3 sm:pt-4 gap-3 sm:gap-0">
          <div>
            <h2 className="text-lg sm:text-[22px] md:text-2xl lg:text-3xl font-bold text-primary-500 leading-tight">Hi, John</h2>
            <p className="text-xs sm:text-sm text-primary-200 font-medium">Welcome back</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs sm:text-sm md:text-xl text-primary-200 font-medium">Available?</span>
            <ToggleSwitch
              isOn={isAvailable}
              onToggle={() => setIsAvailable(!isAvailable)}
            />
          </div>
        </div>

        {/* Earnings Card */}
        <div className="mt-3 sm:mt-4 shadow-custom rounded-2xl">
          <div className="relative rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0">
              <img src={CleanerBG} alt="Cleaner Background" className="w-full h-full object-cover" />
            </div>
            
            {/* Content Overlay */}
            <div className="relative z-10 p-2 sm:p-3">
              <p className="text-xs sm:text-sm md:text-lg lg:text-xl text-[#374151]">Earnings This Week</p>
              <div className="flex items-end justify-between mt-1">
                <div>
                  <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary-500 mb-1 sm:mb-2">$540</div>
                  <div className="text-xs sm:text-sm md:text-base text-primary-200 font-medium">3 jobs completed</div>
                  <button onClick={() => navigate('/earnings')} className="text-primary-500 text-xs sm:text-sm md:text-base font-semibold mt-1 sm:mt-2 cursor-pointer">
                    View Earnings
                    <span className="inline-block ml-1">→</span>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Coin3 image positioned at bottom right */}
            <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 z-10">
              <img src={Coin3} alt="coins" className="w-12 h-10 sm:w-14 sm:h-14 md:w-20 md:h-20 lg:w-36 lg:h-36" />
            </div>
          </div>
        </div>

        {/* Live jobs near you */}
      <div className="mt-3 sm:mt-4 bg-white rounded-2xl border-[#F3F3F3] p-3 sm:p-4 shadow-custom">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-primary-50 flex items-center justify-center">
                <img src={BoldJobIcon} alt="jobs" className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-10" />
              </div>
              <span className="ml-2 text-xs sm:text-sm md:text-xl text-primary-500 font-semibold">Live Jobs near you</span>
            </div>
             <button 
               onClick={() => navigate('/cleaner-jobs')}
               className="text-xs sm:text-sm md:text-lg text-[#1F6FEB] font-medium flex items-center cursor-pointer"
             >
               <span className="w-2 h-2 rounded-full bg-primary-500 mr-2"></span> 3 Jobs Found</button>
          </div>
        </div>

        {/* Quick actions */}
        <div className="mt-3 sm:mt-4 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4" >
          {quickActions.map(action => (
            <button key={action.id} onClick={action.onClick} className="bg-white rounded-2xl! border-[F3F3F3] p-3 sm:p-4 md:p-5 text-left shadow-custom cursor-pointer">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-full bg-primary-50 flex items-center justify-center mb-1 sm:mb-2">
                <img src={action.icon} alt="icon" className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12" />
              </div>
              <div className="text-xs sm:text-sm md:text-base font-medium text-primary-500">{action.title}</div>
            </button>
          ))}
        </div>

        {/* Active Jobs */}
        <div className="mt-3 sm:mt-4 md:mt-5 bg-white rounded-2xl border-[F3F3F3] p-2 sm:p-3 md:p-4 lg:p-5 shadow-custom">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 sm:mb-3 md:mb-4 gap-2 sm:gap-3 md:gap-0">
            <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-primary-500">Your Active Jobs</h3>
            
            {/* Navigation Buttons */}
            <div className="flex items-center justify-between sm:justify-end space-x-2">
              <Button 
                onClick={() => navigate('/cleaner-jobs')}
                size="sm"
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium text-xs sm:text-sm hover:text-white border border-[#1F6FEB] rounded-full px-2 sm:px-3 md:px-5 py-1 sm:py-1.5 md:py-2 flex items-center justify-center space-x-1 sm:space-x-2"
                icon={
                  <svg width="12" height="12" className="sm:w-3 sm:h-3 md:w-4 md:h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.2974 5.32548H16.8208V3.15311C16.8208 2.17207 16.0145 1.37402 15.0234 1.37402H8.97664C7.98556 1.37402 7.17927 2.17216 7.17927 3.15311V5.32548H3.70256C1.66097 5.32548 0 6.98645 0 9.02804V19.6015C0 21.2691 1.3567 22.6258 3.02437 22.6258H20.9756C22.6433 22.6258 24 21.2691 24 19.6015V9.02804C24 6.98645 22.339 5.32548 20.2974 5.32548ZM8.58978 3.15311C8.58978 2.94297 8.75609 2.78454 8.97664 2.78454H15.0234C15.2439 2.78454 15.4102 2.94297 15.4102 3.15311V5.32548H8.58978V3.15311ZM22.5894 19.6015C22.5894 20.4913 21.8655 21.2153 20.9756 21.2153H3.02437C2.13445 21.2153 1.41051 20.4913 1.41051 19.6015V13.0138C1.63556 13.1551 1.87812 13.2663 2.13201 13.3448C2.14551 13.3489 2.15911 13.3527 2.17279 13.356L9.35787 15.112V15.6921C9.35787 16.6027 10.0988 17.3436 11.0095 17.3436H12.9905C13.9012 17.3436 14.6421 16.6027 14.6421 15.6921V15.112L21.8272 13.356C21.8409 13.3527 21.8545 13.349 21.8679 13.3448C22.1218 13.2663 22.3644 13.1551 22.5894 13.0138V19.6015H22.5894ZM10.7684 15.6921V13.7021C10.7685 13.6382 10.7939 13.5769 10.8391 13.5317C10.8843 13.4865 10.9456 13.4611 11.0095 13.461H12.9905C13.0545 13.4611 13.1157 13.4865 13.1609 13.5317C13.2061 13.5769 13.2316 13.6382 13.2316 13.7021V15.6921C13.2315 15.756 13.2061 15.8173 13.1609 15.8624C13.1157 15.9076 13.0545 15.9331 12.9905 15.9331H11.0095C10.9456 15.933 10.8843 15.9076 10.8391 15.8624C10.7939 15.8172 10.7685 15.756 10.7684 15.6921ZM22.5895 10.4493C22.5895 11.1584 22.1405 11.7756 21.47 11.9913L14.6411 13.6602C14.6187 12.7688 13.8872 12.0504 12.9905 12.0504H11.0095C10.1129 12.0504 9.38136 12.7688 9.35895 13.6602L2.53003 11.9913C1.85957 11.7756 1.41051 11.1584 1.41051 10.4493V9.02804C1.41051 7.7642 2.43871 6.736 3.70256 6.736H20.2974C21.5612 6.736 22.5894 7.7642 22.5894 9.02804V10.4493H22.5895Z" fill="white"/>
                  </svg>
                }
              >
                <span className="hidden sm:inline">View Jobs</span>
                <span className="sm:hidden">Jobs</span>
              </Button>
              
              <div className="flex space-x-1 sm:space-x-2">
                <Button 
                  onClick={goToPrev}
                  variant="ghost"
                  size="xs"
                  className="rounded-full p-1 sm:p-1.5 md:p-2"
                  icon={
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  }
                />
                
                <Button 
                  onClick={goToNext}
                  variant="ghost"
                  size="xs"
                  className="rounded-full p-1 sm:p-1.5 md:p-2"
                  icon={
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  }
                />
              </div>
            </div>
          </div>

          {activeJobs.length > 0 && (
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
              loop={activeJobs.length > 1}
              className="!pb-4 mt-3"
            >
          {activeJobs.map((job, index) => (
            <SwiperSlide key={`job-${index}`}>
                  <div className="bg-white rounded-2xl border border-[#F3F3F3] p-2 sm:p-3 md:p-4 lg:p-5 shadow-custom h-36 sm:h-40 md:h-44 lg:h-48">
                    <div className="flex flex-col justify-between h-full">
                      <div>
                        <div className="flex items-center justify-between text-xs sm:text-sm text-primary-200 font-medium mb-1 sm:mb-2">
                          <span className="truncate">{job.id}</span>
                          <span className={`px-1.5 sm:px-2 py-0.5 rounded-full font-semibold text-xs ${getStatusColors(job.status).bg} ${getStatusColors(job.status).text}`}>{job.status}</span>
                        </div>
                        <div className="text-primary-500 font-semibold text-xs sm:text-sm md:text-base mb-1 sm:mb-2 line-clamp-2">{job.title}</div>
                        <div className="text-primary-500 font-bold text-xs sm:text-sm md:text-base">${job.price}<span className="text-primary-200 font-medium text-xs sm:text-sm"> ( {job.note} )</span></div>
                      </div>
                        <Button 
                          variant="secondary"
                          size="sm"
                          fullWidth
                          className="py-1 sm:py-1.5 md:py-2 rounded-xl border text-[#1F6FEB] font-medium hover:bg-primary-50 shadow-custom text-xs sm:text-sm"
                          onClick={() => navigate('/cleaner-jobs')}
                        >
                          Open Job
                        </Button>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
      </div>
    </div>
  )
}

export default CleanerDashboard


