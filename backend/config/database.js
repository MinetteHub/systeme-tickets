const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`MongoDB connecté: ${conn.connection.host}`);
        
        // Événements de connexion
        mongoose.connection.on('error', (err) => {
            console.error('Erreur MongoDB:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB déconnecté');
        });

    } catch (error) {
        console.error(`Erreur: ${error.message}`);
        process.exit(1); // Arrêter le serveur si pas de DB
    }
};

module.exports = connectDB;