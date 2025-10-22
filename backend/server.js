require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/authRoutes');
const ticketRoutes = require('./routes/ticketRoutes.js');

// Connexion DB
connectDB();

// Init app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);  
app.use('/api/tickets', ticketRoutes);

// Route de test
app.get('/', (req, res) => {
    res.json({ 
        message: 'API Système de Tickets',
        endpoints: {
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
                me: 'GET /api/auth/me'
            },
            tickets: {
                list: 'GET /api/tickets',
                create: 'POST /api/tickets',
                details: 'GET /api/tickets/:id',
                update: 'PUT /api/tickets/:id',
                delete: 'DELETE /api/tickets/:id',
                assign: 'PUT /api/tickets/:id/assign',
                stats: 'GET /api/tickets/stats'
            }
        }
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur sur http://localhost:${PORT}`);
});

