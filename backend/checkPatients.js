const mongoose = require('mongoose');
require('dotenv').config();
const patientModel = require('./src/models/patient.model');

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const patients = await patientModel.find({});
        console.log("Registered Patients in DB:");
        patients.forEach(p => console.log(`- ID: ${p._id}, Email: ${p.email}, Name: ${p.name}`));
        process.exit();
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

checkDB();
