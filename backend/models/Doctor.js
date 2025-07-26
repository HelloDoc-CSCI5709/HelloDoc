const mongoose = require('mongoose');
const { Schema } = mongoose;

const doctorSchema = new Schema({
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
  dob: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    default: 'other'
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
      required: false
    },
    coordinates: {
      type: [Number],
      default: null,
      validate: {
        validator: function (value) {
          return !value || (
            value.length === 2 &&
            value[0] >= -180 && value[0] <= 180 &&
            value[1] >= -90 && value[1] <= 90
          );
        },
        message: 'Coordinates must be [longitude, latitude] within valid ranges'
      },
      required: false
    }
  },
  education: {
    type: String,
    trim: true
  },
  specialization: {
    type: [String],
    enum: [
      'Dermatologist',
      'Cardiologist',
      'Oncologist',
      'Family Medicine',
      'Anesthesiology',
      'Neurologist',
      'Psychiatrist',
      'Radiologist',
      'Gynecologist',
      'Orthopedic Surgeon',
      'Pediatrician',
      'Urologist',
      'ENT Specialist',
      'Gastroenterologist',
      'General Practitioner'
    ]
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  profilePicture: {
    data: Buffer,
    contentType: String
  },
  isApproved: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  strict: true
});

doctorSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Doctor', doctorSchema);