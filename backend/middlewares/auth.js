const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

const adminMiddleware = (req, res, next) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    next();
};

// Add some basic auth routes
router.post('/login', (req, res) => {
    res.json({ message: 'Login endpoint' });
});

router.post('/register', (req, res) => {
    res.json({ message: 'Register endpoint' });
});

// Export the router as default export
module.exports = router;

// Export middleware functions as named exports
module.exports.authMiddleware = authMiddleware;
module.exports.adminMiddleware = adminMiddleware;
