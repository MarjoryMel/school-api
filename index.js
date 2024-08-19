const express = require("express");
const cookieParser = require("cookie-parser");
require("dotenv").config({ path: "./config/.env" });
const path = require("path");
const mongoose = require("mongoose");

// Import user routes
const userRoutes = require("./routes/userRoutes");
const professorRoutes = require("./routes/professorRoutes");
const studentRoutes = require("./routes/studentRoutes");
const courseRoutes = require("./routes/courseRoutes");

// Import the function to initialize the default admin
const initializeAdmin = require('./utils/initializeAdmin'); 

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");
        return initializeAdmin(); // Execute the function to create the default admin
    })
    .catch(err => console.error("MongoDB connection error:", err));

// System routes
app.use('/api/users', userRoutes);
app.use('/api/professor', professorRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/course', courseRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start the server and listen on the specified port
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
