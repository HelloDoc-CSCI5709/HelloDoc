const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    validate:{
        validator: async function(userId){
            const user = await mongoose.model('User').findById(userId);
            return user && user.role === 'patient';
        },
        message: 'Invalid patient ID or user is not a patient'
    }
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    validate: {
      validator: async function(userId) {
        const user = await mongoose.model('User').findById(userId);
        return user && user.role === 'doctor';
      },
      message: 'Invalid doctor ID or user is not a doctor'
    }
  },
  scheduledFor: {
    type: Date,
    required: true,
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Scheduled date must be in the future'
    }
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
    validate: {
      validator: function(value) {
        return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
      },
      message: 'Time must be in HH:mm format'
    }
  },
  reason: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500,
    set: function(value) {
        if (this.isNew) {
            return value.trim();
        }

        return this.reason
        ? `${this.reason.trim()} ; ${value.trim()}`
        : value.trim();
    }
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'no-show', 're-scheduled'],
    default: 'scheduled'
  },
}, { strict: true , timestamps: true });

appointmentSchema.pre('validate', async function(next) {
    if(this.isModified('scheduledFor')){
        const dt = new Date(this.scheduledFor);

        this.date = new Date(Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate()));
        this.time = dt.toTimeString().split(' ')[0].substring(0, 5);

    }

    if (this.patientId.equals(this.doctorId)) {
    return next(new Error('Patient and doctor cannot be the same user.'));
  }

  next();
});

module.exports = mongoose.model('Appointment', appointmentSchema);