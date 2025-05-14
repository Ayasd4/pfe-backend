const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Accès refusé. Token manquant ou mal formaté." });
    }

    const token = authHeader.split(" ")[1]; // Récupérer uniquement le token

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.utilisateur = verified;  // Ajouter les infos de l'utilisateur à `req`
        next();
    } catch (err) {
        res.status(403).json({ message: "Token invalide" });
    }
};
