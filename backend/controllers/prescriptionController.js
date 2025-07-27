const Prescription = require('../models/Prescription');
const User = require('../models/User');
const { responseBody } = require('../config/responseBody');

exports.createPrescription = async (req, res) => {
  try {
    const { patientId, medications, notes, appointmentId } = req.body;
    const doctorId = req.user.userId;

    if (!patientId || !medications || !Array.isArray(medications) || medications.length === 0) {
      return res.status(400).json(responseBody(400, 'Invalid request body'));
    }

    const prescription = new Prescription({
      patientId,
      doctorId,
      appointmentId,
      medications,
      notes,
    });

    await prescription.save();
    return res.status(201).json(responseBody(201, 'Prescription created', prescription));
  } catch (err) {
    console.error('Error creating prescription:', err);
    return res.status(500).json(responseBody(500, 'Server error'));
  }
};

exports.getPrescriptionsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    const prescriptions = await Prescription.find({ patientId })
      .populate('doctorId', 'fullName email')
      .sort({ createdAt: -1 });

    return res.status(200).json(responseBody(200, 'Prescriptions fetched', prescriptions));
  } catch (err) {
    console.error('Error fetching prescriptions:', err);
    return res.status(500).json(responseBody(500, 'Server error'));
  }
};
