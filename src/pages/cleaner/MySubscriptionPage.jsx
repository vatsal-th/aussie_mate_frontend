import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight, 
  CheckCircle2, 
  History as HistoryIcon, 
  CreditCard, 
  Info, 
  X,
  PlusCircle,
  Briefcase,
  TrendingUp,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import { subscriptionsAPI, categoriesAPI } from '../../services/api';
import { Button, Loader, PageHeader } from '../../components';
import { useAuth } from '../../contexts/AuthContext';
import CardBG7 from '../../assets/CardBG7.png'; // Using existing assets if possible

const MySubscriptionPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [activeSubscription, setActiveSubscription] = useState(null);
  const [history, setHistory] = useState([]);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [selectedPlanCategories, setSelectedPlanCategories] = useState([]);
  const [selectedPlanName, setSelectedPlanName] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch all plans
      const plansRes = await subscriptionsAPI.getPlans();
      if (plansRes.success) {
        setPlans(plansRes.data);
      }

      // Fetch my status
      const statusRes = await subscriptionsAPI.getMyStatus().catch(() => ({ success: false }));
      if (statusRes.success && statusRes.data?.subscription?.status === 'active') {
        setActiveSubscription(statusRes.data);
        
        // Fetch history if active subscription exists
        const historyRes = await subscriptionsAPI.getHistory().catch(() => ({ success: false }));
        if (historyRes.success) {
          setHistory(historyRes.data);
        }
      }
    } catch (err) {
      console.error('Error fetching subscription data:', err);
      setError('Failed to load subscription data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId) => {
    setLoading(true);
    try {
      const res = await subscriptionsAPI.checkoutPlan(planId);
      if (res.success && res.url) {
        window.location.href = res.url; // Redirect to Stripe
      } else {
        setError('Failed to initiate checkout. Please try again.');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError('An error occurred during checkout.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewCategories = async (plan) => {
    const categoryId = plan.includedCategories?.[0]?._id;
    if (!categoryId) return;

    setSelectedPlanName(plan.name);
    setShowCategoriesModal(true);
    setModalLoading(true);
    try {
      const res = await categoriesAPI.getServiceTypes(categoryId);
      if (res.success) {
        setSelectedPlanCategories(res.data);
      }
    } catch (err) {
      console.error('Error fetching service types:', err);
    } finally {
      setModalLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading && !plans.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader fullscreen message="Loading subscription details..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader 
          title={activeSubscription ? "Your Active Plan" : "My Subscription"} 
          onBack={() => navigate(-1)} 
        />

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-center gap-2">
            <Info className="w-5 h-5" />
            {error}
          </div>
        )}

        {activeSubscription ? (
          /* Active Subscription View */
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Out of Credits Alert */}
            {activeSubscription.availableCredits === 0 && (
              <div className="bg-white rounded-[32px] p-8 shadow-xl border border-gray-100 flex flex-col items-center text-center animate-in zoom-in duration-500">
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
                  <AlertTriangle className="w-10 h-10 text-red-500" />
                </div>
                <h3 className="text-2xl font-black text-[#111111] mb-2">You're out of credits!</h3>
                <p className="text-gray-500 font-medium max-w-xs mb-6">
                  You have used all your available credits. Purchase additional credits to continue responding to customer leads.
                </p>
                <Button 
                  onClick={() => navigate('/buy-credits')}
                  className="rounded-2xl h-14 px-10 font-black flex items-center gap-2"
                >
                  <PlusCircle className="w-5 h-5" />
                  Buy More Credits
                </Button>
              </div>
            )}

            {/* Active Plan Card */}
            <div className="relative bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 p-6 md:p-8">
              {/* Card Decoration */}
              <div 
                className="absolute top-0 right-0 w-48 h-48 opacity-10 pointer-events-none"
                style={{ backgroundImage: `url(${CardBG7})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat' }}
              />
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold mb-2">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> ACTIVE
                    </span>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-[#111111]">
                      {activeSubscription.subscription?.planId?.name}
                    </h2>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 font-medium">Monthly Cost</p>
                    <p className="text-2xl font-bold text-primary-500">
                      {formatCurrency(activeSubscription.subscription?.planId?.pricePerMonth || 0)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-primary-50 rounded-2xl p-4 border border-primary-100">
                    <p className="text-xs text-primary-600 font-bold uppercase tracking-wider mb-1">Available Credits</p>
                    <p className="text-2xl font-black text-primary-700">{activeSubscription.availableCredits}</p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Plan Period</p>
                    <p className="text-sm font-bold text-gray-700">
                      {formatDate(activeSubscription.subscription?.currentPeriodStart)} - {formatDate(activeSubscription.subscription?.currentPeriodEnd)}
                    </p>
                  </div>
                </div>

                {/* Credit Usage Progress Bar */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary-500" /> Credit Usage
                    </p>
                    <p className="text-sm font-medium text-gray-500">
                      {activeSubscription.extraCredits > 0
                        ? `${activeSubscription.availableCredits} Credits Available (${activeSubscription.extraCredits} Top-up)`
                        : `${activeSubscription.usedCredits || 0} of ${activeSubscription.planCredits || 0} used`
                      }
                    </p>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                    <div 
                      className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-1000"
                      style={{ 
                        width: `${Math.min(100, Math.max(0, ((activeSubscription?.usedCredits || 0) / (activeSubscription?.planCredits || 1)) * 100))}%` 
                      }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500 italic">
                    Estimated Leads Remaining: <span className="font-bold text-primary-600">{Math.floor(activeSubscription.availableCredits / (activeSubscription.subscription?.planId?.creditsPerLead || 1))} leads</span>
                  </p>
                  
                  <div className="mt-6 pt-6 border-t border-gray-50">
                    <button 
                      onClick={() => navigate('/buy-credits')}
                      className="text-primary-600 font-bold text-sm flex items-center gap-2 hover:translate-x-1 transition-transform"
                    >
                      <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                        <PlusCircle className="w-3.5 h-3.5 text-white" />
                      </div>
                      Buy Credits
                    </button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button 
                    fullWidth 
                    variant="primary" 
                    className="rounded-2xl h-14 font-bold text-lg shadow-lg shadow-primary-200"
                    onClick={() => navigate('/cleaner-jobs')}
                  >
                    Find Jobs
                  </Button>
                  <Button 
                    variant="outline" 
                    className="rounded-2xl h-14 px-6 border-2"
                    icon={<PlusCircle className="w-6 h-6" />}
                    onClick={() => navigate('/buy-credits')} 
                  >
                    Buy Credits
                  </Button>
                </div>
              </div>
            </div>

            {/* Lead Usage History */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <HistoryIcon className="w-5 h-5 text-primary-500" /> Lead Usage History
                </h3>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Recent Activity</span>
              </div>
              
              <div className="divide-y divide-gray-50">
                {history.length > 0 ? (
                  history.map((item, idx) => (
                    <div key={item._id || idx} className="p-5 hover:bg-gray-50 transition-colors flex justify-between items-center">
                      <div className="flex gap-4 items-center">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500">
                          <Briefcase className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800 mb-0.5">{item.description}</p>
                          <p className="text-xs text-gray-500 font-medium">#{typeof item.jobId === 'object' ? item.jobId?.jobId : (item.jobId || 'N/A')} • {formatDate(item.createdAt)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-black ${item.type === 'credit' ? 'text-green-500' : 'text-red-500'}`}>
                          {item.type === 'credit' ? '+' : '-'}{Math.abs(item.amount)}
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Credits</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-gray-200">
                      <HistoryIcon className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-bold text-lg">No Lead Activity Yet</p>
                    <p className="text-gray-400 text-sm max-w-xs mx-auto mt-1">Your lead activity will appear here once you start responding to customer jobs.</p>
                  </div>
                )}
              </div>
              {history.length > 0 && (
                <div className="p-4 border-t border-gray-50 text-center">
                  <button className="text-primary-600 font-bold text-sm hover:underline flex items-center gap-1 mx-auto">
                    View Full History <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* "No Subscription" Plan Selection View */
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Why Subscribe Section */}
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-black text-[#111111] mb-2">Get Cleaning Leads</h2>
              <p className="text-gray-500 font-medium text-lg leading-relaxed mb-8">
                Subscribe to access verified customer jobs in your service categories.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Get direct job leads from customers",
                  "Chat with customers instantly if you're among the first 3 applicants",
                  "Secure verified leads only",
                  "Flexible credit usage for multiple jobs"
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-primary-600" />
                    </div>
                    <p className="text-sm font-bold text-gray-700">{feature}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Plans List */}
            <div className="space-y-6">
              {plans.map((plan) => (
                <div 
                  key={plan._id} 
                  className="relative bg-white rounded-[32px] p-6 md:p-8 shadow-xl border-2 border-transparent hover:border-primary-300 transition-all group overflow-hidden"
                >
                  {/* Glassmorphism gradient effect */}
                  <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl" />
                  
                  <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
                      <div>
                        <h4 className="text-lg font-black text-gray-400 uppercase tracking-widest mb-1">{plan.name}</h4>
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-black text-[#111111]">{formatCurrency(plan.pricePerMonth)}</span>
                          <span className="text-gray-400 font-bold mb-1">/ month</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="bg-orange-50 text-orange-600 px-4 py-2 rounded-2xl border border-orange-100 flex flex-col items-center justify-center min-w-[100px]">
                          <span className="text-[10px] font-black uppercase tracking-wider mb-0.5 opcity-70">Duration</span>
                          <span className="text-sm font-black">{plan.durationMonths} Month Contract</span>
                        </div>
                        <div className="bg-primary-50 text-primary-600 px-4 py-2 rounded-2xl border border-primary-100 flex flex-col items-center justify-center min-w-[100px]">
                          <span className="text-[10px] font-black uppercase tracking-wider mb-0.5 opacity-70">Credits</span>
                          <span className="text-sm font-black">{plan.creditsPerMonth} Credits</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 mb-8">
                      <div className="flex items-center gap-2 text-gray-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                        <p className="text-sm font-bold">{plan.creditsPerLead} credits per lead</p>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                        <p className="text-sm font-bold">Approx. {plan.approxLeads}</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button 
                        fullWidth 
                        variant="primary" 
                        className="rounded-2xl h-14 font-black text-lg shadow-lg group-hover:scale-[1.02] transition-transform active:scale-95"
                        onClick={() => handleSubscribe(plan._id)}
                      >
                        Subscribe to {plan.name.split(' ')[0]} Plan
                      </Button>
                      <button 
                        onClick={() => handleViewCategories(plan)}
                        className="flex items-center justify-center gap-2 text-primary-600 font-black text-sm hover:translate-x-1 transition-transform cursor-pointer h-14"
                      >
                        View Included Categories <ChevronRight className="w-5 h-5 text-primary-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Categories Modal */}
        {showCategoriesModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-100">
              <div className="p-6 md:p-8 flex justify-between items-center border-b border-gray-50">
                <div>
                  <h3 className="text-2xl font-black text-[#111111]">{selectedPlanName}</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Included Services</p>
                </div>
                <button 
                  onClick={() => setShowCategoriesModal(false)}
                  className="p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-800"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 md:p-8 max-h-[60vh] overflow-y-auto">
                {modalLoading ? (
                  <div className="py-20 flex justify-center">
                    <Loader message="Loading service types..." />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {selectedPlanCategories.map((type, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-primary-50 hover:border-primary-100 transition-all group"
                      >
                        <div className="w-3 h-3 rounded-full bg-primary-200 group-hover:bg-primary-500 mr-4 transition-colors" />
                        <span className="text-gray-800 font-bold text-lg">{type.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="p-6 md:p-8 bg-gray-50/50 flex justify-center">
                <Button 
                  onClick={() => setShowCategoriesModal(false)} 
                  variant="ghost" 
                  className="text-gray-500 font-black hover:text-gray-800"
                >
                  Close Categories
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MySubscriptionPage;
