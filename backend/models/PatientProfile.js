const mongoose = require('mongoose');

const patientProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  mobile: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female', 'Other']
  },
  dob: {
    type: Date,
    required: true
  },
  emergencyContact: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('PatientProfile', patientProfileSchema);
