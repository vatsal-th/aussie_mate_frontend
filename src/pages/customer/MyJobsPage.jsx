import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import ArrowLeftIcon from '../../assets/arrow-left.svg';
import SearchIcon from '../../assets/search.svg';
import CalendarIcon from '../../assets/Calendar.svg';
import MapPinIcon from '../../assets/map-pin 1.png';
import UserIcon from '../../assets/user.svg';
import MessageIcon from '../../assets/message2.svg';
import ChatIcon from '../../assets/message2.svg';
import { jobsAPI, userAPI } from '../../services/api';
import { chatAPI } from '../../services/chatAPI';
import { useAuth } from '../../contexts/AuthContext';

const tabs = [
  { id: 'all', label: 'All' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'ongoing', label: 'Ongoing' },
  { id: 'completed', label: 'Completed' }
];

// Helpers
const formatDate = (iso) => {
  if (!iso) return '';
  
  try {
    const d = new Date(iso);
    
    // Check if date is valid
    if (isNaN(d.getTime())) {
      console.warn('Invalid date:', iso);
      return '';
    }
    
    // Extract date and time directly from the ISO string to avoid timezone conversion
    const dateStr = d.toISOString().split('T')[0]; // Get YYYY-MM-DD
    const timeStr = d.toISOString().split('T')[1].split('.')[0]; // Get HH:MM:SS
    
    // Parse the date parts
    const [year, month, day] = dateStr.split('-');
    const [hours, minutes] = timeStr.split(':');
    
    // Convert month number to month name
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthName = monthNames[parseInt(month) - 1];
    
    // Format time in 12-hour format
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    const timeFormatted = `${hour12}:${minutes} ${ampm}`;
    
    return `${day} ${monthName} ${year}, ${timeFormatted}`;
  } catch (error) {
    console.error('Error formatting date:', iso, error);
    return '';
  }
};

const getStatusChip = (statusRaw) => {
  const s = (statusRaw || '').toString().toLowerCase();
  if (s === 'in_progress') {
    return { label: 'In Process', className: 'bg-[#FFEBCA] text-[#F59E0B] border border-[#FFEBCA]' };
  }
  if (s === 'completed') {
    return { label: 'Completed', className: 'bg-[#DBF9E7] text-[#1EB154] border border-[#DBF9E7]' };
  }
  // Show "Accepted" for accepted jobs
  if (s === 'accepted') {
    return { label: 'Accepted', className: 'bg-[#D1FAE5] text-[#059669] border border-[#D1FAE5]' };
  }
  // Show "Quoted" for jobs with quotes
  if (s === 'quoted') {
    return { label: 'Quoted', className: 'bg-[#E0F2FE] text-[#0369A1] border border-[#E0F2FE]' };
  }
  // Upcoming states (posted/pending) should show as "Pending Quotes"
  if (['posted', 'pending', 'pending_quotes'].includes(s)) {
    return { label: 'Pending Quotes', className: 'bg-[#DDEFFF] text-[#0088FF] border border-[#DDEFFF]' };
  }
  // Fallback
  return { label: 'Pending Quotes', className: 'bg-[#DDEFFF] text-[#0088FF] border border-[#DDEFFF]' };
};

// Helper function to format cleaner data from quotes (same as CustomerJobDetailsPage)
const formatCleanerData = (quote) => {
  const cleaner = quote.cleanerId || quote.cleaner;
  const cleanerId = cleaner?._id || cleaner?.id || quote.cleanerId || quote._id || quote.id;
  
  return {
    id: cleanerId,
    quoteId: quote._id || quote.id,
    name: cleaner ? `${cleaner.firstName || ''} ${cleaner.lastName || ''}`.trim() || `Cleaner #${cleanerId?.slice(-4)}` : 'Cleaner',
    rating: cleaner?.rating || 4.5,
    reviews: cleaner?.reviewCount || 0,
    tier: cleaner?.tier || 'Standard',
    quoteAmount: quote.price || quote.amount || 0,
    distance: quote.distance || cleaner?.distance || 'Distance unknown',
    isVerified: cleaner?.isVerified || false,
    estimatedDuration: quote.estimatedDuration || '2 hours',
    status: quote.status || 'pending'
  };
};

// Helper function to get message count for a job
const getMessageCountForJob = async (jobId) => {
  try {
    const response = await chatAPI.getUnreadCount();
    
    if (response.success && response.data) {
      // Handle different response formats
      let dataArray = [];
      
      if (Array.isArray(response.data)) {
        dataArray = response.data;
      } else if (response.data.messages && Array.isArray(response.data.messages)) {
        dataArray = response.data.messages;
      } else if (response.data.unreadCounts && Array.isArray(response.data.unreadCounts)) {
        dataArray = response.data.unreadCounts;
      } else if (typeof response.data === 'object') {
        // If data is an object, try to find job-specific data
        const jobData = response.data[jobId] || response.data[jobId?.toString()];
        return jobData ? (jobData.unreadCount || jobData.count || 0) : 0;
      }
      
      // Find messages for this specific job
      const jobMessages = dataArray.find(item => 
        item.jobId === jobId || item.jobId?._id === jobId || item.jobId?.id === jobId
      );
      return jobMessages ? (jobMessages.unreadCount || jobMessages.count || 0) : 0;
    }
    return 0;
  } catch (error) {
    console.error('Error fetching message count:', error);
    return 0;
  }
};

const MyJobsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [jobs, setJobs] = useState([]);
  const [allJobs, setAllJobs] = useState([]); // Store original jobs
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const calendarRef = useRef(null);

  // Get current user ID
  useEffect(() => {
    const getCurrentUserId = async () => {
      try {
        if (user?.id) {
          setCurrentUserId(user.id);
        } else {
          // Fetch user profile to get ID
          const userProfile = await userAPI.getProfile();
          const userData = userProfile.data?.user || userProfile.data || userProfile;
          setCurrentUserId(userData?._id || userData?.id);
        }
      } catch (error) {
        console.error('Error fetching user ID:', error);
        setError('Failed to load user information');
      }
    };

    getCurrentUserId();
  }, [user]);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleOutside = (e) => {
      if (showCalendar && calendarRef.current && !calendarRef.current.contains(e.target)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [showCalendar]);

  // Fetch jobs posted by current user only
  useEffect(() => {
    const fetchJobs = async () => {
      if (!currentUserId) return; 

      try {
        setLoading(true);
        setError('');

        let list = [];
        
        if (activeTab === 'upcoming') {
          // For upcoming tab, fetch both quoted and accepted jobs
          const [quotedRes, acceptedRes] = await Promise.all([
            jobsAPI.getAllJobs({ status: 'quoted', page: 1, limit: 50 }),
            jobsAPI.getAllJobs({ status: 'accepted', page: 1, limit: 50 })
          ]);
          
          const quotedJobs = quotedRes?.data?.jobs || quotedRes?.data || [];
          const acceptedJobs = acceptedRes?.data?.jobs || acceptedRes?.data || [];
          list = [...quotedJobs, ...acceptedJobs];
        } else {
          const statusParam = (() => {
            if (activeTab === 'ongoing') return 'in_progress';
            if (activeTab === 'completed') return 'completed';
            return undefined;
          })();
          
          const res = await jobsAPI.getAllJobs(statusParam ? { status: statusParam, page: 1, limit: 50 } : { page: 1, limit: 50 });
          list = res?.data?.jobs || res?.data || res || [];
        }

        // Filter jobs to only show those posted by current user
        const userJobs = list.filter((j) => {
          const jobCustomerId = j.customerId?._id || j.customerId?.id || j.customer?._id || j.customer?.id || j.postedBy?._id || j.postedBy?.id;
          return jobCustomerId === currentUserId;
        });

        // Normalize into UI shape with message counts
        const normalized = await Promise.all(userJobs.map(async (j) => {
          const status = (j.status || '').toString();
          const address = j.location?.address || j.location?.fullAddress || '';
          const assignedTo = j.assignedCleaner?.name || j.assignedCleaner?.fullName || j.cleaner?.name || j.assignedTo || null;
          
          const dateLabel = formatDate(j.scheduledDate || j.createdAt);
          const paymentAmount = j.payment?.amount ? `$${j.payment.amount}` : null;
          
          
          // Count quotes from different possible API response formats (only pending quotes)
          let quoteCount = 0;
          if (j.quotesReceived && j.quotesReceived > 0) {
            quoteCount = j.quotesReceived;
          } else if (j.quotes && Array.isArray(j.quotes)) {
            // Filter out rejected quotes and count only pending quotes
            quoteCount = j.quotes.filter(quote => quote.status !== 'rejected').length;
          } else if (j.quotes && typeof j.quotes === 'number') {
            quoteCount = j.quotes;
          } else if (j.quoteCount) {
            quoteCount = j.quoteCount;
          } else {
            // If no quote data in job list, try to fetch individual job details
            try {
              const jobDetails = await jobsAPI.getJobById(j._id || j.jobId || j.id);
              if (jobDetails.success && jobDetails.data) {
                const jobData = jobDetails.data;
                if (jobData.quotes && Array.isArray(jobData.quotes)) {
                  quoteCount = jobData.quotes.filter(quote => quote.status !== 'rejected').length;
                } else if (jobData.quotesReceived && jobData.quotesReceived > 0) {
                  quoteCount = jobData.quotesReceived;
                }
              }
            } catch (error) {
              console.error('Error fetching job details for quotes:', error);
            }
          }
          
          const shouldShowQuotes = quoteCount > 0 && status !== 'accepted' && status !== 'in_progress' && status !== 'completed';
          const quotes = shouldShowQuotes ? `${quoteCount} Quotes Received` : null;
          const title = j.title || `${(j.serviceType || '').toString().replace(/\b\w/g, c => c.toUpperCase())}`.trim();
          const statusChip = getStatusChip(status);
          
          // Get message count for this job
          const messageCount = await getMessageCountForJob(j._id || j.jobId || j.id);
          
          return {
            id: j._id || j.jobId || j.id || `job-${Math.random()}`,    // Use _id for navigation
            status: status,  // Keep original status for filtering
            statusLabel: statusChip.label,  // Display label
            statusClass: statusChip.className,  // Display class
            jobId: j.jobId, // Store jobId for display
            title,
            dateLabel,  
            address,
            payment: paymentAmount,
            quotes,
            assignedTo,
            scheduledDate: j.scheduledDate,
            createdAt: j.createdAt,
            messageCount: messageCount,
            originalJob: j // Store original job data for chat navigation
          };
        }));
        
        // Sort by scheduled date (latest first), fallback to creation date
        const sortedJobs = normalized.sort((a, b) => {
          const dateA = a.scheduledDate || a.createdAt;
          const dateB = b.scheduledDate || b.createdAt;
          
          if (!dateA && !dateB) return 0;
          if (!dateA) return 1;
          if (!dateB) return -1;
          return new Date(dateB) - new Date(dateA);
        });
        
        setJobs(sortedJobs);
        setAllJobs(sortedJobs); // Store original jobs
      } catch (e) {
        console.error('Error fetching jobs:', e);
        setError('Failed to load your jobs');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [activeTab, currentUserId]);

  const filteredJobs = useMemo(() => {
    const q = query.trim().toLowerCase();
    const mapTab = (status) => {
      const s = (status || '').toLowerCase();
      if (['in_progress', 'assigned'].includes(s)) return 'ongoing';
      if (['completed', 'done'].includes(s)) return 'completed';
      if (['quoted', 'accepted', 'posted', 'pending', 'pending_quotes'].includes(s)) return 'upcoming';
      if (!s) return 'upcoming';
      return 'upcoming';
    };
    
    // Use allJobs for filtering when any date is set
    const hasRange = Boolean(startDate || endDate);
    const jobsToFilter = hasRange ? allJobs : jobs;
    
    return jobsToFilter.filter((job) => {
      const matchesQuery = !q || job.title.toLowerCase().includes(q) || (job.id || '').toLowerCase().includes(q) || (job.address || '').toLowerCase().includes(q);
      const tab = mapTab(job.status);
      const matchesTab = activeTab === 'all' || activeTab === tab;
      
      // Date range filtering (inclusive) - use scheduledDate if available, otherwise createdAt
      let matchesDate = true;
      if (hasRange) {
        const jobDate = job.scheduledDate || job.createdAt;
        if (!jobDate) {
          matchesDate = false;
        } else {
          const jobTime = new Date(jobDate);
          const jobDayStart = new Date(jobTime.getFullYear(), jobTime.getMonth(), jobTime.getDate()).getTime();
          const startTs = startDate ? new Date(startDate).getTime() : null;
          const endTs = endDate ? new Date(endDate).getTime() : null;
          if (startTs !== null && jobDayStart < startTs) matchesDate = false;
          if (endTs !== null && jobDayStart > endTs) matchesDate = false;
        }
      }
      
      return matchesQuery && matchesTab && matchesDate;
    });
  }, [query, activeTab, jobs, allJobs, startDate, endDate]);

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <Header />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
        {/* Top Bar */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg bg-white border border-gray-200 cursor-pointer">
            <img src={ArrowLeftIcon} alt="Back" className="w-5 h-5" />
          </button>
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900">My Jobs</h1>
        </div>

        {/* Search + Calendar */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2">
              <img src={SearchIcon} alt="Search" className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search jobs..."
              className="w-full pl-9 pr-3 py-2 sm:py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none"  
            />
          </div>
          <button
            onClick={() => setShowCalendar((v) => !v)}
            className={`p-2 sm:p-3 rounded-xl! border cursor-pointer ${
              startDate || endDate ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'
            }`}
            title="Filter by date range"
          >
            <img src={CalendarIcon} alt="Calendar" className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          {(startDate || endDate) && (
            <button
              onClick={() => { setStartDate(''); setEndDate(''); }}
              className="p-2 sm:p-3 rounded-xl! bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-colors"
              title="Clear date filter"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Calendar Panel */}
        {showCalendar && (
          <div ref={calendarRef} className="mb-4 bg-white rounded-2xl border border-gray-200 shadow-custom p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Filter by Date</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setStartDate(''); setEndDate(''); }}
                  className="px-3 py-2 text-sm rounded-xl border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                >
                  Clear
                </button>
                <button
                  onClick={() => setShowCalendar(false)}
                  className="px-3 py-2 text-sm rounded-xl bg-[#1F6FEB] text-white hover:opacity-90 cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Start date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">End date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none"
                />
              </div>
            </div>
            {(startDate || endDate) && (
              <div className="mt-3 text-sm text-gray-600">
                Showing: {startDate || '—'} to {endDate || '—'}
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto no-scrollbar">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-[8px]! text-sm font-medium whitespace-nowrap cursor-pointer ${
                activeTab === t.id ? 'bg-[#EBF2FD] text-[#1F6FEB]' : 'bg-white text-gray-600 border border-gray-200  focus:outline-none'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Job Cards */}
        {!currentUserId && (
          <div className="text-sm text-gray-500">Loading user information...</div>
        )}
        {currentUserId && loading && (
          <div className="text-sm text-gray-500">Loading your jobs...</div>
        )}
        {(!loading && error) && (
          <div className="text-sm text-red-600">{error}</div>
        )}
        {currentUserId && !loading && !error && filteredJobs.length === 0 && (
          <div className="text-center py-8">
            <div className="text-sm text-gray-500 mb-2">No jobs found</div>
            <div className="text-xs text-gray-400">You haven't posted any jobs yet.</div>
          </div>
        )}
        <div className="space-y-3">
          {filteredJobs.map((job) => (
            <div 
              key={job.id} 
              onClick={() => {
                if (job.status === 'in_progress') {
                  navigate(`/customer-in-progress-job/${job.id}`);
                } else {
                  navigate(`/customer-job-details/${job.id}`);
                }
              }}
              className="bg-white rounded-2xl border border-gray-200 shadow-custom p-4 cursor-pointer hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="text-[15px] text-primary-200 font-medium">{job.jobId}</div>
                {(() => { 
                  if (job.quotes) {
                    return (
                      <div className="flex items-center gap-1.5 bg-[#E0F2FE] px-2 py-1 rounded-full">
                        <div className="w-2 h-2 bg-[#0369A1] rounded-full"></div>
                        <span className="text-xs font-medium text-[#0369A1]">
                          {job.quotes}
                        </span>
                      </div>
                    );
                  } else {
                    return (
                      <div className={`text-[11px] px-2 py-1 rounded-full font-medium ${job.statusClass} text-center`}>
                        {job.statusLabel}
                      </div>
                    );
                  }
                })()}
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-primary-500 mb-2 line-clamp-2">{job.title}</h3>

             
              <div className="flex items-center text-xs text-primary-200 font-medium mb-1">
                <img src={CalendarIcon} alt="Date" className="w-4 h-4 mr-2" />
                {job.dateLabel}
              </div>
              <div className="flex items-center text-xs text-primary-200 font-medium">
                <img src={MapPinIcon} alt="Location" className="w-4 h-4 mr-2" />
                {job.address}
              </div>

              {/* Assigned cleaner */}
              {(['in_progress', 'completed'].includes(job.status) && job.assignedTo) && (
                <div className="mt-1 flex items-center text-xs text-primary-200 font-medium">
                  <img src={UserIcon} alt="Assigned" className="w-4 h-4 mr-2" />
                  Assigned to: {job.assignedTo}
                </div>
              )}

              {/* Footer Row */}
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {job.payment ? (() => {
                    const match = (job.payment || '').match(/^\s*([$£€₹]?\d+(?:[.,]\d{1,2})?)/);
                    const amount = match ? match[1] : null;
                    const rest = amount ? job.payment.slice(match[0].length) : '';
                    return (
                      <div className="text-[11px] sm:text-xs text-primary-200 font-medium">
                        Payment: {amount ? (<><span className="text-[#1F6FEB] font-semibold">{amount}</span>{rest}</>) : job.payment}
                      </div>
                    );
                  })() : <span />}

                  {/* Message Count Badge */}
                  {job.messageCount > 0 && (
                    <div className="flex items-center gap-1">
                      <img src={MessageIcon} alt="Messages" className="w-3 h-3" />
                      <span className="text-[10px] sm:text-xs font-medium bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
                        {job.messageCount} new
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Chat Button for Accepted Jobs only (not in_progress) */} 
                  {job.status === 'accepted' && (
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        
                        try {
                          // Fetch detailed job data for accepted jobs
                          const jobResponse = await jobsAPI.getJobById(job.id);
                          let jobData = job.originalJob || job;
                          
                          if (jobResponse.success && jobResponse.data) {
                            jobData = jobResponse.data;
                          }
                          
                          const acceptedQuote = jobData.quotes?.find(quote => quote.status === 'accepted');
                          
                          if (acceptedQuote) {
                            const cleanerData = formatCleanerData(acceptedQuote);
                            
                            if (cleanerData.id && cleanerData.id !== 'undefined' && cleanerData.id !== 'null') {
                              navigate(`/customer-chat/${job.id}?cleaner=${cleanerData.id}`);
                            }
                          }
                        } catch (error) {
                          console.error('Error fetching job details for chat:', error);
                        }
                      }}
                      className="text-[#1F6FEB] px-3 py-2 rounded-full font-medium transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer text-sm border border-[#9CC0F6] shadow-custom"
                    >
                      <img src={ChatIcon} alt="Chat" className="w-4 h-4" />
                      Chat with Cleaner
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyJobsPage;


