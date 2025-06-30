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
      from: `"Project Thrift" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Verify Your Email - Project Thrift',
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
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-code { background: #fff; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; }
            .otp-number { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
            .btn { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎓 Project Thrift</h1>
              <p>Student Discounts Made Easy</p>
            </div>
            <div class="content">
              <h2>Hi${firstName ? ' ' + firstName : ''}! 👋</h2>
              <p>Welcome to Project Thrift! We're excited to have you join our community of smart students saving money.</p>
              
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
                  Need help? Contact us at support@projectthrift.com
                </p>
              </div>
            </div>
            <div class="footer">
              <p>© 2025 Project Thrift. Making education more affordable, one discount at a time.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Hi${firstName ? ' ' + firstName : ''}!
        
        Welcome to Project Thrift! 
        
        Your verification code is: ${otpCode}
        
        This code expires in 10 minutes. Enter it on the verification page to complete your registration.
        
        If you didn't create an account with us, please ignore this email.
        
        Best regards,
        Project Thrift Team
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
      from: `"Project Thrift" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Welcome to Project Thrift! 🎉',
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
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .cta-button { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to Project Thrift!</h1>
              <p>Your student discount journey starts here</p>
            </div>
            <div class="content">
              <h2>Hi ${firstName}! 🎓</h2>
              
              <p>Congratulations! Your Project Thrift account is now active and ready to help you save money as a student.</p>
              
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
                  Questions? We're here to help! Contact us at support@projectthrift.com
                </p>
              </div>
            </div>
            <div class="footer">
              <p>© 2025 Project Thrift. Happy saving! 💰</p>
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
  testEmailConfig
};
