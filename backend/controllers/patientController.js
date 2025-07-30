const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const HAndPRecord = require('../models/PatientHAndPRecord');
const PatientDocument = require('../models/PatientDocument');
const HealthRecord = require('../models/HealthRecord');
const { responseBody } = require('../config/responseBody');

const BASE_URL = process.env.BASE_URL || 'https://hellodoc-prod.onrender.com';

const getPatientProfile = async (req, res) => {
  try {
    const userId = req.user?.userId;

    const user = await User.findById(userId).select('fullName email role emailVerified createdAt');
    if (!user || user.role !== 'patient') {
      return res.status(404).json(responseBody(404, 'Patient user not found', null));
    }

    const profile = await PatientProfile.findOne({ userId });

    const healthRecord = await HAndPRecord.findOne({ patientId: userId }).populate('doctorNotes.doctorId', 'fullName email');

    const patientDocs = await PatientDocument.find({ userId });
    const patientDocumentLinks = {};
    patientDocs.forEach(doc => {
      if (doc.docType) {
        patientDocumentLinks[doc.docType] = `https://hellodoc-prod.onrender.com/uploads/patient/${doc.fileName}`;
      }
    });

    const healthDocs = await HealthRecord.find({ patientId: userId });
    const healthRecordLinks = {};
    healthDocs.forEach(doc => {
      const key = doc.documentType || `record-${doc._id}`;
      healthRecordLinks[key] = `https://hellodoc-prod.onrender.com/uploads/health-records/${doc.fileName}`;
    });

    return res.status(200).json(
      responseBody(200, 'Patient profile fetched', {
        user,
        profile,
        healthRecord,
        documents: {
          patientDocuments: patientDocumentLinks,
          healthRecords: healthRecordLinks
        }
      })
    );
  } catch (err) {
    console.error('Get Patient Profile error:', err);
    return res.status(500).json(responseBody(500, 'Internal Server error', null));
  }
};

const getPatientProfileForDoctor = async (req, res) => {
  try {
    const { patientId } = req.params;

    const user = await User.findById(patientId).select('role');
    if (!user || user.role !== 'patient') {
      return res.status(404).json(responseBody(404, 'Patient user not found', null));
    }

    const profile = await PatientProfile.findOne({ userId: patientId });
    const healthRecord = await HAndPRecord.findOne({ patientId }).populate('doctorNotes.doctorId', 'fullName email');

    const patientDocs = await PatientDocument.find({ userId: patientId });
    const patientDocumentLinks = {};
    patientDocs.forEach(doc => {
      patientDocumentLinks[doc.docType] = `https://hellodoc-prod.onrender.com/uploads/patient/${doc.fileName}`;
    });

    const healthDocs = await HealthRecord.find({ patientId });
    const healthRecordLinks = {};
    healthDocs.forEach(doc => {
      healthRecordLinks[doc.documentType] = `https://hellodoc-prod.onrender.com/uploads/health-records/${doc.fileName}`;
    });

    return res.status(200).json(
      responseBody(200, 'Patient profile fetched', {
        profile,
        healthRecord,
        documents: {
          patientDocuments: patientDocumentLinks,
          healthRecords: healthRecordLinks
        }
      })
    );
  } catch (err) {
    console.error('Get Patient Profile (Doctor View) error:', err);
    return res.status(500).json(responseBody(500, 'Internal Server error', null));
  }
};

const updatePatientProfile = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const {
      mobile,
      dob,
      gender,
      emergencyContact
    } = req.body;

    const errors = [];

    const genderEnum = PatientProfile.schema.path('gender').enumValues;

    if (gender && !genderEnum.includes(gender)) {
      errors.push(`Gender must be one of: ${genderEnum.join(', ')}`);
    }

    if (mobile && !/^\d{10}$/.test(mobile)) {
      errors.push('Mobile number must be a 10-digit number');
    }

    if (dob && isNaN(Date.parse(dob))) {
      errors.push('Date of birth must be a valid date');
    }

    if (emergencyContact && !/^\d{10}$/.test(emergencyContact)) {
      errors.push('Emergency contact must be a 10-digit number');
    }

    if (errors.length) {
      return res.status(400).json(responseBody(400, 'Validation error', { errors }));
    }

    let profile = await PatientProfile.findOne({ userId });

    if (profile) {
      profile.mobile = mobile;
      profile.dob = dob;
      profile.gender = gender;
      profile.emergencyContact = emergencyContact;

      await profile.save();

      return res.status(200).json(
        responseBody(200, 'Profile updated successfully', profile)
      );
    }

    profile = new PatientProfile({
      userId,
      mobile,
      dob,
      gender,
      emergencyContact
    });

    await profile.save();

    return res.status(201).json(
      responseBody(201, 'Profile created successfully', profile)
    );
  } catch (err) {
    console.error('Update Patient Profile error:', err);
    return res.status(500).json(responseBody(500, 'Server error', null));
  }
};

const getAllPatients = async (req, res) => {
  try {
    const user = req.user

    if (!user || user.role !== 'admin') {
      return res.status(403).json(responseBody(403, 'Unauthorized: Admin access required', null));
    }

    const patients = await User.find({ role: 'patient' })
      .select('fullName email emailVerified createdAt')
      .lean();

    const patientData = await Promise.all(patients.map(async (patient) => {
      const profile = await PatientProfile.findOne({ userId: patient._id })
        .select('mobile dob gender emergencyContact')
        .lean();
      
      return {
        ...patient,
        profile: profile || null
      };
    }));

    return res.status(200).json(
      responseBody(200, 'Patients retrieved successfully', patientData)
    );
  } catch (err) {
    console.error('Get All Patients error:', err);
    return res.status(500).json(responseBody(500, 'Internal Server error', null));
  }
};

module.exports = {
  getPatientProfile,
  updatePatientProfile,
  getPatientProfileForDoctor,
  getAllPatients,
  updatePatientProfile
};
