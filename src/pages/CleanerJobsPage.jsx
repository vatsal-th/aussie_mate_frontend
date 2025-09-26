import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import ArrowLeftIcon from '../assets/arrow-left.svg';
import DownIcon from '../assets/down2.svg';
import CalendarIcon from '../assets/Calendar.svg';
import MapPinIcon from '../assets/map-pin 1.png';
import CurrentLocationIcon from '../assets/currentLocation.svg';
import UserIcon from '../assets/user.svg';
import SearchIcon from '../assets/search.svg';
import { jobsAPI, userAPI } from '../services/api';

const CleanerJobsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('live-jobs');
  const [sortBy, setSortBy] = useState('distance');
  const [showSortModal, setShowSortModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const jobsPerPage = 10;

  // Filter states
  const [distance, setDistance] = useState(25);
  const [customDistance, setCustomDistance] = useState('');
  const [budget, setBudget] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [userLocation, setUserLocation] = useState({
    address: 'Location not set',
    city: 'Please set your location',
    coordinates: null
  });

  // Load user location
  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        const userProfile = await userAPI.getProfile();
        const userData = userProfile?.data?.user || userProfile?.data || userProfile;
        const location = userData?.location;
        
        if (location) {
          // Extract address and city from fullAddress or address (same logic as Header)
          const fullAddress = location.fullAddress || location.address || '';
          const addressParts = fullAddress.split(',');
          const address = addressParts[0]?.trim() || 'Location not set';
          const city = addressParts.length > 1 ? addressParts[addressParts.length - 2]?.trim() : (location.city || 'Please set your location');
          
          setUserLocation({
            address: address,
            city: city,
            coordinates: location.coordinates || null
          });
          return;
        }
      } catch (error) {
        console.error('Error fetching location from backend:', error);
      }

      // Fallback to localStorage
      const storedLocation = localStorage.getItem('userLocation');
      if (storedLocation) {
        try {
          const location = JSON.parse(storedLocation);
          setUserLocation({
            address: location.address?.split(',')[0] || 'Location not set',
            city: location.city || 'Please set your location',
            coordinates: location.coordinates || null
          });
        } catch (error) {
          console.error('Error parsing stored location:', error);
        }
      }
    };

    fetchUserLocation();

    // Listen for location updates
    const handleLocationUpdate = () => {
      fetchUserLocation();
    };

    window.addEventListener('locationUpdated', handleLocationUpdate);

    // Also listen for storage changes (when location is updated in another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'userLocation') {
        fetchUserLocation();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('locationUpdated', handleLocationUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Disable body scroll when modal is open
  useEffect(() => {
    if (showSortModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showSortModal]);

  const tabs = [
    { id: 'live-jobs', label: 'Live Jobs' },
    { id: 'my-bids', label: 'My Bids' },
    { id: 'accepted', label: 'Accepted' },
    { id: 'completed', label: 'My Completed Jobs' }
  ];

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError('');

        // Map tab to API status parameter
        const statusMap = {
          'live-jobs': 'posted',
          'my-bids': 'quoted',
          'accepted': 'accepted',
          'completed': 'completed'
        };

        const status = statusMap[activeTab];

        // Fetch jobs from API with pagination
        const response = await jobsAPI.getAllJobs({
          status: status,
          page: currentPage,
          limit: jobsPerPage
        });

        // Transform API data to match UI format
        const jobsData = response?.data?.jobs || response?.data || response || [];
        
        // Handle pagination data
        const totalCount = response?.data?.total || response?.total || jobsData.length;
        const totalPagesCount = Math.ceil(totalCount / jobsPerPage);
        
        
        setTotalJobs(totalCount);
        setTotalPages(totalPagesCount);

        // Get current user ID for filtering
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const currentUserId = currentUser.id || currentUser._id;

        const transformedJobs = jobsData.map(job => ({
          id: job._id || job.jobId || job.id, // Use _id first as it's the main identifier
          title: job.title || `${(job.serviceType || '').toString().replace(/\b\w/g, c => c.toUpperCase())}`.trim(),
          location: job.location?.address || job.location?.fullAddress || 'Location not specified',
          date: job.scheduledDate ? new Date(job.scheduledDate).toLocaleDateString('en-AU', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
          }) : 'Date not specified',
          price: job.estimatedPrice ? `$${job.estimatedPrice}` : job.budget ? `$${job.budget}` : 'Price not specified',
          customerName: job.customerId?.firstName || job.customerId?.lastName || job.customer?.firstName || job.customer?.name || job.customerName || job.postedBy || 'Customer',
          status: job.status || 'posted',
          timeAgo: job.createdAt ? getTimeAgo(new Date(job.createdAt)) : 'Recently posted',
          type: job.serviceType || 'general',
          // Add original job data for filtering
          originalJob: job
        }));

        // Filter jobs based on active tab
        let filteredJobs = transformedJobs;

        if (activeTab === 'completed') {
          // For completed jobs, only show jobs completed by current cleaner
          filteredJobs = transformedJobs.filter(job => {
            const jobData = job.originalJob;
            // Check if job is completed and assigned to current cleaner
            const isCompleted = jobData.status === 'completed';
            const isAssignedToCurrentCleaner = jobData.assignedCleanerId === currentUserId ||
              jobData.cleanerId === currentUserId ||
              jobData.completedBy === currentUserId;
            return isCompleted && isAssignedToCurrentCleaner;
          });
        }

        setJobs(filteredJobs);
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError('Failed to load jobs');
        // Don't fallback to mock data - show empty state instead
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [activeTab, currentPage]);

  // Helper function to calculate time ago
  const getTimeAgo = (date) => {
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Posted just now';
    } else if (diffInHours === 1) {
      return 'Posted 1h ago';
    } else if (diffInHours < 24) {
      return `Posted ${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Posted ${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  // Filter jobs
  const filteredJobs = useMemo(() => {
    let filtered = jobs;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query) ||
        job.type.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [jobs, searchQuery]);

  const handleJobClick = (jobId) => {
    // Navigate to job details page
    navigate(`/job-details/${jobId}`);
  };

  // Pagination functions
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Reset to page 1 when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />

      <div className="max-w-sm mx-auto sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl">
        {/* Top Navigation */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <img src={ArrowLeftIcon} alt="Back" className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold text-primary-500">Jobs</h1>
          </div>
            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate('/set-cleaner-location', { state: { from: 'cleaner-jobs' } })}
            >
              <img src={CurrentLocationIcon} alt="Location" className="w-5 h-5" />
              <span className="text-sm text-[#1F6FEB] font-medium ">
                {userLocation.address}, {userLocation.city}
              </span>
            </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-custom">
          {/* Search and Sort Bar */}
          <div className="px-4 py-3">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <img
                  src={SearchIcon}
                  alt="Search"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 "
                />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none text-primary-200 font-medium cursor-pointer"
                />
              </div>

              {/* Sort By Button */}
              <div className="relative sm:w-auto w-full">
                <button
                  onClick={() => setShowSortModal(true)}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-primary-200 font-medium hover:bg-gray-50 transition-colors whitespace-nowrap w-full sm:w-auto cursor-pointer "
                >
                  <span>Sort By</span>
                  <img
                    src={DownIcon}
                    alt="Dropdown"
                    className="w-4 h-4"
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="px-4 pb-4">
            <div className="flex gap-2 overflow-x-auto no-scrollbar scrollbar-hide pb-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 rounded-xl! text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${activeTab === tab.id
                      ? 'bg-[#EBF2FD] text-[#1F6FEB] shadow-sm font-semibold border-none'
                      : 'bg-[#F9FAFB] text-gray-600 border border-[#F3F3F3] hover:bg-gray-50'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Job Cards */}
          <div className="px-4 pb-6">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-3xl p-6 animate-pulse">
                    {/* Header skeleton */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </div>

                    {/* Title skeleton */}
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>

                    {/* Details skeleton */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-gray-200 rounded mr-3"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-gray-200 rounded mr-3"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-gray-200 rounded mr-3"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    </div>

                    {/* Bottom section skeleton */}
                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-24"></div>
                        </div>
                        <div className="h-8 bg-gray-200 rounded w-24"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-red-500">{error}</div>
              </div>
            ) : jobs.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-500">No jobs found</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {filteredJobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => handleJobClick(job.id)}
                    className="bg-white border border-gray-200 rounded-2xl px-4 py-2 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                  >
                    {/* Job ID and Status */}
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm text-primary-200 font-medium">
                        {job.originalJob?.jobId || job.id?.substring(0, 8) || 'AM' + Math.random().toString(36).substr(2, 5).toUpperCase()}
                      </div>
                      {activeTab === 'completed' && (
                        <span className="text-xs font-bold px-2 py-1 rounded-full bg-green-500 text-white">
                          Completed
                        </span>
                      )}
                    </div>

                    {/* Job Title */}
                    <h3 className="text-lg font-semibold text-primary-500 mb-2">
                      {job.title}
                    </h3>

                    {/* Job Details with Icons */}
                    <div className="space-y-1">
                      {/* Location */}
                      <div className="flex items-center">
                        <img src={MapPinIcon} alt="Location" className="w-4 h-4 mr-3" />
                        <span className="text-sm text-primary-200 font-medium">{job.location}</span>
                      </div>

                      {/* Date & Time */}
                      <div className="flex items-center">
                        <img src={CalendarIcon} alt="Date" className="w-4 h-4 mr-3" />
                        <span className="text-sm text-primary-200 font-medium">
                          {activeTab === 'completed' ? `Completed: ${job.date}` : job.date}
                        </span>
                      </div>

                      {/* Job Poster Name */}
                      <div className="flex items-center">
                        <img src={UserIcon} alt="Job Poster" className="w-4 h-4 mr-3" />
                        <span className="text-sm text-primary-200 font-medium">{job.customerName}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {!loading && jobs.length > 0 && (
            <div className="px-4 pb-6">
              <div className="flex items-center justify-between">
                {/* Page Info */}
                <div className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * jobsPerPage) + 1} to {Math.min(currentPage * jobsPerPage, totalJobs)} of {totalJobs} jobs
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center space-x-2">
                  {/* Previous Button */}
                  <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    Previous
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                            currentPage === pageNum
                              ? 'bg-primary-500 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sort Modal */}
      {showSortModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setShowSortModal(false)}
        >

          <div
            className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-md mx-4 sm:mx-0 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-primary-500">Sort By</h2>
                <button
                  onClick={() => setShowSortModal(false)}
                  className="text-primary-200 font-medium hover:text-primary-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {/* Handle bar */}
            </div>

            {/* Modal Content */}
            <div className="px-6 py-6 space-y-6">
              {/* Distance Filter */}
              <div>
                <h3 className="text-lg font-semibold text-primary-500 mb-2">Distance</h3>
                <p className="text-sm text-primary-200 font-medium mb-4">Select your preferable distance</p>

                {/* Distance Slider */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-primary-200 font-medium mb-2">
                    <span>0 km</span>
                    <span className="font-medium text-blue-600">{distance} km</span>
                    <span>50 km</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={distance}
                    onChange={(e) => {
                      setDistance(parseInt(e.target.value));
                      setCustomDistance(''); // Clear custom input when slider is moved
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${(distance / 50) * 100}%, #E5E7EB ${(distance / 50) * 100}%, #E5E7EB 100%)`
                    }}
                  />
                </div>

                {/* Custom Distance Input */}
                <div>
                  <label className="block text-sm font-medium text-primary-200 mb-2">
                    Enter Custom Value
                  </label>
                  <input
                    type="number"
                    value={customDistance}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      setCustomDistance(e.target.value);
                      if (value >= 0 && value <= 50) {
                        setDistance(value);
                      }
                    }}
                    placeholder="Enter custom distance"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                    min="0"
                    max="50"
                  />
                </div>
              </div>


              {/* Urgency Filter */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-primary-500 mb-1">Urgency</h3>
                  <p className="text-sm text-primary-200 font-medium">Tap on toggle to find urgent jobs</p>
                </div>
                <button
                  onClick={() => setIsUrgent(!isUrgent)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isUrgent ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isUrgent ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3">
              <button
                onClick={() => {
                  setDistance(25);
                  setCustomDistance('');
                  setBudget('');
                  setIsUrgent(false);
                }}
                className="flex-1 px-4 py-3 border border-[#E5E7EB] text-primary-500 rounded-lg font-medium hover:bg-primary-50 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={() => {
                  // Apply filters here
                  setShowSortModal(false);
                }}
                className="flex-1 px-4 py-3 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CleanerJobsPage;
