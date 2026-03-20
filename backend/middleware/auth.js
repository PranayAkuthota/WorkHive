const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
    try {
        const token = req.headers.authorization;
        
        console.log("Auth middleware - Token received:", token ? "Yes" : "No");

        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        // Verify the token
        const decoded = jwt.verify(token, "SECRET_KEY");
        
        console.log("Auth middleware - Decoded user:", decoded);
        
        // Map the decoded token to req.user
        req.user = {
            id: decoded.userId,  // Map userId to id
            tenantId: decoded.tenantId,
            role: decoded.role
        };
        
        next();
    } catch (err) {
        console.error("Auth middleware error:", err.message);
        res.status(401).json({ message: "Invalid token" });
    }
};

module.exports = auth;