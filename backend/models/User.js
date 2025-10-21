const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Définir la structure d'un utilisateur
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Le nom est requis'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email requis'],
        unique: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Email invalide']
    },
    password: {
        type: String,
        required: [true, 'Mot de passe requis'],
        minlength: 6,
        select: false  // Ne pas renvoyer le mot de passe par défaut
    },
    role: {
        type: String,
        enum: ['consultant', 'manager', 'dev'],
        default: 'consultant'
    }
}, {
    timestamps: true  // Ajoute createdAt et updatedAt automatiquement
});

// Avant de sauvegarder, hasher le mot de passe
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Méthode pour vérifier le mot de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
