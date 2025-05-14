const express = require("express");
const router = express.Router();
const maintenanceController = require("../controllers/maintenance");

router.get('/', async (req, res) => {
    await maintenanceController.list(req, res);
});

module.exports= router;