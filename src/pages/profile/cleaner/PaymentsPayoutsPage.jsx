import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle, Loader2, XCircle } from 'lucide-react';
import { Button, PageHeader } from '../../../components';
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
        <>
            <div className="mx-auto w-full max-w-2xl px-3 sm:px-4 py-4 sm:py-6">
                <PageHeader
                    title="Payments & Payouts"
                    onBack={() => navigate(-1)}
                    className="mb-4 sm:mb-6"
                    titleClassName="text-base sm:text-lg md:text-xl font-semibold text-primary-500"
                />

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
                        <div>
                            <h4 className="text-sm font-medium text-red-800">Error</h4>
                            <p className="text-sm text-red-600 mt-1">{error}</p>
                        </div>
                    </div>
                )}

                {/* Success Message */}
                {successMessage && (
                    <div className="mb-4 p-4 rounded-xl bg-green-50 border border-green-200 flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
                        <div>
                            <h4 className="text-sm font-medium text-green-800">Success</h4>
                            <p className="text-sm text-green-600 mt-1">{successMessage}</p>
                        </div>
                    </div>
                )}

                {/* Backend Status Warning */}
                {backendStatus === 'offline' && (
                    <div className="mb-4 p-4 rounded-xl bg-yellow-50 border border-yellow-200 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
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
                        <Loader2 className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5 animate-spin" strokeWidth={2} />
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
        </>
    );
};

export default PaymentsPayoutsPage;
