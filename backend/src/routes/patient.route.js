const express = require('express')
const patientController = require('../controllers/patient.controller')
const upload = require('../middlewares/multer.middleware')
const patientRoute = express.Router()
const patientAuth = require('../middlewares/patientAuth.middleware')

patientRoute.get("/view-patient-profile", patientAuth, patientController.viewProfile)
patientRoute.post("/update-patient-profile", upload.single('image'), patientAuth, patientController.updateProfile)
patientRoute.post("/book-appointment", patientAuth, patientController.bookAppointment)
patientRoute.get("/view-patient-appointments", patientAuth, patientController.listAppointment)
patientRoute.post("/cancel-patient-appointment", patientAuth, patientController.cancelAppointment)

// patientRoute.post("/payment-razorpay", authUser, paymentRazorpay)
// patientRoute.post("/verifyRazorpay", authUser, verifyRazorpay)
// patientRoute.post("/payment-stripe", authUser, paymentStripe)
// patientRoute.post("/verifyStripe", authUser, verifyStripe)

patientRoute.get("/all-doctors", patientAuth, patientController.getAllDoctors)

module.exports = patientRoute