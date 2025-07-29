const Doctor = require('../models/Doctor');
const User = require('../models/User');
const DoctorAvailability = require('../models/DoctorAvailability');
const DoctorCredential = require('../models/DoctorCredential');
const { responseBody } = require('../config/responseBody');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const {ALLOWED_SPECIALIZATIONS , FILE_CONFIG, PAGINATION_LIMITS } = require("../config/Constants")


const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const validateDoctorProfile = (data) => {
  const errors = [];
  
  if (data.fullName && (!data.fullName?.trim() || data.fullName.length > 100)) {
    errors.push('fullName must be a non-empty string up to 100 characters');
  }
  
  if (data.dob) {
    const parsedDate = new Date(data.dob);
    if (isNaN(parsedDate.getTime())) {
      errors.push('dob must be a valid ISO date');
    } else {
      data.dob = parsedDate;
    }
  }
  
  if (data.gender && !['male', 'female', 'other'].includes(data.gender)) {
    errors.push('gender must be male, female, or other');
  }
  
  if (data.phone && (typeof data.phone !== 'string' || data.phone.length > 20)) {
    errors.push('phone must be a string up to 20 characters');
  }
  
  if (data.address && (!data.address?.trim() || data.address.length > 500)) {
    errors.push('address must be a non-empty string up to 500 characters');
  }
  
  if (data.education && (typeof data.education !== 'string' || data.education.length > 1000)) {
    errors.push('education must be a string up to 1000 characters');
  }
  
  if (data.specialization) {
    if (!Array.isArray(data.specialization) || data.specialization.length === 0) {
      errors.push('specialization must be a non-empty array');
    } else if (!data.specialization.every(s => ALLOWED_SPECIALIZATIONS.includes(s))) {
      errors.push('specialization contains invalid values');
    }
  }
  
  if (data.bio && (typeof data.bio !== 'string' || bio.length > 2000)) {
    errors.push('bio must be a string up to 2000 characters');
  }
  
  return errors;
};

const validateAvailabilitySlot = (slot) => {
  const errors = [];
  
  const startDate = new Date(slot.start);
  const endDate = new Date(slot.end);
  
  if (isNaN(startDate.getTime())) {
    errors.push('start must be a valid ISO date');
  }
  
  if (isNaN(endDate.getTime())) {
    errors.push('end must be a valid ISO date');
  }
  
  if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && startDate >= endDate) {
    errors.push('end must be after start');
  }
  
  const stringFields = [
    { field: 'title', maxLength: 100 },
    { field: 'location', maxLength: 500 },
    { field: 'description', maxLength: 1000 }
  ];
  
  stringFields.forEach(({ field, maxLength }) => {
    if (slot[field] && (typeof slot[field] !== 'string' || slot[field].length > maxLength)) {
      errors.push(`${field} must be a string up to ${maxLength} characters`);
    }
  });
  
  return errors;
};

const validateCoordinates = (coordinates) => {
  const errors = [];
  
  if (!Array.isArray(coordinates) || coordinates.length !== 2) {
    errors.push('coordinates must be an array of [longitude, latitude]');
    return errors;
  }
  
  const [lng, lat] = coordinates;
  
  if (typeof lng !== 'number' || lng < -180 || lng > 180) {
    errors.push('longitude must be a number between -180 and 180');
  }
  
  if (typeof lat !== 'number' || lat < -90 || lat > 90) {
    errors.push('latitude must be a number between -90 and 90');
  }
  
  return errors;
};

const validateCredentialFile = (file) => {
  const errors = [];
  
  if (!file) {
    errors.push('No PDF file uploaded');
    return errors;
  }
  
  if (file.mimetype !== 'application/pdf') {
    errors.push('Invalid file type. Only PDF allowed');
  }
  
  if (file.size > FILE_CONFIG.MAX_SIZE) {
    errors.push('File too large. Maximum size is 10MB');
  }
  
  return errors;
};

const validateApproveReject = (data, isRejection) => {
  const errors = [];
  
  if (!isValidObjectId(data.adminId)) {
    errors.push('adminId must be a valid ObjectId');
  }
  
  if (isRejection && (!data.reason?.trim() || data.reason.length > 1000)) {
    errors.push('reason must be a non-empty string up to 1000 characters');
  }
  
  return errors;
};

const validatePagination = (page, limit) => {
  const errors = [];
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  
  if (isNaN(pageNum) || pageNum < 1) {
    errors.push('page must be a positive integer');
  }
  
  if (isNaN(limitNum) || limitNum < 1 || limitNum > PAGINATION_LIMITS.MAX_PAGE_SIZE) {
    errors.push(`limit must be an integer between 1 and ${PAGINATION_LIMITS.MAX_PAGE_SIZE}`);
  }
  
  return { errors, pageNum, limitNum };
};

const checkDoctorAuth = (user, doctorId = null) => {
  if (!user || user.role !== 'doctor') {
    return { authorized: false, message: 'Only doctors can perform this action' };
  }
  
  if (doctorId && user.userId !== doctorId) {
    return { authorized: false, message: 'Not authorized to access this doctor profile' };
  }
  
  return { authorized: true };
};

const checkAdminAuth = (user) => {
  if (!user || user.role !== 'admin') {
    return { authorized: false, message: 'Admin role required' };
  }
  
  return { authorized: true };
};

const checkDoctorOrAdminAuth = (user, doctorId = null) => {
  if (!user || !['doctor', 'admin'].includes(user.role)) {
    return { authorized: false, message: 'Only doctors or admins can perform this action' };
  }
  
  if (user.role === 'doctor' && doctorId && user.userId !== doctorId) {
    return { authorized: false, message: 'Not authorized to access this doctor profile' };
  }
  
  return { authorized: true };
};

const findOrCreateDoctor = async (userId) => {
  let doctor = await Doctor.findOne({ doctorId: userId });
  
  if (!doctor) {
    const user = await User.findById(userId);
    if (!user || user.role !== 'doctor') {
      throw new Error('Doctor not found or not a doctor');
    }
    
    doctor = new Doctor({
      doctorId: user._id,
      email: user.email,
      fullName: user.fullName,
      location: {
        type: 'Point',
        coordinates: [0, 0]
      }
    });
    
    console.log('New Doctor document before save:', JSON.stringify(doctor, null, 2));
    try {
      await doctor.save();
      console.log('Doctor document saved successfully:', JSON.stringify(doctor, null, 2));
    } catch (error) {
      console.error('Error saving doctor in findOrCreateDoctor:', error);
      throw new Error(`Failed to create doctor profile: ${error.message}`);
    }
  }
  
  return doctor;
};

const buildDoctorFilter = (specialization, lng, lat, radius) => {
  const filter = {};
  
  if (specialization) {
    filter.specialization = specialization;
  }
  
  if (lng && lat) {
    filter.location = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)]
        },
        $maxDistance: parseInt(radius)
      }
    };
  }
  
  return filter;
};

const handleAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next))
    .catch((err) => {
      console.error(`Error in ${fn.name}:`, err);
      res
        .status(500)
        .json(responseBody(500, `Internal Server Error: ${err.message}`, null));
    });
};

 const getDoctorProfile = handleAsync(
   async ({ user, query: { doctorId } }, res) => {
     const { authorized, message } = checkDoctorOrAdminAuth(user);
     if (!authorized) {
       return res
         .status(403)
         .json({ status: 403, message, data: null });
     }

    const { role, userId } = user;
    const targetId = role === 'admin' && doctorId ? doctorId : userId;

    if (role === 'admin' && doctorId && !isValidObjectId(doctorId)) {
      return res
        .status(400)
        .json(responseBody(400, 'Invalid doctorId', null));
    }

    // fetch and populate
    const doctor = await Doctor
      .findOne({ doctorId: targetId })
      .populate('doctorId', 'fullName email');

    if (!doctor) {
      return res
        .status(404)
        .json(responseBody(404, 'Doctor profile not found', null));
    }

    return res
      .status(200)
      .json(responseBody(200, 'Doctor profile retrieved successfully', doctor));
  }
);

const updateBasicDoctorProfile = handleAsync(async (req, res) => {
  const { user } = req;

  const authCheck = checkDoctorOrAdminAuth(user);
  if (!authCheck.authorized) {
    return res
      .status(403)
      .json(responseBody(403, authCheck.message, null));
  }

  const targetDoctorId =
    user.role === 'admin' && req.query.doctorId
      ? req.query.doctorId
      : user.userId;
  if (user.role === 'admin' && req.query.doctorId && !isValidObjectId(req.query.doctorId)) {
    return res
      .status(400)
      .json(responseBody(400, 'Invalid doctorId', null));
  }

  let doctor;
  try {
    doctor = await findOrCreateDoctor(targetDoctorId);
  } catch (err) {
    console.error('findOrCreateDoctor failed:', err);
    return res
      .status(400)
      .json(
        responseBody(400, `Failed to load doctor profile: ${err.message}`, null)
      );
  }
  
  const {
    fullName,
    email,
    dob,
    gender,
    phone,
    education,
    specialization,
    bio
  } = req.body;

  const userUpdates = {
    ...(fullName     && { fullName }),
    ...(email        && { email })
  };

  const doctorUpdates = {
    ...(dob           && { dob }),
    ...(gender        && { gender }),
    ...(phone         && { phone }),
    ...(education     && { education }),
    ...(specialization&& { specialization }),
    ...(bio           && { bio })
  };

  let updatedUser = null;
  if (Object.keys(userUpdates).length) {
    updatedUser = await User.findByIdAndUpdate(
      targetDoctorId,
      userUpdates,
      { new: true, runValidators: true }
    );
  }

  Object.assign(doctor, doctorUpdates);

  if (!doctor.location?.coordinates) {
    doctor.location = { type: 'Point', coordinates: [0, 0] };
  }

  const savedDoctor = await doctor.save();
  return res.status(200).json(
    responseBody(200, 'Doctor profile updated successfully', {
      user:   updatedUser || undefined,
      doctor: savedDoctor
    })
  );
});

const updateAvailability = handleAsync(
  async ({ user, body: { slots } }, res) => {
    const { authorized, message } = checkDoctorAuth(user);
    if (!authorized) {
      return res
        .status(403)
        .json(responseBody(403, message, null));
    }

    if (!Array.isArray(slots) || slots.length === 0) {
      return res
        .status(400)
        .json(responseBody(400, 'Provided a non-empty array of availability slots', null));
    }

    const errors = slots.reduce((errs, slot, idx) => {
      const slotErrs = validateAvailabilitySlot(slot);
      if (slotErrs.length) {
        errs.push(`Slot ${idx}: ${slotErrs.join(', ')}`);
      }
      return errs;
    }, []);

    if (errors.length > 0) {
      return res
        .status(400)
        .json(responseBody(400, 'Validation error', errors));
    }

    await DoctorAvailability.deleteMany({ doctorId: user.userId });

    const entries = slots.map(
      ({ title = 'Available', start, end, location = '', description = '' }) => ({
        doctorId:   user.userId,
        title:      title.trim(),
        start:      new Date(start),
        end:        new Date(end),
        location:   location.trim(),
        description: description.trim(),
      })
    );

    const saved = await DoctorAvailability.insertMany(entries);
    return res
      .status(200)
      .json(responseBody(200, 'Availability updated successfully', saved));
  }
);

const updateDoctorAddress = handleAsync(
  async ({ user, body: { address = '', coordinates } }, res) => {

    const { authorized, message } = checkDoctorAuth(user);
    if (!authorized) {
      return res
        .status(403)
        .json(responseBody(403, message, null));
    }

    const trimmed = address.trim();
    const errors = [
      ...(!trimmed
        ? ['address must be a non-empty string up to 500 characters']
        : []),
      ...validateCoordinates(coordinates)
    ];
    if (errors.length) {
      return res
        .status(400)
        .json(responseBody(400, 'Validation error', errors));
    }

    const updated = await Doctor.findOneAndUpdate(
      { doctorId: user.userId },
      {
        address: trimmed,
        location: {
          type: 'Point',
          coordinates
        }
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json(responseBody(404, 'Doctor profile not found', null));
    }

    return res
      .status(200)
      .json(
        responseBody(200, 'Address updated successfully', {
          address:  updated.address,
          location: updated.location
        })
      );
  }
);

const getAvailability = handleAsync(async (req, res) => {
  const { user } = req;
  
  const authCheck = checkDoctorAuth(user);
  if (!authCheck.authorized) {
    return res.status(403).json(responseBody(403, authCheck.message, null));
  }
  
  const availability = await DoctorAvailability.find({ doctorId: user.userId }).sort({ start: 1 });
  
  return res.status(200).json(responseBody(200, 'Availability retrieved successfully', availability));
});

const uploadProfilePicture = handleAsync(async (req, res) => {
  const { user } = req;
  
  const authCheck = checkDoctorAuth(user);
  if (!authCheck.authorized) {
    return res.status(403).json(responseBody(403, authCheck.message, null));
  }
  
  if (!req.file) {
    return res.status(400).json(responseBody(400, 'No image file uploaded', null));
  }
  
  if (!FILE_CONFIG.ALLOWED_TYPES.includes(req.file.mimetype)) {
    return res.status(400).json(responseBody(400, 'Invalid file type. Only JPEG, PNG allowed', null));
  }
  
  if (req.file.size > FILE_CONFIG.MAX_SIZE) {
    return res.status(400).json(responseBody(400, 'File too large. Maximum size is 10MB', null));
  }
  
  const doctor = await Doctor.findOne({ doctorId: user.userId });
  
  if (!doctor) {
    return res.status(404).json(responseBody(404, 'Doctor profile not found', null));
  }
  
  doctor.profilePicture = {
    filename: req.file.filename,
    path: req.file.path
  };
  
  try {
    await doctor.save();
  } catch (error) {
    console.error('Error saving profile picture:', error);
    return res.status(400).json(400, `Error saving profile picture: ${error}`, null)
  }
  
  return res.status(200).json(responseBody(200, 'Profile picture updated successfully', null));
});

const getPublicDoctorProfile = handleAsync(async (req, res) => {
  const { doctorId } = req.params;
  
  if (!isValidObjectId(doctorId)) {
    return res.status(400).json(responseBody(400, 'Invalid doctorId', null));
  }
  
  const doctor = await Doctor.findOne({ doctorId }).populate('doctorId', 'fullName');
  
  if (!doctor) {
    return res.status(404).json(responseBody(404, 'Doctor not found', null));
  }
  
  const availability = await DoctorAvailability.find({ doctorId }).sort({ start: 1});
  
  const publicProfile = {
    fullName: doctor.doctorId.fullName,
    specialization: doctor.specialization,
    bio: doctor.bio,
    location: doctor.location,
    education: doctor.education,
    availability
  };
  
  return res.status(200).json(responseBody(200, 'Doctor profile retrieved', publicProfile));
});

const listDoctors = handleAsync(async (req, res) => {
  const { specialization, lng, lat, radius = '5000', page = '1', limit = '10' } = req.query;

  const errors = [];

  if (specialization && !ALLOWED_SPECIALIZATIONS.includes(specialization)) {
    errors.push('specialization is invalid');
  }

  if ((lng && !lat) || (!lng && lat)) {
    errors.push('Both lng and lat must be provided together');
  }

  let useGeo = false;
  if (lng && lat) {
    useGeo = true;
    const longitude = parseFloat(lng);
    const latitude = parseFloat(lat);

    if (isNaN(longitude) || longitude < -180 || longitude > 180) {
      errors.push('lng must be a number between -180 and 180');
    }

    if (isNaN(latitude) || latitude < -90 || latitude > 90) {
      errors.push('lat must be a number between -90 and 90');
    }
  }

  const radiusNum = parseInt(radius);
  if (isNaN(radiusNum) || radiusNum <= 0 || radiusNum > PAGINATION_LIMITS.MAX_RADIUS) {
    errors.push(`radius must be a positive number up to ${PAGINATION_LIMITS.MAX_RADIUS}`);
  }

  const { errors: paginationErrors, pageNum, limitNum } = validatePagination(page, limit);
  errors.push(...paginationErrors);

  if (errors.length > 0) {
    return res.status(400).json(responseBody(400, 'Validation error', errors));
  }

  const filter = buildDoctorFilter(specialization, lng, lat, radius);
  const skip = (pageNum - 1) * limitNum;

  // Only apply `location: { $ne: null }` if geospatial filtering is used
  const locationFilter = useGeo ? { location: { $ne: null } } : {};

  const [doctors, total] = await Promise.all([
    Doctor.find({ ...filter, ...locationFilter })
      .populate('doctorId', 'fullName')
      .select('doctorId specialization bio location education')
      .skip(skip)
      .limit(limitNum),
    Doctor.countDocuments({ ...filter, ...locationFilter })
  ]);

  return res.status(200).json(responseBody(200, 'Doctors retrieved successfully', {
    doctors,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    }
  }));
});

const submitDoctorCredential = handleAsync(async (req, res) => {
  const { user } = req;
  const { doctorId } = req.params;
  
  if (!isValidObjectId(doctorId)) {
    return res.status(400).json(responseBody(400, 'Invalid doctorId', null));
  }
  
  const authCheck = checkDoctorAuth(user, doctorId);
  if (!authCheck.authorized) {
    return res.status(403).json(responseBody(403, authCheck.message, null));
  }
  
  const errors = validateCredentialFile(req.file);
  if (errors.length > 0) {
    return res.status(400).json(responseBody(400, 'Validation error', errors));
  }
  
  const fileName = req.file.filename;
  
  try {
    const credential = await DoctorCredential.findOneAndUpdate(
      { doctorId },
      { doctorId, fileName, submittedAt: new Date(), status: 'Pending', adminId: null, reviewedAt: null, reason: null },
      { upsert: true, new: true, runValidators: true }
    );
    
    res.status(201).json(responseBody(201, 'Credential submitted; pending admin approval', {
      credentialId: credential._id,
      doctorId: credential.doctorId,
      fileName: credential.fileName,
      submittedAt: credential.submittedAt,
      status: credential.status
    }));
  } catch (error) {
    console.error('Error submitting credential:', error);
    return res.status(500).json(
      responseBody(500, `Error submitting credentials: ${error.message}`, null)
    )
  }
});

const getDoctorCredentials = handleAsync(async (req, res) => {
  const { doctorId } = req.params;
  const { user } = req;
  
  if (!isValidObjectId(doctorId)) {
    return res.status(400).json(responseBody(400, 'Invalid doctorId', null));
  }
  
  const authCheck = checkDoctorAuth(user, doctorId);
  if (!authCheck.authorized) {
    return res.status(403).json(responseBody(403, authCheck.message, null));
  }
  
  const credential = await DoctorCredential.findOne({ doctorId });
  
  if (!credential) {
    return res.status(404).json(responseBody(404, 'No credential found', null));
  }
  
  return res.status(200).json(responseBody(200, 'Credential retrieved', {
    credentialId: credential._id,
    doctorId: credential.doctorId,
    fileName: credential.fileName,
    submittedAt: credential.submittedAt,
    status: credential.status,
    reviewedAt: credential.reviewedAt || null,
    reason: credential.reason || null
  }));
});

const processCredentialReview = async (req, res, isApproval) => {
  const { doctorId, credentialId } = req.params;
  const { user } = req;
  
  if (!isValidObjectId(doctorId) || !isValidObjectId(credentialId)) {
    return res.status(400).json(responseBody(400, 'Invalid doctorId or credentialId', null));
  }
  
  const authCheck = checkAdminAuth(user);
  if (!authCheck.authorized) {
    return res.status(403).json(responseBody(403, authCheck.message, null));
  }
  
  const errors = validateApproveReject(req.body, !isApproval);
  if (errors.length > 0) {
    return res.status(400).json(responseBody(400, 'Validation error', errors));
  }
  
  const credential = await DoctorCredential.findOne({ _id: credentialId, doctorId });
  
  if (!credential) {
    return res.status(404).json(responseBody(404, 'Credential not found', null));
  }
  
  if (credential.status !== 'Pending') {
    return res.status(409).json(responseBody(409, 'Credential has already been reviewed', null));
  }
  
  credential.status = isApproval ? 'Approved' : 'Rejected';
  credential.adminId = req.body.adminId;
  credential.reviewedAt = new Date();
  
  if (!isApproval) {
    credential.reason = req.body.reason.trim();
  }
  
  try {
    await credential.save();
  } catch (error) {
    console.error('Error saving credential review:', error);
    return res.status(500).json(
      responseBody(`Failed to process credential review: ${error.message}`, null)
    )
  }
  
  const response = {
    credentialId: credential._id,
    doctorId: credential.doctorId,
    adminId: credential.adminId,
    status: credential.status,
    reviewedAt: credential.reviewedAt
  };
  
  if (!isApproval) {
    response.reason = credential.reason;
  }
  
  const message = isApproval ? 'Credential approved' : 'Credential rejected';
  return res.status(200).json(responseBody(200, message, response));
};

const approveDoctorCredential = handleAsync(async (req, res) => {
  await processCredentialReview(req, res, true);
});

const rejectDoctorCredential = handleAsync(async (req, res) => {
  await processCredentialReview(req, res, false);
});

const getDoctorCredentialById = handleAsync(async (req, res) => {
  const { doctorId, credentialId } = req.params;
  const { user } = req;
  
  if (!isValidObjectId(doctorId) || !isValidObjectId(credentialId)) {
    return res.status(400).json(responseBody(400, 'Invalid doctorId or credentialId', null));
  }
  
  if (!user || (user.role !== 'admin' && user.userId !== doctorId)) {
    return res.status(403).json(responseBody(403, 'Not authorized to view this credential', null));
  }
  
  const credential = await DoctorCredential.findOne({ _id: credentialId, doctorId });
  
  if (!credential) {
    return res.status(404).json(responseBody(404, 'Credential not found', null));
  }
  
  return res.status(200).json(responseBody(200, 'Credential retrieved', {
    credentialId: credential._id,
    doctorId: credential.doctorId,
    fileName: credential.fileName,
    submittedAt: credential.submittedAt,
    status: credential.status,
    reviewedAt: credential.reviewedAt || null,
    reason: credential.reason || null,
    adminId: credential.adminId || null
  }));
});

module.exports = {
  getDoctorProfile,
  updateBasicDoctorProfile,
  updateAvailability,
  updateDoctorAddress,
  getAvailability,
  uploadProfilePicture,
  getPublicDoctorProfile,
  listDoctors,
  submitDoctorCredential,
  getDoctorCredentials,
  approveDoctorCredential,
  rejectDoctorCredential,
  getDoctorCredentialById
};