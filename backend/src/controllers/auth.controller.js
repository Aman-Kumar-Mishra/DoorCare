const patientModel = require('../models/patient.model')
const doctorModel = require('../models/doctor.model')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const imageURL = require('../services/cloud.service')

// API to register patient
const registerPatient = async (req, res) => {

    try {
        const { name, email, password } = req.body;

        // checking for all data to register patient
        if (!name || !email || !password) {
            return res.json({ 
                success: false, 
                message: 'Missing Details' 
            })
        }

        // validating email format
        if (!validator.isEmail(email)) {
            return res.json({ 
                success: false, 
                message: "Please enter a valid email" 
            })
        }

        // validating strong password
        if (password.length < 8) {
            return res.json({ 
                success: false, 
                message: "Please enter a strong password" 
            })
        }

        // hashing patient password
        const hashedPassword = await bcrypt.hash(password, 10)

        const patient = await patientModel.create({
            name,
            email,
            password: hashedPassword
        })

        const token = jwt.sign({ 
            id: patient._id 
        }, process.env.JWT_SECRET)

        res.cookie('token', token)

        res.json({ 
            success: true,
            token
        })

    } catch (error) {
        console.log(error)
        res.json({ 
            success: false, 
            message: error.message 
        })
    }
}

// API to login patient
const loginPatient = async (req, res) => {

    try {
        const { email, password } = req.body;
        const patient = await patientModel.findOne({ email })

        if (!patient) {
            return res.json({ 
                success: false, 
                message: "Patient does not exist" })
        }

        const isMatch = await bcrypt.compare(password, patient.password)

        if (isMatch) {
            const token = jwt.sign({ 
                id: patient._id 
            }, process.env.JWT_SECRET)

            res.cookie('token',token)

            res.json({ 
                success: true,
                token
            })
        }
        else {
            res.json({ 
                success: false, 
                message: "Invalid credentials" 
            })
        }
    } catch (error) {
        console.log(error)

        res.json({ 
            success: false, 
            message: error.message 
        })
    }
}

// API for register doctor
const registerDoctor = async (req, res) => {

    try {

        const { name, email, password, speciality, qualification, experience, about, fee, address } = req.body
        const imageFile = req.file

        // checking for all data to add doctor
        if (!name || !email || !password || !speciality || !qualification || !experience || !about || !fee || !address) {
            return res.json({ 
                success: false, 
                message: "Missing Details" 
            })
        }

        const existingDoc = await doctorModel.findOne({ email })
        if (existingDoc) {
            return res.json({
                success: false,
                message: existingDoc.status === 'pending' ? 'Registration already submitted, approval is pending!' : 'An account with this email already exists!'
            })
        }

        // validating email format
        if (!validator.isEmail(email)) {
            return res.json({ 
                success: false, 
                message: "Please enter a valid email" 
            })
        }

        // validating strong password
        if (password.length < 8) {
            return res.json({ 
                success: false, 
                message: "Please enter a strong password" 
            })
        }

        // hashing doctor password
        const hashedPassword = await bcrypt.hash(password, 10)

        // upload image to cloudinary
        const imageUrl = await imageURL(imageFile.path,imageFile.name)

        const doctor = await doctorModel.create({
            name,
            email,
            image: imageUrl,
            password: hashedPassword,
            speciality,
            qualification,
            experience,
            about,
            fee,
            address: JSON.parse(address),
            date: Date.now()
        })

        res.json({ 
            success: true, 
            message: 'Doctor Registered, approval pending' 
        })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API for doctor Login 
const loginDoctor = async (req, res) => {

    try {

        const { email, password } = req.body
        const doctor = await doctorModel.findOne({ email })

        if (!doctor) {
            return res.json({ 
                success: false, 
                message: "Invalid credentials" 
            })
        }

        const isMatch = await bcrypt.compare(password, doctor.password)

        if (isMatch) {
            if(doctor.status=="pending"){
                return res.json({
                    success: false,
                    message: "Approval is still pending! Please wait for administration."
                })
            }
            const token = jwt.sign({ 
                id: doctor._id 
            }, process.env.JWT_SECRET)

            res.cookie('token',token)

            res.json({ 
                success: true,
                token
            })
        } else {
            res.json({ 
                success: false, 
                message: "Invalid credentials" 
            })
        }


    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API for admin login
const loginAdmin = async (req, res) => {
    try {

        const { email, password } = req.body

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign({
                email,
                password}, process.env.JWT_SECRET)

            res.cookie('token',token)

            res.json({ 
                success: true,
                token
            })
        } else {
            res.json({ 
                success: false, 
                message: "Invalid credentials" 
            })
        }

    } catch (error) {
        console.log(error)
        res.json({ 
            success: false, 
            message: error.message 
        })
    }

}

module.exports = {registerPatient, loginPatient, registerDoctor, loginDoctor, loginAdmin}