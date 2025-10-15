import { API_CONFIG } from '../config/api';

// API Configuration
const API_BASE_URL = API_CONFIG.BASE_URL;

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Generic API request function for payments
const paymentApiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Check if response is HTML (404 page) instead of JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      throw new Error(`API endpoint not found: ${endpoint}. Backend server may not be running.`);
    }

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      const textResponse = await response.text();
      throw new Error(`Invalid JSON response: ${textResponse}`);
    }

    if (!response.ok) {
      const errorMessage = data.error || data.message || `API request failed with status ${response.status}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.response = data;
      throw error;
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Payment API Service
export const paymentService = {
  /**
   * Create payment for job
   * @param {string} jobId - Job ID
   * @param {string} paymentMethod - 'cash' or 'online'
   * @param {boolean} useCheckout - Use Stripe Checkout (true) or Elements (false)
   * @param {string} captureMethod - 'automatic' (instant) or 'manual' (3-day hold) - DEFAULT: 'manual'
   * @returns {Promise} Payment response with checkout URL or clientSecret
   */
  createPayment: async (jobId, paymentMethod, useCheckout = true, captureMethod = 'manual') => {
    return paymentApiRequest('/payments/create', {
      method: 'POST',
      body: JSON.stringify({ 
        jobId, 
        paymentMethod, 
        useCheckout,
        captureMethod  // ← NEW: Added capture method
      }),
    });
  },

  /**
   * Capture manually held payment
   * @param {string} paymentId - Payment ID
   * @returns {Promise} Capture response
   */
  capturePayment: async (paymentId) => {
    return paymentApiRequest(`/payments/capture/${paymentId}`, {
      method: 'POST',
    });
  },

  /**
   * Release payment to cleaner after job completion
   * @param {string} jobId - Job ID
   * @returns {Promise} Release payment response
   */
  releasePayment: async (jobId) => {
    return paymentApiRequest(`/payments/release/${jobId}`, {
      method: 'POST',
    });
  },

  /**
   * Get payment status for a job
   * @param {string} jobId - Job ID
   * @returns {Promise} Payment status details
   */
  getPaymentStatus: async (jobId) => {
    return paymentApiRequest(`/payments/status/${jobId}`);
  },

  /**
   * Get payment history for user
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise} Payment history with pagination
   */
  getPaymentHistory: async (page = 1, limit = 10) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    return paymentApiRequest(`/payments/history?${params.toString()}`);
  },

  /**
   * Create Stripe Connect account for cleaner
   * @returns {Promise} Stripe Connect account creation response with onboarding URL
   */
  createStripeConnectAccount: async () => {
    return paymentApiRequest('/payments/stripe/connect', {
      method: 'POST',
    });
  },

  /**
   * Get Stripe Connect account status
   * @returns {Promise} Stripe account status
   */
  getStripeAccountStatus: async () => {
    try {
      return await paymentApiRequest('/payments/stripe/account/status');
    } catch (error) {
      // If no Stripe account found, return null instead of throwing
      if (error.response?.code === 'NO_STRIPE_ACCOUNT' || error.status === 404) {
        return { success: false, data: null };
      }
      throw error;
    }
  },

  /**
   * Test Stripe Connect status (no auth required)
   * @returns {Promise} Test result with account details
   */
  testStripeConnect: async () => {
    return paymentApiRequest('/payments/test-connect');
  },
};

/**
 * Handle payment API errors
 * @param {Error} error - Error object
 * @returns {string} User-friendly error message
 */
export const handlePaymentError = (error) => {
  console.error('Payment API Error:', error);

  // Handle specific error codes
  if (error.response?.code === 'JOB_NOT_FOUND') {
    return 'Job not found. Please try again.';
  }

  if (error.response?.code === 'JOB_NOT_ACCEPTED') {
    return 'Job must be accepted before payment.';
  }

  if (error.response?.code === 'NO_ACCEPTED_QUOTE') {
    return 'No accepted quote found for this job.';
  }

  if (error.response?.code === 'CLEANER_NO_STRIPE_ACCOUNT') {
    return 'Cleaner has not set up their payment account yet.';
  }

  if (error.response?.code === 'ACCESS_DENIED') {
    return 'You do not have permission to perform this action.';
  }

  if (error.response?.code === 'VALIDATION_ERROR') {
    return error.response?.details?.map(d => d.msg).join(', ') || 'Validation failed.';
  }

  if (error.response?.code === 'PAYMENT_NOT_FOUND') {
    return 'Payment not found.';
  }

  if (error.response?.code === 'INVALID_PAYMENT_STATUS') {
    return 'Payment cannot be captured. Invalid status.';
  }

  if (error.response?.code === 'CAPTURE_FAILED') {
    return 'Payment capture failed. Please try again.';
  }

  // Handle authentication errors
  if (error.message.includes('401') || error.message.includes('Unauthorized')) {
    return 'Session expired. Please login again.';
  }

  // Handle network errors
  if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
    return 'Network error. Please check your connection.';
  }

  // Default error message
  return error.message || 'Payment processing failed. Please try again.';
};

/**
 * Helper: Get payment status badge info for UI
 * @param {string} status - Payment status
 * @returns {object} Badge color and text
 */
export const getPaymentStatusBadge = (status) => {
  switch (status) {
    case 'succeeded':
    case 'completed':
      return { color: 'green', text: 'Completed', icon: '✅' };
    case 'pending_capture':
      return { color: 'orange', text: 'Pending Capture', icon: '⏳' };
    case 'processing':
      return { color: 'blue', text: 'Processing', icon: '🔄' };
    case 'pending':
      return { color: 'yellow', text: 'Pending', icon: '⏱️' };
    case 'failed':
      return { color: 'red', text: 'Failed', icon: '❌' };
    case 'cancelled':
      return { color: 'gray', text: 'Cancelled', icon: '🚫' };
    default:
      return { color: 'gray', text: status, icon: '❓' };
  }
};

export default paymentService;