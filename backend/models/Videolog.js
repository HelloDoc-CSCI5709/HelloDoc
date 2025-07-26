const mongoose = require('mongoose');
const VideoRoom = mongoose.model('VideoRoom');

const videoLogSchema = new mongoose.Schema({
    appointmentId : {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Appointment",
        index: true
    },
    roomId: {
        type: String,
        required: true,
        validate:{
            validator: async function (rid){
                return await VideoRoom.exists({
                    roomId:  rid,
                    appoinmentId: this.appoinmentId
                })
            },
            message: 'The roomId is invalid or doesn\'t belong to this appointment'
        }
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        validate: {
            validator: async function (uid){
                const room = await VideoRoom.findOne({
                    roomId: this.roomId
                })
                return room && (
                    room.doctorId.equals(uid) ||
                    room.patientId.equals(uid)
                )
            },
            message: 'The userId must be a doctor or a patient for this room'
        }
    },
    role: {
        type: String,
        enum: ['doctor', 'patient'],
        required: true
    },
    joinedAt: {
        type: Date,
        required: true
    },
    leftAt: {
        type: Date,
    },
    durationInMin : {
        type: Number,
        min: 0
    }
});

videoLogSchema.pre('save', function(next){
    if(this.joinedAt && this.leftAt){
        const diff = this.leftAt - this.joinedAt;
        this.durationInMin = Math.max(0, Math.round(diff / 1000 / 60));
    }

    next()
});

module.exports = mongoose.model('VideoLog', videoLogSchema);