// Import auth utilities
import { getUserToken } from '../utils/auth';

const API_BASE_URL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'development' ? '/api' : 'http://localhost:5000/api');

/**
 * Generic API request function
 */
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available
  const token = getUserToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

/**
 * Admin API request function with admin token
 */
const adminApiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add admin token if available
  const adminToken = localStorage.getItem('adminToken');
  if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('Admin API request failed:', error);
    throw error;
  }
};

/**
 * Authentication API functions
 */
export const authAPI = {
  // Register new user
  register: async (userData) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
  // Verify OTP
  verifyOTP: async (email, otp) => {
    return apiRequest('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otpCode: otp }),
    });
  },

  // Resend OTP
  resendOTP: async (email) => {
    return apiRequest('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  // Login user
  login: async (email, password) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  // Get user profile
  getProfile: async () => {
    return apiRequest('/auth/profile', {
      method: 'GET',
    });
  },

  // Update user profile
  updateProfile: async (userData) => {
    return apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  // Health check
  healthCheck: async () => {
    return apiRequest('/auth/health', {
      method: 'GET',
    });
  },
  // Brand registration
  brandRegister: async (brandData) => {
    return apiRequest('/brand-auth/register', {
      method: 'POST',
      body: JSON.stringify(brandData),
    });
  },

  // Brand registration with FormData (for file uploads)
  brandRegisterWithFormData: async (formData) => {
    const url = `${API_BASE_URL}/brand-auth/register`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData, // Don't set Content-Type header, let browser set it with boundary
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  },

  // Brand OTP verification
  brandVerifyOTP: async (email, otpCode) => {
    return apiRequest('/brand-auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otpCode }),
    });
  },

  // Brand resend OTP
  brandResendOTP: async (email) => {
    return apiRequest('/brand-auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  // Brand login
  brandLogin: async (email, password) => {
    return apiRequest('/brand-auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  // Forgot password - send reset code
  forgotPassword: async (email) => {
    return apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  // Verify forgot password OTP
  verifyForgotPasswordOTP: async (email, otpCode) => {
    return apiRequest('/auth/verify-forgot-password-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otpCode }),
    });
  },

  // Reset password
  resetPassword: async (email, resetToken, newPassword) => {
    return apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, resetToken, newPassword }),
    });
  },

  // Brand forgot password - send reset code
  brandForgotPassword: async (email) => {
    return apiRequest('/brand-auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  // Verify brand forgot password OTP
  verifyBrandForgotPasswordOTP: async (email, otpCode) => {
    return apiRequest('/brand-auth/forgot-password/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otpCode }),
    });
  },

  // Brand reset password
  brandResetPassword: async (email, resetToken, newPassword) => {
    return apiRequest('/brand-auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, resetToken, newPassword }),
    });
  },
};

/**
 * Admin API functions
 */
export const adminAPI = {
  // Admin login with secret key (no auth token needed)
  login: async (secretKey) => {
    return apiRequest('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ secretKey }),
    });
  },

  // Get pending brands
  getPendingBrands: async () => {
    return adminApiRequest('/admin/brands/pending', {
      method: 'GET',
    });
  },

  // Approve brand
  approveBrand: async (brandId, adminNote = '') => {
    return adminApiRequest(`/admin/brands/${brandId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ reason: adminNote }),
    });
  },

  // Reject brand
  rejectBrand: async (brandId, reason = '', adminNote = '') => {
    return adminApiRequest(`/admin/brands/${brandId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason: reason || adminNote }),
    });
  },

  // Get all brands (pending, approved, rejected)
  getAllBrands: async () => {
    return adminApiRequest('/admin/brands/all', {
      method: 'GET',
    });
  },

  // Get dashboard stats (alternative name for consistency)
  getDashboardStats: async () => {
    return adminApiRequest('/admin/dashboard/stats', {
      method: 'GET',
    });
  },

  // Get pending offers
  getPendingOffers: async () => {
    return adminApiRequest('/admin/offers/pending', {
      method: 'GET',
    });
  },

  // Approve offer
  approveOffer: async (offerId) => {
    return adminApiRequest(`/admin/offers/${offerId}/approve`, {
      method: 'POST',
    });
  },

  // Reject offer
  rejectOffer: async (offerId, reason = '') => {
    return adminApiRequest(`/admin/offers/${offerId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },
};

/**
 * Offers API functions
 */
export const offersAPI = {
  // Get all offers (public view)
  getAllOffers: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.limit) queryParams.append('limit', filters.limit);
    if (filters.public_view) queryParams.append('public_view', 'true');
    
    const endpoint = `/offers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiRequest(endpoint, { method: 'GET' });
  },

  // Get offers for authenticated brand
  getBrandOffers: async () => {
    const brandToken = localStorage.getItem('brand-token');
    
    if (!brandToken) {
      throw new Error('No authentication token found. Please log in again.');
    }
    
    if (brandToken === 'null' || brandToken === 'undefined') {
      throw new Error('Invalid authentication token. Please log in again.');
    }
    
    return fetch(`${API_BASE_URL}/offers/brand`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${brandToken}`,
      },
    }).then(async (response) => {
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      return data;
    });
  },

  // Get featured offers
  getFeaturedOffers: async (limit = 4) => {
    return apiRequest(`/offers/featured?limit=${limit}`, { method: 'GET' });
  },

  // Get offers by category
  getOffersByCategory: async (category) => {
    return apiRequest(`/offers/category/${category}`, { method: 'GET' });
  },

  // Get offers by brand ID
  getOffersByBrandId: async (brandId) => {
    return apiRequest(`/offers?brand_id=${brandId}`, { method: 'GET' });
  },

  // Search offers
  searchOffers: async (searchTerm) => {
    const queryParams = new URLSearchParams({ q: searchTerm });
    return apiRequest(`/offers/search?${queryParams.toString()}`, { method: 'GET' });
  },

  // Search brands for suggestions
  searchBrands: async (searchTerm, limit = 5) => {
    const queryParams = new URLSearchParams({ q: searchTerm, limit: limit.toString() });
    return apiRequest(`/offers/search/brands?${queryParams.toString()}`, { method: 'GET' });
  },

  // Get new lineup offers
  getNewLineupOffers: async () => {
    return apiRequest('/offers/new-lineup', { method: 'GET' });
  },

  // Get specific offer
  getOfferById: async (id) => {
    return apiRequest(`/offers/${id}`, { method: 'GET' });
  },

  // Create new offer (Brand authenticated)
  createOffer: async (offerData) => {
    const brandToken = localStorage.getItem('brand-token');
    
    console.log('🔍 Creating offer with token:', brandToken);
    console.log('🔍 Token type:', typeof brandToken);
    console.log('🔍 Token length:', brandToken ? brandToken.length : 0);
    
    if (!brandToken) {
      throw new Error('No authentication token found. Please log in again.');
    }
    
    if (brandToken === 'null' || brandToken === 'undefined') {
      throw new Error('Invalid authentication token. Please log in again.');
    }
    
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('title', offerData.title);
    formData.append('description', offerData.description);
    formData.append('discount_percent', offerData.discount_percent);
    
    if (offerData.category) formData.append('category', offerData.category);
    if (offerData.valid_until) formData.append('valid_until', offerData.valid_until);
    if (offerData.terms_conditions) formData.append('terms_conditions', offerData.terms_conditions);
    if (offerData.usage_limit) formData.append('usage_limit', offerData.usage_limit);
    if (offerData.offerImage) formData.append('offerImage', offerData.offerImage);

    console.log('🚀 Sending request to:', `${API_BASE_URL}/offers`);
    console.log('🔑 Authorization header:', `Bearer ${brandToken.substring(0, 20)}...`);

    return fetch(`${API_BASE_URL}/offers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${brandToken}`,
      },
      body: formData,
    }).then(async (response) => {
      console.log('📨 Response status:', response.status);
      const data = await response.json();
      console.log('📨 Response data:', data);
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      return data;
    });
  },

  // Update offer (Brand authenticated)
  updateOffer: async (id, offerData) => {
    const brandToken = localStorage.getItem('brand-token');
    
    // Create FormData for file upload
    const formData = new FormData();
    if (offerData.title) formData.append('title', offerData.title);
    if (offerData.description) formData.append('description', offerData.description);
    if (offerData.discount_percent) formData.append('discount_percent', offerData.discount_percent);
    if (offerData.category) formData.append('category', offerData.category);
    if (offerData.status) formData.append('status', offerData.status);
    if (offerData.valid_until !== undefined) formData.append('valid_until', offerData.valid_until);
    if (offerData.terms_conditions !== undefined) formData.append('terms_conditions', offerData.terms_conditions);
    if (offerData.usage_limit !== undefined) formData.append('usage_limit', offerData.usage_limit);
    if (offerData.offerImage) formData.append('offerImage', offerData.offerImage);

    return fetch(`${API_BASE_URL}/offers/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${brandToken}`,
      },
      body: formData,
    }).then(async (response) => {
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      return data;
    });
  },

  // Delete offer (Brand authenticated)
  deleteOffer: async (id) => {
    const brandToken = localStorage.getItem('brand-token');
    return apiRequest(`/offers/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${brandToken}`,
      },
    });
  },

  // Update offer status (Brand authenticated)
  updateOfferStatus: async (id, status) => {
    const brandToken = localStorage.getItem('brand-token');
    return apiRequest(`/offers/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${brandToken}`,
      },
      body: JSON.stringify({ status }),
    });
  },

  // Redeem offer (public)
  redeemOffer: async (id) => {
    return apiRequest(`/offers/${id}/redeem`, {
      method: 'POST',
    });
  },

  // Get offer statistics (Brand authenticated)
  getOfferStats: async () => {
    const brandToken = localStorage.getItem('brand-token');
    return apiRequest('/offers/stats/overview', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${brandToken}`,
      },
    });
  },

  // Get all brands (public)
  getBrands: async () => {
    return apiRequest('/offers/brands', {
      method: 'GET',
    });
  },
};

/**
 * Brand API functions
 */
export const brandAPI = {
  // Get brand profile data
  getBrandProfile: async () => {
    const brandToken = localStorage.getItem('brand-token');
    
    if (!brandToken) {
      throw new Error('No authentication token found. Please log in again.');
    }
    
    if (brandToken === 'null' || brandToken === 'undefined') {
      throw new Error('Invalid authentication token. Please log in again.');
    }
    
    return fetch(`${API_BASE_URL}/brand-auth/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${brandToken}`,
      },
    }).then(async (response) => {
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      return data;
    });
  },

  // Update brand profile
  updateBrandProfile: async (updateData) => {
    const brandToken = localStorage.getItem('brand-token');
    
    if (!brandToken) {
      throw new Error('No authentication token found. Please log in again.');
    }
    
    if (brandToken === 'null' || brandToken === 'undefined') {
      throw new Error('Invalid authentication token. Please log in again.');
    }
    
    return fetch(`${API_BASE_URL}/brand-auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${brandToken}`,
      },
      body: JSON.stringify(updateData),
    }).then(async (response) => {
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      return data;
    });
  },
};

/**
 * Utility functions for token management (Legacy - use auth.js utilities instead)
 */
export const tokenUtils = {
  setToken: (token) => {
    localStorage.setItem('userToken', token);
  },

  getToken: () => {
    return localStorage.getItem('userToken');
  },

  removeToken: () => {
    localStorage.removeItem('userToken');
  },

  isTokenExpired: (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch (error) {
      return true;
    }
  },
};

// Contact API
export const contactAPI = {
  sendMessage: async (formData) => {
    return apiRequest('/contact', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
  },
};

export default apiRequest;
