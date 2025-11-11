import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components';
import DownIcon from '../../assets/down2.svg';
import CalendarIcon from '../../assets/Calendar.svg';
import MapPinIcon from '../../assets/map-pin 1.png';
import CurrentLocationIcon from '../../assets/currentLocation.svg';
import SearchIcon from '../../assets/search.svg';
import { jobsAPI, userAPI, reviewsAPI } from '../../services/api';
import ChatIcon from '../../assets/message2.svg';  

const CleanerJobsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('live-jobs');
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
  const [cleanerReviews, setCleanerReviews] = useState([]);
  const [cleanerProfile, setCleanerProfile] = useState(null);
  // Load cleaner profile and reviews
  useEffect(() => {
    const fetchCleanerData = async () => {
      try {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const currentUserId = currentUser.id || currentUser._id;
        
        if (currentUserId) {
          // Fetch cleaner profile
          const profileResponse = await userAPI.getProfile();
          if (profileResponse.success && profileResponse.data) {
            const profileData = profileResponse.data.user || profileResponse.data;
            setCleanerProfile(profileData);
          }
          
          // Fetch cleaner reviews
          const reviewsResponse = await reviewsAPI.getCleanerReviews(currentUserId);
          if (reviewsResponse.success && reviewsResponse.data) {
            const reviewsData = reviewsResponse.data.reviews || reviewsResponse.data;
            setCleanerReviews(reviewsData);
          }
        }
      } catch (error) {
        // Error fetching cleaner data
      }
    };
    
    fetchCleanerData();
  }, []);

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
        // Silently handle error and fallback to localStorage
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
          // Silently handle parsing error
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

        // Get current user ID for filtering (needed for all tabs)
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const currentUserId = currentUser.id || currentUser._id;

        // Map tab to API status parameter
        const statusMap = {
          'live-jobs': 'posted',
          'my-bids': 'quoted',
          'accepted': 'accepted',
          'completed': 'completed'
        };

        const status = statusMap[activeTab];

        let response;
        
        // Special handling for "My Bids" tab
        if (activeTab === 'my-bids') {
          
          // Get all jobs (both posted and quoted status) to find jobs where cleaner has submitted quotes
          const [postedJobsResponse, quotedJobsResponse] = await Promise.all([
            jobsAPI.getAllJobs({ status: 'posted', page: 1, limit: 100 }),
            jobsAPI.getAllJobs({ status: 'quoted', page: 1, limit: 100 })
          ]);
          
          const postedJobs = postedJobsResponse?.data?.jobs || postedJobsResponse?.data || [];
          const quotedJobs = quotedJobsResponse?.data?.jobs || quotedJobsResponse?.data || [];
          const allJobs = [...postedJobs, ...quotedJobs];
          
          // Filter jobs where current cleaner has submitted a quote
          // Since getAllJobs doesn't include quotes, we need to fetch individual job details
          const jobsWithMyBids = [];
          
          for (const job of allJobs) {
            try {
              // Fetch individual job details to get quotes
              const jobDetails = await jobsAPI.getJobById(job._id || job.jobId || job.id);
              
              if (jobDetails.success && jobDetails.data) {
                const jobData = jobDetails.data;
                
                if (jobData.quotes && jobData.quotes.length > 0) {
                  
                  const hasMyQuote = jobData.quotes.some((quote, index) => {
                    const quoteCleanerId = quote.cleanerId || quote.cleanerId?._id;
                    const isMyQuote = quoteCleanerId === currentUserId;
                    const isPending = quote.status === 'pending';
                    
                    return isMyQuote && isPending;
                  });
                  
                  if (hasMyQuote) {
                    jobsWithMyBids.push(jobData);
                  }
                }
              }
            } catch (error) {
              // Error fetching job details
            }
          }
          
          // Apply pagination to filtered results
          const startIndex = (currentPage - 1) * jobsPerPage;
          const endIndex = startIndex + jobsPerPage;
          const paginatedJobs = jobsWithMyBids.slice(startIndex, endIndex);
          
          response = {
            success: true,
            data: {
              jobs: paginatedJobs,
              total: jobsWithMyBids.length,
              page: currentPage,
              limit: jobsPerPage,
              totalPages: Math.ceil(jobsWithMyBids.length / jobsPerPage)
            }
          };
        } else if (activeTab === 'live-jobs') {
          // For Live Jobs, fetch both posted and quoted jobs
          const [postedJobsResponse, quotedJobsResponse] = await Promise.all([
            jobsAPI.getAllJobs({ status: 'posted', page: 1, limit: 50 }),
            jobsAPI.getAllJobs({ status: 'quoted', page: 1, limit: 50 })
          ]);
          
          // Combine both job arrays
          const postedJobs = postedJobsResponse?.data?.jobs || postedJobsResponse?.data || [];
          const quotedJobs = quotedJobsResponse?.data?.jobs || quotedJobsResponse?.data || [];
          const allLiveJobs = [...postedJobs, ...quotedJobs];
          
          // Apply pagination to combined results
          const startIndex = (currentPage - 1) * jobsPerPage;
          const endIndex = startIndex + jobsPerPage;
          const paginatedJobs = allLiveJobs.slice(startIndex, endIndex);
          
          response = {
            success: true,
            data: {
              jobs: paginatedJobs,
              total: allLiveJobs.length,
              page: currentPage,
              limit: jobsPerPage,
              totalPages: Math.ceil(allLiveJobs.length / jobsPerPage)
            }
          };
        } else if (activeTab === 'accepted') {
          // For Accepted tab, fetch both accepted and in_progress jobs
          const [acceptedJobsResponse, inProgressJobsResponse] = await Promise.all([
            jobsAPI.getAllJobs({ status: 'accepted', page: 1, limit: 100 }),
            jobsAPI.getAllJobs({ status: 'in_progress', page: 1, limit: 100 })
          ]);
          
          const acceptedJobs = acceptedJobsResponse?.data?.jobs || acceptedJobsResponse?.data || [];
          const inProgressJobs = inProgressJobsResponse?.data?.jobs || inProgressJobsResponse?.data || [];
          const allAcceptedJobs = [...acceptedJobs, ...inProgressJobs];
          
          // Apply pagination to combined results
          const startIndex = (currentPage - 1) * jobsPerPage;
          const endIndex = startIndex + jobsPerPage;
          const paginatedJobs = allAcceptedJobs.slice(startIndex, endIndex);
          
          response = {
            success: true,
            data: {
              jobs: paginatedJobs,
              total: allAcceptedJobs.length,
              page: currentPage,
              limit: jobsPerPage,
              totalPages: Math.ceil(allAcceptedJobs.length / jobsPerPage)
            }
          };
        } else if (activeTab === 'completed') {
          try {
            // Get ALL jobs and filter for completed status
            const allJobsResponse = await jobsAPI.getAllJobs({ page: 1, limit: 200 });
            const allJobs = allJobsResponse?.data?.jobs || allJobsResponse?.data || [];
            
            // Filter for completed jobs only
            const completedJobs = allJobs.filter(job => job.status === 'completed');
            
            // Filter jobs completed by current cleaner
            const myCompletedJobs = completedJobs.filter(job => {
              // Check multiple possible fields for cleaner assignment
              const isAssignedToCurrentCleaner = 
                job.assignedCleanerId === currentUserId ||
                job.assignedCleanerId?.toString() === currentUserId?.toString() ||
                job.cleanerId === currentUserId ||
                job.cleanerId?.toString() === currentUserId?.toString() ||
                job.completedBy === currentUserId ||
                job.completedBy?.toString() === currentUserId?.toString() ||
                job.completedBy?._id === currentUserId ||
                job.completedBy?._id?.toString() === currentUserId?.toString();
              
              return isAssignedToCurrentCleaner;
            });
            
            // Apply pagination to filtered results
            const startIndex = (currentPage - 1) * jobsPerPage;
            const endIndex = startIndex + jobsPerPage;
            const paginatedJobs = myCompletedJobs.slice(startIndex, endIndex);
            
            response = {
              success: true,
              data: {
                jobs: paginatedJobs,
                total: myCompletedJobs.length,
                page: currentPage,
                limit: jobsPerPage,
                totalPages: Math.ceil(myCompletedJobs.length / jobsPerPage)
              }
            };
          } catch (completedJobsError) {
            // Fallback to empty response
            response = {
              success: true,
              data: {
                jobs: [],
                total: 0,
                page: currentPage,
                limit: jobsPerPage,
                totalPages: 0
              }
            };
          }
        } else {
          // Fetch jobs from API with pagination for other tabs
          response = await jobsAPI.getAllJobs({
            status: status,
            page: currentPage,
            limit: jobsPerPage
          });
        }

        // Transform API data to match UI format
        let jobsData = response?.data?.jobs || response?.data || response || [];
        
        // Apply client-side pagination if API returns more jobs than requested
        if (jobsData.length > jobsPerPage) {
          const startIndex = (currentPage - 1) * jobsPerPage;
          const endIndex = startIndex + jobsPerPage;
          jobsData = jobsData.slice(startIndex, endIndex);
        }
        
        // Handle pagination data
        const originalTotalCount = response?.data?.total || response?.total || (response?.data?.jobs?.length || response?.data?.length || 0);
        const totalCount = originalTotalCount; // Use original total for pagination calculation
        const totalPagesCount = Math.ceil(totalCount / jobsPerPage);
        
        setTotalJobs(totalCount);
        setTotalPages(totalPagesCount);

        const transformedJobs = jobsData.map(job => {
          
          // Find my quote for this job (for My Bids tab)
          let myQuote = null;
          if (activeTab === 'my-bids' && job.quotes && job.quotes.length > 0) {
            myQuote = job.quotes.find(quote => 
              (quote.cleanerId === currentUserId || quote.cleanerId?._id === currentUserId) && 
              quote.status === 'pending'
            );
          }
          
          return {
            id: job._id || job.jobId || job.id, // Use _id first as it's the main identifier
            title: job.title || `${(job.serviceType || '').toString().replace(/\b\w/g, c => c.toUpperCase())}`.trim(),
            location: job.location?.address || job.location?.fullAddress || 'Location not specified',
            date: job.scheduledDate ? new Date(job.scheduledDate).toLocaleDateString('en-AU', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            }) : 'Date not specified',
            price: myQuote ? `$${myQuote.price}` : (job.estimatedPrice ? `$${job.estimatedPrice}` : job.budget ? `$${job.budget}` : 'Price not specified'),
            status: job.status || 'posted',
            timeAgo: job.createdAt ? getTimeAgo(new Date(job.createdAt)) : 'Recently posted',
            type: job.serviceType || 'general',
            // Add original job data for filtering
            originalJob: job,
            // Add my quote data for My Bids tab
            myQuote: myQuote
          };
        });

        // Filter jobs based on active tab
        let filteredJobs = transformedJobs;

        if (activeTab === 'accepted') {
          // For accepted jobs, fetch individual job details to get assignment and quotes data
          const acceptedJobs = [];
          
          for (const job of transformedJobs) {
            try {
              // Fetch individual job details to get quotes and assignment data
              const jobDetails = await jobsAPI.getJobById(job.originalJob._id || job.originalJob.jobId || job.originalJob.id);
              
              if (jobDetails.success && jobDetails.data) {
                const jobData = jobDetails.data;
                
                
                // Check if job is accepted or in_progress and assigned to current cleaner
                const isAccepted = jobData.status === 'accepted' || jobData.status === 'in_progress';
                const isAssignedToCurrentCleaner = jobData.assignedCleanerId === currentUserId ||
                  jobData.assignedCleanerId?.toString() === currentUserId?.toString() ||
                  jobData.cleanerId === currentUserId ||
                  jobData.cleanerId?.toString() === currentUserId?.toString() ||
                  jobData.acceptedBy === currentUserId ||
                  jobData.acceptedBy?.toString() === currentUserId?.toString();
                
                // Also check if any quote from current cleaner is accepted
                const hasAcceptedQuote = jobData.quotes && jobData.quotes.some(quote => {
                  const quoteCleanerId = quote.cleanerId?._id || quote.cleanerId?.id || quote.cleanerId;
                  const isMyQuote = quoteCleanerId === currentUserId || quoteCleanerId?.toString() === currentUserId?.toString();
                  const isAccepted = quote.status === 'accepted';
                  
                  
                  return isMyQuote && isAccepted;
                });
                
                const shouldShow = isAccepted && (isAssignedToCurrentCleaner || hasAcceptedQuote);
                
                
                if (shouldShow) {
                  acceptedJobs.push({
                    ...job,
                    originalJob: jobData
                  });
                }
              }
            } catch (error) {
              // Error fetching job details
            }
          }
          
          filteredJobs = acceptedJobs;
        }

        // Completed jobs filtering is now handled in the API call above

        setJobs(filteredJobs);
      } catch (err) {
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

  // Helper function to calculate average rating
  const getAverageRating = () => {
    if (!cleanerReviews || cleanerReviews.length === 0) return 0;
    const totalRating = cleanerReviews.reduce((sum, review) => sum + (review.rating || 0), 0);
    return Math.round((totalRating / cleanerReviews.length) * 10) / 10; // Round to 1 decimal
  };

  const handleJobClick = (jobId, jobStatus) => {
    // Don't navigate for in_progress jobs
    if (jobStatus === 'in_progress') {
      return;
    }
    // Navigate to completed job details page if job is completed
    if (jobStatus === 'completed') {
      navigate(`/cleaner-job-completed/${jobId}`);
      return;
    }
    // Navigate to job details page for other statuses
    navigate(`/job-details/${jobId}`);
  };

  const handleInProgressJobClick = (jobId) => {
    // Navigate to in-progress job details page
    navigate(`/in-progress-job/${jobId}`);
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
      <div className="max-w-sm mx-auto sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl">
        <PageHeader
          title="Jobs"
          onBack={() => navigate(-1)}
          rightSlot={
            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate('/set-cleaner-location', { state: { from: 'cleaner-jobs' } })}
            >
              <img src={CurrentLocationIcon} alt="Location" className="w-5 h-5" />
              <span className="text-sm text-primary-600 font-medium ">
                {userLocation.address}, {userLocation.city}
              </span>
            </div>
          }
        />

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
                      ? 'bg-[#EBF2FD] text-primary-600 shadow-sm font-semibold border-none'
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
                    onClick={() => handleJobClick(job.id, job.originalJob?.status)}
                    className={`bg-white border border-gray-200 rounded-2xl px-4 py-2 shadow-sm transition-all duration-200 ${
                      job.originalJob?.status === 'in_progress' ? 'cursor-default' : 'cursor-pointer hover:shadow-md'
                    }`}
                  >
                    {/* Job ID and Status */}
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm text-primary-200 font-medium">
                        {job.originalJob?.jobId || job.id?.substring(0, 8) || 'AM' + Math.random().toString(36).substr(2, 5).toUpperCase()}
                      </div>
                      {activeTab === 'completed' && (
                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-[#D1FAE5] border border-[#D1FAE5] text-[#059669]">
                          Completed
                        </span>
                      )}
                      {activeTab === 'accepted' && job.originalJob?.status === 'in_progress' && (
                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-[#FFF1D9] border border-[#FFEBCA] text-[#F59E0B]">
                          Awaiting Payment
                        </span>
                      )}
                      {activeTab === 'accepted' && job.originalJob?.status === 'accepted' && (
                          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-[#D1FAE5] border border-[#D1FAE5] text-[#059669]">
                          Accepted
                        </span>
                      )}
                      {activeTab === 'my-bids' && job.myQuote && (
                        <div className="flex flex-col items-end">
                          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-[#E0F2FE] text-[#0369A1] mb-1">
                            Quotes Sent
                          </span>
                        </div>
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
                      
                      {/* My Quote Amount for My Bids tab */}
                      {activeTab === 'my-bids' && job.myQuote && (
                        <div className="flex items-center">
                          <span className="text-sm font-semibold text-primary-500">
                            My Quote: <span className="ml-1 text-primary-600">${job.myQuote.price}</span>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Chat with Customer Button for Accepted Jobs (not in_progress) */}
                    {activeTab === 'accepted' && job.originalJob?.status === 'accepted' && (
                      <div className="flex items-center justify-end cursor-pointer">
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent job card click
                            navigate(`/chat/${job.id}`);
                          }}
                          className="text-primary-600 px-3 py-2 rounded-full font-medium transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer text-sm border border-[#9CC0F6] shadow-custom"
                        >
                          <img src={ChatIcon} alt="Chat" className="w-5 h-5 " />
                          Chat with Customer
                        </button>
                      </div>
                    )}
                    
                    {/* View Details Button for In Progress Jobs */}
                    {activeTab === 'accepted' && job.originalJob?.status === 'in_progress' && (
                      <div className="flex items-center justify-end cursor-pointer mt-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent job card click
                            handleInProgressJobClick(job.id);
                          }}
                          className="text-primary-600 px-3 py-2 rounded-full font-medium transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer text-sm border border-[#9CC0F6] shadow-custom"
                        >
                          View Details
                        </button>
                      </div>
                    )}
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
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
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
                          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                            currentPage === pageNum
                              ? 'bg-primary-500 text-white '
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
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
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
