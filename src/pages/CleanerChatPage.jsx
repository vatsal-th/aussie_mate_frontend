import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import ArrowLeftIcon from '../assets/arrow-left.svg';
import InfoIcon from '../assets/info.svg';
import SendIcon from '../assets/sendChat.svg';
import { jobsAPI } from '../services/api';

const CleanerChatPage = () => {
    const navigate = useNavigate();
    const { jobId } = useParams();
    const [job, setJob] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [quoteAmount, setQuoteAmount] = useState('');
    const [isNegotiable, setIsNegotiable] = useState(false);
    const [showQuoteSummary, setShowQuoteSummary] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const fetchJobDetails = async () => {
            try {
                setLoading(true);
                setError('');

                const response = await jobsAPI.getJobById(jobId);

                if (response.success && response.data) {
                    const jobData = response.data;
                    setJob(jobData);

                    // Initialize with sample messages for demo
                    setMessages([
                        {
                            id: 1,
                            sender: 'cleaner',
                            message: "Hi, I can complete the job for $140. I'll bring my own cleaning kit.",
                            timestamp: new Date(Date.now() - 3600000), // 1 hour ago
                            time: '9:00 am'
                        },
                        {
                            id: 2,
                            sender: 'customer',
                            message: "Do you also do carpet cleaning?",
                            timestamp: new Date(Date.now() - 3240000), // 54 minutes ago
                            time: '9:06 am'
                        },
                        {
                            id: 3,
                            sender: 'cleaner',
                            message: "Yes, for an extra $30.",
                            timestamp: new Date(Date.now() - 3180000), // 53 minutes ago
                            time: '9:07 am'
                        }
                    ]);
                } else {
                    setError('Job not found');
                }
            } catch (err) {
                console.error('Error fetching job details:', err);
                setError('Failed to load job details');
            } finally {
                setLoading(false);
            }
        };

        if (jobId) {
            fetchJobDetails();
        }
    }, [jobId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = () => {
        if (newMessage.trim()) {
            const message = {
                id: messages.length + 1,
                sender: 'cleaner',
                message: newMessage.trim(),
                timestamp: new Date(),
                time: new Date().toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                }).toLowerCase()
            };

            setMessages([...messages, message]);
            setNewMessage('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleSendQuote = () => {
        if (quoteAmount.trim()) {
            const quoteMessage = {
                id: messages.length + 1,
                sender: 'cleaner',
                message: `I'm sending you a quote for $${quoteAmount}${isNegotiable ? ' (negotiable)' : ''}.`,
                timestamp: new Date(),
                time: new Date().toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                }).toLowerCase(),
                isQuote: true
            };

            setMessages([...messages, quoteMessage]);
            setShowQuoteSummary(false);
            setQuoteAmount('');
        }
    };

    const getJobTitle = (job) => {
        if (!job) return 'Job Chat';
        const serviceType = job.serviceType?.charAt(0).toUpperCase() + job.serviceType?.slice(1) || 'Service';
        const propertyType = job.propertyType?.charAt(0).toUpperCase() + job.propertyType?.slice(1) || 'Property';
        return `${serviceType} - ${job.bedrooms || 0} Bedroom ${propertyType}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="max-w-sm mx-auto min-h-screen sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl">
                    <div className="p-4 sm:p-6 lg:p-8">
                        <div className="animate-pulse space-y-4">
                            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-16 bg-gray-200 rounded"></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="max-w-sm mx-auto min-h-screen sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl">
                    <div className="p-4 sm:p-6 lg:p-8">
                        <div className="text-center py-8">
                            <div className="text-red-500 text-lg font-medium">{error || 'Job not found'}</div>
                            <button
                                onClick={() => navigate(-1)}
                                className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                            >
                                Go Back
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <Header />

            {/* Chat Header */}
            <div className="max-w-6xl mx-auto py-4">
                <div className="flex items-center justify-between ">
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                        >
                            <img src={ArrowLeftIcon} alt="Back" className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-lg font-semibold text-primary-500 truncate">
                                {getJobTitle(job)}
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 bg-white rounded-2xl shadow-custom py-4">
                {/* Safety Banner */}
                <div className="bg-[#F9FAFB] px-4 py-3 sm:px-6 rounded-xl border border-[#E5E7EB] max-w-lg mx-auto">
                    <div className="flex items-center space-x-2">
                        <img src={InfoIcon} alt="Info" className="w-4 h-4 flex-shrink-0" />
                        <p className="text-xs text-primary-200 font-medium">
                            For safety, phone numbers and emails are hidden until booking. Please chat only through Aussie Mate.
                        </p>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
                    <div className="space-y-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.sender === 'cleaner' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-xs sm:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl font-medium ${message.sender === 'cleaner'
                                            ? 'bg-[#F9FAFB] text-primary-500 border border-[#E5E7EB]'
                                            : 'bg-[#EBF2FD] text-primary-500 '
                                        }`}
                                >
                                    <p className="text-sm">{message.message}</p>
                                    <p className={`text-xs mt-1 ${message.sender === 'cleaner' ? 'text-primary-200' : 'text-primary-200'
                                        }`}>
                                        {message.time}
                                    </p>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Message Input */}
                <div className="bg-white px-4 py-3 sm:px-6">
                    <div className="flex items-center space-x-3">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Message..."
                            className="flex-1 px-4 py-3 rounded-full text-sm focus:outline-none bg-[#F9FAFB] border border-[#E5E7EB] shadow-custom"
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim()}
                            className=" cursor-pointer"
                        >
                            <img src={SendIcon} alt="Send" className="w-10 h-10" />
                        </button>
                    </div>
                </div>
                 {/* Toggle and Quote Summary */}
                 <div className="bg-white px-4 py-4 sm:px-6 border-t border-gray-200">
                     {/* Toggle Section */}
                     <div className="flex items-center justify-between mb-4">
                         <h3 className="text-lg font-semibold text-primary-500">Quote Summary</h3>
                         <div className="flex items-center space-x-2">
                             <span className="text-sm text-primary-500 font-medium ">Is Negotiable?</span>
                             <button
                                 onClick={() => setIsNegotiable(!isNegotiable)}
                                 className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${isNegotiable ? 'bg-primary-500' : 'bg-gray-300'
                                     }`}
                             >
                                 <span
                                     className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isNegotiable ? 'translate-x-6' : 'translate-x-1'
                                         }`}
                                 />
                             </button>
                         </div>
                     </div>

                     {/* Quote Summary - Only show when toggle is ON */}
                     {isNegotiable && (
                         <div className="space-y-4">
                             <div>
                                 <p className="text-sm text-gray-600 mb-2">Customer's Budget: <span className="font-semibold text-primary-500">${job.estimatedPrice || job.budget || 'Not specified'}</span></p>
                                 <div className="flex items-center space-x-2">
                                     <span className="text-sm text-gray-600">Your Quote:</span>
                                     <input
                                         type="number"
                                         value={quoteAmount}
                                         onChange={(e) => setQuoteAmount(e.target.value)}
                                         placeholder="Enter amount"
                                         className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                     />
                                 </div>
                             </div>

                             <div className="flex space-x-3">
                                 <button
                                     onClick={() => {
                                         setIsNegotiable(false);
                                         setQuoteAmount('');
                                     }}
                                     className="flex-1 px-4 py-2 text-red-500 border border-red-500 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                                 >
                                     Cancel
                                 </button>
                                 <button
                                     onClick={handleSendQuote}
                                     disabled={!quoteAmount.trim()}
                                     className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                 >
                                     Send Quote
                                 </button>
                             </div>
                         </div>
                     )}
                 </div>
            </div>
        </div>
    );
};

export default CleanerChatPage;
