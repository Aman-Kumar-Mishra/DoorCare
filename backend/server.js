const app = require('./src/app')
const connectDB = require('./src/services/database.service')
require('dotenv').config()

connectDB()
.then(()=>{
    try{
        app.listen(3000,()=>{
            console.log("server running on port 3000")
        })
    }catch(error){
        console.log("SERVER ERROR: ",error)
    }
})
