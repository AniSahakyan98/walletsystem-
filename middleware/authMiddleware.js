//Middleware → verifies token , runs BEFORE your controller, security checkpoint between:request And controller
// Client request
//     ↓
// Middleware
//     ↓
// Controller
//     ↓
// Service

const jwt = require('jsonwebtoken')

const authMiddleware = (req,res,next) => {
    try {
        const authHeader = req.headers.authorization;
        if(!authHeader) {
            return res.status(401).json({
                error: "Authorisation header missing"
            })
        }
        console.log(authHeader)
        const token = authHeader.split(" ")[1]

        if(!token) {
            return res.status(401).json({
                error: "Token is missing"
            })
        }

        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        req.user = decoded

        return next() //👉 This sends request to controller
    } catch(error) {
        return res.status(401).json({
            error: "Invalid token",
            details: error.message
        })
    }
}

module.exports = authMiddleware