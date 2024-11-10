const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Step 1: Find the user by username
        const user = await User.findOne({ username });
        if (!user) {
            console.log("User not found:", username);
            return res.status(400).json({ message: 'User not found' });
        }

        // Step 2: Debug logs for the stored password hash
        console.log("Stored Password Hash:", user.password);
        console.log("Entered Password:", password);

        // Step 3: Compare the entered password with the stored hash
        const isMatch = await bcrypt.compare(password, user.password);
        console.log("Password Match:", isMatch);  // Log the result of bcrypt.compare

        if (!isMatch) {
            console.log("Incorrect password");
            return res.status(400).json({ message: 'Incorrect password' });
        }

        // Step 4: Generate a JWT token if the password matches
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, role: user.role });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
