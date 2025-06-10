const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization; //Récupère l’en-tête d’autorisation de la requête HTTP
    
    //Si le token est absent ou mal formé (Authorization: Bearer <token> est attendu), on renvoie une erreur
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Accès refusé. Token manquant ou mal formaté." });
    }

    const token = authHeader.split(" ")[1]; // Récupérer uniquement le token

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET); //Vérification du token
        req.adminn = verified;  // Ajouter les infos de l'admin à `req`
        next();
    } catch (err) {
        res.status(403).json({ message: "Token invalide" });
    }
};
