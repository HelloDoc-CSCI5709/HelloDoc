const PatientProfile = require('../models/PatientProfile');
const PatientDocument = require('../models/PatientDocument');
const path = require('path');
const fs = require('fs');
const { responseBody } = require('../config/responseBody');

const uploadField = (fieldName, label, docType) => async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json(responseBody(400, 'No file uploaded', null));
    }

    const userId = req.user.userId;
    const fileName = req.file.filename;

    // Upsert the document in DB
    await PatientDocument.findOneAndUpdate(
      { userId, docType },
      { userId, docType, fileName },
      { upsert: true, new: true }
    );

    return res.status(200).json(
      responseBody(200, `${label} uploaded successfully`, { fileName })
    );
  } catch (err) {
    console.error(`Upload ${label} error:`, err);
    return res.status(500).json(responseBody(500, 'Server error', null));
  }
};


const uploadHealthCardFrontcontroller    = uploadField('healthCardFront',     'Health card front',    'healthcard-front');
const uploadHealthCardBackcontroller     = uploadField('healthCardBack',      'Health card back',     'healthcard-back');
const uploadInsuranceDocument  = uploadField('insuranceDocument',   'Insurance document',   'insurance');
const uploadAllergyDocument    = uploadField('allergyDocument',     'Allergy document',     'allergy');
const uploadMedicalHistory     = uploadField('medicalHistory',      'Medical history',      'history');

module.exports = {
  uploadHealthCardFrontcontroller,
  uploadHealthCardBackcontroller,
  uploadInsuranceDocument,
  uploadAllergyDocument,
  uploadMedicalHistory
};
