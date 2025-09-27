import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import ArrowLeftIcon from '../assets/arrow-left.svg';
import InfoIcon from '../assets/info.svg';
import MessageIcon from '../assets/sendChat.svg';
import UserIcon from '../assets/user.svg';

const CustomerChatPage = () => {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const [searchParams] = useSearchParams();
  const cleanerId = searchParams.get('cleaner');
  
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'cleaner',
      message: "Hi, I can complete the job for $140. I'll bring my own cleaning kit.",
      timestamp: '9:00am',
      avatar: '🔒'
    },
    {
      id: 2,
      sender: 'user',
      message: "Do you also do carpet cleaning?",
      timestamp: '9:06am'
    },
    {
      id: 3,
      sender: 'cleaner',
      message: "Yes, for an extra $30.",
      timestamp: '9:07am',
      avatar: '🔒'
    }
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const [quoteData, setQuoteData] = useState({
    baseQuote: 140,
    addons: [
      { name: 'Carpet Cleaning', price: 30, selected: true }
    ],
    total: 170
  });
  
  const messagesEndRef = useRef(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: messages.length + 1,
        sender: 'user',
        message: newMessage.trim(),
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };
  
  const handleRejectQuote = () => {
    // Handle quote rejection
    console.log('Quote rejected');
    navigate(`/customer-job-details/${jobId}`);
  };
  
  const handleAcceptQuote = () => {
    // Handle quote acceptance and booking
    console.log('Quote accepted');
    navigate(`/booking-confirmation/${jobId}`);
  };
  
  const toggleAddon = (index) => {
    const updatedAddons = [...quoteData.addons];
    updatedAddons[index].selected = !updatedAddons[index].selected;
    
    const selectedAddons = updatedAddons.filter(addon => addon.selected);
    const totalAddonPrice = selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
    
    setQuoteData({
      ...quoteData,
      addons: updatedAddons,
      total: quoteData.baseQuote + totalAddonPrice
    });
  };
  
  return (
    <div className="min-h-screen! bg-gray-50">
      <Header />
      
      {/* Chat Header */}
      <div className="max-w-sm mx-auto sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl py-2 sm:py-3 px-3 sm:px-4 flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="mr-2 sm:mr-3 p-1 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <img src={ArrowLeftIcon} alt="Back" className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <h1 className="text-base sm:text-lg font-semibold text-gray-900">
          Cleaner #{cleanerId || '1047'}
        </h1>
      </div>
      
      <div className="max-w-sm mx-auto sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl bg-white rounded-xl shadow-custom pt-1 overflow-x-hidden">
      {/* Safety Banner */}
      <div className="bg-[#F9FAFB] px-3 sm:px-4 py-2 sm:py-3 mx-3 sm:mx-4 mt-3 sm:mt-4 rounded-2xl shadow-custom border border-[#E5E7EB]">
        <div className="flex items-start space-x-2 sm:space-x-3">
          <img src={InfoIcon} alt="Info" className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" />
          <p className="text-xs sm:text-sm text-primary-200 font-medium leading-relaxed">
            For safety, phone numbers and emails are hidden until booking. Please chat only through Aussie Mate.
          </p>
        </div>
      </div>
      
      {/* Chat Messages */}
      <div className="flex-1 px-3 sm:px-6 py-3 sm:py-4 space-y-3 sm:space-y-4 overflow-y-auto">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-2 max-w-[280px] sm:max-w-xs md:max-w-md ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              {/* Avatar */}
              {msg.sender === 'cleaner' && (
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  {msg.avatar === '🔒' ? (
                    <img src={UserIcon} alt="Cleaner" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  ) : (
                    <span className="text-xs">{msg.avatar}</span>
                  )}
                </div>
              )}
              
              {/* Message Bubble */}
              <div className="flex flex-col">
                <div
                  className={`px-2.5 sm:px-3 py-2 sm:py-3 rounded-2xl text-primary-500 font-medium ${
                    msg.sender === 'user'
                      ? 'bg-white border border-gray-200'
                      : 'bg-[#EBF2FD]'
                  }`}
                >
                  <p className="text-xs sm:text-sm text-gray-800 leading-relaxed">{msg.message}</p>
                </div>
                <span className="text-xs text-gray-500 mt-1">
                  {msg.sender === 'user' ? '' : ''}{msg.timestamp}
                </span>
              </div>
              
              {/* User Avatar */}
              {msg.sender === 'user' && (
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <img src={UserIcon} alt="You" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message Input */}
      <div className="bg-white py-2 sm:py-3 px-3 sm:px-6">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Message..."
            className="flex-1 px-3 py-2 border border-[#E5E7EB] rounded-lg text-xs sm:text-sm focus:outline-none focus:border-blue-500 shadow-custom bg-[#F9FAFB]"
          />
          <button
            onClick={handleSendMessage}
            className="cursor-pointer p-1 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <img src={MessageIcon} alt="Send" className="w-8 h-8 sm:w-10 sm:h-10" />
          </button>
        </div>
      </div>
      
      {/* Quote Summary */}
      <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-[#E5E7EB] rounded-t-4xl bg-[#F9FAFB]">
        <h3 className="text-base sm:text-lg font-semibold text-primary-500 mb-2 sm:mb-3">Quote Summary</h3>
        
        {/* Base Quote */}
        <div className="flex items-center py-1 sm:py-2 space-x-2">
          <span className="text-xs sm:text-sm text-primary-200 font-medium">Base Quote:</span>
          <span className="text-xs sm:text-sm font-bold text-primary-500">${quoteData.baseQuote}</span>
        </div>
        
        {/* Add-ons */}
        {quoteData.addons.map((addon, index) => (
          <div key={index} className="flex justify-between items-center py-1">
            <span className="text-xs sm:text-sm text-primary-200 font-medium">Add-on: +$ <span className="text-[#1F6FEB] font-bold">{addon.price}</span> ({addon.name})</span>
          </div>
        ))}
        
        {/* Total */}
        <div className="border-t border-gray-200 pt-2 mt-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm sm:text-base font-semibold text-gray-900">Total:</span>
            <span className="text-base sm:text-lg font-bold text-blue-600">${quoteData.total}</span>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-3 sm:mt-4">
          <button
            onClick={handleRejectQuote}
            className="flex-1 py-2 sm:py-2.5 px-3 sm:px-4 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-xs sm:text-sm font-medium cursor-pointer"
          >
            Reject Quote
          </button>
          <button
            onClick={handleAcceptQuote}
            className="flex-1 py-2 sm:py-2.5 px-3 sm:px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-xs sm:text-sm font-medium cursor-pointer"
          >
            Accept Quote & Book
          </button>
        </div>
      </div>
      </div>
    </div>
  );
};

export default CustomerChatPage;
