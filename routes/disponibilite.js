const express = require("express");
const router = express.Router();
const dispoController = require('../controllers/disponibilite');

router.get('/en_service', async (req, res)=>{
    await dispoController.vehiculeEnService(req, res);
});

router.get('/en_maintenance', async (req, res)=>{
    await dispoController.vehiculeEnMaintenance(req, res);
});

router.get('/en_panne', async (req, res)=>{
    await dispoController.vehiculeEnPanne(req, res);
});

router.get('/totalDispoService', async (req, res)=>{
    await dispoController.dispoVehiculeEnService(req, res);
});

router.get('/totalDispoMaint', async (req, res)=>{
    await dispoController.dispoVehiculeEnMaintenance(req, res);
});

router.get('/totalDispoPanne', async (req, res)=>{
    await dispoController.dispoVehiculeEnPanne(req, res);
});

module.exports = router;