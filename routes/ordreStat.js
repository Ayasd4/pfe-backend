const express = require("express");
const router = express.Router();
const ordreStatController = require('../controllers/ordreStat');

router.get('/ordreOuvert', async (req, res)=>{
    await ordreStatController.countOrdreOuvert(req, res);
});

router.get('/ordreEnCours', async (req, res)=>{
    await ordreStatController.countOrdreEnCours(req, res);
});

router.get('/ordreFerme', async (req, res)=>{
    await ordreStatController.countOrdreFermé(req, res);
});

router.get('/totalDispoOuvert', async (req, res)=>{
    await ordreStatController.dispoOrderOuvert(req, res);
});

router.get('/totalDispoEnCours', async (req, res)=>{
    await ordreStatController.dispoOrderEnCours(req, res);
});

router.get('/totalDispoFerme', async (req, res)=>{
    await ordreStatController.dispoOrderFermé(req, res);
});

module.exports = router;