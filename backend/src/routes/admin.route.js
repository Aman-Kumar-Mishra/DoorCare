const express = require('express')
const upload = require('../middlewares/multer.middleware')
const adminController = require('../controllers/admin.controller')
const adminAuth = require('../middlewares/adminAuth.middleware')
const adminRoute = express.Router()

adminRoute.post("/add-doctor", adminAuth, upload.single('image'), adminController.addDoctor)
adminRoute.get("/view-appointments", adminAuth, adminController.appointmentsList)
adminRoute.post("/cancel-appointment", adminAuth, adminController.cancelAppointment)
adminRoute.get("/all-doctors", adminAuth, adminController.allDoctors)
// adminRoute.post("/change-availability", authAdmin, )
adminRoute.get("/dashboard", adminAuth, adminController.adminDashboard)
adminRoute.get("/all-patients", adminAuth, adminController.allPatients)
adminRoute.post("/update-doctor-status", adminAuth, adminController.updateDoctorStatus)


module.exports = adminRoute



