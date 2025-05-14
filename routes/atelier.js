const express = require("express");
const router = express.Router();

const atelierController = require("../controllers/atelier");

router.get('/', async (req, res) => {
    await atelierController.list(req, res);
});

router.get('/:id_atelier', async (req, res) =>{
    await atelierController.show(req, res);
});

router.post('/', async (req, res) => {
    await atelierController.create(req, res);
});

router.put('/:id_atelier', async (req, res) => {
    await atelierController.update(req, res);
});

router.delete('/:id_atelier', async (req, res) => {
    await atelierController.delete(req, res);
});

module.exports = router;