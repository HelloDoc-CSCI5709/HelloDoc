const { Router } = require('express');
const { verifyToken } = require('../middleware/authmiddleware/Jwt');
const { authorizeRoles } = require('../middleware/rolemiddleware/role');
const {
  getDoctorProfile,
  updateBasicDoctorProfile,
  updateAvailability,
  uploadAvailabilityFromIcs,
  updateDoctorAddress,
  getAvailability,
  uploadProfilePicture,
  getPublicDoctorProfile,
  listDoctors,
  geocodeLocation,
  submitDoctorCredential,
  getDoctorCredentials,
  approveDoctorCredential,
  rejectDoctorCredential,
  getDoctorCredentialById
} = require('../controllers/doctorController');
const { 
  uploadCredential, 
  uploadProfilePicture: uploadProfilePictureMiddleware,
  uploadIcsFile
} = require('../middleware/upload/doctorDocs');

const router = Router();

router.get('/public/:doctorId', getPublicDoctorProfile);
router.get('/list/all', listDoctors);
router.get('/geocode', geocodeLocation);

router.use(verifyToken);

router.get('/profile', authorizeRoles('doctor', 'admin'), getDoctorProfile);
router.put('/profile/basic', authorizeRoles('doctor', 'admin'), updateBasicDoctorProfile);


router.put('/profile/availability', authorizeRoles('doctor', 'admin'), updateAvailability);
router.get('/availability', authorizeRoles('doctor', 'admin'), getAvailability);

router.post(
  '/availability/upload-ics',
  authorizeRoles('doctor'),
  uploadIcsFile.single('icsFile'),
  uploadAvailabilityFromIcs
);

router.put('/profile/address', authorizeRoles('doctor', 'admin'), updateDoctorAddress);


router.post('/profile-picture', authorizeRoles('doctor'), uploadProfilePictureMiddleware.single('image'), uploadProfilePicture);


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

module.exports = router;