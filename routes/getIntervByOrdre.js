const express = require("express");
const router = express.Router();
const intervByOrdreController = require("../controllers/getIntervByOrdre");

router.get('/:id_ordre', async (req, res) => {
    await intervByOrdreController.getIntervById(req, res);
});

module.exports = router;