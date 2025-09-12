import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import ArrowLeftIcon from '../assets/arrow-left.svg';
import SearchIcon from '../assets/search.svg';
import CalendarIcon from '../assets/Calendar.svg';
import MapPinIcon from '../assets/map-pin 1.png';
import UserIcon from '../assets/user.svg';
import { jobsAPI } from '../services/api';

const tabs = [
  { id: 'all', label: 'All' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'ongoing', label: 'Ongoing' },
  { id: 'completed', label: 'Completed' }
];

// Helpers
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
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch jobs (all) with optional status filter per tab
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const statusParam = (() => {
          if (activeTab === 'ongoing') return 'in_progress';
          if (activeTab === 'completed') return 'completed';
          if (activeTab === 'upcoming') return undefined; // fetch all, client-side filter to include posted/pending/quoted
          return undefined; // all
        })();

        const res = await jobsAPI.getAllJobs(statusParam ? { status: statusParam, page: 1, limit: 50 } : { page: 1, limit: 50 });
        const list = res?.data?.jobs || res?.data || res || [];

        // Normalize into UI shape
        const normalized = list.map((j) => {
          const status = (j.status || '').toString();
          const address = j.location?.address || j.location?.fullAddress || '';
          const assignedTo = j.assignedCleaner?.name || j.assignedCleaner?.fullName || j.cleaner?.name || j.assignedTo || null;
          const dateLabel = formatDate(j.scheduledDate);
          const paymentAmount = j.payment?.amount ? `$${j.payment.amount}` : null;
          const quotes = (j.quotesReceived && j.quotesReceived > 0) ? `${j.quotesReceived} Quotes Received` : null;
          const title = j.title || `${(j.serviceType || '').toString().replace(/\b\w/g, c => c.toUpperCase())}`.trim();
          return {
            id: j._id || j.reference || j.id,
            title,
            status,
            dateLabel,
            address,
            payment: paymentAmount,
            quotes,
            assignedTo
          };
        });
        setJobs(normalized);
      } catch (e) {
        setError('Failed to load jobs');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [activeTab, navigate]);

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
    return jobs.filter((job) => {
      const matchesQuery = !q || job.title.toLowerCase().includes(q) || (job.id || '').toLowerCase().includes(q) || (job.address || '').toLowerCase().includes(q);
      const tab = mapTab(job.status);
      const matchesTab = activeTab === 'all' || activeTab === tab;
      return matchesQuery && matchesTab;
    });
  }, [query, activeTab, jobs]);

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
              className="w-full pl-9 pr-3 py-2 sm:py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="p-2 sm:p-3 rounded-xl! bg-white border border-gray-200 cursor-pointer">
            <img src={CalendarIcon} alt="Calendar" className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto no-scrollbar">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-[8px]! text-sm font-medium whitespace-nowrap cursor-pointer ${
                activeTab === t.id ? 'bg-[#EBF2FD] text-[#1F6FEB]' : 'bg-white text-gray-600 border border-gray-200  focus:ring-primary-500'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Job Cards */}
        {loading && (
          <div className="text-sm text-gray-500">Loading jobs...</div>
        )}
        {(!loading && error) && (
          <div className="text-sm text-red-600">{error}</div>
        )}
        <div className="space-y-3">
          {filteredJobs.map((job) => (
            <div key={job.id} className="bg-white rounded-2xl border border-gray-200 shadow-custom p-4">
              <div className="flex items-start justify-between">
                <div className="text-[15px] text-primary-200 font-medium">{job.id}</div>
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


