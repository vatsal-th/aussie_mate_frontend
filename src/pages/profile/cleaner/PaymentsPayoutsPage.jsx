import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/Header';
import Button from '../../../components/Button';
import ArrowLeftIcon from '../../../assets/arrow-left.svg';
import { userAPI } from '../../../services/api';
import { paymentService, handlePaymentError } from '../../../services/paymentService';


const PaymentsPayoutsPage = () => {
    const navigate = useNavigate();
    const [selectedMethod, setSelectedMethod] = useState('bank_transfer');
    const [loading, setLoading] = useState(false);
    const [stripeLoading, setStripeLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [stripeAccountStatus, setStripeAccountStatus] = useState(null);
    const [backendStatus, setBackendStatus] = useState('checking');
    const [payoutData, setPayoutData] = useState({
        activeMethod: {
            type: 'BANK TRANSFER',
            bankName: 'Commonwealth Bank',
            status: 'Verified',
            bsb: '062-000',
            accountNumber: '....5678'
        },
        payoutHistory: [
            {
                id: 1,
                date: 'Aug 28, 2025',
                amount: '$220.00',
                description: 'Paid to Commonwealth Bank ....5678',
                status: 'completed'
            },
            {
                id: 2,
                date: 'Aug 21, 2025',
                amount: '$120.00',
                description: 'Paid via PayID',
                status: 'completed'
            }
        ]
    });

    const payoutMethods = [
        { id: 'bank_transfer', label: 'Bank Transfer' },
        { id: 'stripe_instant', label: 'Stripe Instant Payout' },
        { id: 'payid', label: 'PayID' }
    ];

    // Check Stripe account status
    const checkStripeStatus = async () => {
        try {
            setBackendStatus('checking');
            const response = await paymentService.getStripeAccountStatus();
            
            if (response.success && response.data) {
                setStripeAccountStatus(response.data);
                setBackendStatus('online');
            } else {
                setStripeAccountStatus(null);
                setBackendStatus('online');
            }
        } catch (err) {
            console.error('Error checking Stripe status:', err);
            setStripeAccountStatus(null);
            
            // Check if backend is offline
            if (err.message?.includes('Failed to fetch') || err.message?.includes('Network')) {
                setBackendStatus('offline');
            } else {
                setBackendStatus('online');
            }
        }
    };

    // Check Stripe account status on component mount and when returning from Stripe
    useEffect(() => {
        checkStripeStatus();
        
        const handleStripeUpdate = () => {
            checkStripeStatus();
        };
        
        window.addEventListener('stripeAccountUpdated', handleStripeUpdate);
        
        return () => {
            window.removeEventListener('stripeAccountUpdated', handleStripeUpdate);
        };
    }, []);

    // Handle Stripe Connect account creation
    const handleStripeConnect = async () => {
        try {
            setStripeLoading(true);
            setError('');
            setSuccessMessage('');

            const response = await paymentService.createStripeConnectAccount();

            if (response.success && response.data.onboardingUrl) {
                setSuccessMessage('Redirecting to Stripe setup...');
                // Redirect to Stripe onboarding
                window.location.href = response.data.onboardingUrl;
            }
        } catch (err) {
            console.error('Stripe Connect error:', err);
            setError(handlePaymentError(err));
        } finally {
            setStripeLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            setError('');
            
            // Update payout method
            await userAPI.updatePayoutMethod({ method: selectedMethod });
            
            setError('Settings saved successfully!');
            setTimeout(() => setError(''), 3000);
        } catch (error) {
            console.error('Error saving payout settings:', error);
            setError('Failed to save settings. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="mx-auto w-full max-w-2xl px-3 sm:px-4 py-4 sm:py-6">
                {/* Page title with back */}
                <div className="mb-4 sm:mb-6 flex items-center gap-2">
                    <button onClick={() => navigate(-1)} className="p-1 -ml-1 cursor-pointer">
                        <img src={ArrowLeftIcon} alt="Back" className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <h1 className="text-base sm:text-lg md:text-xl font-semibold text-primary-500">Payments & Payouts</h1>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                        <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <h4 className="text-sm font-medium text-red-800">Error</h4>
                            <p className="text-sm text-red-600 mt-1">{error}</p>
                        </div>
                    </div>
                )}

                {/* Success Message */}
                {successMessage && (
                    <div className="mb-4 p-4 rounded-xl bg-green-50 border border-green-200 flex items-start gap-3">
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <h4 className="text-sm font-medium text-green-800">Success</h4>
                            <p className="text-sm text-green-600 mt-1">{successMessage}</p>
                        </div>
                    </div>
                )}

                {/* Backend Status Warning */}
                {backendStatus === 'offline' && (
                    <div className="mb-4 p-4 rounded-xl bg-yellow-50 border border-yellow-200 flex items-start gap-3">
                        <svg className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <h4 className="text-sm font-medium text-yellow-800">Backend API Not Available</h4>
                            <p className="text-sm text-yellow-600 mt-1">
                                Payment backend is not running. Start your backend server on <code className="bg-yellow-100 px-1 rounded">localhost:3000</code> to enable Stripe Connect setup.
                            </p>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {backendStatus === 'checking' && (
                    <div className="mb-4 p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-3">
                        <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <div>
                            <h4 className="text-sm font-medium text-blue-800">Checking Backend Status</h4>
                            <p className="text-sm text-blue-600 mt-1">Connecting to payment backend...</p>
                        </div>
                    </div>
                )}

                {/* Stripe Connect Setup Card */}
                <div className="bg-gradient-to-br from-[#635BFF] to-[#0A2540] rounded-2xl p-6 mb-6 text-white shadow-lg">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                            <svg className="w-12 h-12" viewBox="0 0 60 25" fill="white">
                                <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V5.57h3.76l.08 1.02a4.7 4.7 0 0 1 3.23-1.29c2.9 0 5.62 2.6 5.62 7.4 0 5.23-2.7 7.6-5.65 7.6zM40 8.95c-.95 0-1.54.34-1.97.81l.02 6.12c.4.44.98.78 1.95.78 1.52 0 2.54-1.65 2.54-3.87 0-2.15-1.04-3.84-2.54-3.84zM28.24 5.57h4.13v14.44h-4.13V5.57zm0-4.7L32.37 0v3.36l-4.13.88V.88zm-4.32 9.35v9.79H19.8V5.57h3.7l.12 1.22c1-1.77 3.07-1.41 3.62-1.22v3.79c-.52-.17-2.29-.43-3.32.86zm-8.55 4.72c0 2.43 2.6 1.68 3.12 1.46v3.36c-.55.3-1.54.54-2.89.54a4.15 4.15 0 0 1-4.27-4.24l.01-13.17 4.02-.86v3.54h3.14V9.1h-3.13v5.85zm-4.91.7c0 2.97-2.31 4.66-5.73 4.66a11.2 11.2 0 0 1-4.46-.93v-3.93c1.38.75 3.1 1.31 4.46 1.31.92 0 1.53-.24 1.53-1C6.26 13.77 0 14.51 0 9.95 0 7.04 2.28 5.3 5.62 5.3c1.36 0 2.72.2 4.09.75v3.88a9.23 9.23 0 0 0-4.1-1.06c-.86 0-1.44.25-1.44.9 0 1.85 6.29.97 6.29 5.88z"/>
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-bold mb-2">
                                {stripeAccountStatus?.status === 'active' 
                                    ? '✅ Stripe Account Active'
                                    : '🚀 Connect Your Stripe Account'}
                            </h2>
                            <p className="text-sm text-white/90 mb-4">
                                {stripeAccountStatus?.status === 'active'
                                    ? 'Your Stripe account is verified and ready to receive payments. Customers can now book and pay for your services!'
                                    : 'Set up your Stripe account to receive instant payments from customers. Required to accept online payments for your services.'}
                            </p>
                            
                            {stripeAccountStatus?.status === 'active' ? (
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="bg-primary-500 text-white px-3 py-1 rounded-full">
                                        ✓ Charges: {stripeAccountStatus.chargesEnabled ? 'Enabled' : 'Disabled'}
                                    </span>
                                    <span className="bg-white/20 px-3 py-1 rounded-full">
                                        ✓ Payouts: {stripeAccountStatus.payoutsEnabled ? 'Enabled' : 'Disabled'}
                                    </span>
                                </div>
                            ) : (
                                <Button
                                    onClick={handleStripeConnect}
                                    loading={stripeLoading}
                                    disabled={stripeLoading || backendStatus === 'offline'}
                                    className="bg-white text-[#635BFF] hover:bg-white/90 font-semibold border-2 border-white"
                                    size="md"
                                >
                                    {stripeLoading ? 'Connecting...' : 'Connect Stripe Account'}
                                </Button>
                            )}
                        </div>
                    </div>
                    
                    {!stripeAccountStatus && (
                        <div className="mt-4 pt-4 border-t border-white/20">
                            <div className="text-xs text-white/80 space-y-1">
                                <p>✓ Instant payment transfers</p>
                                <p>✓ Secure and PCI compliant</p>
                                <p>✓ Auto-deduct 10% admin commission</p>
                                <p>✓ Track earnings in real-time</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentsPayoutsPage;
