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
const smsRoutes = require('./routes/smsRoutes');
const photoRoutes = require('./routes/photoRoutes');

const app = express();

// Async function to initialize server
const initServer = async () => {
    try {
        const mongooseConnection = await connectDB.connect();

        // Initialize session management
        const sessionManager = new SessionManager(app, mongooseConnection);
        sessionManager.initialize();

        // Middleware
        const allowedOrigins = [
            process.env.PRODUCTION_CLIENT_URL,
            process.env.CLIENT_URL,
            process.env.STAGGING_CLIENT_URL,
            'http://localhost:3000'
        ];

        app.use(cors({
            origin: (origin, callback) => {
                // allow requests with no origin - like mobile apps or curl requests
                if (!origin) return callback(null, true);
                if (allowedOrigins.indexOf(origin) === -1) {
                    const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
                    return callback(new Error(msg), false);
                }
                return callback(null, true);
            },
            credentials: true,
        }));

        app.use(express.json());

        // Routes
        app.use('/auth', authRoutes);
        app.use('/sponsors', sponsorRoutes);
        app.use('/leadership', leadershipRoutes);
        app.use('/events', eventRoutes);
        app.use('/sms', smsRoutes);
        app.use('/googleapi', photoRoutes);

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
