const jwt            = require('jsonwebtoken');
const crypto         = require('crypto');
const RefreshToken   = require('../models/RefreshTokens');
const { SECRET_KEY, JWT } = require('../config/Constants');


function generateSecondFactorToken(user) {
  return jwt.sign(
    { userId: user._id, pending: true },
    SECRET_KEY,
    { expiresIn: JWT.SECOND_FACTOR_EXPIRATION }
  );
}

function verifySecondFactorToken(token) {
  const payload = jwt.verify(token, SECRET_KEY);
  if (!payload.pending || !payload.userId) {
    throw new Error('Invalid second-factor token');
  }
  return payload.userId;
}

async function generateAuthTokens(user) {
  const accessToken = jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    SECRET_KEY,
    { expiresIn: JWT.EXPIRATION }
  );

  const refreshToken = crypto.randomBytes(40).toString('hex');
  await RefreshToken.create({
    userId: user._id,
    token: refreshToken
  });

  return { accessToken, refreshToken, expiresIn: JWT.EXPIRATION };
}

async function verifyRefreshToken(token) {
  const doc = await RefreshToken.findOne({ token });
  if (!doc || doc.revoked) {
    throw new Error('Invalid or revoked refresh token');
  }
  return doc;
}

async function revokeRefreshToken(token) {
  const doc = await RefreshToken.findOne({ token });
  if (doc && !doc.revoked) {
    doc.revoked = true;
    await doc.save();
  }
}

module.exports = {
  generateSecondFactorToken,
  verifySecondFactorToken,
  generateAuthTokens,
  verifyRefreshToken,
  revokeRefreshToken
};
