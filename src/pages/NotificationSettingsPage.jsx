import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import ArrowLeftIcon from '../assets/arrow-left.svg';
import SwitchIcon from '../assets/Switch.svg';
import { useAuth } from '../contexts/AuthContext';

const NotificationSettingsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // State for toggle switches
  const [notifications, setNotifications] = useState({
    pushNotifications: true,
    jobUpdates: false,
    promotions: true,
    loyaltyUpdates: false
  });

  const handleBack = () => {
    navigate(-1);
  };

  const toggleNotification = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Custom toggle switch component
  const ToggleSwitch = ({ isOn, onToggle, className = "" }) => {
    return (
      <button
        onClick={onToggle}
        className={`toggle-switch relative inline-flex h-6 w-11 items-center rounded-full focus:outline-none cursor-pointer ${isOn ? 'bg-primary-500' : 'bg-gray-300'
          } ${className}`}
      >
        <span
          className={`toggle-switch-circle inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ${isOn ? 'translate-x-6' : 'translate-x-1'
            }`}
        />
      </button>
    );
  };

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
            Notification Settings
          </h1>
        </div>
        {
          user?.role === 'Customer' && (
            <div>
          {/* General Section */}
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-primary-200 uppercase tracking-wide mb-2">
              GENERAL
            </h2>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-custom p-4 space-y-4">
              {/* Push Notifications */}
              <div className="flex items-center justify-between py-2">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-primary-500 mb-1">
                    Push Notifications
                  </h3>
                  <p className="text-sm text-primary-200 font-medium">
                    Allow Aussie Mate to send you alerts.
                  </p>
                </div>
                <ToggleSwitch
                  isOn={notifications.pushNotifications}
                  onToggle={() => toggleNotification('pushNotifications')}
                  className="cursor-pointer "
                />
              </div>

              {/* Job Updates */}
              <div className="flex items-center justify-between py-2">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-primary-500 mb-1">
                    Job Updates
                  </h3>
                  <p className="text-sm text-primary-200 font-medium">
                    Get updates about bids, bookings & job status.
                  </p>
                </div>
                <ToggleSwitch
                  isOn={notifications.jobUpdates}
                  onToggle={() => toggleNotification('jobUpdates')}
                />
              </div>
            </div>
          </div>

          {/* Offers & Loyalty Section */}
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-primary-200 uppercase tracking-wide mb-2">
              OFFERS & LOYALTY
            </h2>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-custom p-4 space-y-4">
              {/* Promotions */}
              <div className="flex items-center justify-between py-2">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-primary-500 mb-1">
                    Promotions
                  </h3>
                  <p className="text-sm text-primary-200 font-medium">
                    Receive offers, discounts & new services.
                  </p>
                </div>
                <ToggleSwitch
                  isOn={notifications.promotions}
                  onToggle={() => toggleNotification('promotions')}
                />
              </div>

              {/* Loyalty / MatePoints Updates */}
              <div className="flex items-center justify-between py-2">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-primary-500 mb-1">
                    Loyalty / MatePoints Updates
                  </h3>
                  <p className="text-sm text-primary-200 font-medium">
                    Be notified when you earn or redeem MatePoints.
                  </p>
                </div>
                <ToggleSwitch
                  isOn={notifications.loyaltyUpdates}
                  onToggle={() => toggleNotification('loyaltyUpdates')}
                />
              </div>
            </div>
          </div>
        </div>
          )
        }
       

      </div>
    </div>
  );
};

export default NotificationSettingsPage;
