// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_BACKEND_URL  + '/api',
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
};

// Service Types
export const SERVICE_TYPES = {
  CLEANING: 'cleaning',
  HOUSEKEEPING: 'housekeeping',
  NDIS: 'ndis',
  RETAIL: 'retail',
  PETSITTING: 'petsitting',
  HANDYMAN: 'handyman',
};

// Property Types
export const PROPERTY_TYPES = {
  HOUSE: 'house',
  APARTMENT: 'apartment',
  OFFICE: 'office',
};

// Job Status
export const JOB_STATUS = {
  POSTED: 'posted',
  QUOTED: 'quoted',
  ACCEPTED: 'accepted',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Quote Status
export const QUOTE_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
};

// User Types
export const USER_TYPES = {
  CUSTOMER: 'customer',
  CLEANER: 'cleaner',
};

export default API_CONFIG;
