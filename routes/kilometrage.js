const express = require('express');
const router = express.Router();
const kilometrageController = require('../controllers/kilometrage');

// Get all kilometrage records
router.get('/', kilometrageController.list);

// Get kilometrage record by ID
router.get('/:id', kilometrageController.show);

// Create new kilometrage record
router.post('/', kilometrageController.create);

// Update kilometrage record
router.put('/:id', kilometrageController.update);

// Delete kilometrage record
router.delete('/:id', kilometrageController.delete);

// Get total kilometrage for a specific vehicle
router.get('/vehicle/:vehiculeId', kilometrageController.getVehicleTotal);

router.get('/vehicule/:numparc', kilometrageController.getKilometrageByNumparc);

module.exports = router;