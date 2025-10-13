import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Header from '../../components/Header';
import Button from '../../components/Button';
import JobCompleteModal from '../../components/JobCompleteModal';
import { jobsAPI } from '../../services/api';
import CardBG2 from '../../assets/CardBG2.png';
import CardBG3 from '../../assets/CardBG3.png';
import CardBG4 from '../../assets/CardBG4.png';
import RewardImage from '../../assets/Reward.jpg';
import CoinImage from '../../assets/coin.png';
import CalendarIcon from '../../assets/Calendar.svg';
import PersonIcon from '../../assets/user-check.svg';
import SearchIcon from '../../assets/search.svg';
import PlusIcon from '../../assets/plus.svg';
import CleaningImage from '../../assets/Cleaning.png';
import HandymanImage from '../../assets/Handyman.png';
import HousekeepingImage from '../../assets/Housekeeping.png';
import PetSittingImage from '../../assets/Pet Sitting.png';
import NDISSupportImage from '../../assets/NDIS Support.png';
import RetailAuditorImage from '../../assets/Retail Auditor.png';

const CustomerDashboard = () => {
  const [activeTab, setActiveTab] = useState('messages');
  const [ongoingJobs, setOngoingJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showJobCompleteModal, setShowJobCompleteModal] = useState(false);
  const [completedJobInfo, setCompletedJobInfo] = useState(null);
  const swiperRef = useRef(null);
  const navigate = useNavigate();

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

  // Helper functions
  const formatDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const opts = { day: '2-digit', month: 'short' };
    const date = d.toLocaleDateString('en-AU', opts);
    const time = d.toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' });
    return `${date}, ${time}`;
  };

  const getStatusChip = (statusRaw) => {
    const s = (statusRaw || '').toString().toLowerCase();
    if (s === 'in_progress') {
      return { label: 'In Progress', className: 'bg-[#FFEBCA] text-[#F59E0B] border border-[#FFEBCA]' };
    }
    if (s === 'completed') {
      return { label: 'Completed', className: 'bg-[#DBF9E7] text-[#1EB154] border border-[#DBF9E7]' };
    }
    if (['posted', 'pending', 'pending_quotes', 'quoted'].includes(s)) {
      return { label: 'Pending Quotes', className: 'bg-[#DDEFFF] text-[#0088FF] border border-[#DDEFFF]' };
    }
    return { label: 'Pending Quotes', className: 'bg-[#DDEFFF] text-[#0088FF] border border-[#DDEFFF]' };
  };

  const getActionText = (status) => {
    const s = (status || '').toString().toLowerCase();
    if (s === 'in_progress') return 'Track Job';
    if (s === 'completed') return 'Rate & Review';
    return 'View Quotes';
  };
  const handleViewJobs = () => {
    navigate('/my-jobs');
  };
  const handleViewRewards = () => {
    navigate('/rewards');
  };

  const handleCloseJobCompleteModal = () => {
    setShowJobCompleteModal(false);
    setCompletedJobInfo(null);
  };

  // Test function to show modal
  const handleTestModal = () => {
    setCompletedJobInfo({
      jobId: 'test-123',
      cleanerName: 'John',
      jobTitle: 'House Cleaning Service',
      completedAt: new Date().toISOString()
    });
    setShowJobCompleteModal(true);
  };

  // Check for completed jobs and show modal
  useEffect(() => {
    const checkCompletedJobs = () => {
      // Check if there are any jobs that were just completed
      // This would typically come from a real-time notification or API call
      const completedJob = localStorage.getItem('recentlyCompletedJob');
      if (completedJob) {
        try {
          const jobData = JSON.parse(completedJob);
          setCompletedJobInfo(jobData);
          setShowJobCompleteModal(true);
          // Remove from localStorage after showing
          localStorage.removeItem('recentlyCompletedJob');
        } catch (error) {
          console.error('Error parsing completed job data:', error);
        }
      }
    };

    checkCompletedJobs();
  }, []);

  // Fetch jobs data
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const res = await jobsAPI.getAllJobs({ page: 1, limit: 10 });
        const list = res?.data?.jobs || res?.data || res || [];

        // Normalize into UI shape
        const normalized = list.map((j) => {
          const status = (j.status || '').toString();
          const assignedTo = j.assignedCleaner?.name || j.assignedCleaner?.fullName || j.cleaner?.name || j.assignedTo || null;
          const dateLabel = formatDate(j.createdAt);
          const title = j.title || `${(j.serviceType || '').toString().replace(/\b\w/g, c => c.toUpperCase())}`.trim();
          const statusChip = getStatusChip(status);
          
          return {
            id: j.jobId || j._id || j.reference || j.id,
            title,
            status: statusChip.label,
            date: dateLabel,
            action: getActionText(status),
            assignedTo
          };
        });
        
        setOngoingJobs(normalized);
      } catch (e) {
        setError('Failed to load jobs');
        console.error('Error fetching jobs:', e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobs();
  }, []);

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


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Component */}
      <Header />

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Section */}
        <div className="bg-white px-4 sm:px-6 py-4 rounded-2xl mb-4 sm:mb-6 mt-4 shadow-custom">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center justify-center">
                <img src={SearchIcon} alt="Search" className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <input
                type="text"
                placeholder="Search services, e.g. bond clean..."
                className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 bg-gray-100 rounded-lg text-sm text-primary-200 font-medium focus:outline-none"
              />
            </div>
            <Button 
              onClick={() => navigate('/post-new-job')} 
              size="sm"
              icon={PlusIcon}
            >
              <span className="hidden sm:inline">Post New Job</span>
              <span className="sm:hidden">Post Job</span>
            </Button>
          </div>
        </div>

        {/* Book a cleaner section */}
        <div className="bg-white px-4 sm:px-6 py-4 rounded-2xl shadow-custom mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg md:text-xl font-semibold text-primary-500 mb-1">Book a cleaner in minutes</h2>
          <p className="text-xs sm:text-sm md:text-base text-primary-200 font-medium mb-3 sm:mb-4">Post job → Receive quotes → Choose & pay securely</p>
          
          {/* Service Categories Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
            {serviceCategories.map((service) => (
              <div
                key={service.id}
                className="relative bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-2 sm:p-3 md:p-6 text-center hover:shadow-custom-5 transition-shadow cursor-pointer overflow-hidden shadow-custom"
              >
                {/* Top-left background image */}
                <div className="absolute top-0 left-0 w-12 h-16 sm:w-20 sm:h-24 overflow-hidden rounded-tl-xl sm:rounded-tl-2xl">
                  <img src={CardBG3} alt="Card Background" className="w-full h-full object-cover" />
                </div>
                
                {/* Top-right background image */}
                <div className="absolute top-0 right-0 w-12 h-16 sm:w-20 sm:h-24 overflow-hidden rounded-tr-xl sm:rounded-tr-2xl">
                  <img src={CardBG2} alt="Card Background" className="w-full h-full object-cover" />
                </div>
                
                {/* Bottom-left background image */}
                <div className="absolute bottom-0 left-0 w-12 h-16 sm:w-20 sm:h-24 overflow-hidden rounded-bl-xl sm:rounded-bl-2xl">
                  <img src={CardBG4} alt="Card Background" className="w-full h-full object-cover" />
                </div>
                
                {/* Service Image */}
                <div className="relative z-10 mb-1 sm:mb-2 flex justify-center">
                  <img 
                    src={service.image} 
                    alt={service.name}
                    className="w-8 h-8 sm:w-12 sm:h-12 md:w-20 md:h-20 object-contain"
                  />
                </div>
                
                {/* Service Name */}
                <div className="relative z-10 text-xs sm:text-sm md:text-lg font-medium text-gray-900">{service.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* MatePoints Section */}
        <div className="my-4 sm:my-6 rounded-2xl shadow-custom">
          <div className="relative rounded-xl p-3 sm:p-4 md:p-6 overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0">
              <img src={RewardImage} alt="Reward Background" className="w-full h-full object-cover" />
            </div>
            
            {/* Content Overlay */}
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-primary-500 mb-1">Earn MatePoints with Every Booking</h3>
                <p className="text-xs sm:text-sm md:text-base text-[#374151] mb-2 sm:mb-3">Collect points on each job completed and redeem them for discounts & perks.</p>
                <Button 
                  onClick={handleViewRewards} 
                  size="sm"
                  className="bg-[#111827] hover:bg-[#111827] text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-[8px] text-xs sm:text-sm font-medium"
                >
                  View Rewards
                </Button>
              </div>
            </div>
            
            {/* Coin in right bottom corner */}
            <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 z-10">
              <img src={CoinImage} alt="Coin" className="w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24" />
            </div>
          </div>
        </div>

        {/* Ongoing Jobs Section */}
        <div className="bg-white px-4 sm:px-7 py-4 sm:py-6 rounded-2xl shadow-custom">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3 sm:gap-0">
            <h3 className="text-base sm:text-lg md:text-xl font-semibold text-primary-500">Ongoing Jobs</h3>
            
            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <Button 
                onClick={handleViewJobs} 
                size="sm"
                className="rounded-full px-3 sm:px-5 py-1.5 sm:py-2"
              >
                <svg width="14" height="14" className="sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.2974 5.32548H16.8208V3.15311C16.8208 2.17207 16.0145 1.37402 15.0234 1.37402H8.97664C7.98556 1.37402 7.17927 2.17216 7.17927 3.15311V5.32548H3.70256C1.66097 5.32548 0 6.98645 0 9.02804V19.6015C0 21.2691 1.3567 22.6258 3.02437 22.6258H20.9756C22.6433 22.6258 24 21.2691 24 19.6015V9.02804C24 6.98645 22.339 5.32548 20.2974 5.32548ZM8.58978 3.15311C8.58978 2.94297 8.75609 2.78454 8.97664 2.78454H15.0234C15.2439 2.78454 15.4102 2.94297 15.4102 3.15311V5.32548H8.58978V3.15311ZM22.5894 19.6015C22.5894 20.4913 21.8655 21.2153 20.9756 21.2153H3.02437C2.13445 21.2153 1.41051 20.4913 1.41051 19.6015V13.0138C1.63556 13.1551 1.87812 13.2663 2.13201 13.3448C2.14551 13.3489 2.15911 13.3527 2.17279 13.356L9.35787 15.112V15.6921C9.35787 16.6027 10.0988 17.3436 11.0095 17.3436H12.9905C13.9012 17.3436 14.6421 16.6027 14.6421 15.6921V15.112L21.8272 13.356C21.8409 13.3527 21.8545 13.349 21.8679 13.3448C22.1218 13.2663 22.3644 13.1551 22.5894 13.0138V19.6015H22.5894ZM10.7684 15.6921V13.7021C10.7685 13.6382 10.7939 13.5769 10.8391 13.5317C10.8843 13.4865 10.9456 13.4611 11.0095 13.461H12.9905C13.0545 13.4611 13.1157 13.4865 13.1609 13.5317C13.2061 13.5769 13.2316 13.6382 13.2316 13.7021V15.6921C13.2315 15.756 13.2061 15.8173 13.1609 15.8624C13.1157 15.9076 13.0545 15.9331 12.9905 15.9331H11.0095C10.9456 15.933 10.8843 15.9076 10.8391 15.8624C10.7939 15.8172 10.7685 15.756 10.7684 15.6921ZM22.5895 10.4493C22.5895 11.1584 22.1405 11.7756 21.47 11.9913L14.6411 13.6602C14.6187 12.7688 13.8872 12.0504 12.9905 12.0504H11.0095C10.1129 12.0504 9.38136 12.7688 9.35895 13.6602L2.53003 11.9913C1.85957 11.7756 1.41051 11.1584 1.41051 10.4493V9.02804C1.41051 7.7642 2.43871 6.736 3.70256 6.736H20.2974C21.5612 6.736 22.5894 7.7642 22.5894 9.02804V10.4493H22.5895Z" fill="white"/>
                </svg>
                <span>View Jobs</span>
              </Button>
              
              <div className="flex space-x-2">
                <Button 
                  onClick={goToPrev}
                  variant="ghost"
                  size="sm"
                  className="rounded-full p-1.5 sm:p-2 "
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Button>
                
                <Button 
                  onClick={goToNext}
                  variant="ghost"
                  size="sm"
                  className="rounded-full p-1.5 sm:p-2"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
          
          {loading && (
            <div className="text-center py-8">
              <div className="text-sm text-gray-500">Loading jobs...</div>
            </div>
          )}
          
          {error && (
            <div className="text-center py-8">
              <div className="text-sm text-red-600">{error}</div>
            </div>
          )}
          
          {!loading && !error && ongoingJobs.length === 0 && (
            <div className="text-center py-8">
              <div className="text-sm text-gray-500">No jobs found</div>
            </div>
          )}
          
          {!loading && !error && ongoingJobs.length > 0 && (
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
              loop={ongoingJobs.length > 1}
              className="!pb-4"
            >
              {ongoingJobs.map((job) => (
                <SwiperSlide key={job.id}>
                  <div className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-200 shadow-custom h-44 sm:h-48">
                    <div className="flex flex-col justify-between h-full">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <div className="text-xs sm:text-sm text-primary-200 font-medium">{job.id}</div>
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
                        <h4 className="font-medium text-primary-500 mb-2 line-clamp-2 text-sm sm:text-base">{job.title}</h4>
                        <div className="flex items-center text-xs font-medium text-primary-200 mb-1">
                          <img src={CalendarIcon} alt="Calendar" className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          {job.date}
                        </div>
                        {job.assignedTo && (
                          <div className="flex items-center text-xs text-[#6B7280]">
                            <img src={PersonIcon} alt="Person" className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            <span className="truncate">Assigned to: {job.assignedTo}</span>
                          </div>
                        )}
                      </div>
                      <Button 
                        variant="secondary" 
                        size="xs"
                        className="w-full mt-2 sm:mt-3 text-xs sm:text-sm font-medium"
                      >
                        {job.action}
                      </Button>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
      </div>

      {/* Job Complete Modal */}
      <JobCompleteModal
        isOpen={showJobCompleteModal}
        onClose={handleCloseJobCompleteModal}
        cleanerName={completedJobInfo?.cleanerName || "John"}
        jobTitle={completedJobInfo?.jobTitle || "Cleaning Service"}
      />
    </div>
  );
};

export default CustomerDashboard;
