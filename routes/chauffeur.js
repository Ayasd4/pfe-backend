const express = require("express");
const router = express.Router();
const chauffeurController = require('../controllers/chauffeur');

router.post('/', async(req, res)=>{
    await chauffeurController.create(req, res);
});

router.get('/', async(req, res) => {
    await chauffeurController.list(req, res);
});

 router.get('/:id_chauf', async (req, res) => {
    await chauffeurController.show(req, res);
 });

 router.put('/:id_chauf', async (req,res) => {
    await chauffeurController.update(req,res);
 });

 router.delete('/:id_chauf', async (req, res) => {
    await chauffeurController.delete(req, res);
});

module.exports = router;