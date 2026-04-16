const mongoose = require('mongoose')

async function connectDB(){
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("DB Connected")
    } catch (error) {
        console.log("DB ERROR: ", error)
    }
}

module.exports = connectDB