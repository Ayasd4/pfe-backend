const express = require("express");
const router = express.Router();

const authController = require("../controllers/authentification");

const authenticateToken = require("../middleware/authMiddleware");
const checkRole = require('../middleware/checkRole')


router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/forgotPassword", authController.forgotPassword);

router.get("/users/:role", authenticateToken,checkRole.checkRole ,(req, res) => {
    const role = req.params.role;  // Récupère le rôle depuis les paramètres d'URL
    authController.show(role, res);  // Appelle le contrôleur pour afficher les utilisateurs selon ce rôle
});

router.patch("/users/:id", authenticateToken, checkRole.checkRole, authController.updateUser);
router.get("/checkToken", authenticateToken, authController.checkToken);

router.post("/changePassword", authenticateToken, authController.changePassword);

module.exports = router;



// Route pour mettre à jour un utilisateur (par exemple, changer le mot de passe ou autres informations)
/*router.patch('/users/:id', (req, res) => {
    authController.updateUser(userId, { nom, prenom, telephone, email, password }, res);
});*/