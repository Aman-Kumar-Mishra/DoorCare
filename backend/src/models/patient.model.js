const mongoose = require('mongoose')

const patientSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true
    },
    image: { 
        type: String,
        default: 'https://plus.unsplash.com/premium_photo-1677252438411-9a930d7a5168?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
    phone: { 
        type: String, 
        default: 'xxxxxxxxxx' 
    },
    address: { 
        type: Object, 
        default: { line1: '', line2: '' } 
    },
    gender: { 
        type: String, 
        default: 'Not Selected' 
    },
    dob: { 
        type: String, 
        default: 'Not Selected' 
    },
    password: { 
        type: String, 
        required: true 
    },
    role: {
        type: String,
        defualt: "patient"
    }
})

const patientModel = mongoose.model("patient", patientSchema);

module.exports = patientModel