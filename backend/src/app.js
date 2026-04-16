const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const authRoutes = require('./routes/auth.route')
const patientRoutes = require('./routes/patient.route')
const doctorRoutes = require('./routes/doctor.route')
const adminRoutes = require('./routes/admin.route')
const app = express()

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'], credentials: true }))
app.use(express.json())
app.use(cookieParser())

app.use('/api/auth/',authRoutes)
app.use('/api/patient/',patientRoutes)
app.use('/api/doctor/',doctorRoutes)
app.use('/api/admin/',adminRoutes)

module.exports = app