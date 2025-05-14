const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Change to POST method for login
router.post("", authController.login);

module.exports = router;
