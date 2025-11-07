import * as yup from 'yup';

// NDIS Plan Info Validation Schema
export const ndisPlanInfoSchema = yup.object().shape({
  ndisNumber: yup.string()
    .required('NDIS Number is required'),
  planManagerName: yup.string()
    .required('Plan manager name is required'),
  planManagerEmail: yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  phoneNumber: yup.string()
    .matches(/^\+61\s?\d{9}$/, 'Please enter a valid phone number')
    .required('Phone number is required'),
  planType: yup.string()
    .oneOf(['Self-managed', 'Plan-managed'], 'Invalid plan type')
    .required('Plan type is required'),
  agreeToTerms1: yup.boolean()
    .oneOf([true], 'You must agree to the terms'),
  agreeToTerms2: yup.boolean()
    .oneOf([true], 'You must agree to the authorization')
});

// Signup Form Validation Schema
export const signupSchema = yup.object().shape({
  firstName: yup.string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters'),
  lastName: yup.string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters'),
  email: yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  phone: yup.string()
    .matches(/^\d{9}$/, 'Phone number must be exactly 9 digits')
    .required('Phone number is required'),
  role: yup.string()
    .required('Role is required'),
  password: yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
  agreeToTerms: yup.boolean()
    .oneOf([true], 'You must agree to the Terms & Conditions')
});

// Login Form Validation Schema
export const loginSchema = yup.object().shape({
  email: yup.string()
    .email('Please enter a valid email address')
    .required('Email or phone is required'),
  password: yup.string()
    .required('Password is required')
});

// Forgot Password Schema
export const forgotPasswordSchema = yup.object().shape({
  email: yup.string()
    .email('Please enter a valid email address')
    .required('Email is required')
});

// Reset Password Schema
export const resetPasswordSchema = yup.object().shape({
  password: yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password')
});

// Verify Documents Schema (Dynamic based on user role)
export const createVerifyDocumentsSchema = (userRole) => {
  const baseSchema = {
    abnNumber: yup.string()
      .matches(/^\d{11}$/, 'ABN Number must be exactly 11 digits')
      .required('ABN Number is required'),
    policeCheck: yup.mixed()
      .nullable()
      .test('at-least-one-document', 'Please upload at least one document.', function(value) {
        const { policeCheck, visaWorkRights, trainingCertificates } = this.parent;
        return policeCheck || visaWorkRights || trainingCertificates;
      }),
    visaWorkRights: yup.mixed().nullable(),
    trainingCertificates: yup.mixed().nullable()
  };

  // Add TFN validation for Student Cleaner
  if (userRole === 'Student Cleaner') {
    baseSchema.tfnNumber = yup.string()
      .matches(/^\d{9}$/, 'TFN Number must be exactly 9 digits')
      .required('TFN Number is required for Student Cleaner');
  } else {
    baseSchema.tfnNumber = yup.string()
      .matches(/^\d{9}$/, 'TFN Number must be exactly 9 digits')
      .nullable();
  }

  return yup.object().shape(baseSchema);
};

// Common Field Validations (reusable)
export const phoneRegex = /^\d{9}$/; // 9 digits without leading 0
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const australianPhoneRegex = /^\+61\s?\d{9}$/; // +61 followed by 9 digits

// Helper Functions
export const validateField = async (schema, data) => {
  try {
    await schema.validate(data, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (err) {
    const errors = {};
    if (err.inner) {
      err.inner.forEach((error) => {
        errors[error.path] = error.message;
      });
    }
    return { isValid: false, errors };
  }
};

