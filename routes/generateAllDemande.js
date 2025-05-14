const express = require("express");
const router = express.Router();
const generateController = require("../controllers/generateAllDemande");

router.get('/', async (req, res) => {
    await generateController.genrateAllDemandes(req, res);
});

module.exports = router;