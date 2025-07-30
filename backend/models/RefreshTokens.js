const mongoose = require('mongoose');
const {JWT} = require('../config/Constants');

const refreshTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  revoked: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: JWT.REFRESH_EXPIRATION
  }
}, {strict: true});

refreshTokenSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);