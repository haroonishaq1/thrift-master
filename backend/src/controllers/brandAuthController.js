const bcrypt = require('bcryptjs');
const { generateToken, formatResponse, isValidEmail, generateOTP, getOTPExpiry } = require('../utils/helpers');
const { Brand } = require('../models/Brand');
const { BrandOTP } = require('../models/BrandOTP');
const { sendOTPEmail } = require('../utils/emailService');

// Brand Registration
const register = async (req, res) => {
  try {
    console.log('🚀 Brand registration request received');
    console.log('📋 Request body:', JSON.stringify(req.body, null, 2));
    console.log('📁 Request file:', req.file);
    
    const {
      name,
      email,
      password,
      description,
      website,
      adminUsername,
      category,
      country,
      phoneNumber
    } = req.body;

    // Handle logo file upload
    let logoUrl = null;
    if (req.file) {
      logoUrl = `/uploads/brands/${req.file.filename}`;
      console.log('📁 Logo uploaded:', logoUrl);
    }

    console.log('🔍 Extracted fields:', {
      name, email, adminUsername, category, country, website, phoneNumber
    });
    console.log('🔍 Phone number value:', phoneNumber);
    console.log('🔍 Phone number type:', typeof phoneNumber);

    // Validation
    if (!name || !email || !password || !adminUsername || !category || !country || !website) {
      console.log('❌ Validation failed - missing required fields');
      return res.status(400).json(
        formatResponse(false, 'All required fields must be provided', {
          required: ['name', 'email', 'password', 'adminUsername', 'category', 'country', 'website']
        })
      );
    }

    if (!isValidEmail(email)) {
      console.log('❌ Invalid email format');
      return res.status(400).json(
        formatResponse(false, 'Please provide a valid email address')
      );
    }

    if (password.length < 6) {
      return res.status(400).json(
        formatResponse(false, 'Password must be at least 6 characters long')
      );
    }

    // Check if brand already exists
    const existingBrand = await Brand.findByEmail(email);
    if (existingBrand) {
      console.log('❌ Brand already exists');
      return res.status(400).json(
        formatResponse(false, 'Brand with this email already exists')
      );
    }

    // Create brand object
    const brandData = {
      name,
      email: email.toLowerCase(),
      password,
      description: description || '',
      website,
      phone_number: phoneNumber, // Add phone number to brand data
      logo: logoUrl, // Fix: use 'logo' instead of 'logo_url'
      adminUsername,
      adminEmail: email.toLowerCase(),
      category
    };

    // Create brand in database
    const newBrand = await Brand.create(brandData);

    console.log('✅ Brand registered successfully');
    console.log('📧 Brand email:', email);

    // Generate OTP for brand verification
    const otpCode = generateOTP();
    const expiresAt = getOTPExpiry();

    // Save OTP to database
    await BrandOTP.create(
      email.toLowerCase(),
      otpCode,
      expiresAt,
      null,
      'registration'
    );

    // Send OTP email
    await sendOTPEmail(email, otpCode, name);

    console.log('📧 OTP sent to brand email:', email);

    return res.status(201).json(
      formatResponse(true, 'Registration successful! A verification code has been sent to your email.', {
        brandId: newBrand.id,
        requiresVerification: true
      })
    );

  } catch (error) {
    console.error('❌ Brand registration error:', error);
    return res.status(500).json(
      formatResponse(false, 'Registration failed. Please try again later.')
    );
  }
};

// Brand Login
const login = async (req, res) => {
  try {
    console.log('🚀 Brand login request received');
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json(
        formatResponse(false, 'Email and password are required')
      );
    }

    if (!isValidEmail(email)) {
      return res.status(400).json(
        formatResponse(false, 'Please provide a valid email address')
      );
    }

    // Verify credentials using Brand model
    const credentialCheck = await Brand.verifyCredentials(email, password);
    
    if (!credentialCheck.valid) {
      console.log('❌ Invalid credentials or brand not approved');
      return res.status(400).json(
        formatResponse(false, credentialCheck.message)
      );
    }

    const brand = credentialCheck.brand;

    console.log('✅ Brand login successful');

    // Generate token
    const token = generateToken({ 
      id: brand.id, 
      email: brand.email,
      type: 'brand'
    });

    // Remove password from response
    const brandResponse = { ...brand };
    delete brandResponse.password;

    return res.json(
      formatResponse(true, 'Login successful', {
        brand: brandResponse,
        token
      })
    );

  } catch (error) {
    console.error('❌ Brand login error:', error);
    return res.status(500).json(
      formatResponse(false, 'Login failed. Please try again later.')
    );
  }
};

// Get Brand Profile
const getProfile = async (req, res) => {
  try {
    const brandId = req.user.id;
    console.log('🔍 Getting profile for brand ID:', brandId);
    
    const brand = await Brand.findById(brandId);
    console.log('🔍 Raw brand data from database:', brand);

    if (!brand) {
      return res.status(404).json(
        formatResponse(false, 'Brand not found')
      );
    }

    // Remove password from response
    const brandResponse = { ...brand };
    delete brandResponse.password;

    return res.json(
      formatResponse(true, 'Brand profile retrieved successfully', {
        brand: brandResponse
      })
    );

  } catch (error) {
    console.error('❌ Get brand profile error:', error);
    return res.status(500).json(
      formatResponse(false, 'Failed to get brand profile')
    );
  }
};

// Logout (client-side token removal)
const logout = async (req, res) => {
  try {
    return res.json(
      formatResponse(true, 'Logged out successfully')
    );
  } catch (error) {
    console.error('❌ Brand logout error:', error);
    return res.status(500).json(
      formatResponse(false, 'Logout failed')
    );
  }
};

// Brand Registration OTP Verification
const verifyRegistrationOTP = async (req, res) => {
  try {
    console.log('🔐 Brand registration OTP verification request received');
    const { email, otpCode, brandId } = req.body;

    if (!email || !otpCode || !brandId) {
      return res.status(400).json(
        formatResponse(false, 'Email, OTP code, and brand ID are required')
      );
    }

    if (!isValidEmail(email)) {
      return res.status(400).json(
        formatResponse(false, 'Please provide a valid email address')
      );
    }

    // Find the OTP record
    const otpRecord = await BrandOTP.findByEmailAndType(email.toLowerCase(), 'registration');
    
    if (!otpRecord) {
      return res.status(400).json(
        formatResponse(false, 'No verification code found for this email')
      );
    }

    // Check if OTP is expired
    if (new Date() > new Date(otpRecord.expires_at)) {
      await BrandOTP.deleteByEmail(email.toLowerCase(), 'registration');
      return res.status(400).json(
        formatResponse(false, 'Verification code has expired. Please register again.')
      );
    }

    // Check if OTP is correct
    if (otpRecord.otp_code !== otpCode) {
      return res.status(400).json(
        formatResponse(false, 'Invalid verification code')
      );
    }

    // Mark OTP as used
    await BrandOTP.markAsUsed(otpRecord.id);

    // Update brand as email verified (if you have this field)
    // await Brand.updateEmailVerified(brandId, true);

    console.log('✅ Brand registration OTP verified successfully');
    
    return res.json(
      formatResponse(true, 'Email verified successfully! You can now login.')
    );

  } catch (error) {
    console.error('❌ Brand registration OTP verification error:', error);
    return res.status(500).json(
      formatResponse(false, 'Verification failed. Please try again later.')
    );
  }
};

// Forgot Password (placeholder)
const forgotPassword = async (req, res) => {
  try {
    console.log('🔓 Brand forgot password request received');
    const { email } = req.body;

    if (!email) {
      return res.status(400).json(
        formatResponse(false, 'Email is required')
      );
    }

    if (!isValidEmail(email)) {
      return res.status(400).json(
        formatResponse(false, 'Please provide a valid email address')
      );
    }

    // Check if brand exists
    const existingBrand = await Brand.findByEmail(email);
    if (!existingBrand) {
      return res.status(404).json(
        formatResponse(false, 'Email is not registered with us')
      );
    }

    // Generate OTP
    const otpCode = generateOTP();
    const expiresAt = getOTPExpiry();

    // Delete any existing forgot password OTPs for this brand
    await BrandOTP.deleteByEmail(email, 'forgot_password');

    // Store OTP in database with type 'forgot_password'
    await BrandOTP.create(email, otpCode, expiresAt, null, 'forgot_password');

    // Send OTP email
    await sendOTPEmail(email, otpCode, 'Brand Password Reset');

    console.log('✅ Brand forgot password OTP sent successfully');
    return res.json(
      formatResponse(true, 'Password reset code sent to your email')
    );

  } catch (error) {
    console.error('❌ Brand forgot password error:', error);
    return res.status(500).json(
      formatResponse(false, 'Failed to send reset code. Please try again later.')
    );
  }
};

// Verify Forgot Password OTP
const verifyForgotPasswordOTP = async (req, res) => {
  try {
    console.log('🔓 Verify brand forgot password OTP request received');
    const { email, otpCode } = req.body;

    if (!email || !otpCode) {
      return res.status(400).json(
        formatResponse(false, 'Email and OTP code are required')
      );
    }

    // Find OTP record
    const otpRecord = await BrandOTP.findByEmailAndCode(email, otpCode, 'forgot_password');
    
    if (!otpRecord) {
      return res.status(400).json(
        formatResponse(false, 'Invalid or expired reset code')
      );
    }

    // Check if OTP is expired
    if (new Date() > new Date(otpRecord.expires_at)) {
      await BrandOTP.deleteByEmail(email, 'forgot_password');
      return res.status(400).json(
        formatResponse(false, 'Reset code has expired. Please request a new one.')
      );
    }

    // Generate a temporary reset token
    const resetToken = generateToken({ 
      email, 
      type: 'brand_password_reset',
      timestamp: Date.now()
    });

    // Delete the OTP since it's been verified
    await BrandOTP.deleteByEmail(email, 'forgot_password');

    console.log('✅ Brand forgot password OTP verified successfully');
    return res.json(
      formatResponse(true, 'Reset code verified successfully', {
        resetToken
      })
    );

  } catch (error) {
    console.error('❌ Verify brand forgot password OTP error:', error);
    return res.status(500).json(
      formatResponse(false, 'Verification failed. Please try again later.')
    );
  }
};

// Reset Password (placeholder)
const resetPassword = async (req, res) => {
  try {
    console.log('🔓 Brand reset password request received');
    const { email, resetToken, newPassword } = req.body;

    if (!email || !resetToken || !newPassword) {
      return res.status(400).json(
        formatResponse(false, 'Email, reset token, and new password are required')
      );
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return res.status(400).json(
        formatResponse(false, 'Password must be at least 8 characters long')
      );
    }

    // Verify reset token
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
      
      if (decoded.email !== email || decoded.type !== 'brand_password_reset') {
        throw new Error('Invalid token');
      }

      // Check if token is too old (15 minutes)
      const tokenAge = Date.now() - decoded.timestamp;
      if (tokenAge > 15 * 60 * 1000) { // 15 minutes in milliseconds
        throw new Error('Token expired');
      }
    } catch (tokenError) {
      return res.status(400).json(
        formatResponse(false, 'Invalid or expired reset token')
      );
    }

    // Check if brand exists
    const existingBrand = await Brand.findByEmail(email);
    if (!existingBrand) {
      return res.status(404).json(
        formatResponse(false, 'Brand not found')
      );
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update brand password
    await Brand.updatePassword(email, hashedPassword);

    console.log('✅ Brand password reset successful');
    return res.json(
      formatResponse(true, 'Password reset successful')
    );

  } catch (error) {
    console.error('❌ Brand reset password error:', error);
    return res.status(500).json(
      formatResponse(false, 'Failed to reset password. Please try again later.')
    );
  }
};

// Update brand profile
const updateProfile = async (req, res) => {
  try {
    console.log('🚀 Brand profile update request received');
    console.log('📋 Request body:', JSON.stringify(req.body, null, 2));
    console.log('👤 Brand ID from token:', req.user.id);

    const { name, category, phoneNumber } = req.body;

    // Validation
    if (!name || !category) {
      console.log('❌ Validation failed - missing required fields');
      return res.status(400).json(
        formatResponse(false, 'Name and category are required')
      );
    }

    // Update brand profile
    const updatedBrand = await Brand.updateProfile(req.user.id, {
      name,
      category,
      phoneNumber
    });

    console.log('✅ Brand profile updated successfully');

    return res.status(200).json(
      formatResponse(true, 'Profile updated successfully', {
        brand: updatedBrand
      })
    );

  } catch (error) {
    console.error('❌ Brand profile update error:', error);
    return res.status(500).json(
      formatResponse(false, 'Failed to update profile. Please try again later.')
    );
  }
};

// Change Password
const changePassword = async (req, res) => {
  try {
    console.log('🚀 Brand change password request received');
    console.log('🔍 Brand from token:', req.user);
    const { newPassword } = req.body;
    const brandId = req.user.id || req.user.userId;

    // Validation
    if (!newPassword) {
      return res.status(400).json(
        formatResponse(false, 'New password is required')
      );
    }

    if (newPassword.length < 8) {
      return res.status(400).json(
        formatResponse(false, 'Password must be at least 8 characters long')
      );
    }

    // Get brand data
    const brand = await Brand.findById(brandId);
    if (!brand) {
      return res.status(404).json(
        formatResponse(false, 'Brand not found')
      );
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update brand password
    await Brand.updatePassword(brand.email, hashedPassword);

    console.log('✅ Brand password changed successfully');
    return res.json(
      formatResponse(true, 'Password changed successfully')
    );

  } catch (error) {
    console.error('❌ Brand change password error:', error);
    return res.status(500).json(
      formatResponse(false, 'Failed to change password. Please try again later.')
    );
  }
};

module.exports = {
  register,
  login,
  getProfile,
  logout,
  updateProfile,
  forgotPassword,
  verifyForgotPasswordOTP,
  resetPassword,
  changePassword,
  verifyRegistrationOTP
};
