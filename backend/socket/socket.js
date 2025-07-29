const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

function initSocket(server) {
  io = new Server(server, {
    cors: { 
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  const videoNS = io.of('/video');

  videoNS.use(async (socket, next) => {
    try {
      const { token, appointmentId, roomId } = socket.handshake.auth;
      
      if (!appointmentId || !roomId) {
        return next(new Error('Missing appointmentId or roomId'));
      }
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        socket.userId = decoded.userId;
        socket.userRole = decoded.role;
      } catch (jwtError) {
        console.log('JWT verification failed:', jwtError.message);
        return next(new Error('Invalid or expired token'));
      }

      const allowedRoles = ['patient', 'doctor'];
      if (!allowedRoles.includes(decoded.role)) {
        return next(new Error('Unauthorized: Only patients and doctors can join video calls'));
      }

      const Appointment = require('../models/Appointments');
      const mongoose = require('mongoose');
      if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
        return next(new Error('Invalid appointment ID'));
      }

      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        return next(new Error('Appointment not found'));
      }

      const isDoctor = appointment.doctorId.toString() === decoded.userId;
      const isPatient = appointment.patientId.toString() === decoded.userId;
      if (!isDoctor && !isPatient) {
        return next(new Error('Forbidden: Not a participant in this appointment'));
      }

      const VideoRoom = require('../models/VideoRoom');
      const room = await VideoRoom.findOne({ appointmentId, roomId });
      if (!room) {
        return next(new Error('Video room not found or invalid'));
      }

      socket.appointmentId = appointmentId;
      socket.roomId = roomId;
      socket.isDoctor = isDoctor;
      socket.isPatient = isPatient;
      socket.appointment = appointment;

      console.log(`Auth OK for ${decoded.userId} (${decoded.role}) in appointment ${appointmentId}`);
      next();

    } catch (err) {
      console.error('Socket auth error:', err);
      next(new Error('Authentication failed'));
    }
  });

  videoNS.on('connection', socket => {
    console.log(`Connected: ${socket.id} (user ${socket.userId}, role: ${socket.userRole})`);

    socket.on('video:joinRoom', async ({ appointmentId: aId, roomId: rId }, cb) => {
        console.log(`joinRoom request for ${aId}/${rId} from ${socket.id}`);
        if (aId !== socket.appointmentId || rId !== socket.roomId) {
            console.warn('Room mismatch');
            return cb?.({ error:'Room mismatch' });
        }

        const existingClients = await videoNS.in(rId).fetchSockets();
        const isInitiator = existingClients.length === 0;

        if(existingClients.length >= 2){
            socket.emit('room-full', {
                message: 'Room is full'
            })
            return cb?.({
                error: 'Room is full',
                maxParticipants: 2,
                currentParticipants: existingClients.length
            })
        }

        socket.join(rId);
        console.log(`${socket.id} joined ${rId} as ${isInitiator ? 'HOST' : 'GUEST'} (${existingClients.length + 1}/2)`);

        cb?.({
            success: true,
            isInitiator,
            userId: socket.userId,
            userRole: socket.userRole,
            isDoctor: socket.isDoctor,
            isPatient: socket.isPatient,
            role: isInitiator ? 'host' : 'guest',
            participantCount: existingClients.length + 1
        });

        if (existingClients.length > 0) {
            const peer = existingClients[0];

            socket.emit('video:participantJoined', {
                socketId: peer.id,
                userId: peer.userId,
                userRole: peer.userRole,
                isDoctor: peer.isDoctor,
                isPatient: peer.isPatient,
                role: 'host',
                isInitiator: true
            });
            console.log(`Notified ${socket.id} about existing peer ${peer.id}`);

            peer.emit('video:participantJoined', {
                socketId: socket.id,
                userId: socket.userId,
                userRole: socket.userRole,
                isDoctor: socket.isDoctor,
                isPatient: socket.isPatient,
                role: 'guest',
                isInitiator: false
            });
        }

        console.log(`Notified room ${rId} about new participant ${socket.id}`);

        videoNS.to(rId).emit('video:roomUpdate', {
            participantCount: existingClients.length + 1,
            maxParticipants: 2
        });
    });

    socket.on('video:offer', ({ offer }) => {
      console.log(`Relaying offer from ${socket.id} (${socket.userRole})`);
      socket.broadcast.to(socket.roomId).emit('video:offer', { 
        offer, 
        from: socket.id 
      });
    });

    socket.on('video:answer', ({ answer }) => {
      console.log(`Relaying answer from ${socket.id} (${socket.userRole})`);
      socket.broadcast.to(socket.roomId).emit('video:answer', { 
        answer, 
        from: socket.id 
      });
    });

    socket.on('video:iceCandidate', ({ candidate }) => {
      console.log(`Relaying ICE candidate from ${socket.id}`);
      socket.broadcast.to(socket.roomId).emit('video:iceCandidate', { 
        candidate, 
        from: socket.id 
      });
    });

    socket.on('video:ready', () => {
      console.log(`${socket.id} (${socket.userRole}) is ready`);
      socket.broadcast.to(socket.roomId).emit('video:ready', { 
        from: socket.id 
      });
    });

    socket.on('disconnect', async reason => {
        console.log(`${socket.id} (${socket.userRole}) disconnected:`, reason);
        
        if (socket.roomId) {
            const remainingClients = await videoNS.in(socket.roomId).fetchSockets();

            if (remainingClients.length === 1) {
                const newHost = remainingClients[0];
                console.log(`${newHost.id} promoted to HOST after ${socket.id} left`);

                newHost.emit('video:roleChanged', {
                    newRole: 'host',
                    isInitiator: true,
                    reason: 'peer_disconnected'
                });
            }

            socket.broadcast.to(socket.roomId).emit('video:peerLeft', {
                socketId: socket.id,
                userId: socket.userId,
                userRole: socket.userRole,
                reason,
                remainingParticipants: remainingClients.length
            });

            if (remainingClients.length > 0) {
                videoNS.to(socket.roomId).emit('video:roomUpdate', {
                    participantCount: remainingClients.length,
                    maxParticipants: 2
                });
            }
        } else {
            console.log(`${socket.id} disconnected before joining any room`);
        }
    });

    socket.on('error', err => {
      console.error(`Socket error ${socket.id}:`, err);
    });
  });
}

function getVideoNamespace() {
  if (!io) throw new Error('Socket.IO not initialized');
  return io.of('/video');
}

module.exports = {
  initSocket,
  getVideoNamespace
};