const jwt = require('jsonwebtoken')

// doctor authentication middleware
const doctorAuth = async (req, res, next) => {

    const dtoken = req.headers.dtoken || req.headers.token;
    if (!dtoken) {
        return res.json({ 
            success: false, 
            message: 'Not Authorized Login Again' 
        })
    }
    try {
        const token_decode = jwt.verify(dtoken, process.env.JWT_SECRET)
        if (!req.body) req.body = {};
        req.body.docId = token_decode.id
        next()
    } catch (error) {
        console.log(error)
        res.json({ 
            success: false, 
            message: error.message 
        })
    }
}

module.exports = doctorAuth