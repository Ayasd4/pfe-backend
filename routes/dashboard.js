const express = require("express");
const router = express.Router();
const dashboardController = require('../controllers/dashboard');

router.get('/vehicules', async (req, res)=>{
    await dashboardController.countVehicle(req, res);
});

router.get('/chauffeur', async (req, res)=>{
    await dashboardController.countDriver(req, res);
});

router.get('/technicien', async (req, res)=>{
    await dashboardController.countTechnician(req, res);
});

router.get('/atelier', async (req, res)=>{
    await dashboardController.countAtelier(req, res);
});

router.get('/ordre', async (req, res)=>{
    await dashboardController.countOrders(req, res);
});

module.exports = router;