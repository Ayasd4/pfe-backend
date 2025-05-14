const express = require("express");
const router = express.Router();
const statusController = require("../controllers/updateStatus");

router.put('/:id_demande' ,async (req, res)=>{
    await statusController.update(req, res);
});

module.exports = router;