const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    // Handle validation errors with more detail
    if (data.errors && Array.isArray(data.errors)) {
      const errorMessages = data.errors.map(err => {
        if (err.path && err.msg) {
          return `${err.path}: ${err.msg}`;
        } else if (err.msg) {
          return err.msg;
        } else {
          return JSON.stringify(err);
        }
      }).join(', ');
      throw new Error(errorMessages);
    }
    
    // Handle single error message
    if (data.message) {
      throw new Error(data.message);
    }
    
    // Fallback: show raw error data if we can't parse it
    throw new Error(`Validation failed: ${JSON.stringify(data)}`);
  }
  
  return data;
};

// Authentication API functions
export const authAPI = {
  // Register a new user
  register: async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(userData)
      });
      
      const data = await handleResponse(response);
      
      if (data.success && data.data.token) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
      }
      
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });
      
      const data = await handleResponse(response);
      
      if (data.success && data.data.token) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
      }
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },

  // Reset password
  resetPassword: async (token, password, confirmPassword) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password,
          confirmPassword
        })
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  },

  // Update profile
  updateProfile: async (profileData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(profileData)
      });
      
      const data = await handleResponse(response);
      
      if (data.success && data.data.user) {
        localStorage.setItem('user', JSON.stringify(data.data.user));
      }
      
      return data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  // Add address
  addAddress: async (address) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/address`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ address })
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Add address error:', error);
      throw error;
    }
  },

  // Update address
  updateAddress: async (address) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/address`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ address })
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Update address error:', error);
      throw error;
    }
  },

  // Get address
  getAddress: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/address`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Get address error:', error);
      throw error;
    }
  },

  // Delete account
  deleteAccount: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/account`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      const data = await handleResponse(response);
      
      if (data.success) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      
      return data;
    } catch (error) {
      console.error('Delete account error:', error);
      throw error;
    }
  },

  // Logout (clear local storage)
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// Utility functions
export const getStoredUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const getStoredToken = () => {
  return localStorage.getItem('token');
};

export const isAuthenticated = () => {
  return !!getStoredToken();
};
