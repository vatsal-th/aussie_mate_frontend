import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, ChevronRight, Loader2, Sparkles, Star } from 'lucide-react';
import { Button } from '../../components';
import { subscriptionsAPI } from '../../services/api';
import CardBG7 from '../../assets/CardBG7.png';

const SubscriptionSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    if (sessionId) {
      verifySubscription();
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  const verifySubscription = async () => {
    try {
      setLoading(true);
      // Even if we don't have a specific verify session API, 
      // fetching status will confirm if the subscription is active now
      const res = await subscriptionsAPI.getMyStatus().catch(() => ({ success: false }));
      
      if (res.success && res.data?.subscription?.status === 'active') {
        setSubscription(res.data);
      } else {
        // Fallback: stay on page but show generic success
        console.log('Subscription might still be processing');
      }
    } catch (err) {
      console.error('Error verifying subscription:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
        <p className="text-gray-600 font-bold text-lg animate-pulse">Verifying your subscription...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full animate-in fade-in zoom-in duration-500">
        <div className="relative bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100 p-8 text-center">
          {/* Decorative Background */}
          <div 
            className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none"
            style={{ backgroundImage: `url(${CardBG7})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat' }}
          />
          
          <div className="relative z-10">
            {/* Success Icon */}
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-100/50 animate-bounce">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>

            <h1 className="text-3xl font-black text-[#111111] mb-2 flex items-center justify-center gap-2">
              Subscription Active! <Sparkles className="w-6 h-6 text-yellow-500 fill-yellow-500" />
            </h1>
            
            <p className="text-gray-500 font-medium mb-8">
              Thank you! Your subscription has been activated successfully. You now have full access to cleaning leads.
            </p>

            {subscription && (
              <div className="bg-primary-50 rounded-3xl p-6 mb-8 border border-primary-100 text-left">
                <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest mb-3">PLAN DETAILS</p>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-xl font-black text-primary-700">{subscription.subscription?.planId?.name}</h3>
                    <p className="text-sm font-bold text-primary-500">Active until {new Date(subscription.subscription?.currentPeriodEnd).toLocaleDateString()}</p>
                  </div>
                  <div className="bg-white p-2 rounded-2xl shadow-sm">
                    <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-primary-600 bg-white/50 p-3 rounded-2xl">
                  <CheckCircle2 className="w-4 h-4" /> {subscription.availableCredits} Credits added to your account
                </div>
              </div>
            )}

            <div className="space-y-4">
              <Button 
                fullWidth 
                variant="primary" 
                className="rounded-2xl h-14 font-black text-lg shadow-xl shadow-primary-200"
                onClick={() => navigate('/cleaner-dashboard')}
              >
                Go to Dashboard
              </Button>
              <button 
                onClick={() => navigate('/cleaner-jobs')}
                className="flex items-center justify-center gap-2 text-primary-600 font-black text-sm hover:translate-x-1 transition-transform mx-auto py-2"
              >
                View Available Jobs <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        
        <p className="text-center mt-6 text-xs text-gray-400 font-bold uppercase tracking-widest">
          Secured by Stripe Payment Gateway
        </p>
      </div>
    </div>
  );
};

export default SubscriptionSuccessPage;
