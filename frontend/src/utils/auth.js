// Authentication utilities for Project Thrift

// Brand Authentication Functions
export const isBrandAuthenticated = () => {
  const token = localStorage.getItem('brand-token');
  const brandData = localStorage.getItem('brand-data');
  
  if (!token || !brandData) {
    return false;
  }
  
  try {
    const parsedData = JSON.parse(brandData);
    // Check if token is expired (if expiry is set)
    if (parsedData.expires && new Date() > new Date(parsedData.expires)) {
      clearBrandAuth();
      return false;
    }
    return true;
  } catch (error) {
    clearBrandAuth();
    return false;
  }
};

export const storeBrandAuth = (authData, legacyBrandData = null) => {
  // Handle both object and separate parameter formats
  let token, brandData;
  
  console.log('🔍 storeBrandAuth called with:', authData, legacyBrandData);
  
  if (typeof authData === 'object' && authData.token) {
    // New object format: { token: ..., brand: ... }
    token = authData.token;
    brandData = authData.brand;
  } else if (legacyBrandData !== null) {
    // Old format: (token, brandData)
    token = authData;
    brandData = legacyBrandData;
  } else {
    // Fallback if only one parameter and it's a string (assume it's a token)
    token = authData;
    brandData = {};
  }
  
  console.log('🔍 Final token to store:', token);
  console.log('🔍 Final brand data to store:', brandData);
  
  localStorage.setItem('brand-token', token);
  
  // Set expiry for 24 hours from now
  const expiryTime = new Date();
  expiryTime.setHours(expiryTime.getHours() + 24);
  
  const dataWithExpiry = {
    ...brandData,
    expires: expiryTime.toISOString()
  };
  
  localStorage.setItem('brand-data', JSON.stringify(dataWithExpiry));
  
  console.log('🔍 Stored in localStorage - token:', localStorage.getItem('brand-token'));
  console.log('🔍 Stored in localStorage - data:', localStorage.getItem('brand-data'));
};

export const getBrandData = () => {
  const brandData = localStorage.getItem('brand-data');
  if (!brandData) return null;
  
  try {
    return JSON.parse(brandData);
  } catch (error) {
    clearBrandAuth();
    return null;
  }
};

export const getBrandToken = () => {
  return localStorage.getItem('brand-token');
};

export const clearBrandAuth = () => {
  localStorage.removeItem('brand-token');
  localStorage.removeItem('brand-data');
};

// User Authentication Functions (for regular users)
export const isUserAuthenticated = () => {
  const token = localStorage.getItem('userToken');
  const userData = localStorage.getItem('userData');
  
  if (!token || !userData) {
    return false;
  }
  
  try {
    const parsedData = JSON.parse(userData);
    // Check if token is expired
    if (parsedData.expires && new Date() > new Date(parsedData.expires)) {
      clearUserAuth();
      return false;
    }
    return true;
  } catch (error) {
    clearUserAuth();
    return false;
  }
};

export const storeUserAuth = (token, userData) => {
  localStorage.setItem('userToken', token);
  
  // Set expiry for 7 days from now for regular users
  const expiryTime = new Date();
  expiryTime.setDate(expiryTime.getDate() + 7);
  
  const dataWithExpiry = {
    ...userData,
    expires: expiryTime.toISOString()
  };
  
  localStorage.setItem('userData', JSON.stringify(dataWithExpiry));
};

export const getUserData = () => {
  const userData = localStorage.getItem('userData');
  if (!userData) return null;
  
  try {
    return JSON.parse(userData);
  } catch (error) {
    clearUserAuth();
    return null;
  }
};

export const getUserToken = () => {
  return localStorage.getItem('userToken');
};

export const clearUserAuth = () => {
  localStorage.removeItem('userToken');
  localStorage.removeItem('userData');
};

// Helper function to get auth headers for API calls
export const getAuthHeaders = (userType = 'user') => {
  const token = userType === 'brand' ? getBrandToken() : getUserToken();
  
  if (!token) {
    return {};
  }
  
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Specific function for brand auth headers (for backwards compatibility)
export const getBrandAuthHeaders = () => {
  const token = getBrandToken();
  
  if (!token) {
    return {};
  }
  
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Function to check if current session is valid and redirect if not
export const requireAuth = (userType = 'user') => {
  const isAuthenticated = userType === 'brand' ? isBrandAuthenticated() : isUserAuthenticated();
  
  if (!isAuthenticated) {
    // Clear any invalid auth data
    if (userType === 'brand') {
      clearBrandAuth();
    } else {
      clearUserAuth();
    }
    return false;
  }
  
  return true;
};
