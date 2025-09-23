import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import ArrowLeftIcon from '../assets/arrow-left.svg';
import { userAPI } from '../services/api';

const PaymentsPayoutsPage = () => {
    const navigate = useNavigate();
    const [selectedMethod, setSelectedMethod] = useState('bank_transfer');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
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

                {/* Error/Success Message */}
                {error && (
                    <div className={`mb-4 p-3 rounded-xl ${
                        error.includes('successfully') 
                            ? 'bg-[#E4FBED] border border-[#DBF9E7]' 
                            : 'bg-[#FFE4E4] border border-[#FFDDDD]'
                    }`}>
                        <p className={`text-sm font-medium ${
                            error.includes('successfully') 
                                ? 'text-[#1EB154]' 
                                : 'text-[#EF4444]'
                        }`}>{error}</p>
                        {!error.includes('successfully') && (
                            <button 
                                onClick={() => setError('')}
                                className="text-[#EF4444] text-xs underline mt-1"
                            >
                                Retry
                            </button>
                        )}
                    </div>
                )}

                <div className="space-y-4 sm:space-y-6">
                    {/* Your Active Payout Method */}
                    <div>
                        <h2 className="text-sm sm:text-base font-semibold text-primary-500 mb-3 sm:mb-4">Your Active Payout Method</h2>
                        
                        <div className="bg-white rounded-2xl border border-[#F3F3F3] p-3 sm:p-4 md:p-5">
                            <div className="text-xs text-primary-200 font-medium mb-2">{payoutData.activeMethod.type}</div>
                            
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-base sm:text-lg font-semibold text-primary-500">{payoutData.activeMethod.bankName}</h3>
                                <span className="bg-[#E4FBED] text-[#1EB154] border border-[#DBF9E7] px-2 py-1 rounded-full text-xs font-medium">
                                    {payoutData.activeMethod.status}
                                </span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <div className="text-xs text-primary-500 font-semibold mb-1">BSB</div>
                                    <div className="text-sm font-medium text-primary-200">{payoutData.activeMethod.bsb}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-primary-500 font-semibold mb-1">Account Number</div>
                                    <div className="text-sm font-medium text-primary-200">{payoutData.activeMethod.accountNumber}</div>
                                </div>
                            </div>
                            
                            <button className="text-[#1F6FEB] text-sm font-medium underline">
                                Update Bank Details
                            </button>
                        </div>
                    </div>

                    {/* Payout Method Options */}
                    <div>
                        <h2 className="text-sm sm:text-base font-semibold text-primary-500 mb-3 sm:mb-4">Payout Method</h2>
                        
                        <div className="space-y-2">
                            {payoutMethods.map((method) => (
                                <div key={method.id} className="bg-white rounded-2xl border border-[#F3F3F3] p-3 sm:p-4 cursor-pointer">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="payoutMethod"
                                            value={method.id}
                                            checked={selectedMethod === method.id}
                                            onChange={(e) => setSelectedMethod(e.target.value)}
                                            className="w-4 h-4 text-[#1F6FEB] border-2 border-gray-300 focus:ring-[#1F6FEB]"
                                            style={{
                                                accentColor: '#1F6FEB'
                                            }}
                                        />
                                        <span className="text-sm sm:text-base font-medium text-primary-500">{method.label}</span>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Payout History */}
                    <div>
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <h2 className="text-sm sm:text-base font-semibold text-primary-500">Payout History</h2>
                            <button className="text-[#1F6FEB] text-sm font-semibold cursor-pointer">
                                View All
                            </button>
                        </div>
                        
                        <div className="space-y-2">
                            {payoutData.payoutHistory.map((payout) => (
                                <div key={payout.id} className="bg-white rounded-2xl border border-[#F3F3F3] p-3 sm:p-4 cursor-pointer">
                                        <div className="text-sm text-primary-200 font-medium">{payout.date}</div>
                                        <div className="text-base sm:text-xl font-semibold text-primary-500">{payout.amount}</div>
                                    <div className="text-sm text-primary-200 font-medium">{payout.description}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-primary-500 text-white font-medium py-3 sm:py-2 px-16  rounded-xl hover:bg-primary-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
                    >
                            {loading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentsPayoutsPage;
