# Thrift - Student Discount Platform

A comprehensive web application that provides university students with exclusive discounts and offers from various brands.

## Features

### User Features
- 🎓 **Student Registration** - Email verification with OTP
- 👤 **User Profiles** - Complete personal and university information
- 🔐 **Secure Authentication** - JWT-based login system
- 🛍️ **Brand Discovery** - Browse offers from approved brands
- 📱 **Responsive Design** - Works on desktop and mobile

### Brand Features
- 🏢 **Brand Registration** - Multi-step registration with email verification
- ✅ **Admin Approval System** - Brands need admin approval to activate
- 📊 **Brand Dashboard** - Manage offers and view analytics
- 📧 **OTP Verification** - Secure email verification for brands

### Admin Features
- 🔑 **Secret Key Authentication** - Secure admin access
- ✅ **Brand Approval** - Approve or reject brand applications
- 📋 **Brand Management** - View all brands and their status

## Tech Stack

### Backend
- **Node.js** with Express.js
- **PostgreSQL** database
- **JWT** authentication
- **Nodemailer** for email services
- **bcrypt** for password hashing
- **express-validator** for input validation

### Frontend
- **React.js** with modern hooks
- **React Router** for navigation
- **Formik & Yup** for form handling and validation
- **Axios** for API calls
- **CSS3** with professional styling

## Project Structure

```
thrift/
├── backend/
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # API controllers
│   │   ├── middleware/     # Authentication & validation
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   └── utils/          # Helper functions
│   ├── server.js           # Main server file
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── styles/         # CSS files
│   │   └── utils/          # Helper functions
│   ├── public/
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL database
- Gmail account for email services

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file with the following variables:
   ```env
   PORT=5000
   NODE_ENV=development
   
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=thrift_db
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   
   # JWT Secret
   JWT_SECRET=your_jwt_secret_key
   
   # Email Configuration
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   
   # OTP Configuration
   OTP_EXPIRY_MINUTES=10
   
   # Admin Configuration
   ADMIN_SECRET_KEY=your_admin_secret_key
   
   # Frontend URL
   FRONTEND_URL=http://localhost:3000
   ```

4. Start the server:
   ```bash
   npm start
   ```

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

## API Endpoints

### User Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/verify-otp` - Email verification
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Brand Authentication
- `POST /api/brand-auth/register` - Brand registration
- `POST /api/brand-auth/verify-otp` - Brand email verification
- `POST /api/brand-auth/login` - Brand login

### Admin
- `POST /api/admin/login` - Admin login
- `GET /api/admin/brands/pending` - Get pending brands
- `POST /api/admin/brands/:id/approve` - Approve brand
- `POST /api/admin/brands/:id/reject` - Reject brand

## Database Schema

### Users Table
- Personal information (name, username, age, gender, phone)
- Location (country, city)
- University details (university, course, graduation year, student ID)
- Account information (email, password, verification status)

### Brands Table
- Brand information (name, email, website, description)
- Admin details (username, email)
- Approval status and timestamps

### OTP Tables
- Separate OTP tables for users and brands
- Expiration handling and usage tracking

## Features Implemented

### ✅ Complete User System
- Multi-step registration form
- Email OTP verification
- Professional profile system
- Secure authentication with JWT

### ✅ Complete Brand System
- Multi-step brand registration
- Email OTP verification for brands
- Admin approval workflow
- Brand dashboard (ready for implementation)

### ✅ Admin System
- Secret key authentication
- Brand approval/rejection
- Admin dashboard

### ✅ UI/UX
- Professional design matching login/signup theme
- Responsive design for all devices
- Consistent styling throughout the application
- User-friendly profile management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please contact the development team.
