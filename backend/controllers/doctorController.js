const Doctor = require('../models/Doctor');
const User = require('../models/User');
const DoctorAvailability = require('../models/DoctorAvailability');
const DoctorCredential = require('../models/DoctorCredential');
const Appointment = require('../models/Appointments');
const { responseBody } = require('../config/responseBody');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const ics = require('ics');
const { ALLOWED_SPECIALIZATIONS, FILE_CONFIG, PAGINATION_LIMITS } = require('../config/Constants');

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
  
  if (data.bio && (typeof data.bio !== 'string' || data.bio.length > 2000)) {
    errors.push('bio must be a string up to 2000 characters');
  }
  
  return errors;
};

const checkDoctorCredentialStatus = async (doctorId) => {
  const credential = await DoctorCredential.findOne({ doctorId });
  if (!credential) {
    return { ok: false, message: 'Upload credentials before proceeding.' };
  }
  if (credential.status === 'Pending') {
    return { ok: false, message: 'Your credentials are under review. Please wait for admin approval.' };
  }
  if (credential.status === 'Rejected') {
    return { ok: false, message: credential.reason || 'Your credentials were rejected. Please contact admin.' };
  }
  return { ok: true };
};

const checkCredentialForPutApis = async (doctorId) => {
  const credential = await DoctorCredential.findOne({ doctorId });

  if (!credential) {
    return { ok: false, message: 'Upload credentials before proceeding.' };
  }

  if (credential.status === 'Pending') {
    return { ok: false, message: 'Your credentials are under review. Please wait for admin approval.' };
  }

  if (credential.status === 'Rejected') {
    return {
      ok: false,
      message: credential.reason || 'Your credentials were rejected. Please contact admin.'
    };
  }

  return { ok: true };
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

const validateIcsFile = (file) => {
  const errors = [];
  
  if (!file) {
    errors.push('No ICS file uploaded');
    return errors;
  }
  
  const fileExtension = path.extname(file.originalname).toLowerCase();
  if (fileExtension !== '.ics') {
    errors.push('Invalid file type. Only .ics files are allowed');
  }
  
  const allowedMimeTypes = [
    'text/calendar',
    'application/ics',
    'text/plain',
    'application/octet-stream'
  ];
  
  if (!allowedMimeTypes.includes(file.mimetype)) {
    errors.push('Invalid MIME type. Please upload a valid .ics file');
  }
  
  if (file.size > 2 * 1024 * 1024) {
    errors.push('File too large. Maximum size is 2MB');
  }
  
  return errors;
};

const parseIcsFile = async (filePath) => {
  try {
    const icsContent = fs.readFileSync(filePath, 'utf8');
    const events = [];
    const lines = icsContent.split('\n');
    let currentEvent = null;
    let isInEvent = false;
    
    for (let line of lines) {
      line = line.trim();
      
      if (line === 'BEGIN:VEVENT') {
        isInEvent = true;
        currentEvent = {};
      } else if (line === 'END:VEVENT' && isInEvent) {
        if (currentEvent && currentEvent.dtstart && currentEvent.dtend) {
          events.push(currentEvent);
        }
        currentEvent = null;
        isInEvent = false;
      } else if (isInEvent && currentEvent) {
        if (line.startsWith('DTSTART:') || line.startsWith('DTSTART;')) {
          const dateValue = line.split(':')[1];
          currentEvent.dtstart = parseIcsDate(dateValue);
        } else if (line.startsWith('DTEND:') || line.startsWith('DTEND;')) {
          const dateValue = line.split(':')[1];
          currentEvent.dtend = parseIcsDate(dateValue);
        } else if (line.startsWith('SUMMARY:')) {
          currentEvent.summary = line.substring(8);
        } else if (line.startsWith('DESCRIPTION:')) {
          currentEvent.description = line.substring(12);
        } else if (line.startsWith('LOCATION:')) {
          currentEvent.location = line.substring(9);
        }
      }
    }
    
    return events;
  } catch (error) {
    console.error('Error parsing ICS file:', error);
    throw new Error('Failed to parse ICS file. Please ensure it is a valid calendar file.');
  }
};

const parseIcsDate = (dateString) => {
  try {
    if (dateString.includes('T')) {
      const cleanDate = dateString.replace(/[TZ]/g, '');
      const year = cleanDate.substring(0, 4);
      const month = cleanDate.substring(4, 6);
      const day = cleanDate.substring(6, 8);
      const hour = cleanDate.substring(8, 10) || '00';
      const minute = cleanDate.substring(10, 12) || '00';
      const second = cleanDate.substring(12, 14) || '00';
      
      return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
    } else {
      const year = dateString.substring(0, 4);
      const month = dateString.substring(4, 6);
      const day = dateString.substring(6, 8);
      
      return new Date(`${year}-${month}-${day}`);
    }
  } catch (error) {
    console.error('Error parsing date:', dateString, error);
    return null;
  }
};

const convertIcsEventsToAvailability = (events, doctorId) => {
  const availabilitySlots = [];
  
  for (const event of events) {
    if (!event.dtstart || !event.dtend) {
      continue;
    }
    
    const slot = {
      doctorId: doctorId,
      title: event.summary || 'Available',
      start: event.dtstart,
      end: event.dtend,
      location: event.location || '',
      description: event.description || ''
    };
    
    const errors = validateAvailabilitySlot(slot);
    if (errors.length === 0) {
      availabilitySlots.push(slot);
    } else {
      console.warn(`Skipping invalid availability slot: ${errors.join(', ')}`);
    }
  }
  
  return availabilitySlots;
};

const geocodeAddress = async (address) => {
  try {
    const GOOGLE_MAPS_API_KEY = process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
    
    if (!GOOGLE_MAPS_API_KEY) {
      throw new Error('Google Maps API key not configured');
    }

    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address: address,
        key: GOOGLE_MAPS_API_KEY
      }
    });

    if (response.data.status === 'OK' && response.data.results.length > 0) {
      const result = response.data.results[0];
      const location = result.geometry.location;
      
      const addressComponents = {};
      result.address_components.forEach(component => {
        if (types.includes('street_number')) {
          addressComponents.streetNumber = component.long_name;
        }
        if (types.includes('route')) {
          addressComponents.streetName = component.long_name;
        }
        if (types.includes('locality')) {
          addressComponents.city = component.long_name;
        }
        if (types.includes('administrative_area_level_1')) {
          addressComponents.state = component.long_name;
        }
        if (types.includes('country')) {
          addressComponents.country = component.long_name;
        }
        if (types.includes('postal_code')) {
          addressComponents.postalCode = component.long_name;
        }
      });

      return {
        success: true,
        coordinates: [location.lng, location.lat],
        formattedAddress: result.formatted_address,
        addressComponents
      };
    } else {
      throw new Error(`Geocoding failed: ${response.data.status}`);
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    return {
      success: false,
      error: error.message
    };
  }
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
  const pageNum = parseInt(page) || 1; // Default to page 1
  const limitNum = parseInt(limit) || 10; // Default to limit 10
  
  if (pageNum < 1) {
    errors.push('page must be a positive integer');
  }
  
  if (limitNum < 1 || limitNum > PAGINATION_LIMITS.MAX_PAGE_SIZE) {
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

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
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
        .json(responseBody(403, message, null));
    }

    const { role, userId } = user;
    const targetId = role === 'admin' && doctorId ? doctorId : userId;

    if (role === 'admin' && doctorId && !isValidObjectId(doctorId)) {
      return res
        .status(400)
        .json(responseBody(400, 'Invalid doctorId', null));
    }

    const userInfo = await User.findById(targetId).select('fullName email role emailVerified createdAt');
    if (!userInfo || userInfo.role !== 'doctor') {
      return res.status(404).json(responseBody(404, 'User not found or not a doctor', null));
    }

    const doctorInfo = await Doctor.findOne({ doctorId: targetId });

    return res.status(200).json(responseBody(200, 'Doctor profile retrieved successfully', {
      user: userInfo,
      doctor: doctorInfo || null
    }));
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

  const credentialCheck = await checkCredentialForPutApis(targetDoctorId);
  if (!credentialCheck.ok) {
    return res.status(403).json(responseBody(403, credentialCheck.message, null));
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
    dob,
    gender,
    phone,
    education,
    specialization,
    bio
  } = req.body;

  const doctorUpdates = {
    ...(dob           && { dob }),
    ...(gender        && { gender }),
    ...(phone         && { phone }),
    ...(education     && { education }),
    ...(specialization&& { specialization }),
    ...(bio           && { bio })
  };

  Object.assign(doctor, doctorUpdates);

  if (!doctor.location?.coordinates) {
    doctor.location = { type: 'Point', coordinates: [0, 0] };
  }

  const savedDoctor = await doctor.save();
  return res.status(200).json(
    responseBody(200, 'Doctor profile updated successfully', {
      doctor: savedDoctor
    })
  );
});

const updateAvailability = handleAsync(async ({ user, body: { slots } }, res) => {
  const { authorized, message } = checkDoctorAuth(user);
  if (!authorized) {
    return res.status(403).json(responseBody(403, message, null));
  }

  const credentialCheck = await checkCredentialForPutApis(user.userId);
  if (!credentialCheck.ok) {
    return res.status(403).json(responseBody(403, credentialCheck.message, null));
  }
  
  if (!Array.isArray(slots) || slots.length === 0) {
    return res.status(400).json(responseBody(400, 'Provide a non-empty array of availability slots', null));
  }

  const errors = slots.reduce((errs, slot, idx) => {
    const slotErrs = validateAvailabilitySlot(slot);
    if (slotErrs.length) {
      errs.push(`Slot ${idx}: ${slotErrs.join(', ')}`);
    }
    return errs;
  }, []);

  if (errors.length > 0) {
    return res.status(400).json(responseBody(400, 'Validation error', errors));
  }

  const startDate = new Date(slots[0].start);
  const year = startDate.getUTCFullYear();
  const month = startDate.getUTCMonth();

  const isSameMonth = slots.every(slot => {
    const d = new Date(slot.start);
    return d.getUTCFullYear() === year && d.getUTCMonth() === month;
  });

  if (!isSameMonth) {
    return res.status(400).json(
      responseBody(400, 'All availability slots must be within the same month and year', null)
    );
  }

  const monthStart = new Date(Date.UTC(year, month, 1, 0, 0, 0));
  const nextMonthStart = new Date(Date.UTC(year, month + 1, 1, 0, 0, 0));

  await DoctorAvailability.deleteMany({
    doctorId: user.userId,
    start: {
      $gte: monthStart,
      $lt: nextMonthStart
    }
  });

  const entries = slots.map(({ title = 'Available', start, end, location = '', description = '' }) => ({
    doctorId: user.userId,
    title: title.trim(),
    start: new Date(start),
    end: new Date(end),
    location: location.trim(),
    description: description.trim()
  }));

  const saved = await DoctorAvailability.insertMany(entries);

  return res.status(200).json(
    responseBody(200, `Availability updated for ${year}-${month + 1}`, saved)
  );
});

const uploadAvailabilityFromIcs = handleAsync(async (req, res) => {
  const { user } = req;

  const authCheck = checkDoctorAuth(user);
  if (!authCheck.authorized) {
    return res
      .status(403)
      .json(responseBody(403, authCheck.message, null));
  }

  const fileErrors = validateIcsFile(req.file);
  if (fileErrors.length > 0) {
    return res
      .status(400)
      .json(responseBody(400, 'File validation error', fileErrors));
  }

  try {
    const events = await parseIcsFile(req.file.path);
    
    if (events.length === 0) {
      return res
        .status(400)
        .json(responseBody(400, 'No valid events found in the ICS file', null));
    }

    const availabilitySlots = convertIcsEventsToAvailability(events, user.userId);
    
    if (availabilitySlots.length === 0) {
      return res
        .status(400)
        .json(responseBody(400, 'No valid availability slots could be created from the ICS file', null));
    }

    await DoctorAvailability.deleteMany({ doctorId: user.userId });

    const saved = await DoctorAvailability.insertMany(availabilitySlots);

    fs.unlinkSync(req.file.path);

    return res
      .status(200)
      .json(responseBody(200, `Availability updated successfully from ICS file. ${saved.length} slots imported.`, {
        slotsImported: saved.length,
        availability: saved
      }));

  } catch (error) {
    console.error('Error processing ICS file:', error);
    
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res
      .status(400)
      .json(responseBody(400, `Error processing ICS file: ${error.message}`, null));
  }
});

const updateDoctorAddress = handleAsync(async (req, res) => {
  const { user } = req;

  const authCheck = checkDoctorAuth(user);
  if (!authCheck.authorized) {
    return res
      .status(403)
      .json(responseBody(403, authCheck.message, null));
  }

  const credentialCheck = await checkCredentialForPutApis(user.userId);
  if (!credentialCheck.ok) {
    return res.status(403).json(responseBody(403, credentialCheck.message, null));
  }

  const { 
    address,
    coordinates,
    autoGeocode = true,
    city,
    state,
    country,
    postalCode,
    streetNumber,
    streetName
  } = req.body;

  const errors = [];

  if (!address || !address.trim() || address.trim().length > 500) {
    errors.push('address must be a non-empty string up to 500 characters');
  }

  if (errors.length) {
    return res
      .status(400)
      .json(responseBody(400, 'Validation error', errors));
  }

  try {
    let finalCoordinates = coordinates;
    let finalAddressComponents = {};
    let formattedAddress = address.trim();

    if (autoGeocode && (!coordinates || coordinates.length !== 2)) {
      console.log('Geocoding address:', address);
      const geocodeResult = await geocodeAddress(address);
      
      if (geocodeResult.success) {
        finalCoordinates = geocodeResult.coordinates;
        finalAddressComponents = geocodeResult.addressComponents;
        formattedAddress = geocodeResult.formattedAddress;
        console.log('Geocoded coordinates:', finalCoordinates);
      } else {
        return res
          .status(400)
          .json(responseBody(400, `Address geocoding failed: ${geocodeResult.error}`, null));
      }
    } else if (coordinates) {
      const coordinateErrors = validateCoordinates(coordinates);
      if (coordinateErrors.length > 0) {
        return res
          .status(400)
          .json(responseBody(400, 'Invalid coordinates', coordinateErrors));
      }
      finalCoordinates = coordinates;
    } else {
      return res
        .status(400)
        .json(responseBody(400, 'Either enable autoGeocode or provide valid coordinates', null));
    }

    if (city || state || country || postalCode || streetNumber || streetName) {
      finalAddressComponents = {
        ...finalAddressComponents,
        ...(city && { city: city.trim() }),
        ...(state && { state: state.trim() }),
        ...(country && { country: country.trim() }),
        ...(postalCode && { postalCode: postalCode.trim() }),
        ...(streetNumber && { streetNumber: streetNumber.trim() }),
        ...(streetName && { streetName: streetName.trim() })
      };
    }

    const updateData = {
      address: formattedAddress,
      location: {
        type: 'Point',
        coordinates: finalCoordinates
      }
    };

    if (Object.keys(finalAddressComponents).length > 0) {
      updateData.addressComponents = finalAddressComponents;
    }

    const updated = await Doctor.findOneAndUpdate(
      { doctorId: user.userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json(responseBody(404, 'Doctor profile not found', null));
    }

    return res
      .status(200)
      .json(responseBody(200, 'Address updated successfully with location coordinates', {
        address: updated.address,
        location: updated.location,
        addressComponents: updated.addressComponents || null,
        coordinates: finalCoordinates
      }));

  } catch (error) {
    console.error('Error updating doctor address:', error);
    return res
      .status(500)
      .json(responseBody(500, `Error updating address: ${error.message}`, null));
  }
});

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

  const credentialCheck = await checkCredentialForPutApis(user.userId);
  if (!credentialCheck.ok) {
    return res.status(403).json(responseBody(403, credentialCheck.message, null));
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
    return res.status(400).json(responseBody(400, `Error saving profile picture: ${error}`, null));
  }
  
  return res.status(200).json(responseBody(200, 'Profile picture updated successfully', null));
});

const getPublicDoctorProfile = handleAsync(async (req, res) => {
  const { doctorId } = req.params;
  
  if (!isValidObjectId(doctorId)) {
    return res.status(400).json(responseBody(400, 'Invalid doctorId', null));
  }

  const credentialStatus = await checkDoctorCredentialStatus(doctorId);
  if (!credentialStatus.ok) {
    return res.status(403).json(responseBody(403, credentialStatus.message, null));
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
  const { 
    specialization, 
    lng, 
    lat, 
    radius = '5000',
    page = '1', 
    limit = '10',
    city,
    state,
    country
  } = req.query;

  // Validate pagination parameters first
  const { errors: paginationErrors, pageNum, limitNum } = validatePagination(page, limit);
  const errors = [...paginationErrors];

  // Validate other query parameters
  if (specialization && !ALLOWED_SPECIALIZATIONS.includes(specialization)) {
    errors.push('specialization is invalid');
  }

  if ((lng && !lat) || (!lng && lat)) {
    errors.push('Both lng and lat must be provided together');
  }
  
  let longitude, latitude, radiusNum;
  if (lng && lat) {
    longitude = parseFloat(lng);
    latitude = parseFloat(lat);
    
    if (isNaN(longitude) || longitude < -180 || longitude > 180) {
      errors.push('lng must be a number between -180 and 180');
    }

    if (isNaN(latitude) || latitude < -90 || latitude > 90) {
      errors.push('lat must be a number between -90 and 90');
    }
    
    radiusNum = parseInt(radius);
    if (isNaN(radiusNum) || radiusNum <= 0 || radiusNum > PAGINATION_LIMITS.MAX_RADIUS) {
      errors.push(`radius must be a positive number up to ${PAGINATION_LIMITS.MAX_RADIUS} meters`);
    }
  }
  
  if (errors.length > 0) {
    return res.status(400).json(responseBody(400, 'Validation error', errors));
  }
  
  try {
    const filter = {};
    
    if (specialization) {
      filter.specialization = specialization;
    }
    
    if (city || state || country) {
      const addressFilter = {};
      if (city) addressFilter['addressComponents.city'] = new RegExp(city, 'i');
      if (state) addressFilter['addressComponents.state'] = new RegExp(state, 'i');
      if (country) addressFilter['addressComponents.country'] = new RegExp(country, 'i');
      Object.assign(filter, addressFilter);
    }
    
    if (longitude !== undefined && latitude !== undefined) {
      filter.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: radiusNum
        }
      };
    }
    
    filter.location = filter.location || { $ne: null };
    
    const skip = (pageNum - 1) * limitNum;
    const approvedDoctorCredentials = await DoctorCredential.find({ status: 'Approved' }).select('doctorId');
    const approvedDoctorIds = approvedDoctorCredentials.map((c) => c.doctorId.toString());

    filter.doctorId = { $in: approvedDoctorIds };
    
    const [doctors, total] = await Promise.all([
      Doctor.find(filter)
        .populate('doctorId', 'fullName email')
        .select('fullName specialization bio location education addressComponents')
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Doctor.countDocuments(filter)
    ]);
    
    const doctorsWithDistance = doctors.map(doctor => {
      if (longitude !== undefined && latitude !== undefined && doctor.location?.coordinates) {
        const [docLng, docLat] = doctor.location.coordinates;
        const distance = calculateDistance(latitude, longitude, docLat, docLng);
        return {
          ...doctor,
          distance: {
            meters: Math.round(distance * 1000),
            kilometers: Math.round(distance * 100) / 100
          }
        };
      }
      return doctor;
    });
    
    return res.status(200).json(responseBody(200, 'Doctors retrieved successfully', {
      doctors: doctorsWithDistance,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      },
      searchCriteria: {
        specialization: specialization || null,
        location: longitude !== undefined ? { lng: longitude, lat: latitude, radius: radiusNum } : null,
        addressFilter: { city, state, country }
      }
    }));
    
  } catch (error) {
    console.error('Error listing doctors:', error);
    return res.status(500).json(responseBody(500, `Error retrieving doctors: ${error.message}`, null));
  }
});

const getAllDoctors = handleAsync(async (req, res) => {
  const { user } = req;
  const { page = '1', limit = '10' } = req.query;

  const authCheck = checkAdminAuth(user);
  if (!authCheck.authorized) {
    return res.status(403).json(responseBody(403, authCheck.message, null));
  }

  const { errors, pageNum, limitNum } = validatePagination(page, limit);
  if (errors.length > 0) {
    return res.status(400).json(responseBody(400, 'Validation error', errors));
  }

  try {
    const skip = (pageNum - 1) * limitNum;

    const [users, total, doctors, credentials] = await Promise.all([
      User.find({ role: 'doctor' })
        .select('fullName email emailVerified createdAt')
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments({ role: 'doctor' }),
      Doctor.find({}).lean(),
      DoctorCredential.find({}).select('doctorId status reason reviewedAt').lean()
    ]);

    const doctorMap = doctors.reduce((map, doc) => {
      map[doc.doctorId.toString()] = {
        specialization: doc.specialization || [],
        bio: doc.bio || null,
        location: doc.location || null,
        education: doc.education || null,
        addressComponents: doc.addressComponents || null
      };
      return map;
    }, {});

    const credentialMap = credentials.reduce((map, cred) => {
      map[cred.doctorId.toString()] = {
        status: cred.status,
        reason: cred.reason || null,
        reviewedAt: cred.reviewedAt || null
      };
      return map;
    }, {});

    const doctorsWithDetails = users.map(user => ({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      profile: doctorMap[user._id.toString()] || null,
      credentialStatus: credentialMap[user._id.toString()] || { status: 'Not Submitted', reason: null, reviewedAt: null }
    }));

    return res.status(200).json(responseBody(200, 'All doctors retrieved successfully', {
      doctors: doctorsWithDetails,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    }));
  } catch (error) {
    console.error('Error retrieving all doctors:', error);
    return res.status(500).json(responseBody(500, `Error retrieving doctors: ${error.message}`, null));
  }
});

const getDoctorPatients = handleAsync(async (req, res) => {
  const { user } = req;

  const { authorized, message } = checkDoctorAuth(user);
  if (!authorized) {
    return res.status(403).json(responseBody(403, message, null));
  }

  const patientIds = await Appointment.find({
    doctorId: user.userId
  }).distinct('patientId');

  const patients = await User.find({
    _id: { $in: patientIds },
    role: 'patient'
  }).select('_id fullName');

  return res
    .status(200)
    .json(responseBody(200, 'Patients retrieved successfully', patients));
});

const geocodeLocation = handleAsync(async (req, res) => {
  const { location } = req.query;
  
  if (!location || !location.trim()) {
    return res.status(400).json(responseBody(400, 'Location parameter is required', null));
  }
  
  try {
    const geocodeResult = await geocodeAddress(location);
    
    if (geocodeResult.success) {
      return res.status(200).json(responseBody(200, 'Location geocoded successfully', {
        location: location,
        coordinates: geocodeResult.coordinates,
        formattedAddress: geocodeResult.formattedAddress,
        addressComponents: geocodeResult.addressComponents
      }));
    } else {
      return res.status(400).json(responseBody(400, `Geocoding failed: ${geocodeResult.error}`, null));
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    return res.status(500).json(responseBody(500, `Geocoding error: ${error.message}`, null));
  }
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
    );
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

const getAllDoctorCredentials = handleAsync(async (req, res) => {
  const { user } = req;

  // admin‑only
  const authCheck = checkAdminAuth(user);
  if (!authCheck.authorized) {
    return res
      .status(403)
      .json(responseBody(403, authCheck.message, null));
  }

  // fetch ALL credentials
  const credentials = await DoctorCredential.find({});
  if (!credentials.length) {
    return res
      .status(404)
      .json(responseBody(404, 'No credentials found', null));
  }

  return res
    .status(200)
    .json(responseBody(200, 'Credentials retrieved', credentials));
});

const processCredentialReview = async (req, res, isApproval) => {
  const { doctorId, credentialId } = req.params;
  const { user } = req;
  console.log("CHECKING DoctorId", credentialId)
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
      responseBody(500, `Failed to process credential review: ${error.message}`, null)
    );
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
  uploadAvailabilityFromIcs,
  updateDoctorAddress,
  getAvailability,
  uploadProfilePicture,
  getPublicDoctorProfile,
  listDoctors,
  getAllDoctors,
  geocodeLocation,
  submitDoctorCredential,
  getDoctorCredentials,
  approveDoctorCredential,
  rejectDoctorCredential,
  getDoctorCredentialById,
  getDoctorPatients,
  getAllDoctorCredentials
};