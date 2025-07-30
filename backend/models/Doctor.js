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
    trim: true,
    required: false 
  },
  addressComponents: {
    city: {
      type: String,
      trim: true,
      maxlength: 100,
      index: true 
    },
    state: {
      type: String,
      trim: true,
      maxlength: 100,
      index: true 
    },
    country: {
      type: String,
      trim: true,
      maxlength: 100,
      index: true 
    },
    postalCode: {
      type: String,
      trim: true,
      maxlength: 20,
      index: true 
    },
    streetNumber: {
      type: String,
      trim: true,
      maxlength: 10
    },
    streetName: {
      type: String,
      trim: true,
      maxlength: 200
    }
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0], 
      validate: {
        validator: function (value) {
          return !value || (
            value.length === 2 &&
            value[0] >= -180 && value[0] <= 180 && 
            value[1] >= -90 && value[1] <= 90
          );
        },
        message: 'Coordinates must be [longitude, latitude] within valid ranges'
      }
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
    ],
    index: true
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  profilePicture: {
    filename: String,
    path: String
  },
  isApproved: {
    type: Boolean,
    default: false,
    index: true 
  },
  practiceDetails: {
    practiceName: {
      type: String,
      trim: true,
      maxlength: 200
    },
    practiceType: {
      type: String,
      enum: ['clinic', 'hospital', 'private_practice', 'telehealth', 'home_visits'],
      default: 'clinic'
    },
    acceptsInsurance: {
      type: Boolean,
      default: true
    },
    languages: [{
      type: String,
      trim: true
    }],
    consultationFee: {
      type: Number,
      min: 0
    }
  }
}, {
  timestamps: true,
  strict: true
});

doctorSchema.index({ location: '2dsphere' });

doctorSchema.index({ 
  specialization: 1, 
  'addressComponents.city': 1,
  isApproved: 1 
});

doctorSchema.index({ 
  'addressComponents.state': 1, 
  'addressComponents.country': 1,
  isApproved: 1 
});

doctorSchema.index({
  'addressComponents.city': 'text',
  'addressComponents.state': 'text',
  'addressComponents.country': 'text',
  'practiceDetails.practiceName': 'text'
});

doctorSchema.virtual('formattedAddress').get(function() {
  if (!this.addressComponents) {
    return this.address;
  }
  
  const components = this.addressComponents;
  const parts = [];
  
  if (components.streetNumber && components.streetName) {
    parts.push(`${components.streetNumber} ${components.streetName}`);
  }
  if (components.city) parts.push(components.city);
  if (components.state) parts.push(components.state);
  if (components.postalCode) parts.push(components.postalCode);
  if (components.country) parts.push(components.country);
  
  return parts.join(', ') || this.address;
});

doctorSchema.virtual('locationSummary').get(function() {
  const components = this.addressComponents;
  if (!components) return this.address;
  
  const parts = [];
  if (components.city) parts.push(components.city);
  if (components.state) parts.push(components.state);
  if (components.country) parts.push(components.country);
  
  return parts.join(', ');
});

doctorSchema.pre('save', function(next) {
  if (this.location && this.location.coordinates) {
    const [lng, lat] = this.location.coordinates;
    
    if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
      return next(new Error('Invalid coordinates: longitude must be -180 to 180, latitude must be -90 to 90'));
    }
    
    this.location.type = 'Point';
  }
  
  next();
});

doctorSchema.statics.findNearLocation = function(longitude, latitude, radiusInMeters = 5000, options = {}) {
  const query = {
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: radiusInMeters
      }
    },
    isApproved: true
  };
  
  if (options.specialization) {
    query.specialization = options.specialization;
  }
  
  if (options.city) {
    query['addressComponents.city'] = new RegExp(options.city, 'i');
  }
  
  if (options.state) {
    query['addressComponents.state'] = new RegExp(options.state, 'i');
  }
  
  return this.find(query);
};

doctorSchema.statics.findByLocationName = function(locationName, options = {}) {
  const query = {
    $or: [
      { 'addressComponents.city': new RegExp(locationName, 'i') },
      { 'addressComponents.state': new RegExp(locationName, 'i') },
      { 'addressComponents.country': new RegExp(locationName, 'i') },
      { address: new RegExp(locationName, 'i') }
    ],
    isApproved: true
  };
  
  if (options.specialization) {
    query.specialization = options.specialization;
  }
  
  return this.find(query);
};

doctorSchema.set('toJSON', { virtuals: true });
doctorSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Doctor', doctorSchema);