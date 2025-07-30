const {Router} = require('express');
const { verifyToken } = require('../middleware/authmiddleware/Jwt');
const { authorizeRoles } = require('../middleware/rolemiddleware/role');
const {
  bookAppointment,
  getAppointments,
  getAppointmentById,
  cancelAppointment,
  rescheduleAppointment,
  noShowAppointment,
  deleteAppointment,
  getAllAppointments
} = require('../controllers/appointmentController');

const router = Router();

router.use(verifyToken);

router.get('/all', authorizeRoles('admin'), getAllAppointments)
router.post(
    '/book',
    authorizeRoles('patient'),
    bookAppointment);
router.get(
    '/',
    authorizeRoles('patient', 'doctor', 'admin'), 
    getAppointments);
router.get(
    '/:appointmentId', 
    authorizeRoles('patient', 'doctor', 'admin'),
    getAppointmentById);
router.put(
    '/cancel/:appointmentId',
    authorizeRoles('patient', 'doctor', 'admin'),
    cancelAppointment);
router.put(
    '/reschedule/:appointmentId',
    authorizeRoles('patient', 'doctor', 'admin'),
    rescheduleAppointment);
router.put(
    '/no-show/:appointmentId', 
    authorizeRoles('doctor', 'admin'),
    noShowAppointment);
router.delete(
    '/:appointmentId',
    authorizeRoles('admin'),
    deleteAppointment);



module.exports = router;