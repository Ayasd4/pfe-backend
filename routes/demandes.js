const express = require("express");
const router = express.Router();
const demandesController = require("../controllers/demandes");

/*router.get('/', async (req, res) => {
    await demandesController.list(req, res);
});*/

// Get all fuel consumption records
router.get('/', async (req, res) => {
    // If search parameters are provided, use search function
    if (Object.keys(req.query).length > 0) {
        await demandesController.search(req, res);
    } else {
        await demandesController.list(req, res);
    }
});

router.get('/:id_demande', async (req, res) => {
    await demandesController.show(req, res);
});

router.get('/getDemande/:id_demande', async (req, res)=>{
    await demandesController.getDemande(req, res);
});

router.get('/search/numparc/:numparc', async (req, res)=>{
    //req.query.numparc = req.params.numparc;
    //req.query.matricule_chauf = req.params.matricule_chauf;
    await demandesController.search(req, res);
});

router.post('/', async (req, res) => {
    await demandesController.create(req, res);
});

router.put('/:id_demande', async (req, res) => {
    await demandesController.update(req, res);
});

router.delete('/:id_demande', async (req, res) => {
    await demandesController.delete(req, res);
});

router.get('/vehicule/:numparc', demandesController.getVehiculeByNumparc);
router.get('/chauffeur/:nom', demandesController.getChauffeurByNom);

router.get('/generatePdf/:id_demande', async (req, res) => {
    await demandesController.generatePdf(req, res);
});


module.exports = router;