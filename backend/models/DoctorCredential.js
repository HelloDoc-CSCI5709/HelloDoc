const mongoose = require('mongoose');
const { Schema } = mongoose;

const doctorCredentialSchema = new Schema({
  doctorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true, 
    validate: {
      validator: async function (userId) {
        const user = await mongoose.model('User').findById(userId);
        return user && user.role === 'doctor';
      },
      message: 'Invalid doctor ID or user is not a doctor'
    }
  },
  fileName: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  adminId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: {
    type: Date,
    default: null
  },
  reason: {
    type: String,
    trim: true,
    maxlength: 1000,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('DoctorCredential', doctorCredentialSchema);