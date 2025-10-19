// Load required packages
const express = require('express');   // Express framework to build the backend server
const cors = require('cors');         // CORS middleware to allow frontend requests from different origins
require('dotenv').config();           // Load environment variables from .env file

// Import route modules
const aiRoutes = require('./routes/aiRoutes');
const layoutRoutes = require('./routes/layoutRoutes');

// Initialize Express app
const app = express();

// Set the port the server will listen on
// If an environment variable PORT exists (for deployment), use it; otherwise default to 5000
const PORT = process.env.PORT || 5000;

// --------------------- Middleware ---------------------

// Enable Cross-Origin Resource Sharing so your frontend can call the backend
app.use(cors());

// Enable parsing of JSON bodies from frontend requests
// This lets you access req.body for POST requests
app.use(express.json());

// --------------------- Test Route ---------------------

// Simple GET route at the root URL to verify the server is running
// Visiting http://localhost:5000 in a browser should return "Backend is running!"
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// --------------------- Routes ---------------------

// Mount route modules
app.use('/api/ai', aiRoutes);        // All AI-related endpoints
app.use('/api/layout', layoutRoutes); // All layout-related endpoints

// --------------------- Start the Server ---------------------

// Start the server and listen on the specified port
// The callback confirms in the console that the server is running
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
