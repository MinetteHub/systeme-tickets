// 1. Importer dotenv EN PREMIER
require('dotenv').config();

// 2. Importer la fonction de connexion
const connectDB = require('./config/database');

// 3. Importer Express
const express = require('express');
const app = express();

// 4. Connecter à MongoDB AVANT de démarrer le serveur
const startServer = async () => {
    try {
        // D'abord connecter à MongoDB
        await connectDB();
        
        // PUIS démarrer le serveur
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Serveur lancé sur le port ${PORT}`);
        });
        
    } catch (error) {
        console.error('Impossible de démarrer le serveur:', error);
    }
};

// Lancer !
startServer();