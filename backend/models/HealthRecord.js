const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', default: null },
  documentType: {
    type: String,
    enum: ['X-ray', 'Lab Report', 'Prescription', 'Vaccination Record', 'Surgical Note'],
    required: true,
  },
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  fileType: { type: String, enum: ['pdf', 'image', 'other'], required: true },
  uploadDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model('HealthRecord', healthRecordSchema);
