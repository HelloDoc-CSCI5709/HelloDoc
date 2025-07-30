const express = require('express');
const { verifyToken, verifyPendingToken } = require('../middleware/authmiddleware/Jwt');
const { authorizeRoles } = require('../middleware/rolemiddleware/role');
const { getPatientProfile, updatePatientProfile, getPatientProfileForDoctor, getAllPatients } = require('../controllers/patientController');
const upload = require('../middleware/upload/patientDocs');

const {
  uploadHealthCardFrontcontroller,
  uploadHealthCardBackcontroller,
  uploadInsuranceDocument,
  uploadAllergyDocument,
  uploadMedicalHistory
} = require('../controllers/patientDocumentController');

const {
  uploadHealthCardFront,
  uploadHealthCardBack,
  uploadInsurance,
  uploadAllergy,
  uploadMedical
} = require('../middleware/upload/patientDocs');

const router = express.Router();

router.get('/profile', verifyToken, authorizeRoles('patient'), getPatientProfile);
router.put('/profile', verifyToken, authorizeRoles('patient'), updatePatientProfile);
router.get('/patient/profile', verifyToken, authorizeRoles('doctor'),  getPatientProfileForDoctor);
router.get('/all', verifyToken, authorizeRoles('admin'), getAllPatients)

router.post(
  '/upload/healthcard/front',
  verifyToken,
  authorizeRoles('patient'),
  uploadHealthCardFront.single('file'),
  uploadHealthCardFrontcontroller
);

router.post(
  '/upload/healthcard/back',
  verifyToken,
  authorizeRoles('patient'),
  uploadHealthCardBack.single('file'),
  uploadHealthCardBackcontroller
);

router.post(
  '/upload/insurance',
  verifyToken,
  authorizeRoles('patient'),
  uploadInsurance.single('file'),
  uploadInsuranceDocument
);

router.post(
  '/upload/allergy',
  verifyToken,
  authorizeRoles('patient'),
  uploadAllergy.single('file'),
  uploadAllergyDocument
);

router.post(
  '/upload/medical-history',
  verifyToken,
  authorizeRoles('patient'),
  uploadMedical.single('file'),
  uploadMedicalHistory
);

module.exports = router;