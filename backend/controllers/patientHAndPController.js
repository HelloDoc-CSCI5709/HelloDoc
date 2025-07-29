const PatientHAndPRecord = require('../models/PatientHAndPRecord');
const { responseBody } = require('../config/responseBody');

// GET: Fetch full H&P record for a patient
const getHAndPByPatientId = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Patients can only access their own data
    if (req.user.role === 'patient' && req.user.userId !== patientId) {
      return res.status(403).json(responseBody(403, 'Unauthorized', null));
    }

    const record = await PatientHAndPRecord.findOne({ patientId }).populate('doctorNotes.doctorId', 'fullName email');

    if (!record) {
      return res.status(404).json(responseBody(404, 'H&P record not found', null));
    }

    return res.status(200).json(responseBody(200, 'H&P record fetched', record));
  } catch (err) {
    console.error('Error fetching H&P:', err);
    return res.status(500).json(responseBody(500, 'Server error', null));
  }
};

// PUT: Update generic fields (height, weight, bloodType, etc.)
const updateGenericHAndP = async (req, res) => {
  try {
    const { patientId } = req.params;
    const updateFields = req.body;

    const record = await PatientHAndPRecord.findOneAndUpdate(
      { patientId },
      { ...updateFields, updatedAt: Date.now() },
      { new: true, upsert: true }
    );

    return res.status(200).json(responseBody(200, 'H&P updated successfully', record));
  } catch (err) {
    console.error('Error updating H&P:', err);
    return res.status(500).json(responseBody(500, 'Server error', null));
  }
};

// POST: Add doctor note
const addDoctorNote = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { note } = req.body;
    const doctorId = req.user.userId;

    if (!note || note.trim() === '') {
      return res.status(400).json(responseBody(400, 'Note is required', null));
    }

    const record = await PatientHAndPRecord.findOneAndUpdate(
      { patientId },
      {
        $push: {
          doctorNotes: {
            doctorId,
            note,
            createdAt: new Date()
          }
        },
        $set: { updatedAt: new Date() }
      },
      { new: true, upsert: true }
    );

    return res.status(201).json(responseBody(201, 'Note added successfully', record));
  } catch (err) {
    console.error('Error adding doctor note:', err);
    return res.status(500).json(responseBody(500, 'Server error', null));
  }
};

module.exports = {
  getHAndPByPatientId,
  updateGenericHAndP,
  addDoctorNote
};
