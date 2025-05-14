const express = require("express");
const router = express.Router();
const technicienController = require("../controllers/technicien");

router.get('/', async (req, res) => {
    await technicienController.list(req, res);
});

router.get('/:id_technicien', async (req, res) =>{
    await technicienController.show(req, res);
});

router.post('/', async (req, res) => {
    await technicienController.create(req, res);
});

router.put('/:id_technicien', async (req, res) => {
    await technicienController.update(req, res);
});

router.delete('/:id_technicien', async (req, res) => {
    await technicienController.delete(req, res);
});


module.exports = router;