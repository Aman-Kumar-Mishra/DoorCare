const jwt = require('jsonwebtoken')
const patientModel = require('../models/patient.model')
const doctorModel = require('../models/doctor.model')
const appointmentModel = require('../models/apppointment.model')
const imageURL = require('../services/cloud.service')

// API to view patient profile
const viewProfile = async (req, res) => {

    try {
        const token  = req.cookies.token
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const patientId = decoded.id
        const patientData = await patientModel.findById(patientId)

        res.json({
            success: true, 
            patientData
        })

    } catch (error) {
        console.log(error)
        res.json({ 
            success: false,
            message: error.message
        })
    }
}

// API to update patient profile
const updateProfile = async (req, res) => {

    try {

        const token  = req.cookies.token
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const patientId = decoded.id

        const {name, phone, address, dob, gender} = req.body

        async function updater(key){
            if(key){
                if(key==address){
                    await patientModel.findByIdAndUpdate(patientId, {
                        key: JSON.parse(key)
                    })
                    return
                }
                await patientModel.findByIdAndUpdate(patientId, { 
                    key
                 })
            }
        }

        updater(name)
        updater(phone)
        updater(address)
        updater(dob)
        updater(gender)

        const imageFile = req.file


        if (imageFile) {

            const imageUrl = imageURL(imageFile.path, imageFile.name)

            await patientModel.findByIdAndUpdate(patientId, { image: imageUrl })
        }

        res.json({
            success: true, 
            message: 'Profile Updated' 
        })

    } catch (error) {
        console.log(error)
        res.json({ 
            success: false, 
            message: error.message 
        })
    }
}

// API to book appointment 
const bookAppointment = async (req, res) => {

    try {
        const token  = req.cookies.token
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const patientId = decoded.id

        const { docId, slotDate, slotTime } = req.body
        const docData = await doctorModel.findById(docId)

        if (!docData.available) {
            return res.json({ 
                success: false, 
                message: 'Doctor Not Available' 
            })
        }

        const existingAppt = await appointmentModel.findOne({ patientId, doctorId: docId, slotDate })
        if (existingAppt && !existingAppt.cancelled) {
            return res.json({ 
                success: false, 
                message: 'You have already booked this doctor for this day.' 
            })
        }

        let slots_booked = docData.slots_booked

        // checking for slot availablity 
        if (slots_booked[slotDate]) {
            if (slots_booked[slotDate].includes(slotTime)) {
                return res.json({ 
                    success: false, 
                    message: 'Slot Not Available' })
            }
            else {
                slots_booked[slotDate].push(slotTime)
            }
        } else {
            slots_booked[slotDate] = []
            slots_booked[slotDate].push(slotTime)
        }

        const patientData = await patientModel.findById(patientId)

        delete docData.slots_booked

        const newAppointment = await appointmentModel.create({
            patientId,
            doctorId: docId,
            patientData,
            doctorData: docData,
            fee: docData.fee,
            payment: req.body.payment || false,
            slotTime,
            slotDate,
            date: Date.now()
        })

        // save new slots data in docData
        await doctorModel.findByIdAndUpdate(docId, { slots_booked })

        res.json({ 
            success: true, 
            message: 'Appointment Booked' 
        })

    } catch (error) {
        console.log(error)
        res.json({ 
            success: false, 
            message: error.message 
        })
    }

}

// API to cancel appointment
const cancelAppointment = async (req, res) => {
    try {

        const { patientId, appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        // verify appointment user 
        if (appointmentData.patientId.toString() !== patientId) {
            return res.json({ 
                success: false, 
                message: 'Unauthorized action' 
            })
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

        // releasing doctor slot 
        const { docId, slotDate, slotTime } = appointmentData

        const doctorData = await doctorModel.findById(docId)

        let slots_booked = doctorData.slots_booked

        slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)

        await doctorModel.findByIdAndUpdate(docId, { slots_booked })

        res.json({ 
            success: true, 
            message: 'Appointment Cancelled' })

    } catch (error) {
        console.log(error)
        res.json({ 
            success: false, 
            message: error.message })
    }
}

// API to get user appointments for frontend my-appointments page
const listAppointment = async (req, res) => {
    try {
        
        const token = req.cookies.token;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const patientId = decoded.id;

        const appointments = await appointmentModel.find({ patientId });

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
// API to get all doctors
const getAllDoctors = async (req, res) => {
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

module.exports = {viewProfile, updateProfile, bookAppointment, cancelAppointment, listAppointment, getAllDoctors}