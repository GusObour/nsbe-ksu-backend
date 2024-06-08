const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const sponsorRoutes = require('./routes/sponsorRoutes');
const leadershipRoutes = require('./routes/leadershipRoutes');
const eventRoutes = require('./routes/eventRoutes');
const agenda = require('./services/agenda');
const SessionManager = require('./services/SessionManager');

const app = express();

// Async function to initialize server
const initServer = async () => {
    try {
        const mongooseConnection = await connectDB.connect();

        // Initialize session management
        const sessionManager = new SessionManager(app, mongooseConnection);
        sessionManager.initialize();

        // Middleware
        app.use(cors({
            origin: process.env.CLIENT_URL || 'http://localhost:3000',
            credentials: true,
        }));
        app.use(express.json());

        // Routes
        app.use('/auth', authRoutes);
        app.use('/sponsors', sponsorRoutes);
        app.use('/leadership', leadershipRoutes);
        app.use('/events', eventRoutes);

        // Agenda
        agenda.on('ready', () => {
            console.log('Agenda started');
            agenda.start();
        });

        // Start server
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Error initializing server', err);
        process.exit(1);  // Exit process with failure
    }
};

initServer();
