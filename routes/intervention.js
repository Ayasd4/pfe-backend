const express = require("express");
const router = express.Router();
const interventionController = require("../controllers/intervention");

router.get('/generatePdf/:id_intervention', async (req, res)=>{
    await interventionController.generatePdf(req, res);
})

// Get all fuel consumption records
router.get('/', async (req, res) => {
    // If search parameters are provided, use search function
    if (Object.keys(req.query).length > 0) {
        await interventionController.search(req, res);
    } else {
        await interventionController.list(req, res);
    }
});

router.get('/search/numparc/:numparc', async (req, res)=>{
    //req.query.numparc = req.params.numparc;
    //req.query.matricule_chauf = req.params.matricule_chauf;
    await demandesController.search(req, res);
});

router.get('/:id_intervention', async (req, res) => {
    await interventionController.show(req, res);
});

router.post('/', async (req, res) => {
    await interventionController.create(req, res);
});

router.put('/:id_intervention', async (req, res) => {
    await interventionController.update(req, res);
});

router.delete('/:id_intervention', async (req, res) => {
    await interventionController.delete(req, res);
});

router.get('/ordre/:nom_travail', interventionController.getOrdreByTravaux);
router.get('/technicien/:matricule_techn', interventionController.getTechnicienByMatricule);
router.get('/atelier/:nom_atelier', interventionController.getAtelierByNom);


module.exports = router;