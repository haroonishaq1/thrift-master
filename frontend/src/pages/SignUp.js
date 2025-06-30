import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import '../styles/Login.css';

function SignUp() {
  // State for multi-step form
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({});
  
  // Navigation hook
  const navigate = useNavigate();
  
  // Student email domain state
  const [studentEmailDomain, setStudentEmailDomain] = useState('student.uol.edu.pk');
    // Step 1: Personal information validation schema
  const step1ValidationSchema = Yup.object({
    firstName: Yup.string()
      .required('First name is required')
      .min(2, 'First name must be at least 2 characters'),
    lastName: Yup.string()
      .required('Last name is required')
      .min(2, 'Last name must be at least 2 characters'),
    username: Yup.string()
      .required('Username is required')
      .min(4, 'Username must be at least 4 characters'),
    age: Yup.number()
      .required('Age is required')
      .min(16, 'You must be at least 16 years old')
      .max(100, 'Age cannot be more than 100'),    gender: Yup.string()
      .required('Gender is required'),
    phone: Yup.string()
      .required('Phone number is required')
      .min(10, 'Phone number is too short')
      .test('is-valid-phone', 'Please enter a valid phone number', function(value) {
        // Basic validation - can be enhanced based on your requirements
        return value && /^\d{10,15}$/.test(value.replace(/[^\d]/g, ''));
      })
  });    // Step 2: University and account information validation schema
  const step2ValidationSchema = Yup.object({
    country: Yup.string()
      .required('Country is required'),
    city: Yup.string()
      .required('City is required'),
    university: Yup.string()
      .required('University is required'),
    course: Yup.string()
      .required('Course is required')
      .min(2, 'Course must be at least 2 characters'),
    email: Yup.string()
      .required('Email is required')
      .email('Invalid email format')
      .test('is-university-email', 'Email must use university domain', function(value) {
        return value ? value.endsWith(`@${studentEmailDomain}`) : false;
      }),
    password: Yup.string()
      .required('Password is required')
      .min(8, 'Password must be at least 8 characters'),
    confirmPassword: Yup.string()
      .required('Confirm password is required')
      .oneOf([Yup.ref('password')], 'Passwords must match')
  });// Handle proceeding to the next step
  const nextStep = (values) => {
    setFormData(prev => ({ ...prev, ...values }));
    setStep(2);
  };
  
  // Handle going back to previous step
  const prevStep = () => {
    setStep(1);
  };
      // Handle final submission
  const handleSubmit = async (values) => {
    const finalFormData = { ...formData, ...values };
    console.log('Signup attempt', finalFormData);
    setIsSubmitting(true);
    
    try {      // Transform frontend form data to match backend API
      const apiData = {
        first_name: finalFormData.firstName,
        last_name: finalFormData.lastName,
        username: finalFormData.username,
        email: finalFormData.email,
        password: finalFormData.password,
        age: parseInt(finalFormData.age),
        gender: finalFormData.gender,
        country: finalFormData.country,        city: finalFormData.city,
        university: finalFormData.university,
        course: finalFormData.course,
        phone: finalFormData.phone
      };

      const response = await authAPI.register(apiData);
      
      if (response.success) {
        // Registration successful, redirect to OTP verification
        navigate('/verify-otp', { 
          state: { 
            email: finalFormData.email,
            message: response.message 
          } 
        });
      }
    } catch (error) {
      console.error('Registration failed:', error);
      alert(`Registration failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };// Form step indicator component
  const StepIndicator = () => {
    return (
      <div className="step-indicator">
        <div className={`step ${step === 1 ? 'active' : 'completed'}`}>1</div>
        <div className="step-separator"></div>
        <div className={`step ${step === 2 ? 'active' : ''}`}>2</div>
      </div>
    );
  };  // Initial form values
  const getInitialValues = () => ({
    // Step 1
    firstName: formData.firstName || '',
    lastName: formData.lastName || '',
    username: formData.username || '',
    age: formData.age || '',
    gender: formData.gender || '',
    phone: formData.phone || '',
    // Step 2
    country: formData.country || 'Pakistan',
    city: formData.city || 'Lahore',
    university: formData.university || 'University of Lahore',
    course: formData.course || '',
    email: formData.email || '',
    password: formData.password || '',
    confirmPassword: formData.confirmPassword || ''
  });// Render step 1 form: Personal information
  const renderStep1 = () => {
    return (
      <Formik
        initialValues={getInitialValues()}
        validationSchema={step1ValidationSchema}
        onSubmit={nextStep}
        enableReinitialize
      >
        {({ isSubmitting, errors, touched }) => (
          <Form className="login-form"><div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <Field 
                id="firstName"
                type="text" 
                name="firstName"
              />
              <ErrorMessage name="firstName" component="div" className="error-message" />
            </div>
            
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <Field 
                id="lastName"
                type="text" 
                name="lastName"
              />
              <ErrorMessage name="lastName" component="div" className="error-message" />
            </div>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <Field 
                id="username"
                type="text" 
                name="username"
              />
              <ErrorMessage name="username" component="div" className="error-message" />
            </div>
            
            <div className="form-group">
              <label htmlFor="age">Age</label>
              <Field 
                id="age"
                type="number" 
                name="age"
                min="16"
                max="100"
              />
              <ErrorMessage name="age" component="div" className="error-message" />
            </div>
            
            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <Field 
                id="gender"
                as="select" 
                name="gender"
              >
                <option value="" disabled>Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </Field>
              <ErrorMessage name="gender" component="div" className="error-message" />
            </div>              <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <Field name="phone">
                {({ field, form }) => (
                  <PhoneInput
                    country={'pk'} 
                    value={field.value}
                    onChange={(phone) => form.setFieldValue('phone', phone)}
                    onBlur={() => form.setFieldTouched('phone', true)}
                    inputProps={{
                      id: 'phone',
                      required: true,
                    }}
                    countryCodeEditable={false}
                    enableSearch={true}
                    preferredCountries={['pk', 'in', 'us', 'gb']}
                    containerClass="phone-input-container"
                    inputClass={`phone-input ${form.errors.phone && form.touched.phone ? 'is-invalid' : ''}`}
                    buttonClass="phone-dropdown-button"
                  />
                )}
              </Field>
              <ErrorMessage name="phone" component="div" className="error-message" />
            </div>
            
            <button 
              type="submit" 
              className="login-button"
              disabled={isSubmitting}
            >
              Continue
            </button>
          </Form>
        )}
      </Formik>
    );
  };    // Render step 2 form: Country, City, University, and account details
  const renderStep2 = () => {
    return (
      <Formik
        initialValues={getInitialValues()}
        validationSchema={step2ValidationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting, setFieldValue, values }) => (
          <Form className="login-form">
            <div className="form-group">
              <label htmlFor="country">Country</label>
              <Field 
                id="country"
                as="select" 
                name="country"
              >
                <option value="Pakistan">Pakistan</option>
              </Field>
              <ErrorMessage name="country" component="div" className="error-message" />
            </div>
            
            <div className="form-group">
              <label htmlFor="city">City</label>
              <Field 
                id="city"
                as="select" 
                name="city"
              >
                <option value="Lahore">Lahore</option>
              </Field>
              <ErrorMessage name="city" component="div" className="error-message" />
            </div>
              <div className="form-group">
              <label htmlFor="university">University</label>
              <Field 
                id="university"
                as="select" 
                name="university"
                onChange={(e) => {
                  setFieldValue('university', e.target.value);
                  setStudentEmailDomain('student.uol.edu.pk');
                }}
              >
                <option value="University of Lahore">University of Lahore</option>
              </Field>
              <ErrorMessage name="university" component="div" className="error-message" />
            </div>
            
            <div className="form-group">
              <label htmlFor="course">Course/Program</label>
              <Field 
                id="course"
                type="text" 
                name="course"
                placeholder="e.g., Computer Science, Business Administration"
              />
              <ErrorMessage name="course" component="div" className="error-message" />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="email-info">
                Your student email must end with: @{studentEmailDomain}
              </div>
              <Field 
                id="email"
                type="email" 
                name="email"
              />
              <ErrorMessage name="email" component="div" className="error-message" />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <Field 
                id="password"
                type="password" 
                name="password"
              />
              <ErrorMessage name="password" component="div" className="error-message" />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <Field 
                id="confirmPassword"
                type="password" 
                name="confirmPassword"
              />
              <ErrorMessage name="confirmPassword" component="div" className="error-message" />
            </div>
            
            <div className="form-buttons">
              <button type="button" onClick={prevStep} className="back-button">
                Back
              </button>
              <button 
                type="submit" 
                className="login-button"
                disabled={isSubmitting}
              >
                Join Now
              </button>
            </div>
          </Form>
        )}
      </Formik>
    );
  };
    return (
    <div className="login-container">
      <div className="login-form-wrapper">
        <h1>THRIFT</h1>
        <div className="promo-message">
          <h2>Studying at university? Get student discounts on all your favorite brands—for free!</h2>
        </div>
        
        <StepIndicator />
        
        {step === 1 ? renderStep1() : renderStep2()}
        
        <div className="form-footer">
          <p>Already have an account? <a href="/login">Log in</a></p>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
