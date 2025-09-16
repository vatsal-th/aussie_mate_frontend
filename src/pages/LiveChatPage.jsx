import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import ArrowLeftIcon from '../assets/arrow-left.svg';
import SearchIcon from '../assets/search.svg';
import HelpUserIcon from '../assets/helpUser.svg';
import CardBG7 from '../assets/CardBG7.png';
import CardBG3 from '../assets/CardBG3.png';

const LiveChatPage = () => {
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');

  const handleBack = () => {
    navigate(-1);
  };

  const handleSearch = () => {
    if (question.trim()) {
      console.log('Searching for:', question);
      // Handle search functionality
    }
  };

  const handleSuggestedQuestion = (questionText) => {
    setQuestion(questionText);
    console.log('Selected question:', questionText);
    // Handle suggested question selection
  };

  const suggestedQuestions = [
    "How do I pay online?",
    "Can I cancel a booking?",
    "Is my money safe?",
    "What happens if the cleaner doesn't show up?"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={handleBack}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <img src={ArrowLeftIcon} alt="Back" className="w-5 h-5" />
          </button>
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
            Live Chat Support
          </h1>
        </div>

        {/* Question Input Field */}
        <div className="bg-white rounded-xl p-6 md:p-8 border-2 border-[#8B92A620] relative overflow-hidden">
          {/* Background Image - Top Right */}
          <div className="absolute top-0 right-0 w-24 h-24 sm:w-56 sm:h-56 z-0">
            <img 
              src={CardBG7} 
              alt="Background" 
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Background Image - Top Left */}
          <div className="absolute top-0 left-0 w-24 h-24 sm:w-56 sm:h-56 z-0">
            <img 
              src={CardBG3} 
              alt="Background" 
              className="w-full h-full object-cover"
            />
          </div>
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Type your question..."
              className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:outline-none 
               text-gray-900 placeholder-gray-500 relative z-10"
            />
            <button
              onClick={handleSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors"
            >
              <img src={SearchIcon} alt="Search" className="w-4 h-4" style={{ filter: 'brightness(0) invert(1)' }} />
            </button>
          </div>
        </div>

        {/* AI Assistant Message */}
        <div className="mb-6">
          <div className="flex items-start gap-3">
            {/* AI Assistant Avatar */}
            <div className="flex-shrink-0">
              <img src={HelpUserIcon} alt="AI Assistant" className="w-11 h-11" />
            </div>
            
            {/* Chat Bubble */}
            <div className="flex-1">
              <div className="bg-[#EBF2FD] rounded-2xl  px-4 py-3 max-w-xs">
                <p className="text-primary-500 font-medium text-sm leading-relaxed">
                Hi 👋 I’m your AI Assistant. Ask me anything or choose from common questions below.
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-1 ml-4">9:00am</p>
            </div>
          </div>
        </div>

        {/* Suggested Questions */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 mb-3 z-10">Common Questions</h3>
          
          {/* Two questions in one line */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            {suggestedQuestions.slice(0, 2).map((questionText, index) => (
              <button
                key={index}
                onClick={() => handleSuggestedQuestion(questionText)}
                className="text-left bg-white text-[#1F6FEB] border border-[#DDEAFF] shadow-custom rounded-xl px-4 py-3 transition-colors z-10 hover:bg-gray-50"
              >
                <p className="font-medium text-sm">
                  {questionText}
                </p>
              </button>
            ))}
          </div>
          
          {/* Remaining questions */}
          <div className="grid grid-cols-2 gap-3 mb-3">
          {suggestedQuestions.slice(2).map((questionText, index) => (
            <button
              key={index + 2}
              onClick={() => handleSuggestedQuestion(questionText)}
              className="w-full text-left bg-white text-[#1F6FEB] border border-[#DDEAFF] shadow-custom rounded-xl px-4 py-3 transition-colors z-10 hover:bg-gray-50"
            >
              <p className="font-medium text-sm">
                {questionText}
              </p>
              </button>
            ))}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default LiveChatPage;
