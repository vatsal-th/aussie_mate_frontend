import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import ArrowLeftIcon from '../assets/arrow-left.svg';
import ChevronRightIcon from '../assets/chevron-right.svg';
import ThreeDotIcon from '../assets/3dot.svg';
import CheckIcon from '../assets/check.svg';
import TrashRedIcon from '../assets/trash-red.svg';
import BankIcon from '../assets/bank.svg';
import CardIcon from '../assets/card.svg';
import NewCardIcon from '../assets/newCard.svg';
import MastercardLogo from '../assets/mastercard_logo.svg';
import WalletBG from '../assets/walletBG.jpg';

const WalletPage = () => {
  const navigate = useNavigate();
  const [currentCardIndex, setCurrentCardIndex] = useState(1);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [cardForm, setCardForm] = useState({
    cardHolderName: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });
  const [bankForm, setBankForm] = useState({
    accountName: '',
    bsb: '',
    accountNumber: '',
    setAsDefault: true
  });

  // Check if user has bank details (you can modify this logic based on your data structure)
  const hasBankDetails = false; // Set to true if user has bank details

  const paymentMethods = [
    {
      id: 1,
      type: 'visa',
      lastFour: '3289',
      name: 'Visa •••• 3289',
      subtitle: 'Default Payment Method',
      icon: CardIcon,
      isDefault: true
    },
    // Show Add Bank Account if user has no bank details
    ...(!hasBankDetails ? [{
      id: 2,
      type: 'add-bank',
      name: 'Add Bank Account',
      subtitle: 'Link your bank account for payments.',
      icon: BankIcon,
      isDefault: false,
      isAddBank: true
    }] : []),
    // Only show bank details if user has them
    ...(hasBankDetails ? [{
      id: 3,
      type: 'bank',
      name: 'Linked Bank',
      subtitle: 'PayID: john@email.com',
      icon: BankIcon,
      isDefault: false
    }] : []),
    {
      id: 4,
      type: 'add',
      name: 'Add New Card',
      subtitle: 'Save and pay via cards.',
      icon: NewCardIcon,
      isDefault: false,
      isAddCard: true
    }
  ];

  const cards = [
    {
      id: 1,
      type: 'mastercard',
      balance: '$5,750.20',
      number: '5282 3456 7890 1289',
      expiry: '09/25',
      color: 'from-blue-500 to-blue-700'
    },
    {
      id: 2,
      type: 'visa',
      balance: '$2,150.50',
      number: '4532 1234 5678 9012',
      expiry: '12/26',
      color: 'from-purple-500 to-purple-700'
    },
    {
      id: 3,
      type: 'amex',
      balance: '$1,200.00',
      number: '3782 822463 10005',
      expiry: '03/27',
      color: 'from-green-500 to-green-700'
    }
  ];

  const handleTopUp = () => {
    // Handle top up functionality
    console.log('Top up wallet');
  };

  const handlePaymentMethodAction = (method) => {
    if (method.isAddCard) {
      // Open add new card modal
      setShowAddCardModal(true);
    } else if (method.isAddBank) {
      // Open add bank account modal
      setShowAddBankModal(true);
    } else {
      // Toggle dropdown for existing payment method
      setActiveDropdown(activeDropdown === method.id ? null : method.id);
    }
  };

  const handleMakeDefault = (methodId) => {
    console.log('Make default:', methodId);
    setActiveDropdown(null);
  };

  const handleRemove = (methodId) => {
    console.log('Remove:', methodId);
    setActiveDropdown(null);
  };

  const handleClickOutside = (event) => {
    if (!event.target.closest('.dropdown-container')) {
      setActiveDropdown(null);
    }
  };

  const handleCardFormChange = (e) => {
    const { name, value } = e.target;
    setCardForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBankFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBankForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddCard = (e) => {
    e.preventDefault();
    console.log('Adding new card:', cardForm);
    // Here you would typically make an API call to add the card
    setShowAddCardModal(false);
    setCardForm({
      cardHolderName: '',
      cardNumber: '',
      expiry: '',
      cvv: ''
    });
  };

  const handleAddBank = (e) => {
    e.preventDefault();
    console.log('Adding new bank account:', bankForm);
    // Here you would typically make an API call to add the bank account
    setShowAddBankModal(false);
    setBankForm({
      accountName: '',
      bsb: '',
      accountNumber: '',
      setAsDefault: true
    });
  };

  const closeModal = () => {
    setShowAddCardModal(false);
    setCardForm({
      cardHolderName: '',
      cardNumber: '',
      expiry: '',
      cvv: ''
    });
  };

  const closeBankModal = () => {
    setShowAddBankModal(false);
    setBankForm({
      accountName: '',
      bsb: '',
      accountNumber: '',
      setAsDefault: true
    });
  };

  const handleCardClick = (index) => {
    setCurrentCardIndex(index);
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showAddCardModal || showAddBankModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showAddCardModal, showAddBankModal]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Wallet Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <img src={ArrowLeftIcon} alt="Back" className="w-6 h-6" />
          </button>
          <h1 className="ml-4 text-xl font-semibold text-gray-900">Wallet & Payments</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8 pt-0!">
        {/* Background Image Section */}
        <div className="mb-6 rounded-2xl shadow-custom border border-[#F3F3F3]">
          <div className="relative rounded-xl p-4 sm:p-6 overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0">
              <img src={WalletBG} alt="Wallet Background" className="w-full h-full object-cover" />
            </div>
            
            {/* Content Overlay */}
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1 text-left">
                <h3 className="text-sm font-medium text-[#374151] mb-2">CURRENT BALANCE</h3>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-500 mb-2">$45.00</div>
                <p className="text-sm text-[#374151] mb-4">Available to use for bookings & top-ups.</p>
              </div>
              <div className="flex justify-end w-full sm:w-auto">
                <button
                  onClick={handleTopUp}
                  className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-[8px] text-sm font-medium shadow-custom"
                >
                  Top Up Wallet
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Saved Payment Methods */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8 mb-6">
          <h3 className="text-lg font-semibold text-primary-500 mb-4 sm:mb-6">Saved Payment Methods</h3>
          <div className="space-y-3 sm:space-y-4">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`relative flex items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg bg-[#F9FAFB] transition-colors ${
                  method.isAddCard || method.isAddBank ? 'cursor-pointer hover:bg-gray-100' : ''
                }`}
                onClick={method.isAddCard || method.isAddBank ? () => handlePaymentMethodAction(method) : undefined}
              >
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
                    <img src={method.icon} alt={method.name} className="w-full h-full" />
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-semibold text-primary-500">{method.name}</p>
                    <p className="text-xs sm:text-sm text-primary-200 font-medium" >{method.subtitle}</p>
                  </div>
                </div>
                {method.isAddCard || method.isAddBank ? (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePaymentMethodAction(method)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    > 
                      <img src={ChevronRightIcon} alt="Arrow" className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="relative dropdown-container">
                    <button
                      onClick={() => handlePaymentMethodAction(method)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <img src={ThreeDotIcon} alt="Options" className="w-5 h-5" />
                    </button>
                    
                    {/* Dropdown Menu */}
                    {activeDropdown === method.id && (
                      <div className="absolute right-0 top-full w-48 bg-white rounded-2xl! shadow-custom border border-gray-200 z-50">
                        <div className="py-2">
                          <button
                            onClick={() => handleMakeDefault(method.id)}
                            className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                          >
                            <img src={CheckIcon} alt="Check" className="w-5 h-5 mr-3" />
                            <span className="text-sm font-medium text-gray-700">Make Default</span>
                          </button>
                          <button
                            onClick={() => handleRemove(method.id)}
                            className="w-full flex items-center px-4 py-3 text-left hover:bg-red-50 transition-colors"
                          >
                            <img src={TrashRedIcon} alt="Trash" className="w-5 h-5 mr-3" />
                            <span className="text-sm font-medium text-red-600">Remove</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Card Carousel */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Your Cards</h3>
          
          {/* Card Display */}
          <div className="relative mb-6">
            <div className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide">
              {cards.map((card, index) => (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(index)}
                  className={`flex-shrink-0 w-64 sm:w-72 md:w-80 h-40 sm:h-44 md:h-48 rounded-xl sm:rounded-2xl p-4 sm:p-6 cursor-pointer transition-all duration-300 ${
                    index === currentCardIndex
                      ? 'bg-gradient-to-r from-blue-500 to-blue-700 scale-100'
                      : 'bg-gradient-to-r from-gray-300 to-gray-400 scale-95 opacity-70'
                  }`}
                >
                  <div className="flex flex-col justify-between h-full text-white">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs sm:text-sm">Current Balance</p>
                        <p className="text-xl sm:text-2xl lg:text-3xl font-bold mt-1">{card.balance}</p>
                      </div>
                      {card.type === 'mastercard' && (
                        <div className="w-12 h-8 rounded flex items-center justify-center">
                          <img src={MastercardLogo} alt="Mastercard" className="w-10 h-8" />
                        </div>
                      )}
                      {card.type === 'visa' && (
                        <div className="w-12 h-8 bg-white rounded flex items-center justify-center">
                          <span className="text-blue-600 font-bold text-sm">VISA</span>
                        </div>
                      )}
                      {card.type === 'amex' && (
                        <div className="w-12 h-8 bg-white rounded flex items-center justify-center">
                          <span className="text-green-600 font-bold text-xs">AMEX</span>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-xs sm:text-sm font-medium">{card.number}</p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-medium">{card.expiry}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center space-x-1 mt-4 sm:mt-6">
            {cards.map((_, index) => (
              <button
                key={index}
                onClick={() => handleCardClick(index)}
                className={`transition-all duration-300 ${
                  index === currentCardIndex
                    ? 'bg-primary-500 w-6 h-2 sm:w-8 sm:h-2'
                    : 'bg-gray-300 w-2 h-2 sm:w-4 sm:h-2 hover:bg-gray-400 cursor-pointer'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Add New Card Modal */}
      {showAddCardModal && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
          onClick={closeModal}
        >
          <div 
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-custom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors mr-3"
                >
                  <img src={ArrowLeftIcon} alt="Back" className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-semibold text-gray-900">Add New Card</h2>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddCard} className="space-y-4">
              {/* Card Holder Name */}
              <div>
                <input
                  type="text"
                  name="cardHolderName"
                  value={cardForm.cardHolderName}
                  onChange={handleCardFormChange}
                  placeholder="Card holder name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              {/* Card Number */}
              <div>
                <input
                  type="text"
                  name="cardNumber"
                  value={cardForm.cardNumber}
                  onChange={handleCardFormChange}
                  placeholder="Card Number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              {/* Expiry and CVV */}
              <div className="flex space-x-4">
                <div className="flex-1">
                  <input
                    type="text"
                    name="expiry"
                    value={cardForm.expiry}
                    onChange={handleCardFormChange}
                    placeholder="Expiry"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    required
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    name="cvv"
                    value={cardForm.cvv}
                    onChange={handleCardFormChange}
                    placeholder="CVV"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    required
                  />
                </div>
              </div>

              {/* Add New Card Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-4 rounded-lg cursor-pointer"
                >
                  Add New Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Bank Account Modal */}
      {showAddBankModal && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
          onClick={closeBankModal}
        >
          <div 
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-custom"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <button
                  onClick={closeBankModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors mr-3"
                >
                  <img src={ArrowLeftIcon} alt="Back" className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold text-gray-900">Add Bank Account</h2>
              </div>
              <button
                onClick={closeBankModal}
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddBank} className="space-y-4">
              {/* Account Name */}
              <div>
                <input
                  type="text"
                  name="accountName"
                  value={bankForm.accountName}
                  onChange={handleBankFormChange}
                  placeholder="Account Name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              {/* BSB */}
              <div>
                <input
                  type="text"
                  name="bsb"
                  value={bankForm.bsb}
                  onChange={handleBankFormChange}
                  placeholder="BSB"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              {/* Account Number */}
              <div>
                <input
                  type="text"
                  name="accountNumber"
                  value={bankForm.accountNumber}
                  onChange={handleBankFormChange}
                  placeholder="Account Number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              {/* Set as Default Checkbox */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="setAsDefault"
                  checked={bankForm.setAsDefault}
                  onChange={handleBankFormChange}
                  className="w-4 h-4 text-primary-500 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                />
                <label className="ml-2 text-sm font-medium text-gray-700">
                  Set as default payment
                </label>
              </div>

              {/* Add Bank Account Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-4 rounded-lg cursor-pointer"
                >
                  Add Bank Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletPage;
