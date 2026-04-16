const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();
const doctorModel = require('./src/models/doctor.model');

const specialities = [
    "General physician", "Gynecologist", "Dermatologist", 
    "Pediatricians", "Neurologist", "Gastroenterologist"
];

const names = [
    'William Smith', 'Sarah Johnson', 'James Williams', 'Emily Brown', 'Michael Jones', 
    'Jessica Garcia', 'David Miller', 'Ashley Davis', 'Joshua Rodriguez', 'Amanda Martinez', 
    'Matthew Hernandez', 'Nicole Lopez', 'Daniel Gonzalez', 'Rachel Wilson', 'Christopher Anderson'
];

const doctors = Array.from({ length: 15 }).map((_, i) => ({
    name: `Dr. ${names[i]}`,
    email: `doctor${i + 1}@doorcare.com`,
    password: "password123", // will be hashed during insertion
    image: `https://randomuser.me/api/portraits/${i % 2 === 0 ? 'men' : 'women'}/${i + 10}.jpg`,
    speciality: specialities[i % specialities.length],
    qualification: i % 2 === 0 ? "MBBS, MD" : "MBBS, MS",
    experience: `${(i % 10) + 3} Years`,
    description: "Highly experienced specialist committed to providing excellent patient care. Extensive background in both proactive health management and specialized treatments.",
    available: true,
    fee: 50 + (i * 10),
    slots_booked: {},
    address: { line1: `${100 + i} Medical Blvd`, line2: "Downtown District" },
    date: Date.now(),
    role: "doctor",
    status: "approved"
}));

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB -> Seeding...");

        const salt = await bcrypt.genSalt(10);
        
        for (let doc of doctors) {
            doc.password = await bcrypt.hash(doc.password, salt);
            // using updateOne with upsert to prevent unique email crashes on duplicate runs
            await doctorModel.updateOne({ email: doc.email }, { $set: doc }, { upsert: true });
        }

        console.log("✅ 15 Doctors Successfully Seeded!");
        process.exit();
    } catch (error) {
        console.log("❌ Seeding Error: ", error);
        process.exit(1);
    }
};

seedDB();
