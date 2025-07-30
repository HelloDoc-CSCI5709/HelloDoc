const bcrypt             = require('bcryptjs');
const User               = require('../models/User');
const EmailToken         = require('../models/EmailTokens');
const PasswordResetToken = require('../models/PasswordResetToken');
const { responseBody }   = require('../config/responseBody');
const {
  REQUIRED_FIELDS,
  SECRET_KEY,
  JWT: { EXPIRATION: ACCESS_EXPIRATION, REFRESH_EXPIRATION }
} = require('../config/Constants');

const {
  generateAuthTokens,
  verifyRefreshToken,
  revokeRefreshToken,
  generateSecondFactorToken
} = require('../services/authServices');

const EmailTokens = require('../models/EmailTokens');
const { sendVerificationCode } = require('../services/emailServices');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const registerUser = (sendVerificationCode) => async (req, res) => {
  try {
    const missingFields = REQUIRED_FIELDS.filter(field => !req.body[field]);
    if (missingFields.length) {
      const verb = missingFields.length > 1 ? 'are' : 'is';
      const errorMessage = `Validation error: ${missingFields.join(', ')} ${verb} required or invalid`;
      return res.status(400).json(responseBody(400, errorMessage, null));
    }

    const {
      fullName,
      email,
      password,
      role,
      securityQuestion,
      securityAnswer
    } = req.body;

    if (await User.findOne({ email })) {
      return res.status(409).json(responseBody(409, 'Email already registered', null));
    }

    const hashedAnswer = await bcrypt.hash(securityAnswer, 10);
    const newUser = new User({
      fullName,
      email,
      password,
      role,
      securityQuestion,
      securityAnswer: hashedAnswer,
      emailVerified: false
    });
    await newUser.save();

    await sendVerificationCode(newUser);

    return res.status(201).json(
      responseBody(201, 'User registered successfully; verification email sent', {
        ID: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role
      })
    );
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json(responseBody(500, 'Internal Server error', null));
  }
};

const loginStepOne = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    console.log(user)
    if (!user) {
      return res
        .status(401)
        .json(responseBody(401, 'Invalid email or password', null));
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      console.log(password)
      return res
        .status(401)
        .json(responseBody(401, 'Invalid email or password', null));
    }

    if (!user.emailVerified) {
      const existingEmailToken = await EmailToken.findOne({
        userId: user._id
      });

      if (!existingEmailToken) {
        try {
          await sendVerificationCode(user);
          return res
            .status(403)
            .json(responseBody(403, 'Email not verified. A new verification link has been sent to your email', null));
        } catch (emailError) {
          console.error('Error sending verification email:', emailError);
          return res
            .status(403)
            .json(responseBody(403, 'Email not verified. Please contact support', null));
        }
      } else {
        return res
          .status(403)
          .json(responseBody(403, 'Email not verified. Please check your email for the verification link', null));
      }
    }

    const tempToken = generateSecondFactorToken(user);

    return res.status(200).json(
      responseBody(
        200,
        'Password verified; now answer your security question',
        {
          question: user.securityQuestion,
          tempToken
        }
      )
    );
  } catch (err) {
    console.error('Login Step One error:', err);
    return res
      .status(500)
      .json(responseBody(500, 'Internal Server error', null));
  }
};

const loginStepTwo = async (req, res) => {
  try {
    const userId = req.userId;
    const { securityAnswer } = req.body;

    const user = await User.findById(userId);
    console.log(user);
    if (!user) {
      return res
        .status(404)
        .json(responseBody(404, 'User not found', null));
    }

    const answerMatch = await bcrypt.compare(
      securityAnswer,
      user.securityAnswer
    );
    if (!answerMatch) {
      return res
        .status(401)
        .json(responseBody(401, 'Invalid security answer', null));
    }

    const { accessToken, refreshToken, expiresIn } =
      await generateAuthTokens(user);

    return res.status(200).json(
      responseBody(200, 'Login successful', {
        accessToken,
        refreshToken,
        expiresIn,
        user: {
          ID:       user._id,
          fullName: user.fullName,
          email:    user.email,
          role:     user.role
        }
      })
    );
  } catch (err) {
    console.error('Login Step Two error:', err);
    return res
      .status(500)
      .json(responseBody(500, 'Internal Server error', null));
  }
};


const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json(responseBody(400, 'refreshToken is required', null));
    }

    const tokenDoc = await verifyRefreshToken(refreshToken);

    await revokeRefreshToken(refreshToken);

    const user = await User.findById(tokenDoc.userId);
    if (!user) {
      return res.status(404).json(responseBody(404, 'User not found', null));
    }

    const { accessToken, refreshToken: newRefreshToken, expiresIn } = await generateAuthTokens(user);

    return res.status(200).json(
      responseBody(200, 'Token refreshed', {
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn
      })
    );
  } catch (err) {
    console.error('Refresh error:', err);
    return res.status(401).json(responseBody(401, err.message, null));
  }
};

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }
    return res.status(200).json(responseBody(200, 'Logged out', null));
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json(responseBody(500, 'Internal Server error', null));
  }
};

const verifyEmail = async (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).json(responseBody(400, 'Verification token is required', null));
  }

  try {
    const emailToken = await EmailToken.findOne({ token });
    if (!emailToken) {
      return res.status(401).json(responseBody(401, 'Invalid or expired verification token', null));
    }

    const user = await User.findById(emailToken.userId);
    if (!user) {
      return res.status(404).json(responseBody(404, 'User not found', null));
    }

    if (emailToken.verified && user.emailVerified) {
      return res.status(409).json(responseBody(409, 'Email already verified', null));
    }

    user.emailVerified = true;
    await user.save();

    emailToken.verified = true;
    await emailToken.save();

    return res.status(200).json(responseBody(200, 'Email verified successfully', null));
  } catch (err) {
    console.error('Email verification error:', err);
    return res.status(500).json(responseBody(500, 'Internal Server Error', null));
  }
};

const forgotPassword = (sendPasswordResetOTP) => async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json(responseBody(400, 'Email is required', null));
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(200).json(
        responseBody(200, 'If the email exists, a password reset OTP has been sent', null)
      );
    }

     if (!user.emailVerified) {
      const existingEmailToken = await EmailToken.findOne({
        userId: user._id
      });

      if (!existingEmailToken) {
        try {
          await sendVerificationCode(user);
          return res.status(403).json(
            responseBody(403, 'Email not verified. A verification link has been sent to your email. Please verify your email first', null)
          );
        } catch (emailError) {
          console.error('Error sending verification email:', emailError);
          return res.status(403).json(
            responseBody(403, 'Email not verified. Please contact support', null)
          );
        }
      } else {
        return res.status(403).json(
          responseBody(403, 'Email not verified. Please check your email and verify your account first', null)
        );
      }
    }

    await PasswordResetToken.deleteMany({ userId: user._id });

    const otp = generateOTP();
    
    const resetToken = new PasswordResetToken({
      userId: user._id,
      email: user.email,
      otp: otp
    });
    await resetToken.save();

    await sendPasswordResetOTP(user, otp);

    return res.status(200).json(
      responseBody(200, 'Password reset OTP sent to your email', null)
    );
  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json(responseBody(500, 'Internal Server error', null));
  }
};

const verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json(responseBody(400, 'Email and OTP are required', null));
    }

    const resetToken = await PasswordResetToken.findOne({ 
      email: email.toLowerCase(), 
      otp: otp,
      verified: false 
    });

    if (!resetToken) {
      return res.status(401).json(responseBody(401, 'Invalid or expired OTP', null));
    }

    resetToken.verified = true;
    resetToken.verifiedAt = new Date();
    await resetToken.save();

    return res.status(200).json(
      responseBody(200, 'OTP verified successfully. You can now reset your password', {
        resetTokenId: resetToken._id
      })
    );
  } catch (err) {
    console.error('Verify OTP error:', err);
    return res.status(500).json(responseBody(500, 'Internal Server error', null));
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    if (!email || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json(
        responseBody(400, 'Email, OTP, new password, and confirm password are required', null)
      );
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json(responseBody(400, 'Passwords do not match', null));
    }

    if (newPassword.length < 6) {
      return res.status(400).json(
        responseBody(400, 'Password must be at least 6 characters long', null)
      );
    }

    const resetToken = await PasswordResetToken.findOne({
      email: email.toLowerCase(),
      otp: otp,
      verified: true
    });

    if (!resetToken) {
      return res.status(401).json(
        responseBody(401, 'Invalid OTP or OTP not verified. Please verify OTP first', null)
      );
    }

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    if (resetToken.verifiedAt < tenMinutesAgo) {
      await PasswordResetToken.deleteOne({ _id: resetToken._id });
      return res.status(401).json(
        responseBody(401, 'Reset token expired. Please request a new OTP', null)
      );
    }

    const user = await User.findById(resetToken.userId);
    if (!user) {
      return res.status(404).json(responseBody(404, 'User not found', null));
    }

    
    user.password = newPassword;
    await user.save();

    await PasswordResetToken.deleteOne({ _id: resetToken._id });

    await revokeRefreshToken(null, user._id);

    return res.status(200).json(
      responseBody(200, 'Password reset successfully. Please login with your new password', null)
    );
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json(responseBody(500, 'Internal Server error', null));
  }
};

module.exports = {
  registerUser,
  loginStepOne,
  loginStepTwo,
  refreshAccessToken,
  logout,
  verifyEmail,
  forgotPassword,
  verifyResetOTP,
  resetPassword
};
