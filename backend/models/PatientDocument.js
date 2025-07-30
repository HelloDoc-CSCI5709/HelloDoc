const mongoose = require('mongoose');

const allowedDocTypes = ['healthcard-front', 'healthcard-back', 'insurance', 'history', 'allergy'];

const patientDocumentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  docType: {
    type: String,
    required: true,
    enum: allowedDocTypes
  },
  fileName: {
    type: String,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PatientDocument', patientDocumentSchema);
