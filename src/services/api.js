import { API_CONFIG } from '../config/api';

// API Configuration
const API_BASE_URL = API_CONFIG.BASE_URL;

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to get user info
const getUserInfo = () => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  // Debug logging
  if (!user) {
    console.warn('No user found in localStorage');
  } else if (!user._id && !user.id) {
    console.warn('User found but no ID:', user);
  } else {
    const userType = user.userType || user.role;
  }

  return user;
};

// Helper function to get stored token
export const getStoredToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to get stored user
export const getStoredUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
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

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `API request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    // Don't log errors for missing endpoints during development
    if (!error.message.includes('API endpoint not found')) {
      console.error('API Error:', error);
    }
    throw error;
  }
};

// Authentication API
export const authAPI = {
  // Login user
  login: async (email, password, userType) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, userType }),
    });

    // Store token and user data
    if (response.success && response.data && response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    } else {
    }

    return response;
  },

  // Register customer
  registerCustomer: async (userData) => {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    // Store token and user data if registration includes auto-login
    if (response.success && response.data && response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    } else {
    }

    return response;
  },

  // Register cleaner
  registerCleaner: async (userData) => {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    // Store token and user data if registration includes auto-login
    if (response.success && response.token) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  },

  // Get current user
  getCurrentUser: async () => {
    return apiRequest('/auth/me');
  },

  // Logout (clear local storage)
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },
};

// Jobs API
export const jobsAPI = {
  // Create new job
  createJob: async (jobData) => {
    return apiRequest('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  },

  // Create new job with file uploads
  createJobWithFiles: async (jobData, files = {}) => {
    const user = getUserInfo();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const formData = new FormData();

    // Add job data fields (location should come from jobData, not user)
    const jobPayload = {
      ...jobData,
    };

    Object.keys(jobPayload).forEach(key => {
      if (jobPayload[key] !== null && jobPayload[key] !== undefined) {
        if (typeof jobPayload[key] === 'object') {
          formData.append(key, JSON.stringify(jobPayload[key]));
        } else {
          formData.append(key, jobPayload[key]);
        }
      }
    });

    // Add photo files
    if (files.photos && files.photos.length > 0) {
      files.photos.forEach(photo => {
        formData.append('photos', photo);
      });
    }

    // Add video files
    if (files.videos && files.videos.length > 0) {
      files.videos.forEach(video => {
        formData.append('videos', video);
      });
    }

    const token = getAuthToken();

    try {
      const response = await fetch(`${API_BASE_URL}/jobs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Failed to create job with files');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating job with files:', error);
      throw error;
    }
  },

  // Get customer's jobs
  getCustomerJobs: async (customerId) => {
    return apiRequest(`/jobs/customer/${customerId}`);
  },

  // Get job details with quotes
  getJobDetails: async (jobId) => {
    return apiRequest(`/jobs/${jobId}`);
  },

  // Update job status
  updateJobStatus: async (jobId, status) => {
    return apiRequest(`/jobs/${jobId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // Cancel job
  cancelJob: async (jobId) => {
    return apiRequest(`/jobs/${jobId}`, {
      method: 'DELETE',
    });
  },
};

// Quotes API
export const quotesAPI = {
  // Submit quote for job
  submitQuote: async (jobId, quoteData) => {
    return apiRequest(`/jobs/${jobId}/quotes`, {
      method: 'POST',
      body: JSON.stringify(quoteData),
    });
  },

  // Accept quote
  acceptQuote: async (jobId, quoteId) => {
    return apiRequest(`/jobs/${jobId}/quotes/${quoteId}/accept`, {
      method: 'POST',
    });
  },

  // Get cleaner's quotes
  getCleanerQuotes: async (status = null) => {
    const query = status ? `?status=${status}` : '';
    return apiRequest(`/jobs/quotes/cleaner${query}`);
  },

  // Update quote
  updateQuote: async (quoteId, quoteData) => {
    return apiRequest(`/jobs/quotes/${quoteId}`, {
      method: 'PUT',
      body: JSON.stringify(quoteData),
    });
  },

  // Withdraw quote
  withdrawQuote: async (quoteId) => {
    return apiRequest(`/jobs/quotes/${quoteId}`, {
      method: 'DELETE',
    });
  },
};

// Location API
export const locationAPI = {
  // Search locations
  searchLocations: async (query) => {
    return apiRequest(`/locations/search?q=${encodeURIComponent(query)}`);
  },

  // Find nearby cleaners
  findNearbyCleaners: async (lat, lng, radius = 10) => {
    return apiRequest(`/cleaners/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
  },
};

// User API
export const userAPI = {
  // Update user profile
  updateProfile: async (userData) => {
    // TODO: Implement when backend routes are available
    console.warn('updateProfile API not implemented yet - using localStorage');

    // Store in localStorage as fallback
    const user = getUserInfo();
    if (user) {
      const updatedUser = { ...user, ...userData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }

    return { success: true, message: 'Profile updated in localStorage' };
  },

  // Get user profile
  getProfile: async () => {
    // TODO: Implement when backend routes are available
    console.warn('getProfile API not implemented yet - using localStorage');

    const user = getUserInfo();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Return user data from localStorage
    return {
      success: true,
      data: {
        ...user,
        location: JSON.parse(localStorage.getItem('userLocation') || 'null')
      }
    };
  },

  // Update user location
  updateLocation: async (locationData) => {
    // TODO: Implement when backend routes are available
    console.warn('updateLocation API not implemented yet - using localStorage');

    // Store in localStorage as fallback
    localStorage.setItem('userLocation', JSON.stringify(locationData));

    return { success: true, message: 'Location updated in localStorage' };
  },
};

// File upload helper (Cloudinary)
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const token = getAuthToken();

  try {
    const response = await fetch(`${API_BASE_URL}/uploads/single`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Upload failed');
    }

    return data.data.secureUrl || data.data.url;
  } catch (error) {
    console.error('Upload Error:', error);
    throw error;
  }
};

// Cloudinary file upload helper
export const uploadFileToCloudinary = async (file, type = 'files') => {
  const formData = new FormData();
  formData.append(type === 'photos' ? 'photos' : type === 'videos' ? 'videos' : 'files', file);

  const token = getAuthToken();

  try {
    const endpoint = type === 'photos' || type === 'videos'
      ? `${API_BASE_URL}/uploads/job-media`
      : `${API_BASE_URL}/uploads/multiple`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to upload file to Cloudinary');
    }

    const result = await response.json();

    // Return the first file from the response
    if (result.data.files && result.data.files.length > 0) {
      return result.data.files[0];
    }

    return result.data;
  } catch (error) {
    console.error('Error uploading file to Cloudinary:', error);
    throw error;
  }
};

// Upload multiple files to Cloudinary
export const uploadMultipleFilesToCloudinary = async (files, type = 'files') => {
  const formData = new FormData();

  files.forEach(file => {
    formData.append(type === 'photos' ? 'photos' : type === 'videos' ? 'videos' : 'files', file);
  });

  const token = getAuthToken();

  try {
    const endpoint = type === 'photos' || type === 'videos'
      ? `${API_BASE_URL}/uploads/job-media`
      : `${API_BASE_URL}/uploads/multiple`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to upload files to Cloudinary');
    }

    const result = await response.json();
    return result.data.files || [result.data];
  } catch (error) {
    console.error('Error uploading files to Cloudinary:', error);
    throw error;
  }
};

// Error handling helper
export const handleAPIError = (error) => {
  if (error.message.includes('401') || error.message.includes('Unauthorized')) {
    // Token expired or invalid
    authAPI.logout();
    window.location.href = '/login';
    return 'Session expired. Please login again.';
  }

  return error.message || 'Something went wrong. Please try again.';
};

export default {
  authAPI,
  jobsAPI,
  quotesAPI,
  locationAPI,
  userAPI,
  uploadFile,
  uploadFileToCloudinary,
  uploadMultipleFilesToCloudinary,
  handleAPIError,
};