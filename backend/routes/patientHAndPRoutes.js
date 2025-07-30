const { Router } = require('express');
const router = Router();

const {
  getHAndPByPatientId,
  updateGenericHAndP,
  addDoctorNote
} = require('../controllers/patientHAndPController');

const { verifyToken } = require('../middleware/authmiddleware/Jwt');
const { authorizeRoles } = require('../middleware/rolemiddleware/role');

// Middleware to verify JWT token
router.use(verifyToken);

// Routes
router.get('/:patientId', authorizeRoles('doctor', 'patient', 'admin'), getHAndPByPatientId);
router.put('/:patientId', authorizeRoles('doctor', 'admin'), updateGenericHAndP);
router.post('/:patientId/note', authorizeRoles('doctor'), addDoctorNote);


module.exports = router;
