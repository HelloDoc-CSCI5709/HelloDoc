// routes/healthRecordRoutes.js
const express = require('express');
const router = express.Router();

const { verifyToken } = require('../middleware/authmiddleware/Jwt');
const { authorizeRoles } = require('../middleware/rolemiddleware/role');
const {
  uploadXRay,
  uploadLabReport,
  uploadPrescription,
  uploadVaccine,
  uploadSurgicalNote
} = require('../middleware/upload/healthrecord');

const { uploadHealthRecordByType } = require('../controllers/healthRecordController');

// Routes for 5 document types
router.post(
  '/upload/xray',
  verifyToken,
  authorizeRoles('doctor', 'patient'),
  uploadXRay.single('file'),
  uploadHealthRecordByType('X-ray')
);

router.post(
  '/upload/lab',
  verifyToken,
  authorizeRoles('doctor', 'patient'),
  uploadLabReport.single('file'),
  uploadHealthRecordByType('Lab Report')
);

router.post(
  '/upload/prescription',
  verifyToken,
  authorizeRoles('doctor', 'patient'),
  uploadPrescription.single('file'),
  uploadHealthRecordByType('Prescription')
);

router.post(
  '/upload/vaccine',
  verifyToken,
  authorizeRoles('doctor', 'patient'),
  uploadVaccine.single('file'),
  uploadHealthRecordByType('Vaccination Record')
);

router.post(
  '/upload/surgery',
  verifyToken,
  authorizeRoles('doctor', 'patient'),
  uploadSurgicalNote.single('file'),
  uploadHealthRecordByType('Surgical Note')
);

module.exports = router;
