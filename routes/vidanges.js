const express = require("express");
const router = express.Router();
const vidangeController = require("../controllers/vidange");
router.get('/generateRapport', async (req, res) => {
    await ordreController.generateRapport(req, res);
});

router.get('/', async (req, res) => {
    if (Object.keys(req.query).length > 0) {
        await vidangeController.search(req, res);
    } else {
        await vidangeController.list(req, res);
    }
});

router.get('/:id_vd', async (req, res) => {
    await vidangeController.show(req, res);
});

router.post('/', async (req, res) => {
    await vidangeController.create(req, res);
});

router.put('/:id_vd', async (req, res) => {
    await vidangeController.update(req, res);
});

router.delete('/:id_vd', async (req, res) => {
    await vidangeController.delete(req, res);
});

//router.get('/vehicule', vidangeController.getAllVehicule);


module.exports = router;