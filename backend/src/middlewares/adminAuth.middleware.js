const jwt = require('jsonwebtoken')

// admin authentication middleware
const adminAuth = async (req, res, next) => {
    try {
        const atoken = req.headers.atoken || req.headers.token;
        if (!atoken) {
            return res.json({ 
                success: false,
                message: 'Not Authorized Login Again' 
            })
        }
        const token_decode = jwt.verify(atoken, process.env.JWT_SECRET)
        if (token_decode.email !== process.env.ADMIN_EMAIL || token_decode.password !== process.env.ADMIN_PASSWORD) {
            return res.json({ 
                success: false, 
                message: 'Not Authorized Login Again' 
            })
        }
        next()
    } catch (error) {
        console.log(error)
        res.json({ 
            success: false, 
            message: error.message
        })
    }
}

module.exports = adminAuth