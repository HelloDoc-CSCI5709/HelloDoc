const { Router } = require('express');
const { verifyToken } = require('../middleware/authmiddleware/Jwt');
const { authorizeRoles } = require('../middleware/rolemiddleware/role');
const {
  createPrescription,
  getPrescriptionsByPatient,
} = require('../controllers/prescriptionController');

const router = Router();

router.post(
  '/',
  verifyToken,
  authorizeRoles('doctor'),
  createPrescription
);

router.get(
  '/:patientId',
  verifyToken,
  authorizeRoles('doctor', 'patient'),
  getPrescriptionsByPatient
);

module.exports = router;
