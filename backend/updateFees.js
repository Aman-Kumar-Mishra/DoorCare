const mongoose = require('mongoose');
const doctorModel = require('./src/models/doctor.model');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const brainDir = `C:\\Users\\amanm\\.gemini\\antigravity\\brain\\9c6f7807-fe17-44cf-904f-84d8c2ef3fad`;
const publicTarget = `c:\\Users\\amanm\\Desktop\\DoorCare\\DoorCareUI\\public\\doc_images`;

const images = [
   "indian_male_doc_1_1776348494189.png",
   "indian_female_doc_1776348517006.png",
   "indian_male_doc_2_1776348535834.png"
];

async function run() {
    try {
        if (!fs.existsSync(publicTarget)) {
            fs.mkdirSync(publicTarget, { recursive: true });
        }
        for (const img of images) {
             const src = path.join(brainDir, img);
             const dest = path.join(publicTarget, img);
             if (fs.existsSync(src)) {
                 fs.copyFileSync(src, dest);
                 console.log(`Copied ${img} to public dir.`);
             } else {
                 console.log(`Missing generated image ${src}`);
             }
        }

        await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
        const doctors = await doctorModel.find({});
        console.log(`Found ${doctors.length} doctors. updating fee...`);
        
        for (let i = 0; i < doctors.length; i++) {
            const doc = doctors[i];
            const currentFee = typeof doc.fee === "number" ? doc.fee : (typeof doc.fees === "number" ? doc.fees : 10);
            const newFee = currentFee * 5;
            
            const randomImagePattern = `/doc_images/${images[i % images.length]}`;
            await doctorModel.findByIdAndUpdate(doc._id, { 
                fee: newFee,
                fees: newFee,
                image: randomImagePattern
            });
            console.log(`Updated ${doc.name} to fee ₹${newFee} with image snippet ${randomImagePattern}`);
        }
        console.log("Finished updating doctors fees and pictures");
    } catch (e) {
        console.log(e);
    } finally {
        process.exit();
    }
}
run();
