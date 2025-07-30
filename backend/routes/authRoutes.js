const express = require('express');
const { verifyPendingToken } = require('../middleware/authmiddleware/Jwt');
const { registerUser,  loginStepOne, loginStepTwo, verifyEmail, refreshAccessToken, logout,forgotPassword, verifyResetOTP, resetPassword } = require('../controllers/authController');
const { sendVerificationCode, sendPasswordResetOTP } = require('../services/emailServices');
const router = express.Router();

router.post('/register', registerUser(sendVerificationCode));
router.post('/login', loginStepOne);
router.post('/login/verify',    verifyPendingToken, loginStepTwo);
router.get('/verify-email', verifyEmail);
router.post('/refresh-token', refreshAccessToken);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword(sendPasswordResetOTP));
router.post('/verify-reset-otp', verifyResetOTP);
router.post('/reset-password', resetPassword);

module.exports = router;