const express = require('express');
const User = require('./models/user'); // Add this line
const bcrypt = require('bcryptjs'); // Add this line
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
app.use(express.json());

app.use(cors({
    origin: 'http://localhost:3000',  // Make sure this matches the frontend URL
    credentials: true
  }));

app.use('/uploads', express.static('uploads'));


// Import routes
const authRoutes = require('./routes/auth');  // Correct path for the login route
const productRoutes = require('./routes/product');
const categoryRoutes = require('./routes/category');
const galleryRoutes = require('./routes/gallery');
const feedbackRoutes = require('./routes/feedback');
const userRoutes = require('./routes/user');


app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Connected to MongoDB");
        createDefaultAdmin();
    })
    .catch(err => console.error("MongoDB connection error:", err));


// Function to create a default admin user
async function createDefaultAdmin() {
    try {
        const existingAdmin = await User.findOne({ username: 'Amanj01' });
        const hashedPassword = await bcrypt.hash('admin123', 10);  // Set a known password

        if (!existingAdmin) {
            const admin = new User({
                username: 'Amanj01',
                password: hashedPassword,
                role: 'admin',
            });
            await admin.save();
            console.log('Default admin created with new password');
        } else {
            await User.updateOne(
                { username: 'Amanj01' },
                { $set: { password: hashedPassword } }
            );
            console.log('Admin password updated');
        }
    } catch (error) {
        console.error('Error creating or updating default admin:', error);
    }
}

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/galleries', galleryRoutes);
app.use('/api/feedbacks', feedbackRoutes);
app.use('/api/users', userRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
