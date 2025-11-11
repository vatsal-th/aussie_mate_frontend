import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, FloatingLabelInput, ConfirmationModal, PageHeader } from '../../../components';
import ArrowLeftIcon from '../../../assets/arrow-left.svg';
import ChevronRightIcon from '../../../assets/chevron-right.svg';
import ThreeDotIcon from '../../../assets/3dot.svg';
import CheckIcon from '../../../assets/check.svg';
import TrashRedIcon from '../../../assets/trash-red.svg';
import BankIcon from '../../../assets/bank.svg';
import CardIcon from '../../../assets/card.svg';
import NewCardIcon from '../../../assets/newCard.svg';
import MastercardLogo from '../../../assets/mastercard_logo.svg';
import WalletBG from '../../../assets/walletBG.jpg';
import { userAPI } from '../../../services/api';

const WalletPage = () => {
  const navigate = useNavigate();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [cards, setCards] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [cardForm, setCardForm] = useState({
    cardHolderName: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
    setAsDefault: false
  });
  const [bankForm, setBankForm] = useState({
    accountName: '',
    bankName: '',
    bsb: '',
    accountNumber: '',
    setAsDefault: true
  });
  const [cardError, setCardError] = useState('');
  const [bankError, setBankError] = useState('');
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const [itemType, setItemType] = useState(null);
  const bankDropdownRef = useRef(null);

  // Bank list
  const bankList = [
    'Commonwealth Bank of Australia',
    'Australia and New Zealand Banking Group (ANZ)',
    'National Australia Bank (NAB)',
    'Westpac Banking Corporation',
    'ING Bank (Australia) Limited',
    'Bendigo and Adelaide Bank Limited',
    'Bank of Queensland Limited',
    'Macquarie Bank Limited',
    'Bank Australia Limited',
    'Heritage Bank',
    'IMB Bank (IMB Ltd)',
    'Credit Union Australia (trading as Great Southern Bank)',
    'Australian Mutual Bank Limited',
    'Auswide Bank Ltd',
    'Bankwest (subsidiary of Commonwealth)',
    'Alex Bank Pty Ltd',
    'AMP Bank Ltd',
    'Australian Military Bank',
    'Australian Unity Bank Limited',
    'Avenue Bank Limited',
    'Bank of Us (B&E Ltd)',
    'Beyond Bank Australia',
    'BNK Banking Corporation Limited',
    'Cairns Bank',
    'Central Murray Bank (Central Murray Credit Union)',
    'Coastline Bank (Coastline Credit Union)',
    'Community First Bank / Credit Union (includes Easy Street Financial Services)',
    'Credit Union SA Ltd',
    'Defence Bank Limited',
    'Ford Co‐operative Credit Society Ltd (trading as Geelong Bank)',
    'Gateway Bank Ltd',
    'Horizon Bank (Horizon Credit Union)',
    'Hume Bank Limited',
    'IN1Bank Ltd'
  ];

  // Generate payment methods from API data
  const generatePaymentMethods = () => {
    const methods = [];

    // Add existing cards
    cards.forEach(card => {
      const normalizedCardId = card?.id || card?._id;
      if (!normalizedCardId) return; 
      methods.push({
        id: `card_${normalizedCardId}`,
        type: card.cardType?.toLowerCase() || 'card',
        lastFour: card.lastFourDigits,
        name: `${card.cardType || 'Card'} •••• ${card.lastFourDigits}`,
        subtitle: card.isDefault ? 'Default Payment Method' : 'Payment Method',
        icon: CardIcon,
        isDefault: card.isDefault,
        isCard: true,
        cardData: card
      });
    });

    // Add existing bank accounts
    bankAccounts.forEach(account => {
      const normalizedBankId = account?.id || account?._id;
      if (!normalizedBankId) return; 
      methods.push({
        id: `bank_${normalizedBankId}`,
        type: 'bank',
        name: `Linked Bank:- ${account.bankName}`,  
        subtitle: `BSB: ${account.bsb} •••• ${account.lastFourDigits}`,
        icon: BankIcon,
        isDefault: account.isDefault,
        isBank: true,
        bankData: account,
        bankName: account.bankName
      });
    });

    // Add "Add Bank Account" if no bank accounts
    if (bankAccounts.length === 0) {
      methods.push({
        id: 'add-bank',
        type: 'add-bank',
        name: 'Add Bank Account',
        subtitle: 'Link your bank account for payments.',
        icon: BankIcon,
        isDefault: false,
        isAddBank: true
      });
    }

    // Add "Add New Card"
    methods.push({
      id: 'add-card',
      type: 'add',
      name: 'Add New Card',
      subtitle: 'Save and pay via cards.',
      icon: NewCardIcon,
      isDefault: false,
      isAddCard: true
    });

    return methods;
  };

  const paymentMethods = generatePaymentMethods();

  // API Functions
  const fetchWalletData = async () => {
    setLoading(true);
    try {
      // Fetch wallet balance
      const balanceResponse = await userAPI.getWalletBalance();
      if (balanceResponse.success) {
        setWalletBalance(balanceResponse.data.currentBalance);
      }

      // Fetch cards
      const cardsResponse = await userAPI.getCards();
      if (cardsResponse.success) {
        setCards(cardsResponse.data.cards || []);
      }

      // Fetch bank accounts
      const bankResponse = await userAPI.getBankAccounts();
      if (bankResponse.success) {
        setBankAccounts(bankResponse.data.accounts || []);
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleMakeDefault = async (methodId) => {
    try {
      setLoading(true);
      if (methodId.startsWith('card_')) {
        const cardId = methodId.replace('card_', '');
        const response = await userAPI.setDefaultCard(cardId);
        if (response.success) {
          await fetchWalletData(); // Refresh data
        }
      } else if (methodId.startsWith('bank_')) {
        const bankId = methodId.replace('bank_', '');
        const response = await userAPI.setDefaultBankAccount(bankId);
        if (response.success) {
          await fetchWalletData(); // Refresh data
        }
      }
    } catch (error) {
      console.error('Error setting default payment method:', error);
    } finally {
      setLoading(false);
      setActiveDropdown(null);
    }
  };

  const handleRemove = (methodId) => {
    setItemToRemove(methodId);
    if (methodId.startsWith('card_')) {
      setItemType('card');
    } else if (methodId.startsWith('bank_')) {
      setItemType('bank');
    }
    setShowConfirmationModal(true);
    setActiveDropdown(null);
  };

  const handleConfirmRemove = async () => {
    if (!itemToRemove) return;
    
    try {
      setLoading(true);
      if (itemToRemove.startsWith('card_')) {
        const cardId = itemToRemove.replace('card_', '');
        if (!cardId || cardId === 'undefined') {
          return;
        }
        const response = await userAPI.deleteCard(cardId);
        if (response.success) {
          await fetchWalletData(); // Refresh data
        }
      } else if (itemToRemove.startsWith('bank_')) {
        const bankId = itemToRemove.replace('bank_', '');
        if (!bankId || bankId === 'undefined') {
          return;
        }
        const response = await userAPI.deleteBankAccount(bankId);
        if (response.success) {
          await fetchWalletData(); // Refresh data
        }
      }
    } catch (error) {
      console.error('Error removing payment method:', error);
    } finally {
      setLoading(false);
      setShowConfirmationModal(false);
      setItemToRemove(null);
      setItemType(null);
    }
  };

  const handleCancelRemove = () => {
    setShowConfirmationModal(false);
    setItemToRemove(null);
    setItemType(null);
  };

  const handleClickOutside = (event) => {
    if (!event.target.closest('.dropdown-container')) {
      setActiveDropdown(null);
    }
    if (bankDropdownRef.current && !bankDropdownRef.current.contains(event.target)) {
      setShowBankDropdown(false);
    }
  };

  const handleCardFormChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Handle expiry field formatting
    if (name === 'expiry') {
      // Remove any non-numeric characters
      const numericValue = value.replace(/\D/g, '');

      // Format as MM/YY or MM/YYYY
      let formattedValue = numericValue;
      if (numericValue.length >= 2) {
        formattedValue = numericValue.substring(0, 2) + '/' + numericValue.substring(2, 6);
      }

      setCardForm(prev => ({
        ...prev,
        [name]: formattedValue
      }));
      return;
    }

    // Handle card number formatting
    if (name === 'cardNumber') {
      // Remove any non-numeric characters
      const numericValue = value.replace(/\D/g, '');

      // Format as XXXX XXXX XXXX XXXX
      let formattedValue = numericValue;
      if (numericValue.length > 0) {
        formattedValue = numericValue.match(/.{1,4}/g)?.join(' ') || numericValue;
      }

      setCardForm(prev => ({
        ...prev,
        [name]: formattedValue
      }));
      return;
    }

    // Handle CVV formatting (only numbers, max 4 digits)
    if (name === 'cvv') {
      const numericValue = value.replace(/\D/g, '').substring(0, 4);
      setCardForm(prev => ({
        ...prev,
        [name]: numericValue
      }));
      return;
    }

    setCardForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleBankFormChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Handle BSB formatting (only numbers, max 6 digits)
    if (name === 'bsb') {
      const numericValue = value.replace(/\D/g, '').substring(0, 6);
      setBankForm(prev => ({
        ...prev,
        [name]: numericValue
      }));
      return;
    }

    // Handle account number formatting (only numbers, max 10 digits)
    if (name === 'accountNumber') {
      const numericValue = value.replace(/\D/g, '').substring(0, 10);
      setBankForm(prev => ({
        ...prev,
        [name]: numericValue
      }));
      return;
    }

    setBankForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleBankSelect = (bankName) => {
    setBankForm(prev => ({
      ...prev,
      bankName: bankName
    }));
    setShowBankDropdown(false);
  };

  const toggleBankDropdown = () => {
    setShowBankDropdown(!showBankDropdown);
  };

  const handleAddCard = async (e) => {
    e.preventDefault();
    setLoading(true);
    setCardError('');
    try {
      // Validate expiry format
      const expiryRegex = /^(0[1-9]|1[0-2])\/(\d{2}|\d{4})$/;
      if (!expiryRegex.test(cardForm.expiry)) {
        setCardError('Invalid expiry format. Use MM/YY');
        setLoading(false);
        return;
      }

      // Validate card number
      const cleanCardNumber = cardForm.cardNumber.replace(/\s/g, '');
      if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
        setCardError('Card number must be 13-19 digits');
        setLoading(false);
        return;
      }

      // Parse expiry date
      const [month, year] = cardForm.expiry.split('/');

      // Extract last four digits from card number
      const lastFourDigits = cleanCardNumber.slice(-4);

      const cardData = {
        cardHolderName: cardForm.cardHolderName,
        cardNumber: cardForm.cardNumber,
        lastFourDigits: lastFourDigits,
        expiry: cardForm.expiry,
        cvv: cardForm.cvv,
        setAsDefault: Boolean(cardForm.setAsDefault) // Ensure it's a boolean
      };

      const response = await userAPI.addCard(cardData);

      if (response.success) {
        await fetchWalletData(); // Refresh data
        setShowAddCardModal(false);
        setCardForm({
          cardHolderName: '',
          cardNumber: '',
          expiry: '',
          cvv: '',
          setAsDefault: false
        });
      } else {
        setCardError(response.message || 'Failed to add card');
      }
    } catch (error) {
      setCardError(error?.message || 'Error adding card');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBank = async (e) => {
    e.preventDefault();
    setLoading(true);
    setBankError('');
    try {
      // Validate BSB format (6 digits)
      if (bankForm.bsb.length !== 6) {
        setBankError('BSB must be exactly 6 digits');
        setLoading(false);
        return;
      }

      // Validate account number (4-10 digits)
      if (bankForm.accountNumber.length < 4 || bankForm.accountNumber.length > 10) {
        setBankError('Account number must be between 4 and 10 digits');
        setLoading(false);
        return;
      }

      const bankData = {
        accountName: bankForm.accountName,
        bankName: bankForm.bankName,
        bsb: bankForm.bsb,
        accountNumber: bankForm.accountNumber,
        setAsDefault: Boolean(bankForm.setAsDefault) 
      };

      const response = await userAPI.addBankAccount(bankData);
      if (response.success) {
        await fetchWalletData(); // Refresh data
        setShowAddBankModal(false);
        setBankForm({
          accountName: '',
          bankName: '',
          bsb: '',
          accountNumber: '',
          setAsDefault: true
        });
      } else {
        setBankError(response.message || 'Failed to add bank account');
      }
    } catch (error) {
      setBankError(error?.message || 'Error adding bank account');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowAddCardModal(false);
    setCardForm({
      cardHolderName: '',
      cardNumber: '',
      expiry: '',
      cvv: '',
      setAsDefault: false
    });
  };

  const closeBankModal = () => {
    setShowAddBankModal(false);
    setBankForm({
      accountName: '',
      bankName: '',
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

  // Fetch wallet data on component mount
  useEffect(() => {
    fetchWalletData();
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="Wallet & Payments"
          onBack={() => navigate(-1)}
          className="h-16"
          titleClassName="text-xl font-semibold text-gray-900"
        />
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
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-500 mb-2">
                  ${loading ? '...' : (walletBalance || 0).toFixed(2)}
                </div>
                <p className="text-sm text-[#374151] mb-4">Available to use for bookings & top-ups.</p>
              </div>
              <div className="flex justify-end w-full sm:w-auto">
                <Button
                  onClick={handleTopUp}
                  size="sm"
                  className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-[8px] text-sm font-medium shadow-custom"
                >
                  Top Up Wallet
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Saved Payment Methods */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8 mb-6">
          <h3 className="text-lg font-semibold text-primary-500 mb-4 sm:mb-6">Saved Payment Methods</h3>
          <div className="space-y-3 sm:space-y-4">
            {paymentMethods
              .filter((m) => !m.isAddCard)
              .map((method, index) => (
                <div
                  key={method.id || `method-${index}`}
                  className={`relative flex items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg bg-[#F9FAFB] transition-colors ${method.isAddBank ? 'cursor-pointer hover:bg-gray-100' : ''
                    }`}
                  onClick={method.isAddBank ? () => handlePaymentMethodAction(method) : undefined}
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
                  {!method.isAddBank && (
                    <div className="relative dropdown-container">
                      <Button
                        onClick={() => handlePaymentMethodAction(method)}
                        variant="ghost"
                        size="sm"
                        icon={ThreeDotIcon}
                        className="p-2"
                      />
                      {activeDropdown === method.id && (
                        <div className="absolute right-0 top-full w-48 bg-white rounded-2xl! shadow-custom border border-gray-200 z-50">
                          <div className="py-2">
                            <Button
                              onClick={() => handleMakeDefault(method.id)}
                              variant="ghost"
                              size="sm"
                              icon={CheckIcon}
                              className="w-full justify-start px-4 py-3 text-gray-700"
                            >
                              Make Default
                            </Button>
                            <Button
                              onClick={() => handleRemove(method.id)}
                              variant="ghost"
                              size="sm"
                              icon={TrashRedIcon}
                              className="w-full justify-start px-4 py-3 text-red-600 hover:bg-red-50"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

            {bankAccounts.length > 0 && (
              <Button
                type="button"
                onClick={() => setShowAddBankModal(true)}
                variant="link"
                size="sm"
                className="text-primary-600 font-medium text-sm sm:text-base text-left"
              >
                Add Another Bank Account
              </Button>
            )}

            {paymentMethods
              .filter((m) => m.isAddCard)
              .map((method, index) => (
                <div
                  key={method.id || `method-${index}`}
                  className={`relative flex items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg bg-[#F9FAFB] transition-colors cursor-pointer hover:bg-gray-100`}
                  onClick={() => handlePaymentMethodAction(method)}
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
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => handlePaymentMethodAction(method)}
                      variant="ghost"
                      size="sm"
                      icon={ChevronRightIcon}
                      className="p-2"
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Card Carousel */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Your Cards</h3>

          {/* Card Display */}
          <div className="relative mb-6">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="text-gray-500">Loading cards...</div>
              </div>
            ) : cards.length > 0 ? (
              <div className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide">
                {cards.map((card, index) => (
                  <div
                    key={card.id || card._id || `card-${index}`}
                    onClick={() => handleCardClick(index)}
                    className={`flex-shrink-0 w-64 sm:w-72 md:w-80 h-40 sm:h-44 md:h-48 rounded-xl sm:rounded-2xl p-4 sm:p-6 cursor-pointer transition-all duration-300 ${index === currentCardIndex
                        ? 'bg-gradient-to-r from-blue-500 to-blue-700 scale-100'
                        : 'bg-gradient-to-r from-gray-300 to-gray-400 scale-95 opacity-70'
                      }`}
                  >
                    <div className="flex flex-col justify-between h-full text-white">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs sm:text-sm">Card Number</p>
                          <p className="text-xl sm:text-2xl lg:text-3xl font-bold mt-1">
                            **** **** **** {card.lastFourDigits}
                          </p>
                        </div>
                        {card.cardType?.toLowerCase() === 'mastercard' && (
                          <div className="w-12 h-8 rounded flex items-center justify-center">
                            <img src={MastercardLogo} alt="Mastercard" className="w-10 h-8" />
                          </div>
                        )}
                        {card.cardType?.toLowerCase() === 'visa' && (
                          <div className="w-12 h-8 bg-white rounded flex items-center justify-center">
                            <span className="text-blue-600 font-bold text-sm">VISA</span>
                          </div>
                        )}
                        {card.cardType?.toLowerCase() === 'amex' && (
                          <div className="w-12 h-8 bg-white rounded flex items-center justify-center">
                            <span className="text-green-600 font-bold text-xs">AMEX</span>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-xs sm:text-sm font-medium">{card.cardHolderName}</p>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-medium">
                            {card.expiryMonth}/{card.expiryYear}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex justify-center items-center h-40">
                <div className="text-gray-500">No cards added yet</div>
              </div>
            )}
          </div>

          {/* Pagination Dots */}
          {cards.length > 0 && (
            <div className="flex justify-center space-x-1 mt-4 sm:mt-6">
              {cards.map((_, index) => (
                <Button
                  key={index}
                  onClick={() => handleCardClick(index)}
                  variant="ghost"
                  size="xs"
                  className={`transition-all duration-300 p-0 ${index === currentCardIndex
                      ? 'bg-primary-500 w-6 h-2 sm:w-8 sm:h-2'
                      : 'bg-gray-300 w-2 h-2 sm:w-4 sm:h-2 hover:bg-gray-400'
                    }`}
                />
              ))}
            </div>
          )}
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
            className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md md:max-w-lg shadow-custom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Button
                  onClick={closeModal}
                  variant=""
                  size="sm"
                  icon={ArrowLeftIcon}
                  className="p-2 mr-3"
                />
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Add New Card</h2>
              </div>
              <Button
                onClick={closeModal}
                variant=""
                size="sm"
                className="text-gray-400 hover:text-gray-600 p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>

            <form onSubmit={handleAddCard} className="space-y-4">
              {cardError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  {cardError}
                </div>
              )}
              {/* Card Holder Name */}
              <FloatingLabelInput
                id="cardHolderName"
                name="cardHolderName"
                label="Card Holder Name"
                type="text"
                value={cardForm.cardHolderName}
                onChange={handleCardFormChange}
                required
              />

              {/* Card Number */}
              <FloatingLabelInput
                id="cardNumber"
                name="cardNumber"
                label="Card Number"
                type="text"
                value={cardForm.cardNumber}
                onChange={handleCardFormChange}
                required
              />

              {/* Expiry and CVV */}
              <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
                <div className="flex-1">
                  <FloatingLabelInput
                    id="expiry"
                    name="expiry"
                    label="MM/YY"
                    type="text"
                    value={cardForm.expiry}
                    onChange={handleCardFormChange}
                    required
                  />
                </div>
                <div className="flex-1">
                  <FloatingLabelInput
                    id="cvv"
                    name="cvv"
                    label="CVV"
                    type="text"
                    value={cardForm.cvv}
                    onChange={handleCardFormChange}
                    required
                  />
                </div>
              </div>

              {/* Set as Default Checkbox */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="setAsDefault"
                  checked={cardForm.setAsDefault}
                  onChange={handleCardFormChange}
                  className="w-4 h-4 text-primary-500 bg-gray-100 border-gray-300 rounded focus:outline-none cursor-pointer"
                />
                <label className="ml-2 text-sm font-medium text-gray-700">
                  Set as default payment method
                </label>
              </div>

              {/* Add New Card Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  loading={loading}
                  fullWidth
                  size="md"
                >
                  Add New Card
                </Button>
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
            className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md md:max-w-lg shadow-custom"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Button
                  onClick={closeBankModal}
                  variant=""
                  size="sm"
                  icon={ArrowLeftIcon}
                  className="p-2 mr-3 [&>img]:w-6 [&>img]:h-6"
                />
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Add Bank Account</h2>
              </div>
              <Button
                onClick={closeBankModal}
                variant=""
                size="sm"
                className="text-gray-400 hover:text-gray-600 p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>

            <form onSubmit={handleAddBank} className="space-y-4">

              {/* Account Name */}
              <FloatingLabelInput
                id="accountName"
                name="accountName"
                label="Account Name"
                type="text"
                value={bankForm.accountName}
                onChange={handleBankFormChange}
                required
              />

              {/* Bank Selection Dropdown */}
              <div className="relative" ref={bankDropdownRef}>
                <button
                  type="button"
                  onClick={toggleBankDropdown}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-left flex items-center justify-between bg-white"
                >
                  <span className={bankForm.bankName ? 'text-gray-900' : 'text-gray-500'}>
                    {bankForm.bankName || 'Select your bank'}
                  </span>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${showBankDropdown ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showBankDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {bankList.map((bank, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleBankSelect(bank)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                      >
                        <span className="text-sm text-gray-900">{bank}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* BSB */}
              <FloatingLabelInput
                id="bsb"
                name="bsb"
                label="BSB Number"
                type="text"
                value={bankForm.bsb}
                onChange={handleBankFormChange}
                required
              />

              {/* Account Number */}
              <FloatingLabelInput
                id="accountNumber"
                name="accountNumber"
                label="Account Number"
                type="text"
                value={bankForm.accountNumber}
                onChange={handleBankFormChange}
                required
              />
              {bankError && (
                <div className="text-[#EF4444] text-sm font-medium" >
                  {bankError}
                </div>
              )}
              {/* Set as Default Checkbox */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="setAsDefault"
                  checked={bankForm.setAsDefault}
                  onChange={handleBankFormChange}
                  className="w-4 h-4 text-primary-500 bg-gray-100 border-gray-300 rounded focus:outline-none cursor-pointer"
                />
                <label className="ml-2 text-sm font-medium text-gray-700">
                  Set as default payment
                </label>
              </div>

              {/* Add Bank Account Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  loading={loading}
                  fullWidth
                  size="md"
                >
                  Add Bank Account
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmationModal}
        onClose={handleCancelRemove}
        onConfirm={handleConfirmRemove}
        title={itemType === 'card' ? "Remove Card?" : itemType === 'bank' ? "Remove Bank Account?" : "Remove Payment Method?"}
        message={itemType === 'card' 
          ? "Are you sure you want to remove this card? This action cannot be undone."
          : itemType === 'bank' 
          ? "Are you sure you want to remove this bank account? This action cannot be undone."
          : "Are you sure you want to remove this payment method? This action cannot be undone."
        }
        confirmText="Remove"
        cancelText="Cancel"
        confirmButtonColor="bg-red-500 hover:bg-red-600"
        isLoading={loading}
      />
    </div>
  );
};

export default WalletPage;
