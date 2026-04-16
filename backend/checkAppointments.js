const mongoose = require('mongoose');
require('dotenv').config();
const appointmentModel = require('./src/models/apppointment.model');

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const appts = await appointmentModel.find({});
        console.log("Appointments in DB:");
        appts.forEach(a => console.log(`- ID: ${a._id}, Date: ${a.slotDate}, PatientId: ${a.patientId}, DoctorId: ${a.doctorId}`));
        process.exit();
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

checkDB();
