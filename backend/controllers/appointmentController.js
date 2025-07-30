const { responseBody } = require('../config/responseBody');
const Appointment = require('../models/Appointments');
const DoctorAvailability = require('../models/DoctorAvailability');

const bookAppointment = async (req, res) => {
  try {
    const { doctorId, scheduledFor, reason } = req.body;
    const user = req.user;

    if (!user || user.role !== 'patient') {
      return res.status(403).json(
        responseBody(403, 'Forbidden: Only patients can book appointments', null)
      );
    }

    if (!doctorId || !scheduledFor) {
      return res.status(400).json(
        responseBody(400, 'Validation error: doctorId and scheduledFor are required', null)
      );
    }

    const startTime = new Date(scheduledFor);
    const now = new Date();
    if (startTime < now) {
      return res.status(400).json(
        responseBody(400, 'Validation error: scheduled time must be in the future', null)
      );
    }

    const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);

    const availability = await DoctorAvailability.findOne({
      doctorId,
      start: { $lte: startTime },
      end:   { $gte: endTime }
    });

    if (!availability) {
      return res.status(400).json(
        responseBody(400, 'Doctor is not available at the requested time', null)
      );
    }

    const conflictingAppointment = await Appointment.findOne({
      doctorId,
      status: { $ne: 'cancelled' },
      scheduledFor: { $lt: endTime },
      $expr: {
        $gt: [
          { $add: ['$scheduledFor', 30 * 60 * 1000] },
          startTime
        ]
      }
    });
    if (conflictingAppointment) {
      return res.status(409).json(
        responseBody(409, 'Conflict error: Doctor is already booked for this time slot', null)
      );
    }

    const appointment = new Appointment({
      patientId: user.userId,
      doctorId,
      scheduledFor: startTime,
      reason
    });
    await appointment.save();

    return res.status(201).json(
      responseBody(201, 'Appointment booked successfully', {
        appointmentId:   appointment._id,
        patientId:       appointment.patientId,
        doctorId:        appointment.doctorId,
        scheduledFor:    appointment.scheduledFor,
        date:            appointment.date,
        time:            appointment.time,
        reason:          appointment.reason,
        status:          appointment.status
      })
    );
  } catch (error) {
    console.error('Error booking appointment:', error);
    if (error.name === 'ValidationError') {
      const errorMessage = Object.values(error.errors)
        .map(err => err.message)
        .join(', ');
      return res.status(400).json(
        responseBody(400, `Validation error: ${errorMessage}`, null)
      );
    }
    return res.status(500).json(
      responseBody(500, 'Internal Server Error: Unable to book appointment', null)
    );
  }
};


const getAppointments = async (req, res) => {
  try {
    const { user } = req;

    if (!user || !user.userId) {
      return res.status(403).json(
        responseBody(403, 'Unauthorized: User not authenticated', null)
      );
    }

    const now = new Date();
    const baseFilter = { scheduledFor: { $gte: now } };

    const filter = user.role === 'patient'
      ? { ...baseFilter, patientId: user.userId }
      : { ...baseFilter, doctorId:  user.userId  };

    const appointments = await Appointment.find(filter)
      .populate('patientId', 'fullName email')
      .populate('doctorId',  'fullName email');

    return res.status(200).json(
      responseBody(200, 'Appointments retrieved successfully', appointments)
    );
  } catch (error) {
    console.error('Error retrieving appointments:', error);
    return res.status(500).json(
      responseBody(500, 'Internal Server Error: Unable to retrieve appointments', null)
    );
  }
};

const getAppointmentById = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { user } = req;

    if (!user || !user.userId) {
      return res.status(403).json(
        responseBody(403, 'Unauthorized: User not authenticated', null)
      );
    }

    if (!appointmentId) {
      return res.status(400).json(
        responseBody(400, 'Validation error: appointmentId is required', null)
      );
    }
    const appointment = await Appointment.findById(appointmentId)
      .populate('patientId', 'fullName email')
      .populate('doctorId', 'fullName email');

    if (!appointment) {
      return res.status(404).json(
        responseBody(404, 'Not Found: Appointment not found', null)
      );
    }
    if (appointment.patientId._id.toString() != user.userId && appointment.doctorId._id.toString() != user.userId && user.role !== 'admin') {
        return res.status(403).json(
            responseBody(403, 'Forbidden: You do not have permission to view this appointment', null)
        );
    }
    return res.status(200).json(
      responseBody(200, 'Appointment retrieved successfully', {
        appointmentId: appointment._id,
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        scheduledFor: appointment.scheduledFor,
        date: appointment.date,
        time: appointment.time,
        reason: appointment.reason,
        status: appointment.status
      })
    );
  } catch (error) {
    console.error('Error retrieving appointment:', error);
    if (error.name === 'CastError') {
      return res.status(400).json(
        responseBody(400, 'Validation error: Invalid appointmentId yolo format', null)
      );
    }
    return res.status(500).json(
      responseBody(500, 'Internal Server Error: Unable to retrieve appointment', null)
    );
  }
};
const cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { user } = req;

    if (!user || !user.userId) {
      return res.status(403).json(
        responseBody(403, 'Unauthorized: User not authenticated', null)
      );
    }

    if (!appointmentId) {
      return res.status(400).json(
        responseBody(400, 'Validation error: appointmentId is required', null)
      );
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json(
        responseBody(404, 'Not Found: Appointment not found', null)
      );
    }   
    if (appointment.patientId.toString() !== user.userId && appointment.doctorId.toString() !== user.userId && user.role !== 'admin') {
      return res.status(403).json(
        responseBody(403, 'Forbidden: You do not have permission to cancel this appointment', null)
      );
    }

    appointment.status = 'cancelled';
    await appointment.save();
    return res.status(200).json(
      responseBody(200, 'Appointment cancelled successfully', {
        appointmentId: appointment._id,
        status: appointment.status
      })
    );
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    if (error.name === 'CastError') {
      return res.status(400).json(
        responseBody(400, 'Validation error: Invalid appointmentId format', null)
      );
    }
    if (error.name === 'ValidationError') {
      const errorMessage = Object.values(error.errors)
        .map(err => err.message)
        .join(', ');
        return res.status(400).json(    
            responseBody(400, `Validation error: ${errorMessage}`, null)
        );
    }
    return res.status(500).json(
      responseBody(500, 'Internal Server Error: Unable to cancel appointment', null)
    );
  }
};

const rescheduleAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { scheduledFor, reason } = req.body;
    const { user } = req;

    if (!user || !user.userId) {
      return res.status(403).json(
        responseBody(403, 'Unauthorized: User not authenticated', null)
      );
    }

    if( !scheduledFor || !appointmentId) {
        return res.status(400).json(
            responseBody(400, 'Validation error: appointmentId and scheduledFor are required', null)
        );
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json(
        responseBody(404, 'Not Found: Appointment not found', null)
      );
    }

    if (appointment.patientId.toString() !== user.userId && appointment.doctorId.toString() !== user.userId && user.role !== 'admin') {
      return res.status(403).json(
        responseBody(403, 'Forbidden: You do not have permission to reschedule this appointment', null)
      );
    }

    const startTime = new Date(scheduledFor);

    const now = new Date();
    if (startTime < now) {
      return res.status(400).json(
        responseBody(400, 'Validation error: scheduled time must be in the future', null)
      );
    }

    const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);

    const availability = await DoctorAvailability.findOne({
      doctorId,
      start: { $lte: startTime },
      end:   { $gte: endTime }
    });
    if (!availability) {
      return res.status(400).json(
        responseBody(400, 'Doctor is not available at the requested time', null)
      );
    }

    const conflictingAppointment = await Appointment.findOne({
      doctorId: appointment.doctorId,
      status: { $ne: 'cancelled' },
      scheduledFor: {
        $lt: endTime
      },
      $expr: {
        $gt: [
            {$add: ["$scheduledFor", 30 * 60 * 1000]},
            startTime
        ]
      }
    });

    if (conflictingAppointment) {
      return res.status(409).json(
        responseBody(409, 'Conflict error: Doctor is already booked for this time slot', null)
      );
    }

    appointment.scheduledFor = startTime;
    appointment.reason = reason || appointment.reason;
    appointment.status = 're-scheduled';
    
    await appointment.save();

    return res.status(200).json(
      responseBody(200, 'Appointment rescheduled successfully', {
        appointmentId: appointment._id,
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        scheduledFor: appointment.scheduledFor,
        date: appointment.date,
        time: appointment.time,
        reason: appointment.reason,
        status: appointment.status
      })
    );
  } catch (error) {
    console.error('Error rescheduling appointment:', error);
    if (error.name === 'CastError') {
      return res.status(400).json(
        responseBody(400, 'Validation error: Invalid doctorId format', null)
      );
    }

    if( error.name === 'ValidationError') {
      const errorMessage = Object.values(error.errors)
        .map(err => err.message)
        .join(', ');
      return res.status(400).json(
        responseBody(400, `Validation error: ${errorMessage}`, null)
      );
    }
    return res.status(500).json(
      responseBody(500, 'Internal Server Error: Unable to reschedule appointment', null)
    );
  }
}

const noShowAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { user } = req;

    if (!user || !user.userId) {
      return res.status(403).json(
        responseBody(403, 'Unauthorized: User not authenticated', null)
      );
    }

    if (!appointmentId) {
      return res.status(400).json(
        responseBody(400, 'Validation error: appointmentId is required', null)
      );
    }

    if (user.role !== 'doctor' && user.role !== 'admin') {
      return res.status(403).json(
        responseBody(403, 'Forbidden: Only doctors can mark appointments as no-show', null)
      );
    }  


    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json(
        responseBody(404, 'Not Found: Appointment not found', null)
      );
    }   
    if (appointment.doctorId.toString() !== user.userId && user.role !== 'admin') {
      return res.status(403).json(
        responseBody(403, 'Forbidden: You do not have permission to update this appointment', null)
      );
    }

    appointment.status = 'no-show';
    await appointment.save();
    return res.status(200).json(
      responseBody(200, 'Appointment updated successfully', {
        appointmentId: appointment._id,
        status: appointment.status
      })
    );
  } catch (error) {
    console.error('Error updating appointment:', error);
    if (error.name === 'CastError') {
      return res.status(400).json(
        responseBody(400, 'Validation error: Invalid appointmentId format', null)
      );
    }
    if (error.name === 'ValidationError') {
      const errorMessage = Object.values(error.errors)
        .map(err => err.message)
        .join(', ');
        return res.status(400).json(    
            responseBody(400, `Validation error: ${errorMessage}`, null)
        );
    }
    return res.status(500).json(
      responseBody(500, 'Internal Server Error: Unable to update the appointment', null)
    );
  }
};


const deleteAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { user } = req;

    if (!user || !user.userId) {
      return res.status(403).json(
        responseBody(403, 'Unauthorized: User not authenticated', null)
      );
    }

    if (!appointmentId) {
      return res.status(400).json(
        responseBody(400, 'Validation error: appointmentId is required', null)
      );
    }

    if( user.role !== 'admin') {
      return res.status(403).json(
        responseBody(403, 'Forbidden: Only admins can delete appointments', null)
      );
    }

    const appointment = await Appointment.findByIdAndDelete(appointmentId);

    if (!appointment) {
      return res.status(404).json(
        responseBody(404, 'Not Found: Appointment not found', null)
      );
    }

    return res.status(200).json(
      responseBody(200, 'Appointment deleted successfully', { appointmentId })
    );
  } catch (error) {
    console.error('Error deleting appointment:', error);

    if( error.name === 'ValidationError') {
      const errorMessage = Object.values(error.errors)
        .map(err => err.message)
        .join(', ');
      return res.status(400).json(
        responseBody(400, `Validation error: ${errorMessage}`, null)
      );
    }

    return res.status(500).json(
      responseBody(500, 'Internal Server Error: Unable to delete appointment', null)
    );
  }
};

const getAllAppointments = async (req, res) => {
  try {
    const { user } = req;

    if (!user || !user.userId) {
      return res.status(403).json(
        responseBody(403, 'Unauthorized: User not authenticated', null)
      );
    }

    if (user.role !== 'admin') {
      return res.status(403).json(
        responseBody(403, 'Forbidden: Only admins can retrieve all appointments', null)
      );
    }

    const appointments = await Appointment.find({})
      .populate('patientId', 'fullName email')
      .populate('doctorId', 'fullName email');

    return res.status(200).json(
      responseBody(200, 'All appointments retrieved successfully', appointments)
    );
  } catch (error) {
    console.error('Error retrieving all appointments:', error);
    return res.status(500).json(
      responseBody(500, 'Internal Server Error: Unable to retrieve appointments', null)
    );
  }
};

module.exports = {
  bookAppointment,
  getAppointments,
  getAppointmentById,
  cancelAppointment,
  rescheduleAppointment,
  noShowAppointment,
  deleteAppointment,
  getAllAppointments
};

