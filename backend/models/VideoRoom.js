const mongoose = require('mongoose');
const Appointment = mongoose.model('Appointment')

function generateRoomId(){
    return Math.random().toString(36).substring(2,8).toUpperCase()
}

const videoRoomSchema = new mongoose.Schema({
    appointmentId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        required: true,
        validate : {
            validator: async function(aid){
                return await Appointment.exists({_id: aid})
            }
        },
        message: 'Referenced Appointment does not exist'
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        validate: {
            validator: async function(uid){
                const appt = await Appointment.findById(this.appointmentId);
                console.log(this.appointmentId)
                return appt && appt.doctorId.equals(uid)
            }
        },
        message: 'doctorId must match the appointment\'s doctor'
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        validate: {
            validator: async function(uid){
                const appt = await Appointment.findById(this.appointmentId);
                return appt && appt.patientId.equals(uid)
            }
        },
    },
    roomId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 6,
        maxlength: 6,
        uppercase: true,
        immutable: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        immutable: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: {expires: 0}
    }
});

videoRoomSchema.pre('validate', async function(next){
    if (this.isNew){
        let id;
        do{
            id = generateRoomId()
        }while(await mongoose.models.VideoRoom.exists({ roomId: id }))
        this.roomId = id;
    }

    next()
});


module.exports = mongoose.model('VideoRoom', videoRoomSchema)