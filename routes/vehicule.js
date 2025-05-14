const express = require("express");
const router = express.Router();
const vehiculeController = require("../controllers/vehicule");

router.get('/', async (req, res) => {
    await vehiculeController.list(req, res);
});

router.get('/:idvehicule', async (req, res) =>{
    await vehiculeController.show(req, res);
});

router.post('/', async (req, res) => {
    await vehiculeController.create(req, res);
});

router.put('/:idvehicule', async (req, res) => {
    await vehiculeController.update(req, res);
});

router.delete('/:idvehicule', async (req, res) => {
    await vehiculeController.delete(req, res);
});


module.exports = router;