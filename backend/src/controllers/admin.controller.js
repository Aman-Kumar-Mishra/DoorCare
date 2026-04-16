const appointmentModel = require('../models/apppointment.model')
const doctorModel = require('../models/doctor.model')
const patientModel = require('../models/patient.model')
const validator = require('validator')

// API to get all appointments list
const appointmentsList = async (req, res) => {
    try {

        const appointments = await appointmentModel.find({})
        res.json({ 
            success: true, 
            appointments 
        })

    } catch (error) {
        console.log(error)
        res.json({ 
            success: false, 
            message: error.message 
        })
    }

}

// API for appointment cancellation
const cancelAppointment = async (req, res) => {
    try {

        const { appointmentId } = req.body
        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

        res.json({
            success: true, 
            message: 'Appointment Cancelled' 
        })

    } catch (error) {
        console.log(error)
        res.json({ 
            success: false, 
            message: error.message 
        })
    }

}

// API for approving Doctor
const addDoctor = async (req, res) => {

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
                success: false, message: "Please enter a strong password" })
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10); // the more no. round the more time it will take
        const hashedPassword = await bcrypt.hash(password, salt)

        // upload image to cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })
        const imageUrl = imageUpload.secure_url

        const doctorData = {
            name,
            email,
            image: imageUrl,
            password: hashedPassword,
            speciality,
            degree,
            experience,
            about,
            fees,
            address: JSON.parse(address),
            date: Date.now()
        }

        const newDoctor = new doctorModel(doctorData)
        await newDoctor.save()
        res.json({ success: true, message: 'Doctor Added' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get all doctors list for admin panel
const allDoctors = async (req, res) => {
    try {

        const doctors = await doctorModel.find({}).select('-password')
        res.json({ 
            success: true, 
            doctors 
        })

    } catch (error) {
        console.log(error)
        res.json({ 
            success: false, 
            message: error.message 
        })
    }
}

// API to get dashboard data for admin panel
const adminDashboard = async (req, res) => {
    try {

        const doctors = await doctorModel.find({})
        const patients = await patientModel.find({})
        const appointments = await appointmentModel.find({})

        let earnings = 0;
        appointments.map((item) => {
            if (item.isCompleted || item.payment) {
                earnings += item.fee || (item.doctorData && item.doctorData.fee) || 0;
            }
        });

        const dashData = {
            doctors: doctors.length,
            appointments: appointments.length,
            patients: patients.length,
            earnings: earnings,
            latestAppointments: appointments.reverse()
        }

        res.json({ 
            success: true, 
            dashData 
        })

    } catch (error) {
        console.log(error)
        res.json({ 
            success: false, 
            message: error.message 
        })
    }
}

// API to get all patients list for admin panel
const allPatients = async (req, res) => {
    try {
        const patients = await patientModel.find({}).select('-password')
        res.json({ 
            success: true, 
            patients 
        })
    } catch (error) {
        console.log(error)
        res.json({ 
            success: false, 
            message: error.message 
        })
    }
}

// API to update doctor status for admin panel
const updateDoctorStatus = async (req, res) => {
    try {
        const { doctorId, status } = req.body
        await doctorModel.findByIdAndUpdate(doctorId, { status })
        res.json({ 
            success: true, 
            message: `Doctor successfully ${status}` 
        })
    } catch (error) {
        console.log(error)
        res.json({ 
            success: false, 
            message: error.message 
        })
    }
}

module.exports = {appointmentsList, cancelAppointment, addDoctor, allDoctors, adminDashboard, allPatients, updateDoctorStatus}