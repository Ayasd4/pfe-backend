const express = require("express");
const router = express.Router();
const ordreController = require("../controllers/ordre");

router.get('/generateRapport', async (req, res) => {
    await ordreController.generateRapport(req, res);
});

router.get('/generatePdf/:id_ordre', async (req, res)=>{
    await ordreController.generatePdf(req, res);
})

router.get('/', async (req, res) => {
    if (Object.keys(req.query).length > 0) {
        await ordreController.search(req, res);
    } else {
        await ordreController.list(req, res);
    }
});

router.get('/search/nom_atelier/:nom_atelier', async (req, res)=>{
    //req.query.numparc = req.params.numparc;
    //req.query.matricule_chauf = req.params.matricule_chauf;
    await ordreController.search(req, res);
});

router.get('/:id_ordre', async (req, res) => {
    await ordreController.show(req, res);
});

router.post('/', async (req, res) => {
    await ordreController.create(req, res);
});

router.put('/:id_ordre', async (req, res) => {
    await ordreController.update(req, res);
});

router.delete('/:id_ordre', async (req, res) => {
    await ordreController.delete(req, res);
});

router.put('/status/:id_ordre', async (req, res) => {
    await ordreController.updateStatus(req, res);
});

router.get('/diagnostic/:description_panne', ordreController.getDiagnosticByPanne);
router.get('/atelier/:nom_atelier', ordreController.getAtelierByNom);
router.get('/technicien/:matricule_techn', ordreController.getTechnicienByMatricule);
router.get('/travaux/:nom_travail', ordreController.getTravauxByNom);


module.exports = router;