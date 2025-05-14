// routes/conStatistiqueRoutes.js
const express = require('express');
const router = express.Router();
const conStatistique = require('../controllers/conStatistique');

// Route pour récupérer la consommation par véhicule et mois
router.get('/:numparc', conStatistique.totalConsomationByVehiculeAndMonth);

module.exports = router;