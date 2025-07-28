const { Router } = require('express');
const { verifyToken } = require('../middleware/authmiddleware/Jwt');
const { authorizeRoles } = require('../middleware/rolemiddleware/role');
const {
  getDoctorProfile,
  updateBasicDoctorProfile,
  updateAvailability,
  updateDoctorAddress,
  getAvailability,
  uploadProfilePicture,
  getPublicDoctorProfile,
  listDoctors,
  submitDoctorCredential,
  getDoctorCredentials,
  approveDoctorCredential,
  rejectDoctorCredential,
  getDoctorCredentialById,
  getPatientProfileForDoctor
} = require('../controllers/doctorController');
const { uploadCredential, uploadProfilePicture: uploadProfilePictureMiddleware } = require('../middleware/upload/doctorDocs');

const router = Router();

router.use(verifyToken);

router.get('/profile', authorizeRoles('doctor', 'admin'), getDoctorProfile);
router.put('/profile/basic', authorizeRoles('doctor', 'admin'), updateBasicDoctorProfile);
router.put('/profile/availability', authorizeRoles('doctor', 'admin'), updateAvailability);
router.put('/profile/address', authorizeRoles('doctor', 'admin'), updateDoctorAddress);
router.get('/availability', authorizeRoles('patient','doctor', 'admin'), getAvailability);

router.post('/profile-picture', authorizeRoles('doctor'), uploadProfilePictureMiddleware.single('image'), uploadProfilePicture);

router.get('/public/:doctorId', getPublicDoctorProfile);
router.get('/list/all', listDoctors);

router.post(
  '/:doctorId/credentials',
  authorizeRoles('doctor'),
  uploadCredential.single('file'),
  submitDoctorCredential
);
router.get('/:doctorId/credentials', authorizeRoles('doctor'), getDoctorCredentials);

router.put('/:doctorId/credentials/:credentialId/approve', authorizeRoles('admin'), approveDoctorCredential);
router.put('/:doctorId/credentials/:credentialId/reject', authorizeRoles('admin'), rejectDoctorCredential);
router.get('/:doctorId/credentials/:credentialId', authorizeRoles('doctor', 'admin'), getDoctorCredentialById);
router.get('/view-profile/:patientId', authorizeRoles('doctor', 'admin'), getPatientProfileForDoctor);
module.exports = router;