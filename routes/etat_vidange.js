const express = require("express");
const router = express.Router();
const etatVdController = require("../controllers/etat_vidange");

router.get('/generateRapport', async (req, res) => {
    await etatVdController.generateRapport(req, res);
});

router.get('/', async (req, res) => {
    await etatVdController.list(req, res);
});

router.get('/:id_vidange', async (req, res) => {
    await etatVdController.show(req, res);
});

router.post('/', async (req, res) => {
    await etatVdController.create(req, res);
});


router.put('/:id_vidange', async (req, res) => {
    await etatVdController.update(req, res);
});


router.delete('/:id_vidange', async (req, res) => {
    await etatVdController.delete(req, res);
});

//router.get('/getVehicule', etatVdController.getNumparc);


module.exports = router;