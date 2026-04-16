const mongoose = require('mongoose');
const doctorModel = require('./src/models/doctor.model');
require('dotenv').config();

const indianNames = [
    "Dr. Rahul Sharma",
    "Dr. Priya Patel",
    "Dr. Amit Kumar",
    "Dr. Sneha Gupta",
    "Dr. Vikram Singh",
    "Dr. Neha Reddy",
    "Dr. Rajesh Iyer",
    "Dr. Anjali Desai",
    "Dr. Suresh Menon",
    "Dr. Kavita Joshi"
];

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
        const doctors = await doctorModel.find({});
        console.log(`Found ${doctors.length} doctors. updating...`);
        
        for (let i = 0; i < doctors.length; i++) {
            const doc = doctors[i];
            const newName = indianNames[i % indianNames.length];
            await doctorModel.findByIdAndUpdate(doc._id, { 
                name: newName,
                image: '' // clear image so it defaults to the placeholder UserCircle
            });
            console.log(`Updated ${doc.name} to ${newName}`);
        }
        console.log("Finished updating doctors");
    } catch (e) {
        console.log(e);
    } finally {
        process.exit();
    }
}
run();
