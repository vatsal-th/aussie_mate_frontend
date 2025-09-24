import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import ArrowLeftIcon from '../assets/arrow-left.svg';
import DownIcon from '../assets/Down.svg';
import CalendarIcon from '../assets/Calendar.svg';
import MapPinIcon from '../assets/map-pin 1.png';
import SearchIcon from '../assets/search.svg';
import { jobsAPI } from '../services/api';

const CleanerJobsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('my-bids');
  const [sortBy, setSortBy] = useState('distance');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const tabs = [
    { id: 'live-jobs', label: 'Live Jobs' },
    { id: 'my-bids', label: 'My Bids' },
    { id: 'accepted', label: 'Accepted' },
    { id: 'completed', label: 'Completed' }
  ];

  const sortOptions = [
    { id: 'distance', label: 'Distance' },
    { id: 'price', label: 'Price' },
    { id: 'date', label: 'Date Posted' },
    { id: 'urgency', label: 'Urgency' }
  ];

  // Mock data for demonstration - replace with actual API calls
  const mockJobs = [
    {
      id: '1',
      title: 'Bond Clean – 2 Bed Apartment',
      location: 'Approx. 4.2 km away, VIC',
      date: '23 Aug, 2:00 PM',
      price: '$100',
      status: 'posted',
      timeAgo: 'Posted 2 hrs ago',
      type: 'bond-clean'
    },
    {
      id: '2',
      title: 'Carpet Shampoo – 3 Rooms',
      location: 'Approx. 3 km away, QLD',
      date: '23 Aug, 2:00 PM',
      price: '$120',
      status: 'bid-placed',
      timeAgo: 'Placed 1h ago',
      type: 'carpet-cleaning'
    },
    {
      id: '3',
      title: 'Bond Clean – 2 Bed Apartment',
      location: 'Approx. 4.2 km away, VIC',
      date: '23 Aug, 2:00 PM',
      price: '$100',
      status: 'posted',
      timeAgo: 'Posted 2 hrs ago',
      type: 'bond-clean'
    }
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
        
        // Fetch jobs from API
        const response = await jobsAPI.getAllJobs({ 
          status: status,
          page: 1,
          limit: 50
        });
        
        // Transform API data to match UI format
        const jobsData = response?.data?.jobs || response?.data || response || [];
        const transformedJobs = jobsData.map(job => ({
          id: job.jobId || job._id || job.id,
          title: job.title || `${(job.serviceType || '').toString().replace(/\b\w/g, c => c.toUpperCase())}`.trim(),
          location: job.location?.address || job.location?.fullAddress || 'Location not specified',
          date: job.scheduledDate ? new Date(job.scheduledDate).toLocaleDateString('en-AU', { 
            day: '2-digit', 
            month: 'short', 
            hour: '2-digit', 
            minute: '2-digit' 
          }) : 'Date not specified',
          price: job.estimatedPrice ? `$${job.estimatedPrice}` : job.budget ? `$${job.budget}` : 'Price not specified',
          status: job.status || 'posted',
          timeAgo: job.createdAt ? getTimeAgo(new Date(job.createdAt)) : 'Recently posted',
          type: job.serviceType || 'general'
        }));
        
        setJobs(transformedJobs);
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError('Failed to load jobs');
        // Fallback to mock data for development
        setJobs(mockJobs);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [activeTab]);

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'posted':
        return 'text-gray-500';
      case 'bid-placed':
        return 'text-blue-600';
      case 'accepted':
        return 'text-green-600';
      case 'completed':
        return 'text-gray-400';
      default:
        return 'text-gray-500';
    }
  };

  // Filter and sort jobs
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

    // Sort jobs
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          const priceA = parseInt(a.price.replace('$', ''));
          const priceB = parseInt(b.price.replace('$', ''));
          return priceB - priceA; // Highest first
        case 'date':
          return new Date(b.date) - new Date(a.date);
        case 'urgency':
          // Mock urgency based on time ago
          const urgencyA = a.timeAgo.includes('hrs') ? 1 : 0;
          const urgencyB = b.timeAgo.includes('hrs') ? 1 : 0;
          return urgencyA - urgencyB;
        case 'distance':
        default:
          // Mock distance sorting
          const distA = parseFloat(a.location.match(/(\d+\.?\d*)/)?.[1] || 0);
          const distB = parseFloat(b.location.match(/(\d+\.?\d*)/)?.[1] || 0);
          return distA - distB;
      }
    });

    return filtered;
  }, [jobs, searchQuery, sortBy]);

  const handleJobClick = (jobId) => {
    // Navigate to job details page
    navigate(`/job-details/${jobId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-md mx-auto bg-white min-h-screen sm:max-w-2xl lg:max-w-4xl">
        {/* Top Navigation */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <img src={ArrowLeftIcon} alt="Back" className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Jobs</h1>
          </div>
          <div className="flex items-center gap-2">
            <img src={MapPinIcon} alt="Location" className="w-4 h-4" />
            <span className="text-sm text-gray-600">Sydney, NSW</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 py-3">
          <div className="relative">
            <img 
              src={SearchIcon} 
              alt="Search" 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Sort By Dropdown */}
        <div className="px-4 pb-3">
          <div className="relative">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span>Sort By</span>
              <img 
                src={DownIcon} 
                alt="Dropdown" 
                className={`w-4 h-4 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`}
              />
            </button>
            
            {showSortDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
                {sortOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      setSortBy(option.id);
                      setShowSortDropdown(false);
                    }}
                    className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl ${
                      sortBy === option.id ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-4 pb-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-white text-gray-600 border border-gray-200'
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
                <div key={i} className="bg-white border border-gray-200 rounded-2xl p-4 animate-pulse">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="flex items-center mb-2">
                    <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="flex items-center mb-3">
                    <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                    <div className="h-4 bg-gray-200 rounded w-12"></div>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => handleJobClick(job.id)}
                  className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                {/* Status and Time */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-medium ${getStatusColor(job.status)}`}>
                    {job.timeAgo}
                  </span>
                </div>

                {/* Job Title */}
                <h3 className="text-base font-semibold text-gray-900 mb-3">
                  {job.title}
                </h3>

                {/* Location */}
                <div className="flex items-center mb-2">
                  <img src={MapPinIcon} alt="Location" className="w-4 h-4 mr-2" />
                  <span className="text-sm text-gray-600">{job.location}</span>
                </div>

                {/* Date & Time */}
                <div className="flex items-center mb-3">
                  <img src={CalendarIcon} alt="Date" className="w-4 h-4 mr-2" />
                  <span className="text-sm text-gray-600">{job.date}</span>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Estimation:</span>
                  <span className="text-base font-semibold text-blue-600">{job.price}</span>
                </div>
              </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Overlay for dropdown */}
      {showSortDropdown && (
        <div 
          className="fixed inset-0 z-0"
          onClick={() => setShowSortDropdown(false)}
        />
      )}
    </div>
  );
};

export default CleanerJobsPage;
