import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  PlusCircle, 
  CheckCircle2, 
  CreditCard, 
  Info,
  Flame
} from 'lucide-react';
import { subscriptionsAPI } from '../../services/api';
import { Button, Loader, PageHeader } from '../../components';

const BuyCreditsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCreditPackages();
  }, []);

  const fetchCreditPackages = async () => {
    setLoading(true);
    try {
      const res = await subscriptionsAPI.getCredits();
      if (res.success) {
        setPackages(res.data);
        // Select the most popular package by default if available
        const popular = res.data.find(p => p.isPopular);
        if (popular) {
          setSelectedPackage(popular);
        } else if (res.data.length > 0) {
          setSelectedPackage(res.data[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching credit packages:', err);
      setError('Failed to load credit packages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg);
  };

  const handleCheckout = async () => {
    if (!selectedPackage) return;
    
    setCheckoutLoading(true);
    setError('');
    try {
      const res = await subscriptionsAPI.checkoutCredits(selectedPackage._id);
      if (res.success && res.url) {
        window.location.href = res.url; // Redirect to Stripe
      } else {
        setError('Failed to initiate checkout. Please try again.');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError('An error occurred during checkout.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader fullscreen message="Loading credit packages..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <div className="max-w-xl mx-auto px-4 sm:px-6">
        <PageHeader 
          title="My Subscription" 
          onBack={() => navigate(-1)} 
        />

        <div className="mt-8 mb-10">
          <h1 className="text-3xl font-black text-[#111111] mb-2 tracking-tight">Purchase More Credits</h1>
          <p className="text-gray-500 font-medium text-lg leading-relaxed">
            Continue responding to cleaning job leads by purchasing additional credits.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 flex items-center gap-2">
            <Info className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {packages.map((pkg) => (
            <div 
              key={pkg._id}
              onClick={() => handlePackageSelect(pkg)}
              className={`relative bg-white rounded-3xl p-6 border-2 transition-all cursor-pointer ${
                selectedPackage?._id === pkg._id 
                ? 'border-primary-500 shadow-xl shadow-primary-100 ring-4 ring-primary-50' 
                : 'border-transparent shadow-sm hover:border-gray-200 hover:shadow-md'
              }`}
            >
              {pkg.isPopular && (
                <div className="absolute top-0 right-6 -translate-y-1/2 bg-gradient-to-r from-orange-400 to-orange-500 text-white px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg shadow-orange-100">
                  <Flame className="w-4 h-4" />
                  <span className="text-xs font-black uppercase tracking-wider">Most Popular</span>
                </div>
              )}

              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">{pkg.credits} Credits</p>
                  <h3 className="text-4xl font-black text-[#111111] mb-2">
                    {formatCurrency(pkg.price)}
                  </h3>
                  <p className="text-sm font-bold text-gray-500 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-primary-500" />
                    {pkg.approxLeads}
                  </p>
                </div>

                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                  selectedPackage?._id === pkg._id 
                  ? 'border-primary-500 bg-primary-500' 
                  : 'border-gray-200'
                }`}>
                  {selectedPackage?._id === pkg._id ? (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  ) : (
                    <PlusCircle className="w-5 h-5 text-gray-300" />
                  )}
                </div>
              </div>
              
              <button 
                className={`mt-4 w-full py-3 rounded-2xl text-sm font-black transition-colors flex items-center justify-center gap-2 ${
                  selectedPackage?._id === pkg._id
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-primary-600 hover:bg-primary-50'
                }`}
              >
                <PlusCircle className="w-5 h-5" />
                Purchase Credits
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Action Button / Summary */}
      {selectedPackage && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-6 shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.05)] z-50 animate-in slide-in-from-bottom duration-500">
          <div className="max-w-xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Credit Package: <span className="text-[#111111]">{selectedPackage.credits} Credits</span></p>
              <p className="text-2xl font-black text-primary-500">{formatCurrency(selectedPackage.price)}</p>
            </div>
            <Button 
              className="h-16 px-12 rounded-2xl font-black text-lg shadow-xl shadow-primary-200 min-w-[240px]"
              onClick={handleCheckout}
              loading={checkoutLoading}
            >
              Continue & Pay
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyCreditsPage;
