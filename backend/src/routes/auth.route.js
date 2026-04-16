const express = require('express')
const authController = require('../controllers/auth.controller')
const upload = require('../middlewares/multer.middleware')

const authRoute = express.Router()

authRoute.post('/register-patient',authController.registerPatient)
authRoute.post('/login-patient',authController.loginPatient)
authRoute.post('/register-doctor', upload.single('image'), authController.registerDoctor)
authRoute.post('/login-doctor',authController.loginDoctor)
authRoute.post('/login-admin',authController.loginAdmin)

module.exports = authRoute