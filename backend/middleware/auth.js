const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
    let token;

    // Vérifier si token dans headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extraire le token
            token = req.headers.authorization.split(' ')[1];

            // Vérifier le token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Ajouter l'user à la requête
            req.user = decoded;

            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                error: 'Non autorisé - Token invalide'
            });
        }
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Non autorisé - Pas de token'
        });
    }
};

// Middleware pour vérifier le rôle
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: `Rôle ${req.user.role} non autorisé`
            });
        }
        next();
    };
};

module.exports = { protect, authorize };
