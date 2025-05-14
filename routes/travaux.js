const express = require("express");
const router = express.Router();
const travauxController = require("../controllers/travaux");

router.get('/', async (req, res) => {
    await travauxController.list(req, res);
});

router.get('/:id_travaux', async (req, res) => {
    await travauxController.show(req, res);
});

module.exports = router;
