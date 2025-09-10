import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import CardBG from '../assets/CardBG.svg';
import CleaningImage from '../assets/Cleaning.png';
import HandymanImage from '../assets/Handyman.png';
import HousekeepingImage from '../assets/Housekeeping.png';
import PetSittingImage from '../assets/Pet Sitting.png';
import NDISSupportImage from '../assets/NDIS Support.png';
import RetailAuditorImage from '../assets/Retail Auditor.png';

const CustomerDashboard = () => {
  const [activeTab, setActiveTab] = useState('messages');

  const serviceCategories = [
    {
      id: 'cleaning',
      name: 'Cleaning',
      image: CleaningImage,
      description: 'Professional cleaning services'
    },
    {
      id: 'housekeeping',
      name: 'Housekeeping',
      image: HousekeepingImage,
      description: 'Complete housekeeping solutions'
    },
    {
      id: 'ndis',
      name: 'NDIS Support',
      image: NDISSupportImage,
      description: 'NDIS support services'
    },
    {
      id: 'retail',
      name: 'Retail Auditor',
      image: RetailAuditorImage,
      description: 'Retail auditing services'
    },
    {
      id: 'petsitting',
      name: 'Pet Sitting',
      image: PetSittingImage,
      description: 'Pet care and sitting'
    },
    {
      id: 'handyman',
      name: 'Handyman',
      image: HandymanImage,
      description: 'Repair and maintenance'
    }
  ];

  const ongoingJobs = [
    {
      id: 'AM10432',
      title: 'Bond Cleaning - 2 Bed Apartment',
      status: 'Pending Quotes',
      date: '23 Aug, 2:00 PM',
      action: 'View Quotes'
    },
    {
      id: 'AM104',
      title: 'Pet Sitting',
      date: '23 Aug',
      action: 'Track Job'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Component */}
      <Header />

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto">
        {/* Search Section */}
        <div className="bg-white px-4 py-4 border-b border-gray-200">
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </div>
            <input
              type="text"
              placeholder="Search services, e.g. bond clean..."
              className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Book a cleaner section */}
        <div className="bg-white px-4 py-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Book a cleaner in minutes</h2>
          <p className="text-sm text-gray-600 mb-4">Post job → Receive quotes → Choose & pay securely</p>
          
          {/* Service Categories Grid */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {serviceCategories.map((service) => (
              <div
                key={service.id}
                className="relative bg-white border border-gray-200 rounded-xl p-4 text-center hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
              >
                {/* SVG Background */}
                <div className="absolute inset-0 opacity-10">
                  <img src={CardBG} alt="" className="w-full h-full object-cover" />
                </div>
                
                {/* Service Image */}
                <div className="relative z-10 mb-2 flex justify-center">
                  <img 
                    src={service.image} 
                    alt={service.name}
                    className="w-12 h-12 object-contain"
                  />
                </div>
                
                {/* Service Name */}
                <div className="relative z-10 text-xs font-medium text-gray-900">{service.name}</div>
              </div>
            ))}
          </div>

          {/* Post New Job Button */}
          <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-lg flex items-center justify-center space-x-2 transition-colors">
            <span className="text-xl">+</span>
            <span>Post New Job</span>
          </button>
        </div>

        {/* MatePoints Section */}
        <div className="px-4 my-4">
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Earn MatePoints with Every Booking</h3>
                <p className="text-sm text-gray-600 mb-3">Collect points on each job completed and redeem them for discounts & perks.</p>
                <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium">
                  View Rewards
                </button>
              </div>
              <div className="text-6xl">💰</div>
            </div>
          </div>
        </div>

        {/* Ongoing Jobs Section */}
        <div className="bg-white px-4 py-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Ongoing Jobs</h3>
          
          <div className="space-y-3">
            {ongoingJobs.map((job, index) => (
              <div key={job.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-1">Job ID: {job.id}</div>
                    {job.status && (
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-2">
                        {job.status}
                      </span>
                    )}
                    <h4 className="text-sm font-medium text-gray-900 mb-1">{job.title}</h4>
                    <div className="flex items-center text-xs text-gray-500">
                      <span className="mr-1">📅</span>
                      {job.date}
                    </div>
                  </div>
                </div>
                <button className="text-blue-500 text-sm font-medium hover:text-blue-600">
                  {job.action}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
