const mongoose = require('mongoose')

const appointmentSchema = new mongoose.Schema({
    patientId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "patient",
        required: true 
    },
    doctorId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "doctor",
        required: true 
    },
    slotDate: { 
        type: String, 
        required: true 
    },
    slotTime: { 
        type: String, 
        required: true 
    },
    patientData: { 
        type: Object, 
        required: true 
    },
    doctorData: { 
        type: Object, 
        required: true 
    },
    fee: { 
        type: Number, 
        required: true
    },
    date: { 
        type: Number, 
        required: true 
    },
    cancelled: { 
        type: Boolean, 
        default: false
    },
    payment: {
        type: Boolean, 
        default: false 
    },
    isCompleted: { 
        type: Boolean, 
        default: false 
    }
})

const appointmentModel = mongoose.model("appointment", appointmentSchema)

module.exports = appointmentModel