const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const cookieParser = require('cookie-parser');
const { connectDB } = require('./config/db');
const { responseBody } = require('./config/responseBody');
require('dotenv').config();
const path = require('path');

const PORT = process.env.PORT || 5050;
const app = express();

connectDB();

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use((req, res, next) => {
  const descriptor = Object.getOwnPropertyDescriptor(req, 'query') || {};
  Object.defineProperty(req, 'query', {
    ...descriptor,
    value: req.query,
    writable: true
  });
  next();
});

app.use(mongoSanitize());

app.use(xssClean());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const appointmentRoutes = require('./routes/appointmentRoutes');
app.use('/api/appointments', appointmentRoutes);

const doctorRoutes = require('./routes/doctorRoutes');
app.use('/api/doctors', doctorRoutes);

const patientRoutes = require('./routes/patientRoutes');
app.use('/api/patient', patientRoutes);

const healthRecordRoutes = require('./routes/healthRecordRoutes');
app.use('/api/health-records', healthRecordRoutes);

const patientHAndPRoutes = require('./routes/patientHAndPRoutes');
app.use('/api/patient-handp', patientHAndPRoutes);

const prescriptionRoutes = require('./routes/prescriptionRoutes');
app.use('/api/prescriptions', prescriptionRoutes);

app.get('/', (req, res) => {
  res.send('HelloDoc Backend API');
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

app.use((err, req, res, next) => {

  if (err.code === 'INVALID_FILE_TYPE') {
    return res.status(400).json(
      responseBody(400, 'Only JPG, JPEG, PNG, or PDF files are allowed', null)
    );
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE' || err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json(
      responseBody(400, 'Only one file can be uploaded at a time', null)
    );
  }

  if (err.name === 'MulterError') {
    return res.status(400).json(
      responseBody(400, `Upload error: ${err.message}`, null)
    );
  }


  // if (err.message?.includes('Only JPG, PNG, or PDF')) {
  //   return res.status(400).json(responseBody(400, err.message, null));
  // }

  return res.status(500).json(
    responseBody(500, 'Unexpected server error', null)
  );
});

module.exports = app;
