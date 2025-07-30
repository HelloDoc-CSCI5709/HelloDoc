require ('dotenv').config();

const REQUIRED_FIELDS = [
  'fullName',
  'email',
  'password',
  'role',
  'securityQuestion',
  'securityAnswer'
];
const ROLES = ['patient', 'doctor', 'admin'];
const SECRET_KEY = process.env.JWT_SECRET;
const MONGO_URI = process.env.MONGO_URI;
const JWT = {
  EXPIRATION: '1h',
  REFRESH_EXPIRATION: 7 * 24 * 60 * 60,
  SECOND_FACTOR_EXPIRATION: '10m',
};
const APP_BASE_URL = process.env.APP_BASE_URL || 'https://hellodocprod.netlify.app/';
const EMAIL = {
  VERIFICATION_EXPIRATION: '1h',
  VERIFICATION_EXPIRATION_SECONDS: 3600,
  VERIFICATION_SUBJECT: 'Verify your email address - HelloDoc Team',
  PASSWORD_RESET_SUBJECT: 'Password Reset OTP - HelloDoc Team',
  makeVerificationBody: (user, verifyUrl) => `
    Hi ${user.fullName},

    Thanks for registering! Click here to verify your email:
    ${verifyUrl}

    This link will expire in ${EMAIL.VERIFICATION_EXPIRATION}.

    — HelloDoc Team
  `,
  makePasswordResetBody: (user, otp) => {
    return `
      Hello ${user.fullName},

      You have requested to reset your password. Please use the following One-Time Password (OTP) to proceed with resetting your password:

      Your OTP: ${otp}

      This OTP will expire in 10 minutes for security reasons.

      If you didn't request this password reset, please ignore this email or contact our support team if you have any concerns.

      Best regards,
      HelloDoc Team

      ---
      This is an automated message, please do not reply to this email.
    `.trim();
  }
      
};

const smtpPort = parseInt(process.env.SMTP_PORT) || 587;
const SMTP = {
  HOST: process.env.SMTP_HOST,
  PORT: smtpPort,
  SECURE: smtpPort === 465,
  AUTH: {
    USER: process.env.SMTP_USER,
    PASS: process.env.SMTP_PASS
  },
  FROM: process.env.EMAIL_FROM
};

const ALLOWED_SPECIALIZATIONS = [
  'Dermatologist',
  'Cardiologist',
  'Oncologist',
  'Family Medicine',
  'Anesthesiology',
  'Neurologist',
  'Psychiatrist',
  'Radiologist',
  'Gynecologist',
  'Orthopedic Surgeon',
  'Pediatrician',
  'Urologist',
  'ENT Specialist',
  'Gastroenterologist',
  'General Practitioner'
];

const FILE_CONFIG = {
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
  MAX_SIZE: 10 * 1024 * 1024
};

const PAGINATION_LIMITS = {
  MAX_RADIUS: 100000,
  MAX_PAGE_SIZE: 100
};

module.exports = {
  REQUIRED_FIELDS,
  ROLES,
  SECRET_KEY,
  MONGO_URI,
  JWT,
  EMAIL,
  APP_BASE_URL,
  SMTP,
  ALLOWED_SPECIALIZATIONS,
  FILE_CONFIG,
  PAGINATION_LIMITS
};