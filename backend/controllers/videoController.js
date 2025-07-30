const { responseBody } = require('../config/responseBody');
const Appointment = require('../models/Appointments')
const VideoRoom = require('../models/VideoRoom')
const VideoLog = require('../models/Videolog')
const { getVideoNamespace } = require('../socket/socket');
const mongoose = require('mongoose')

const allowedRoles = ['patient', 'doctor'];
const isValidObjectId = (id) => {
    // Check if id exists and is a string or ObjectId
    if (!id) return false;
    
    // Convert to string if it's an ObjectId instance
    const idString = id.toString();
    
    // Check if it's a valid 24-character hex string
    return /^[0-9a-fA-F]{24}$/.test(idString) && mongoose.Types.ObjectId.isValid(idString);
};

const createRoom = async (req, res, next) => {
    const user = req.user;
    if (!user || !allowedRoles.includes(user.role)) {
        return res.status(403).json(
        responseBody(403, 'Forbidden: only patients or doctors may start a video consultation', null)
        );
    }

    const { appointmentId, expiresInMinutes = 60 } = req.body;
    if (!appointmentId || !isValidObjectId(appointmentId)) {
        return res.status(400).json(
        responseBody(400, 'Bad Request: invalid appointmentId', null)
        );
    }

    try {
        const appt = await Appointment.findById(appointmentId);
        if (!appt) {
        return res.status(404).json(
            responseBody(404, 'Appointment not found', null)
        );
        }

        const isDoctor  = appt.doctorId.toString()  === user.userId;
        const isPatient = appt.patientId.toString() === user.userId;
        if (!isDoctor && !isPatient) {
        return res.status(403).json(
            responseBody(403, 'Forbidden: not a participant in this appointment', null)
        );
        }

        const expiresAt = new Date(Date.now() + expiresInMinutes * 60000);
        const room = await VideoRoom.create({
        appointmentId,
        doctorId:  appt.doctorId,
        patientId: appt.patientId,
        expiresAt
        });

        const payload = {
            roomId:    room.roomId,
            expiresAt: room.expiresAt
        }

        const videoNS = getVideoNamespace();
        videoNS.to(room.roomId).emit('video:roomCreated', payload);

        return res.status(201).json(
        responseBody(201, 'Room created successfully', payload)
        );
    }catch(err){
        return next(err);
    }
}

const getRoomToken = async (req, res, next) => {
    const user = req.user;
    if (!user || !allowedRoles.includes(user.role)) {
        return res.status(403).json(
            responseBody(403, 'Forbidden: only patients or doctors may join a video consultation', null)
        );
    }

    const { appointmentId } = req.params;
    if (!appointmentId || !isValidObjectId(appointmentId)) {
        return res.status(400).json(
            responseBody(400, 'Bad Request: invalid appointmentId', null)
        );
    }

    try {
        const appt = await Appointment.findById(appointmentId);
        if (!appt) {
            return res.status(404).json(
                responseBody(404, 'Appointment not found', null)
            );
        }

        const room = await VideoRoom.findOne({ appointmentId });
        if (!room) {
            return res.status(404).json(
                responseBody(404, 'Video room not found', null)
            );
        }

        const isDoctor  = appt.doctorId.toString()  === user.userId;
        const isPatient = appt.patientId.toString() === user.userId;
        if (!isDoctor && !isPatient) {
            return res.status(403).json(
                responseBody(403, 'Forbidden: not a participant in this appointment', null)
            );
        }

        return res.status(200).json(
            responseBody(200, 'Room token retrieved', {
                appointmentId: appointmentId,
                roomId: room.roomId,
                expiresAt: room.expiresAt
            })
        );
    } catch (err) {
        return next(err);
    }
}

const logStart = async (req, res, next) => {
    const user = req.user;
    if (!user || !allowedRoles.includes(user.role)) {
        return res.status(403).json(
            responseBody(403, 'Forbidden: only patients or doctors may join a session', null)
        );
    }

    const { appointmentId, roomId } = req.body;
    if (!appointmentId || !isValidObjectId(appointmentId) || !roomId) {
        return res.status(400).json(
            responseBody(400, 'Bad Request: invalid appointmentId or roomId', null)
        );
    }

    try {
        const room = await VideoRoom.findOne({ appointmentId, roomId });
        if (!room) {
            return res.status(404).json(
                responseBody(404, 'Video room not found', null)
            );
        }

        const isDoctor  = room.doctorId.toString()  === user.userId;
        const isPatient = room.patientId.toString() === user.userId;
        if (!isDoctor && !isPatient) {
            return res.status(403).json(
                responseBody(403, 'Forbidden: not a participant in this session', null)
            );
        }

        const log = await VideoLog.create({
            appointmentId,
            roomId,
            userId:   user.userId,
            role:     user.role,
            joinedAt: new Date()
        });

        const videoNS = getVideoNamespace();

        const payload = {
            logId:    log._id,
            joinedAt: log.joinedAt,
            userId:   user.userId
        }
        videoNS.to(roomId).emit('video:sessionLogUpdated', payload)

        return res.status(201).json(
            responseBody(201, 'Log created', payload)
        );
    } catch (err) {
        return next(err);
    }
}


const logEnd = async (req, res, next) => {
    const user = req.user;
    if (!user || !allowedRoles.includes(user.role)) {
        return res.status(403).json(
            responseBody(403, 'Forbidden: only patients or doctors may end a session', null)
        );
    }

    const { logId } = req.body;
    if (!logId || !isValidObjectId(logId)) {
        return res.status(400).json(
            responseBody(400, 'Bad Request: invalid logId', null)
        );
    }

    try {
        const log = await VideoLog.findById(logId);
        if (!log) {
            return res.status(404).json(
                responseBody(404, 'Log entry not found', null)
            );
        }

        if (log.userId.toString() !== user.userId) {
            return res.status(403).json(
                responseBody(403, 'Forbidden: can only end own session', null)
            );
        }

        if (log.leftAt) {
            return res.status(400).json(
                responseBody(400, 'Bad Request: session already ended', null)
            );
        }

        log.leftAt = new Date();
        await log.save();

        const payload = {
            leftAt:      log.leftAt,
            durationMin: log.durationMin
        }

        const videoNS = getVideoNamespace();
        videoNS.to(log.roomId).emit('video:sessionLogUpdated', payload);

        return res.status(200).json(
            responseBody(200, 'Log ended', payload)
        );
    } catch (err) {
        return next(err);
    }
}

const getLogs = async (req, res, next) => {
    const user = req.user;
    if (!user || (!allowedRoles.includes(user.role) && user.role !== 'admin')) {
        return res.status(403).json(
            responseBody(403, 'Forbidden: only patients, doctors, or admins may view logs', null)
        );
    }

    const { appointmentId } = req.params;
    if (!appointmentId || !isValidObjectId(appointmentId)) {
        return res.status(400).json(
            responseBody(400, 'Bad Request: invalid appointmentId', null)
        );
    }

    try {
        const appt = await Appointment.findById(appointmentId);
        if (!appt) {
            return res.status(404).json(
                responseBody(404, 'Appointment not found', null)
            );
        }

        if (user.role !== 'admin') {
        const isDoctor  = appt.doctorId.toString()  === user.userId;
        const isPatient = appt.patientId.toString() === user.userId;
        if (!isDoctor && !isPatient) {
            return res.status(403).json(
                responseBody(403, 'Forbidden: not a participant in this appointment', null)
            );
        }
        }

        const logs = await VideoLog.find({ appointmentId }).sort({ joinedAt: 1 });
        return res.status(200).json(
            responseBody(200, 'Logs fetched', logs)
        );
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    createRoom,
    getRoomToken,
    logStart,
    logEnd,
    getLogs
}