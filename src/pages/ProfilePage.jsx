import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../services/api';
import EditIcon from '../assets/edit.svg';
import HelpIcon from '../assets/help.svg';
import InvoiceIcon from '../assets/invoice.svg';
import JobIcon from '../assets/job2.svg';
import LogoutIcon from '../assets/logout.svg';
import MailIcon from '../assets/mail.svg';
import NotificationIcon from '../assets/notification2.svg';
import PhoneIcon from '../assets/phone.svg';
import StarIcon from '../assets/star.svg';
import WalletIcon from '../assets/wallet.svg';
import RightIcon from '../assets/right.svg';
import ArrowLeftIcon from '../assets/arrow-left.svg';
import Header from '../components/Header';
import ProfileBG from '../assets/CardBG7.png';

const ProfilePage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (user) {
          const response = await userAPI.getProfile();
          if (response.success) {
            setUserProfile(response.data);
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

    // Listen for user updates
    const handleUserUpdate = () => {
      fetchProfile();
    };

    window.addEventListener('userUpdated', handleUserUpdate);

    return () => {
      window.removeEventListener('userUpdated', handleUserUpdate);
    };
  }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleEditProfile = () => {
        navigate('/edit-profile');
    };

    const handleNavigation = (path) => {
        navigate(path);
    };

    const profileMenuItems = [
        { icon: JobIcon, label: 'My Jobs', path: '/my-jobs' },
        { icon: WalletIcon, label: 'Wallet & Payments', path: '/wallet' },
        { icon: StarIcon, label: 'MatePoints & Rewards', path: '/rewards' },
        { icon: InvoiceIcon, label: 'Invoices & History', path: '/invoices' },
        { icon: NotificationIcon, label: 'Notifications Settings', path: '/notifications' },
        { icon: HelpIcon, label: 'Help & Support', path: '/help' },
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <Header />

            {/* My Profile Header */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center h-16">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                        >
                            <img src={ArrowLeftIcon} alt="Back" className="w-6 h-6" />
                        </button>
                        <h1 className="text-xl font-semibold text-gray-900">My Profile</h1>
                    </div>
                </div>

            <div className="max-w-7xl mx-auto py-4 sm:py-6 lg:py-8 pt-0! px-4 sm:px-6 lg:px-8">
                {/* Profile and Statistics Container */}
                <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 mb-4 sm:mb-6" >
                    {/* Profile Information Card */}
                    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8 relative overflow-hidden flex-1 w-full justify-center items-center">
                        {/* Background Image */}
                        <div
                            className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 bg-cover bg-center bg-no-repeat z-0"
                            style={{ backgroundImage: `url(${ProfileBG})` }}
                        ></div>

                        <div className="relative z-10 flex flex-row items-center space-x-4 sm:space-x-6 lg:space-x-8">
                            {/* Profile Picture */}
                            <div className="relative">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                                    {userProfile?.profilePicture || user?.profilePicture || user?.profilePhoto?.secureUrl ? (
                                        <img
                                            src={userProfile?.profilePicture || user?.profilePicture || user?.profilePhoto?.secureUrl}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-primary-500 flex items-center justify-center">
                                            <span className="text-white text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold">
                                                {(user?.firstName || user?.name || 'U').charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={handleEditProfile}
                                    className="absolute bottom-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors shodw-custom cursor-pointer"
                                >
                                    <img src={EditIcon} alt="Edit" className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-6 md:h-6" />
                                </button>
                            </div>

                            {/* User Details */}
                            <div className="flex-1 min-w-0">
                                <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-primary-500 mb-2 sm:mb-3 capitalize">
                                    {userProfile?.firstName || user?.firstName || user?.name || 'User Name'}
                                </h2>

                                <div className="space-y-2 sm:space-y-3">
                                    <div className="flex items-center space-x-2 sm:space-x-3">
                                        <img src={MailIcon} alt="Email" className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
                                        <span className="text-xs sm:text-sm md:text-base text-primary-200 truncate font-medium">
                                            {userProfile?.email || user?.email || 'user@example.com'}
                                        </span>
                                    </div>

                                    <div className="flex items-center space-x-2 sm:space-x-3">
                                        <img src={PhoneIcon} alt="Phone" className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
                                        <span className="text-xs sm:text-sm md:text-base text-primary-200 font-medium">
                                            {userProfile?.phone || user?.phoneNumber || '+61 400 123 456'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Statistics Card */}
                    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8 flex-1">
                        <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                            <div className="text-center border-r border-gray-200 ">
                                <div className="flex justify-center mb-1 sm:mb-2 ">
                                    <img src={StarIcon} alt="Reviews" className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" style={{ filter: 'brightness(0) saturate(100%) invert(27%) sepia(96%) saturate(1456%) hue-rotate(210deg) brightness(95%) contrast(101%)' }} />
                                </div>
                                <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-primary-500 mb-1">15</div>
                                <div className="text-[10px] sm:text-xs md:text-sm text-primary-200 font-medium">Reviews</div>
                            </div>

                            <div className="text-center border-r border-gray-200">
                                <div className="flex justify-center mb-1 sm:mb-2">
                                    <img src={JobIcon} alt="Jobs" className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" style={{ filter: 'brightness(0) saturate(100%) invert(27%) sepia(96%) saturate(1456%) hue-rotate(210deg) brightness(95%) contrast(101%)' }} />
                                </div>
                                <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-primary-500 mb-1">12</div>
                                <div className="text-[10px] sm:text-xs md:text-sm text-primary-200 font-medium">Jobs Completed</div>
                            </div>

                            <div className="text-center">
                                <div className="flex justify-center mb-1 sm:mb-2">
                                    <img src={WalletIcon} alt="MatePoints" className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" style={{ filter: 'brightness(0) saturate(100%) invert(27%) sepia(96%) saturate(1456%) hue-rotate(210deg) brightness(95%) contrast(101%)' }} />
                                </div>
                                <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-primary-500 mb-1">345</div>
                                <div className="text-[10px] sm:text-xs md:text-sm text-primary-200 font-medium">MatePoints</div>
                            </div>
                        </div>
                    </div>
                </div>



                {/* Navigation Menu */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    {profileMenuItems.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => handleNavigation(item.path)}
                            className="w-full flex items-center justify-between p-3 sm:p-4 md:p-6 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 cursor-pointer"
                        >
                            <div className="flex items-center space-x-3 sm:space-x-4">
                                <img src={item.icon} alt={item.label} className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 flex-shrink-0" />
                                <span className="text-xs sm:text-sm md:text-base font-medium text-primary-500">
                                    {item.label}
                                </span>
                            </div>
                            <img src={RightIcon} alt="Arrow" className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                        </button>
                    ))}

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-between p-3 sm:p-4 md:p-6 hover:bg-red-50 transition-colors text-red-600"
                    >
                        <div className="flex items-center space-x-3 sm:space-x-4">
                            <img src={LogoutIcon} alt="Logout" className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 flex-shrink-0" />
                            <span className="text-xs sm:text-sm md:text-base font-medium">
                                Logout
                            </span>
                        </div>
                        <img src={RightIcon} alt="Arrow" className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
