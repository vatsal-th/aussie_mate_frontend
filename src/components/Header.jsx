import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../services/api';
import logo from '../assets/logo.png';
import ProfileIcon from '../assets/Profile.svg';
import NotificationIcon from '../assets/notification.svg';
import MapPinIcon from '../assets/map-pin 1.png';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState({
    address: '123 Example Street',
    city: 'Sydney NSW 200, Australia'
  });

  useEffect(() => {
    // Get user location from backend and localStorage
    const updateLocation = async () => {
      try {
        // First try to get from backend
        if (user) {
          const userProfile = await userAPI.getProfile();
          if (userProfile.success && userProfile.data && userProfile.data.location) {
            const location = userProfile.data.location;
            setUserLocation({
              address: location.address?.split(',')[0] || 'Location not set',
              city: location.city || 'Please set your location'
            });
            return;
          }
        }
      } catch (error) {
        console.error('Error fetching location from backend:', error);
        // If it's an authentication error, use localStorage fallback
        if (error.message === 'User not authenticated') {
          console.warn('User authentication issue, using localStorage fallback');
        }
      }

      // Fallback to localStorage
      const storedLocation = localStorage.getItem('userLocation');
      if (storedLocation) {
        try {
          const location = JSON.parse(storedLocation);
          setUserLocation({
            address: location.address?.split(',')[0] || 'Location not set',
            city: location.city || 'Please set your location'
          });
        } catch (error) {
          console.error('Error parsing stored location:', error);
        }
      }
    };

    // Initial load
    updateLocation();

    // Listen for storage changes (when location is updated from other tabs/components)
    const handleStorageChange = (e) => {
      if (e.key === 'userLocation') {
        updateLocation();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events (for same-tab updates)
    const handleLocationUpdate = () => {
      updateLocation();
    };

    window.addEventListener('locationUpdated', handleLocationUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('locationUpdated', handleLocationUpdate);
    };
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="bg-white border-b border-gray-200">
      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
        {/* Logo and Location */}
        <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
          <Link to="/" className="flex-shrink-0">
            <img src={logo} alt="Aussie Mate" className="h-10 sm:h-12 md:h-14 w-auto" />
          </Link>
          <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
            <img src={MapPinIcon} alt="Location" className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-medium text-primary-500 truncate">
                        {userLocation.address}
              </div>
              <div className="text-xs text-primary-200 truncate">
                {userLocation.city || 'City not set'}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Icons */}
        <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
          {/* Notification Icon */}
          <button className="relative p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <img src={NotificationIcon} alt="Notifications" className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />
          </button>

          {/* Profile Icon or Login/Register */}
          {user ? (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700 hidden sm:block">
                Welcome, {user.firstName || user.name || 'User'}
              </span>
              <Link 
                to="/profile" 
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <img src={ProfileIcon} alt="Profile" className="w-5 h-5 sm:w-6 sm:h-6" />
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-gray-800 px-2 py-1 rounded hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1 rounded hover:bg-gray-100"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="text-sm bg-primary-500 text-white px-3 py-1 rounded hover:bg-primary-600"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
