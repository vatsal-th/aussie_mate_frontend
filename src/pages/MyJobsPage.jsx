import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import ArrowLeftIcon from '../assets/arrow-left.svg';
import SearchIcon from '../assets/search.svg';
import CalendarIcon from '../assets/Calendar.svg';
import MapPinIcon from '../assets/map-pin 1.png';
import UserIcon from '../assets/user.svg';
import { jobsAPI, userAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

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
  // Upcoming states (posted/pending/quoted) should show as "Pending Quotes"
  if (['posted', 'pending', 'pending_quotes', 'quoted'].includes(s)) {
    return { label: 'Pending Quotes', className: 'bg-[#DDEFFF] text-[#0088FF] border border-[#DDEFFF]' };
  }
  // Fallback
  return { label: 'Pending Quotes', className: 'bg-[#DDEFFF] text-[#0088FF] border border-[#DDEFFF]' };
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
      if (!currentUserId) return; // Wait for user ID

      try {
        setLoading(true);
        setError('');

        const statusParam = (() => {
          if (activeTab === 'ongoing') return 'in_progress';
          if (activeTab === 'completed') return 'completed';
          if (activeTab === 'upcoming') return undefined; // fetch all, client-side filter to include posted/pending/quoted
          return undefined; // all
        })();

        const res = await jobsAPI.getAllJobs(statusParam ? { status: statusParam, page: 1, limit: 50 } : { page: 1, limit: 50 });
        const list = res?.data?.jobs || res?.data || res || [];

        // Filter jobs to only show those posted by current user
        const userJobs = list.filter((j) => {
          const jobCustomerId = j.customerId?._id || j.customerId?.id || j.customer?._id || j.customer?.id || j.postedBy?._id || j.postedBy?.id;
          return jobCustomerId === currentUserId;
        });

        // Normalize into UI shape
        const normalized = userJobs.map((j) => {
          const status = (j.status || '').toString();
          const address = j.location?.address || j.location?.fullAddress || '';
          const assignedTo = j.assignedCleaner?.name || j.assignedCleaner?.fullName || j.cleaner?.name || j.assignedTo || null;
          
          const dateLabel = formatDate(j.createdAt);
          const paymentAmount = j.payment?.amount ? `$${j.payment.amount}` : null;
          const quotes = (j.quotesReceived && j.quotesReceived > 0) ? `${j.quotesReceived} Quotes Received` : null;
          const title = j.title || `${(j.serviceType || '').toString().replace(/\b\w/g, c => c.toUpperCase())}`.trim();
          return {
            id: j._id || j.jobId || j.id || `job-${Math.random()}`, // Use _id for navigation
            jobId: j.jobId, // Store jobId for display
            title,
            status,
            dateLabel,
            address,
            payment: paymentAmount,
            quotes,
            assignedTo,
            createdAt: j.createdAt
          };
        });
        
        // Sort by creation date (latest first)
        const sortedJobs = normalized.sort((a, b) => {
          if (!a.createdAt && !b.createdAt) return 0;
          if (!a.createdAt) return 1;
          if (!b.createdAt) return -1;
          return new Date(b.createdAt) - new Date(a.createdAt);
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
      if (['in_progress', 'accepted', 'assigned'].includes(s)) return 'ongoing';
      if (['completed', 'done'].includes(s)) return 'completed';
      // treat others as upcoming/pending (including unknown/empty)
      if (!s || ['posted', 'pending', 'pending_quotes', 'quoted'].includes(s)) return 'upcoming';
      return 'upcoming';
    };
    
    // Use allJobs for filtering when any date is set
    const hasRange = Boolean(startDate || endDate);
    const jobsToFilter = hasRange ? allJobs : jobs;
    
    return jobsToFilter.filter((job) => {
      const matchesQuery = !q || job.title.toLowerCase().includes(q) || (job.id || '').toLowerCase().includes(q) || (job.address || '').toLowerCase().includes(q);
      const tab = mapTab(job.status);
      const matchesTab = activeTab === 'all' || activeTab === tab;
      
      // Date range filtering (inclusive)
      let matchesDate = true;
      if (hasRange) {
        if (!job.createdAt) {
          matchesDate = false;
        } else {
          const jobTime = new Date(job.createdAt);
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
              onClick={() => navigate(`/customer-job-details/${job.id}`)}
              className="bg-white rounded-2xl border border-gray-200 shadow-custom p-4 cursor-pointer hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="text-[15px] text-primary-200 font-medium">{job.jobId}</div>
                {(() => { const chip = getStatusChip(job.status); return (
                  <span className={`text-[11px] px-2 py-1 rounded-full font-medium ${chip.className}`}>
                    {chip.label}
                  </span>
                ); })()}
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
              {(['In Progress', 'Completed'].includes(job.status) && job.assignedTo) && (
                <div className="mt-1 flex items-center text-xs text-primary-200 font-medium">
                  <img src={UserIcon} alt="Assigned" className="w-4 h-4 mr-2" />
                  Assigned to: {job.assignedTo}
                </div>
              )}

              {/* Footer Row */}
              <div className="mt-3 flex items-center justify-between">
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

                {job.quotes && (
                  <span className="text-[11px] sm:text-xs font-medium bg-[#DDEFFF] text-[#0088FF] px-2 py-1 rounded-full border border-[#DDEFFF]">
                    {job.quotes}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyJobsPage;


