const mongoose = require('mongoose')

const doctorSchema = new mongoose.Schema({
    name: { 
        type: String,
        required: true 
    },
    email: { 
        type: String,
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    image: { 
        type: String,
        required: true 
    },
    speciality: { 
        type: String, 
        required: true 
    },
    qualification: { 
        type: String, 
        required: true 
    },
    experience: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    available: { 
        type: Boolean, 
        default: false 
    },
    fee: { 
        type: Number, 
        required: true 
    },
    slots_booked: { 
        type: Object, 
        default: {} 
    },
    address: { 
        type: Object, 
        required: true 
    },
    date: { 
        type: Number, 
        required: true 
    },

    role: {
        type: String,
        default: "doctor"
    },

    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    }
    
}, { minimize: false })

const doctorModel = mongoose.model("doctor", doctorSchema);

module.exports = doctorModel