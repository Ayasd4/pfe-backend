const express = require("express");
const router = express.Router();
const infosIntervController = require('../controllers/getInfoIntervention');

router.get('/ordre', async (req, res) => {
    await infosIntervController.getAllOrdre(req, res);
});

router.get('/technicien', async (req, res) => {
    await infosIntervController.getAllTechnicien(req, res);
});

router.get('/atelier', async (req, res) => {
    await infosIntervController.getAllAtelier(req, res);
});

module.exports = router;
