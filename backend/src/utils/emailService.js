const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Send OTP email
const sendOTPEmail = async (email, otpCode, firstName = '') => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Thrift" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Verify Your Email - Thrift',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #6c7ce7 0%, #5a6fd8 100%); color: white !important; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: white !important; margin: 0; font-size: 28px; }
            .header p { color: white !important; margin: 0; font-size: 16px; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-code { background: #fff; border: 2px dashed #6c7ce7; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; }
            .otp-number { font-size: 32px; font-weight: bold; color: #6c7ce7; letter-spacing: 5px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
            .btn { background: #6c7ce7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
            /* Dark mode overrides */
            @media (prefers-color-scheme: dark) {
              .header h1 { color: white !important; }
              .header p { color: white !important; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎓 Thrift</h1>
              <p>Student Discounts Made Easy</p>
            </div>
            <div class="content">
              <h2>Hi${firstName ? ' ' + firstName : ''}! 👋</h2>
              <p>Welcome to Thrift! We're excited to have you join our community of smart students saving money.</p>
              
              <p>To complete your registration, please verify your email address using the verification code below:</p>
              
              <div class="otp-code">
                <p style="margin: 0; font-size: 16px; color: #666;">Your Verification Code</p>
                <div class="otp-number">${otpCode}</div>
                <p style="margin: 0; font-size: 14px; color: #999;">This code expires in 10 minutes</p>
              </div>
              
              <p>Enter this code on the verification page to activate your account and start exploring exclusive student discounts!</p>
              
              <p><strong>What's next?</strong></p>
              <ul>
                <li>🔍 Discover discounts from top brands</li>
                <li>💰 Save money on everything you need</li>
                <li>📱 Get exclusive student deals</li>
                <li>🎯 Find offers tailored to your interests</li>
              </ul>
              
              <p>If you didn't create an account with us, please ignore this email.</p>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                <p style="margin: 0; color: #666; font-size: 14px;">
                  Need help? Contact us at support@thrift.com
                </p>
              </div>
            </div>
            <div class="footer">
              <p>© 2025 Thrift. Making education more affordable, one discount at a time.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Hi${firstName ? ' ' + firstName : ''}!
        
        Welcome to Thrift! 
        
        Your verification code is: ${otpCode}
        
        This code expires in 10 minutes. Enter it on the verification page to complete your registration.
        
        If you didn't create an account with us, please ignore this email.
        
        Best regards,
        Thrift Team
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ OTP email sent successfully to:', email);
    return result;
  } catch (error) {
    console.error('❌ Error sending OTP email:', error.message);
    throw error;
  }
};

// Send welcome email
const sendWelcomeEmail = async (email, firstName) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Thrift" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Welcome to Thrift! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Project Thrift</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #6c7ce7 0%, #5a6fd8 100%); color: white !important; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: white !important; margin: 0; font-size: 28px; }
            .header p { color: white !important; margin: 0; font-size: 16px; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .cta-button { background: #6c7ce7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
            /* Dark mode overrides */
            @media (prefers-color-scheme: dark) {
              .header h1 { color: white !important; }
              .header p { color: white !important; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to Thrift!</h1>
              <p>Your student discount journey starts here</p>
            </div>
            <div class="content">
              <h2>Hi ${firstName}! 🎓</h2>
              
              <p>Congratulations! Your Thrift account is now active and ready to help you save money as a student.</p>
              
              <p><strong>Here's what you can do now:</strong></p>
              <ul>
                <li>🛍️ Browse exclusive student discounts</li>
                <li>💼 Discover deals on technology, fashion, food & more</li>
                <li>📱 Save money on apps and services you use daily</li>
                <li>🎯 Get personalized recommendations</li>
              </ul>
              
              <a href="${process.env.FRONTEND_URL}" class="cta-button">Start Exploring Deals</a>
              
              <p>Follow us on social media to stay updated with the latest deals and exclusive offers!</p>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                <p style="margin: 0; color: #666; font-size: 14px;">
                  Questions? We're here to help! Contact us at support@thrift.com
                </p>
              </div>
            </div>
            <div class="footer">
              <p>© 2025 Thrift. Happy saving! 💰</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent successfully to:', email);
    return result;
  } catch (error) {
    console.error('❌ Error sending welcome email:', error.message);
    throw error;
  }
};

// Send contact form email
const sendContactEmail = async (name, email, message) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Thrift" <${process.env.SMTP_USER}>`,
      to: 'haroonishaq544@gmail.com', // Your email address
      subject: `New Contact Message from ${name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Contact Message</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #6c7ce7 0%, #5a6fd8 100%); color: white !important; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: white !important; margin: 0; font-size: 28px; }
            .header p { color: white !important; margin: 0; font-size: 16px; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .message-box { background: #fff; border-left: 4px solid #6c7ce7; padding: 20px; margin: 20px 0; border-radius: 5px; }
            .info-row { display: flex; margin-bottom: 10px; }
            .info-label { font-weight: bold; color: #6c7ce7; min-width: 80px; }
            .info-value { color: #333; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
            /* Dark mode overrides */
            @media (prefers-color-scheme: dark) {
              .header h1 { color: white !important; }
              .header p { color: white !important; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📧 New Contact Message</h1>
              <p>Thrift Contact Form</p>
            </div>
            <div class="content">
              <h2>You have received a new message!</h2>
              
              <div class="message-box">
                <div class="info-row">
                  <span class="info-label">Name:</span>
                  <span class="info-value">${name}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Email:</span>
                  <span class="info-value">${email}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Date:</span>
                  <span class="info-value">${new Date().toLocaleString()}</span>
                </div>
              </div>
              
              <h3>Message:</h3>
              <div class="message-box">
                <p style="margin: 0; white-space: pre-wrap;">${message}</p>
              </div>
              
              <p><strong>Reply to:</strong> <a href="mailto:${email}" style="color: #6c7ce7;">${email}</a></p>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                <p style="margin: 0; color: #666; font-size: 14px;">
                  This message was sent through the Thrift contact form.
                </p>
              </div>
            </div>
            <div class="footer">
              <p>© 2025 Thrift. Contact Form Notification</p>
            </div>
          </div>
        </body>
        </html>
      `,
      replyTo: email // This allows you to reply directly to the sender
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Contact email sent successfully from:', email);
    return result;
  } catch (error) {
    console.error('❌ Error sending contact email:', error.message);
    throw error;
  }
};

// Send forgot password OTP email
const sendForgotPasswordOTPEmail = async (email, otpCode, firstName = '') => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Thrift" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Reset Your Password - Thrift',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%); color: white !important; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: white !important; margin: 0; font-size: 28px; }
            .header p { color: white !important; margin: 0; font-size: 16px; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
            .btn { background: #f39c12; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔒 Password Reset</h1>
              <p>Reset your Thrift account password</p>
            </div>
            <div class="content">
              <p>Hi ${firstName || 'there'},</p>
              
              <p>We received a request to reset the password for your <strong>Thrift</strong> account.</p>
              
              <p>To proceed, please use the verification code below to reset your password:</p>
              
              <div style="text-align: center; margin: 30px 0; background: #fff; border: 2px dashed #f39c12; padding: 20px; border-radius: 10px;">
                <p style="margin: 0; font-size: 16px; color: #666;">Your Verification Code</p>
                <div style="font-size: 32px; font-weight: bold; color: #f39c12; letter-spacing: 5px;">${otpCode}</div>
                <p style="margin: 0; font-size: 14px; color: #999;">This code expires in ${process.env.OTP_EXPIRY_MINUTES || 10} minutes</p>
              </div>
              
              <p>Enter this code on the password reset page to create a new password for your account.</p>
              
              <p>If you did not request a password reset, you can safely ignore this email. Your account will remain secure.</p>
              
              <p>Thank you,<br>
              The <strong>Thrift</strong> Team</p>
            </div>
            <div class="footer">
              <p style="font-size: 12px; color: #999;">Need help? Contact us at support@thrift.com</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Forgot password OTP email sent successfully to:', email);
    return result;
  } catch (error) {
    console.error('❌ Error sending forgot password OTP email:', error.message);
    throw error;
  }
};
const sendBrandApprovalEmail = async (email, brandName, firstName = '') => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Thrift" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Brand Approved - Welcome to Thrift!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Brand Approved</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%); color: white !important; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: white !important; margin: 0; font-size: 28px; }
            .header p { color: white !important; margin: 0; font-size: 16px; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .approval-badge { background: #fff; border: 2px solid #27ae60; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
            .btn { background: #27ae60; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Congratulations!</h1>
              <p>Your brand has been approved</p>
            </div>
            <div class="content">
              <p>Hello ${firstName},</p>
              <div class="approval-badge">
                <h2 style="color: #27ae60; margin: 0;">✓ ${brandName}</h2>
                <p style="margin: 5px 0 0 0; color: #666;">Successfully Approved</p>
              </div>
              <p>Great news! Your brand <strong>${brandName}</strong> has been approved and is now live on Thrift.</p>
              <p>You can now:</p>
              <ul>
                <li>Create and manage your offers</li>
                <li>View analytics and performance</li>
                <li>Connect with students</li>
              </ul>
              <p>You can access your dashboard by logging into your brand account on our website.</p>
              <p>Thank you for joining Thrift and helping students save money!</p>
            </div>
            <div class="footer">
              <p>Best regards,<br>The Thrift Team</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Brand approval email sent successfully to:', email);
    return result;
  } catch (error) {
    console.error('❌ Error sending brand approval email:', error.message);
    throw error;
  }
};

// Send brand rejection email
const sendBrandRejectionEmail = async (email, brandName, rejectionReason = '', firstName = '') => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Thrift" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Brand Application Update - Thrift',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Brand Application Update</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white !important; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: white !important; margin: 0; font-size: 28px; }
            .header p { color: white !important; margin: 0; font-size: 16px; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .rejection-badge { background: #fff; border: 2px solid #e74c3c; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
            .btn { background: #6c7ce7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Application Update</h1>
              <p>Your brand application status</p>
            </div>
            <div class="content">
              <p>Hello ${firstName},</p>
              <div class="rejection-badge">
                <h2 style="color: #e74c3c; margin: 0;">✗ ${brandName}</h2>
                <p style="margin: 5px 0 0 0; color: #666;">Application Not Approved</p>
              </div>
              <p>We appreciate your interest in joining Thrift. Unfortunately, your brand application for <strong>${brandName}</strong> was not approved at this time.</p>
              ${rejectionReason ? `<p><strong>Reason:</strong> ${rejectionReason}</p>` : ''}
              <p>Please don't be discouraged! You can:</p>
              <ul>
                <li>Review our brand guidelines</li>
                <li>Make necessary improvements</li>
                <li>Reapply when ready</li>
              </ul>
              <p>You can reapply by visiting our website and submitting a new application.</p>
              <p>If you have any questions, please don't hesitate to contact our support team.</p>
            </div>
            <div class="footer">
              <p>Best regards,<br>The Thrift Team</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Brand rejection email sent successfully to:', email);
    return result;
  } catch (error) {
    console.error('❌ Error sending brand rejection email:', error.message);
    throw error;
  }
};

// Send offer approval email
const sendOfferApprovalEmail = async (email, brandName, offerTitle, firstName = '') => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Thrift" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Offer Approved - Thrift',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Offer Approved</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%); color: white !important; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: white !important; margin: 0; font-size: 28px; }
            .header p { color: white !important; margin: 0; font-size: 16px; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .approval-badge { background: #fff; border: 2px solid #27ae60; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
            .btn { background: #27ae60; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Offer Approved!</h1>
              <p>Your offer is now live</p>
            </div>
            <div class="content">
              <p>Hello ${firstName},</p>
              <div class="approval-badge">
                <h2 style="color: #27ae60; margin: 0;">✓ "${offerTitle}"</h2>
                <p style="margin: 5px 0 0 0; color: #666;">Successfully Approved</p>
              </div>
              <p>Great news! Your offer <strong>"${offerTitle}"</strong> for ${brandName} has been approved and is now live on Thrift.</p>
              <p>Students can now:</p>
              <ul>
                <li>View your offer</li>
                <li>Generate discount codes</li>
                <li>Visit your website</li>
              </ul>
              <p>You can view and manage your offers by logging into your brand dashboard.</p>
              <p>Thank you for providing great deals to students!</p>
            </div>
            <div class="footer">
              <p>Best regards,<br>The Thrift Team</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Offer approval email sent successfully to:', email);
    return result;
  } catch (error) {
    console.error('❌ Error sending offer approval email:', error.message);
    throw error;
  }
};

// Send offer rejection email
const sendOfferRejectionEmail = async (email, brandName, offerTitle, rejectionReason = '', firstName = '') => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Thrift" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Offer Update - Thrift',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Offer Update</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white !important; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: white !important; margin: 0; font-size: 28px; }
            .header p { color: white !important; margin: 0; font-size: 16px; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .rejection-badge { background: #fff; border: 2px solid #e74c3c; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
            .btn { background: #6c7ce7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Offer Update</h1>
              <p>Your offer status</p>
            </div>
            <div class="content">
              <p>Hello ${firstName},</p>
              <div class="rejection-badge">
                <h2 style="color: #e74c3c; margin: 0;">✗ "${offerTitle}"</h2>
                <p style="margin: 5px 0 0 0; color: #666;">Not Approved</p>
              </div>
              <p>Your offer <strong>"${offerTitle}"</strong> for ${brandName} was not approved at this time.</p>
              ${rejectionReason ? `<p><strong>Reason:</strong> ${rejectionReason}</p>` : ''}
              <p>You can:</p>
              <ul>
                <li>Review and edit your offer</li>
                <li>Check our offer guidelines</li>
                <li>Resubmit when ready</li>
              </ul>
              <p>You can manage your offers by logging into your brand dashboard.</p>
              <p>If you have any questions, please contact our support team.</p>
            </div>
            <div class="footer">
              <p>Best regards,<br>The Thrift Team</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Offer rejection email sent successfully to:', email);
    return result;
  } catch (error) {
    console.error('❌ Error sending offer rejection email:', error.message);
    throw error;
  }
};

// Test email configuration
const testEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email configuration is valid');
    return true;
  } catch (error) {
    console.error('❌ Email configuration error:', error.message);
    return false;
  }
};

module.exports = {
  sendOTPEmail,
  sendWelcomeEmail,
  sendContactEmail,
  sendForgotPasswordOTPEmail,
  sendBrandApprovalEmail,
  sendBrandRejectionEmail,
  sendOfferApprovalEmail,
  sendOfferRejectionEmail,
  testEmailConfig
};
