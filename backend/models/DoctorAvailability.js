const mongoose = require('mongoose');

const doctorAvailabilitySchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    validate: {
      validator: async function (userId) {
        const user = await mongoose.model('User').findById(userId);
        return user && user.role === 'doctor';
      },
      message: 'Invalid doctor ID or user is not a doctor'
    }
  },
  title: {
    type: String,
    default: 'Available'
  },
  start: {
    type: Date,
    required: true
  },
  end: {
    type: Date,
    required: true
  },
  location: {
    type: String
  },
  description: {
    type: String
  }
}, { timestamps: true });

doctorAvailabilitySchema.index({ doctorId: 1, start: 1, end: 1 });

module.exports = mongoose.model('DoctorAvailability', doctorAvailabilitySchema);
