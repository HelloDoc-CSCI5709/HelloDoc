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
const APP_BASE_URL = process.env.APP_BASE_URL || 'http://localhost:5173';
const EMAIL = {
  VERIFICATION_EXPIRATION: '1h',
  VERIFICATION_EXPIRATION_SECONDS: 3600,
  VERIFICATION_SUBJECT: 'Verify your email address',
  makeVerificationBody: (user, verifyUrl) => `
    Hi ${user.fullName},

    Thanks for registering! Click here to verify your email:
    ${verifyUrl}

    This link will expire in ${EMAIL.VERIFICATION_EXPIRATION}.

    — HelloDoc Team
  `
};

const SMTP = {
  HOST: process.env.SMTP_HOST,
  PORT: process.env.SMTP_PORT || 587,
  SECURE: false,
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
  ICS_ALLOWED_TYPES: ['text/calendar', 'application/ics', 'text/plain', 'application/octet-stream'],
  MAX_SIZE: 10 * 1024 * 1024, 
  ICS_MAX_SIZE: 2 * 1024 * 1024 
};

const PAGINATION_LIMITS = {
  MAX_RADIUS: 100000,
  MAX_PAGE_SIZE: 100
};

const ICS_CONFIG = {
  MAX_EVENTS: 1000, 
  DATE_FORMATS: {
    WITH_TIME: /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z?$/,
    DATE_ONLY: /^(\d{4})(\d{2})(\d{2})$/
  },
  DEFAULT_DURATION_MINUTES: 30, 
  SUPPORTED_PROPERTIES: [
    'DTSTART',
    'DTEND',
    'SUMMARY',
    'DESCRIPTION',
    'LOCATION',
    'UID'
  ]
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
  PAGINATION_LIMITS,
  ICS_CONFIG 
};