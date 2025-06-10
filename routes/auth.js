const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const authenticateToken = require("../middleware/authMiddlewareAdmin");
const checkRole = require('../middleware/checkRole')

// Change to POST method for login
router.post("/login", authController.login);
router.post("/logout", authController.logout);

router.patch("/:id", authenticateToken, checkRole.checkRole, authController.updateAdmin);
router.get("/checkToken", authenticateToken, authController.checkToken);

module.exports = router;
