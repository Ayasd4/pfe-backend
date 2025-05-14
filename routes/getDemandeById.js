const express = require("express");
const router = express.Router();
const getdemandeController = require('../controllers/getDemandeById');

router.get('/:id_demande', async (req, res)=>{
    await getdemandeController.getDemandeById(req,res);
});

module.exports = router;