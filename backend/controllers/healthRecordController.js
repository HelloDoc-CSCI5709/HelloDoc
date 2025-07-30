const HealthRecord = require('../models/HealthRecord');
const { responseBody } = require('../config/responseBody');

exports.uploadHealthRecordByType = (documentType) => {
  return async (req, res) => {
    try {
      const { appointmentId } = req.body;
      const uploadedBy = req.user.userId;
      let patientId;

      if (req.user.role === 'patient') {
        patientId = req.user.userId;
      } else if (req.user.role === 'doctor') {
        if (!req.body.patientId) {
          return res.status(400).json(responseBody(400, 'Patient ID is required', null));
        }
        patientId = req.body.patientId;
      }

      if (!req.file) {
        return res.status(400).json(responseBody(400, 'No file uploaded', null));
      }

      const fileName = req.file.filename;

      const updated = await HealthRecord.findOneAndUpdate(
        { patientId, documentType },
        {
          patientId,
          uploadedBy,
          appointmentId: appointmentId || null,
          documentType,
          fileName,
          uploadDate: Date.now(),
        },
        { upsert: true, new: true }
      );

      return res.status(200).json(
        responseBody(200, `${documentType} uploaded successfully`, updated)
      );
    } catch (error) {
      return res.status(500).json(responseBody(500, 'Upload failed', error.message));
    }
  };
};
