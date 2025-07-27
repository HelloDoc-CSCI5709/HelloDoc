const mongoose = require('mongoose');

const doctorNoteSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  note: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const patientHAndPSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  height: { type: String },
  weight: { type: String },
  bloodType: { type: String },
  allergies: { type: String },
  medications: { type: String },
  chronicIssues: { type: String },
  doctorNotes: [doctorNoteSchema],
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PatientHAndPRecord', patientHAndPSchema);
