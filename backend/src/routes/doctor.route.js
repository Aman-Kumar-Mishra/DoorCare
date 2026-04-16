
const express = require('express')
const doctorController = require('../controllers/doctor.controller')
const doctorAuth = require('../middlewares/doctorAuth.middlleware')
const doctorRoute = express.Router()

doctorRoute.post("/cancel-doctor-appointment", doctorAuth, doctorController.cancelAppointment)
doctorRoute.get("/view-doctor-appointments", doctorAuth, doctorController.doctorAppointments)
doctorRoute.post("/change-doctor-availability", doctorAuth, doctorController.changeAvailablity)
doctorRoute.post("/complete-appointment", doctorAuth, doctorController.completeAppointment)
doctorRoute.get("/dashboard", doctorAuth, doctorController.doctorDashboard)
doctorRoute.get("/view-doctor-profile", doctorAuth, doctorController.doctorProfile)
doctorRoute.post("/update-doctor-profile", doctorAuth, doctorController.updateProfile)

module.exports = doctorRoute