const express = require("express");
const router = express.Router();
const getordreController = require('../controllers/getOrdreById');

router.get('/:id_ordre', async (req, res)=>{
    await getordreController.getOrdreById(req,res);
});

module.exports = router;