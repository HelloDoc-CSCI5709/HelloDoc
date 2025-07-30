const express = require('express');
const router = express.Router();
const { sendMessage, getMessagesByAppointment, deleteMessage } = require('../controllers/messageController');

const { verifyToken } = require('../middleware/authmiddleware/Jwt');
const { authorizeRoles } = require('../middleware/rolemiddleware/role');

router.use(verifyToken);

router.post('/send', authorizeRoles('patient', 'doctor'), sendMessage);
router.get('/:appointmentId', authorizeRoles('patient', 'doctor'), getMessagesByAppointment);
router.delete('/:messageId', authorizeRoles('admin'), deleteMessage);

module.exports = router;
