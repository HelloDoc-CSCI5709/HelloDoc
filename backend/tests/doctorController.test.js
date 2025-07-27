const request = require('supertest');
const express = require('express');
const {
  getDoctorProfile,
  updateBasicDoctorProfile,
  updateAvailability,
  getAvailability,
  getPublicDoctorProfile,
  submitDoctorCredential,
  getDoctorCredentials
} = require('../controllers/doctorController');

// Mock the models
jest.mock('../models/Doctor');
jest.mock('../models/User');
jest.mock('../models/DoctorAvailability');
jest.mock('../models/DoctorCredential');

const Doctor = require('../models/Doctor');
const User = require('../models/User');
const DoctorAvailability = require('../models/DoctorAvailability');
const DoctorCredential = require('../models/DoctorCredential');

// Create express app for testing
const app = express();
app.use(express.json());

// Mock authentication middleware
const mockAuth = (req, res, next) => {
  req.user = {
    userId: '507f1f77bcf86cd799439011',
    role: 'doctor',
    email: 'doctor@test.com'
  };
  next();
};

// Setup routes
app.get('/doctor/profile', mockAuth, getDoctorProfile);
app.put('/doctor/profile', mockAuth, updateBasicDoctorProfile);
app.put('/doctor/availability', mockAuth, updateAvailability);
app.get('/doctor/availability', mockAuth, getAvailability);
app.get('/doctor/public/:doctorId', getPublicDoctorProfile);
app.post('/doctor/:doctorId/credential', mockAuth, submitDoctorCredential);
app.get('/doctor/:doctorId/credential', mockAuth, getDoctorCredentials);

describe('Doctor Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /doctor/profile', () => {
    it('should get doctor profile successfully', async () => {
      const mockDoctor = {
        _id: '507f1f77bcf86cd799439011',
        doctorId: '507f1f77bcf86cd799439011',
        fullName: 'Dr. John Doe',
        email: 'doctor@test.com',
        specialization: ['Cardiology'],
        bio: 'Experienced cardiologist'
      };

      const mockPopulate = jest.fn().mockResolvedValue(mockDoctor);
      Doctor.findOne = jest.fn().mockReturnValue({ populate: mockPopulate });

      const response = await request(app)
        .get('/doctor/profile')
        .expect(200);

      expect(response.body.status).toBe(200);
      expect(response.body.message).toBe('Doctor profile retrieved successfully');
      expect(response.body.body).toEqual(mockDoctor);
    });

    it('should return 404 if doctor profile not found', async () => {
      const mockPopulate = jest.fn().mockResolvedValue(null);
      Doctor.findOne = jest.fn().mockReturnValue({ populate: mockPopulate });

      const response = await request(app)
        .get('/doctor/profile')
        .expect(404);

      expect(response.body.status).toBe(404);
      expect(response.body.message).toBe('Doctor profile not found');
    });
  });

  describe('PUT /doctor/profile', () => {
    it('should update doctor profile successfully', async () => {
      const mockDoctor = {
        _id: '507f1f77bcf86cd799439011',
        doctorId: '507f1f77bcf86cd799439011',
        save: jest.fn().mockResolvedValue(true),
        location: { type: 'Point', coordinates: [0, 0] }
      };

      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        fullName: 'Dr. John Doe Updated',
        email: 'doctor.updated@test.com'
      };

      // Mock findOrCreateDoctor function behavior
      Doctor.findOne = jest.fn().mockResolvedValue(mockDoctor);
      User.findByIdAndUpdate = jest.fn().mockResolvedValue(mockUser);

      const updateData = {
        fullName: 'Dr. John Doe Updated',
        email: 'doctor.updated@test.com',
        specialization: ['Cardiology', 'Internal Medicine'],
        bio: 'Updated bio'
      };

      const response = await request(app)
        .put('/doctor/profile')
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe(200);
      expect(response.body.message).toBe('Doctor profile updated successfully');
      expect(mockDoctor.save).toHaveBeenCalled();
    });
  });

  describe('PUT /doctor/availability', () => {
    it('should update availability successfully', async () => {
      const mockSlots = [
        {
          title: 'Morning Consultation',
          start: '2024-01-15T09:00:00Z',
          end: '2024-01-15T12:00:00Z',
          location: 'Clinic Room 1',
          description: 'General consultation'
        }
      ];

      const mockSavedSlots = mockSlots.map(slot => ({
        ...slot,
        _id: '507f1f77bcf86cd799439012',
        doctorId: '507f1f77bcf86cd799439011'
      }));

      DoctorAvailability.deleteMany = jest.fn().mockResolvedValue({ deletedCount: 0 });
      DoctorAvailability.insertMany = jest.fn().mockResolvedValue(mockSavedSlots);

      const response = await request(app)
        .put('/doctor/availability')
        .send({ slots: mockSlots })
        .expect(200);

      expect(response.body.status).toBe(200);
      expect(response.body.message).toBe('Availability updated successfully');
      expect(DoctorAvailability.deleteMany).toHaveBeenCalledWith({ 
        doctorId: '507f1f77bcf86cd799439011' 
      });
      expect(DoctorAvailability.insertMany).toHaveBeenCalled();
    });

    it('should return 400 for empty slots array', async () => {
      const response = await request(app)
        .put('/doctor/availability')
        .send({ slots: [] })
        .expect(400);

      expect(response.body.status).toBe(400);
      expect(response.body.message).toBe('Provide a non-empty array of availability slots');
    });
  });

  describe('GET /doctor/availability', () => {
    it('should get doctor availability successfully', async () => {
      const mockAvailability = [
        {
          _id: '507f1f77bcf86cd799439012',
          doctorId: '507f1f77bcf86cd799439011',
          title: 'Available',
          start: '2024-01-15T09:00:00Z',
          end: '2024-01-15T17:00:00Z'
        }
      ];

      const mockSort = jest.fn().mockResolvedValue(mockAvailability);
      DoctorAvailability.find = jest.fn().mockReturnValue({ sort: mockSort });

      const response = await request(app)
        .get('/doctor/availability')
        .expect(200);

      expect(response.body.status).toBe(200);
      expect(response.body.message).toBe('Availability retrieved successfully');
      expect(response.body.body).toEqual(mockAvailability);
    });
  });

  describe('GET /doctor/public/:doctorId', () => {
    it('should get public doctor profile successfully', async () => {
      const doctorId = '507f1f77bcf86cd799439011';
      const mockDoctor = {
        _id: doctorId,
        doctorId: { fullName: 'Dr. John Doe' },
        specialization: ['Cardiology'],
        bio: 'Experienced cardiologist',
        education: 'MD from Harvard',
        location: { type: 'Point', coordinates: [-73.935242, 40.730610] }
      };

      const mockAvailability = [
        {
          _id: '507f1f77bcf86cd799439012',
          doctorId: doctorId,
          start: '2024-01-15T09:00:00Z',
          end: '2024-01-15T17:00:00Z'
        }
      ];

      const mockPopulate = jest.fn().mockResolvedValue(mockDoctor);
      Doctor.findOne = jest.fn().mockReturnValue({ populate: mockPopulate });
      
      const mockSort = jest.fn().mockResolvedValue(mockAvailability);
      DoctorAvailability.find = jest.fn().mockReturnValue({ sort: mockSort });

      const response = await request(app)
        .get(`/doctor/public/${doctorId}`)
        .expect(200);

      expect(response.body.status).toBe(200);
      expect(response.body.message).toBe('Doctor profile retrieved');
      expect(response.body.body.fullName).toBe('Dr. John Doe');
      expect(response.body.body.availability).toEqual(mockAvailability);
    });

    it('should return 400 for invalid doctor ID', async () => {
      const response = await request(app)
        .get('/doctor/public/invalid-id')
        .expect(400);

      expect(response.body.status).toBe(400);
      expect(response.body.message).toBe('Invalid doctorId');
    });
  });

  describe('GET /doctor/:doctorId/credential', () => {
    it('should get doctor credentials successfully', async () => {
      const doctorId = '507f1f77bcf86cd799439011';
      const mockCredential = {
        _id: '507f1f77bcf86cd799439013',
        doctorId: doctorId,
        fileName: 'credential.pdf',
        status: 'Approved',
        submittedAt: new Date(),
        reviewedAt: new Date()
      };

      DoctorCredential.findOne = jest.fn().mockResolvedValue(mockCredential);

      const response = await request(app)
        .get(`/doctor/${doctorId}/credential`)
        .expect(200);

      expect(response.body.status).toBe(200);
      expect(response.body.message).toBe('Credential retrieved');
      expect(response.body.body.status).toBe('Approved');
    });

    it('should return 404 if no credential found', async () => {
      const doctorId = '507f1f77bcf86cd799439011';
      DoctorCredential.findOne = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .get(`/doctor/${doctorId}/credential`)
        .expect(404);

      expect(response.body.status).toBe(404);
      expect(response.body.message).toBe('No credential found');
    });
  });

  describe('POST /doctor/:doctorId/credential', () => {
    it('should submit credential successfully', async () => {
      const doctorId = '507f1f77bcf86cd799439011';
      const mockCredential = {
        _id: '507f1f77bcf86cd799439013',
        doctorId: doctorId,
        fileName: 'credential.pdf',
        status: 'Pending',
        submittedAt: new Date()
      };

      DoctorCredential.findOneAndUpdate = jest.fn().mockResolvedValue(mockCredential);

      // Mock multer file object
      const mockReq = {
        user: { userId: doctorId, role: 'doctor' },
        params: { doctorId },
        file: {
          filename: 'credential.pdf',
          mimetype: 'application/pdf',
          size: 1024000
        }
      };

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await submitDoctorCredential(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 201,
          message: 'Credential submitted; pending admin approval'
        })
      );
    });
  });

  describe('Basic Validation Tests', () => {
    it('should handle missing user authentication', async () => {
      const app2 = express();
      app2.use(express.json());
      
      // No auth middleware
      app2.get('/doctor/profile', getDoctorProfile);

      const response = await request(app2)
        .get('/doctor/profile')
        .expect(403);

      expect(response.body.status).toBe(403);
      expect(response.body.message).toBe('Only doctors or admins can perform this action');
    });

    it('should handle availability validation', async () => {
      const response = await request(app)
        .put('/doctor/availability')
        .send({ slots: 'invalid' })
        .expect(400);

      expect(response.body.status).toBe(400);
    });
  });
});