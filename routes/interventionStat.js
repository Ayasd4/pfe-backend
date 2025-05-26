const express = require("express");
const router = express.Router();
const intervStatController = require("../controllers/interventionStat");

router.get('/electrique', async (req, res)=>{
    await intervStatController.electStat(req, res);
});

router.get('/mecanique', async (req, res)=>{
    await intervStatController.mecanStat(req, res);
});

router.get('/volcanisation', async (req, res)=>{
    await intervStatController.volcaStat(req, res);
});

router.get('/moteur', async (req, res)=>{
    await intervStatController.moteurStat(req, res);
});

router.get('/tolerie', async (req, res)=>{
    await intervStatController.tolerieStat(req, res);
});

router.get('/preventive', async (req, res)=>{
    await intervStatController.prevStat(req, res);
});

module.exports = router;