import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import ConfirmationModal from '../components/ConfirmationModal';
import ArrowLeftIcon from '../assets/arrow-left.svg';
import InfoIcon from '../assets/info.svg';
import MessageIcon from '../assets/sendChat.svg';
import UserIcon from '../assets/user.svg';
import { jobsAPI, quotesAPI } from '../services/api';
import { chatAPI } from '../services/chatAPI';
import { socketService } from '../services/socketService';

const CustomerChatPage = () => {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const [searchParams] = useSearchParams();
  const cleanerId = searchParams.get('cleaner');
  
  
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [currentChatRoom, setCurrentChatRoom] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [newMessage, setNewMessage] = useState('');
  const [quoteData, setQuoteData] = useState({
    baseQuote: 0,
    addons: [],
    total: 0
  });
  
  // Reject quote modal states
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  
  const messagesEndRef = useRef(null);

  // Initialize Socket Connection and User Data
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token) {
      setError('Authentication required');
      navigate('/login');
      return;
    }

    setCurrentUser(user);
    
    // Connect to socket
    socketService.connect(token);

    // Socket event listeners
    socketService.on('connectionStatus', setIsConnected);
    socketService.on('chatJoined', (data) => {
      setCurrentChatRoom(data);
    });
     socketService.on('chatHistory', (historyMessages) => {
       if (historyMessages && historyMessages.length > 0) {
         // Remove duplicates from chat history
         const uniqueMessages = historyMessages.filter((msg, index, self) => 
           index === self.findIndex(m => 
             (m._id && m._id === msg._id) || 
             (m.id && m.id === msg.id) ||
             (m.content === msg.content && m.timestamp === msg.timestamp)
           )
         );
         setMessages(uniqueMessages);
       } else {
         // No history - start with empty messages
         setMessages([]);
       }
       setLoading(false);
     });
     socketService.on('newMessage', (message) => {
       setMessages(prev => {
         // Check if message already exists to prevent duplicates
         const messageExists = prev.some(msg => 
           (msg._id && msg._id === message._id) || 
           (msg.id && msg.id === message.id) ||
           (msg.content === message.content && msg.timestamp === message.timestamp)
         );
         
         if (messageExists) {
           return prev;
         }
         
         return [...prev, message];
       });
       scrollToBottom();
     });
     socketService.on('error', (error) => {
       // Handle specific errors more gracefully
       if (error.message === 'Cleaner has not quoted on this job') {
         setError('Chat system temporarily unavailable');
       } else {
         setError(error.message);
       }
       
       // Start with empty messages on error
       setMessages([]);
       setLoading(false);
     });

    return () => {
      socketService.off('connectionStatus', setIsConnected);
      socketService.off('chatJoined', () => {});
      socketService.off('chatHistory', () => {});
      socketService.off('newMessage', () => {});
      socketService.off('error', () => {});
      socketService.disconnect();
    };
  }, [navigate]);

  // Join Chat Room
  useEffect(() => {
    if (jobId && cleanerId && cleanerId !== 'undefined' && cleanerId !== 'null' && isConnected) {
      
      // First, let's verify the cleaner has actually quoted for this job
      const verifyCleanerQuote = async () => {
        try {
          const jobResponse = await jobsAPI.getJobById(jobId);
          if (jobResponse.success && jobResponse.data) {
            const job = jobResponse.data;
            
             if (job.quotes && job.quotes.length > 0) {
               
               // First try to match by quote ID (since cleanerId in URL might be quote ID)
               let cleanerQuote = job.quotes.find(quote => {
                 const quoteId = quote._id || quote.id;
                 return quoteId === cleanerId || quoteId === String(cleanerId);
               });
               
               // If not found by quote ID, try to match by cleaner ID
               if (!cleanerQuote) {
                 cleanerQuote = job.quotes.find(quote => {
                   const quoteCleanerId = quote.cleanerId?._id || quote.cleanerId?.id || quote.cleanerId;
                   const match = quoteCleanerId === cleanerId || 
                                quoteCleanerId === String(cleanerId) || 
                                String(quoteCleanerId) === cleanerId ||
                                quoteCleanerId?.toString() === cleanerId?.toString();
                   
                   return match;
                 });
               }
              
              if (cleanerQuote) {
                // Set quote data for display
                setQuoteData({
                  baseQuote: cleanerQuote.price || 0,
                  addons: [],
                  total: cleanerQuote.price || 0
                });
                
                // Get the actual cleaner ID from the quote
                const actualCleanerId = cleanerQuote.cleanerId?._id || cleanerQuote.cleanerId?.id || cleanerQuote.cleanerId;
                
                // If we don't have cleanerId, try to get it from the cleaner object
                if (!actualCleanerId) {
                  // Try to get cleaner ID from the cleaner object
                  const cleanerObj = cleanerQuote.cleaner;
                  const cleanerIdFromCleaner = cleanerObj?._id || cleanerObj?.id;

                  if (cleanerIdFromCleaner) {
                    socketService.joinChat(jobId, cleanerIdFromCleaner);
                  } else {
                    // This is a backend data structure issue - the cleaner should have an ID
                    socketService.joinChat(jobId, cleanerQuote._id);

                    // Show user-friendly message about backend issue
                    setError('Chat system using demo mode - backend data needs updating. Contact support if this persists.');
                  }
                } else {
                  socketService.joinChat(jobId, actualCleanerId);
                }
              } else {
                setError('This cleaner has not submitted a quote for this job. Please select a cleaner who has quoted.');
                setMessages([]);
                setLoading(false);
              }
            } else {
              setError('No quotes found for this job.');
              setMessages([]);
              setLoading(false);
            }
          }
        } catch (err) {
          setError('Unable to verify cleaner quote. Please try again.');
          setMessages([]);
          setLoading(false);
        }
      };
      
      verifyCleanerQuote();
    } else if (!isConnected || !cleanerId || cleanerId === 'undefined' || cleanerId === 'null') {
      // Start with empty messages if not connected or no valid cleanerId
      setMessages([]);
      setLoading(false);
    }
  }, [jobId, cleanerId, isConnected]);

  // Mark messages as read when chat is viewed
  useEffect(() => {
    if (currentChatRoom?.chatRoomId) {
      socketService.markAsRead(currentChatRoom.chatRoomId);
    }
  }, [currentChatRoom, messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSendMessage = () => {
    if (newMessage.trim()) {
      if (currentChatRoom?.chatRoomId && isConnected) {
        socketService.sendMessage(currentChatRoom.chatRoomId, newMessage.trim());
       } else {
         // Fallback to static messages when not connected
         const message = {
           id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
           sender: 'user',
           message: newMessage.trim(),
           timestamp: new Date().toLocaleTimeString('en-US', {
             hour: 'numeric',
             minute: '2-digit',
             hour12: true
           })
         };
         setMessages(prev => [...prev, message]);
       }
      setNewMessage('');
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };
  
  const handleRejectQuote = () => {
    setShowRejectModal(true);
  };
  
  const handleConfirmReject = async () => {
    setIsRejecting(true);
    try {
      // TODO: Call API to reject quote
      // await quotesAPI.rejectQuote(quoteId);
      
      // For now, just navigate back
      setTimeout(() => {
        setIsRejecting(false);
        setShowRejectModal(false);
        navigate(`/customer-job-details/${jobId}`);
      }, 500);
    } catch (error) {
      setIsRejecting(false);
      setError('Failed to reject quote. Please try again.');
    }
  };
  
  const handleCancelReject = () => {
    setShowRejectModal(false);
  };
  
  const handleAcceptQuote = () => {
    // Handle quote acceptance and booking
    navigate(`/booking-confirmation/${jobId}`);
  };
  
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Chat Header */}
      <div className="max-w-sm mx-auto sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl py-2 sm:py-3 flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="mr-2 sm:mr-3 hover:bg-gray-100 rounded-lg transition-colors p-1 cursor-pointer"
        >
          <img src={ArrowLeftIcon} alt="Back" className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <h1 className="text-base sm:text-lg font-semibold text-gray-900">
          Cleaner #{cleanerId || '1047'}
        </h1>
      </div>
      
      <div className="max-w-sm mx-auto sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl bg-white rounded-xl shadow-custom pt-1 overflow-x-hidden">
      {/* Error Message */}
      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg mx-4 mb-4">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => navigate(`/customer-job-details/${jobId}`)}
              className="ml-3 px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs hover:bg-red-200 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="px-4 py-8 text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
          <p className="text-sm text-gray-500 mt-2">Loading chat...</p>
        </div>
      )}

      {/* Safety Banner */}
      <div className="bg-[#F9FAFB] px-3 sm:px-4 py-2 sm:py-3 mt-3 sm:mt-4 rounded-2xl shadow-custom border border-[#E5E7EB] max-w-lg mx-auto">
        <div className="flex items-start space-x-2 sm:space-x-3">
          <img src={InfoIcon} alt="Info" className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" />
          <p className="text-xs sm:text-sm text-primary-200 font-medium leading-relaxed">
            For safety, phone numbers and emails are hidden until booking. Please chat only through Aussie Mate.
          </p>
        </div>
      </div>
      
      {/* Chat Messages */}
      <div className="flex-1 px-3 sm:px-6 py-3 sm:py-4 space-y-3 sm:space-y-4 overflow-y-auto">
         {messages.map((msg, index) => {
           const isSentByCurrentUser = msg.senderId?._id === currentUser?.id || msg.senderId?._id === currentUser?._id || msg.sender === 'user';
           const messageTime = msg.createdAt ? 
             new Date(msg.createdAt).toLocaleTimeString('en-US', {
               hour: 'numeric',
               minute: '2-digit',
               hour12: true
             }).toLowerCase() : 
             msg.timestamp || '';

           // Create unique key combining multiple identifiers
           const uniqueKey = msg._id || msg.id || `msg-${index}-${msg.content?.slice(0, 10) || 'empty'}`;

           return (
             <div
               key={uniqueKey}
               className={`flex ${isSentByCurrentUser ? 'justify-end' : 'justify-start'}`}
             >
              <div className={`flex items-start space-x-2 max-w-[280px] sm:max-w-xs md:max-w-md ${isSentByCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {/* Avatar */}
                {!isSentByCurrentUser && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <img src={UserIcon} alt="Cleaner" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                )}
                
                {/* Message Bubble */}
                <div className="flex flex-col">
                  {/* Quote Message */}
                  {msg.messageType === 'quote' && msg.quoteData && (
                    <div className="px-2.5 sm:px-3 py-2 sm:py-3 rounded-2xl bg-[#EBF2FD] text-primary-500 font-medium mb-2">
                      <div className="text-xs font-semibold text-primary-500 mb-2">💰 Quote Update</div>
                      <div className="text-xs space-y-1">
                        <div>Price: <span className="font-semibold">${msg.quoteData.price}</span></div>
                        <div>Duration: <span className="font-semibold">{msg.quoteData.estimatedDuration}</span></div>
                        {msg.quoteData.availability && (
                          <div>Available: <span className="font-semibold">
                            {new Date(msg.quoteData.availability).toLocaleDateString()}
                          </span></div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Budget Update Message */}
                  {msg.messageType === 'budget_update' && msg.budgetData && (
                    <div className="px-2.5 sm:px-3 py-2 sm:py-3 rounded-2xl bg-white border border-gray-200 text-primary-500 font-medium mb-2">
                      <div className="text-xs font-semibold text-primary-500 mb-2">💵 Budget Update</div>
                      <div className="text-xs space-y-1">
                        <div>Amount: <span className="font-semibold">${msg.budgetData.amount}</span></div>
                        <div>Status: <span className="font-semibold">
                          {msg.budgetData.isNegotiable ? 'Negotiable' : 'Fixed'}
                        </span></div>
                      </div>
                    </div>
                  )}

                  {/* Regular Text Message */}
                  {(msg.content || msg.message) && (
                    <div
                      className={`px-2.5 sm:px-3 py-2 sm:py-3 rounded-2xl text-primary-500 font-medium ${
                        isSentByCurrentUser
                          ? 'bg-white border border-gray-200'
                          : 'bg-[#EBF2FD]'
                      }`}
                    >
                      <p className="text-xs sm:text-sm text-gray-800 leading-relaxed">
                        {msg.content || msg.message}
                      </p>
                    </div>
                  )}
                  
                  <span className="text-xs text-gray-500 mt-1">
                    {messageTime}
                    {msg.isRead && isSentByCurrentUser && (
                      <span className="ml-1 text-green-500">✓✓</span>
                    )}
                  </span>
                </div>
                
                {/* User Avatar */}
                {isSentByCurrentUser && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <img src={UserIcon} alt="You" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
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
            className="flex-1 px-3 py-3 border border-[#E5E7EB] rounded-lg text-xs sm:text-sm focus:outline-none focus:border-blue-500 shadow-custom bg-[#F9FAFB]"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className={`cursor-pointer p-1 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors ${!newMessage.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
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
        {quoteData.addons && quoteData.addons.length > 0 && quoteData.addons.map((addon, index) => (
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
      
      {/* Reject Quote Confirmation Modal */}
      <ConfirmationModal
        isOpen={showRejectModal}
        onClose={handleCancelReject}
        onConfirm={handleConfirmReject}
        title="Reject Quote"
        message="Are you sure you want to reject this quote? This action cannot be undone."
        confirmText="Reject"
        cancelText="Cancel"
        confirmButtonColor="bg-red-500 hover:bg-red-600"
        isLoading={isRejecting}
      />
    </div>
  );
};

export default CustomerChatPage;
