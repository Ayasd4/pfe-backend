const express = require("express");
const router = express.Router();

const diagnosticControllers = require("../controllers/diagnostic");

router.get('/', async (req, res) => {
    if (Object.keys(req.query).length > 0) {
        await diagnosticControllers.search(req, res);
    } else {
        await diagnosticControllers.list(req, res);
    }
});

router.get('/search/numparc/:numparc', async (req, res)=>{
    //req.query.numparc = req.params.numparc;
    //req.query.matricule_chauf = req.params.matricule_chauf;
    await diagnosticControllers.search(req, res);
});

router.get('/:id_diagnostic', async (req, res) => {
    await diagnosticControllers.show(req, res);
});

router.post('/', async (req, res) => {
    await diagnosticControllers.create(req, res);
});

router.put('/:id_diagnostic', async (req, res) => {
    await diagnosticControllers.update(req, res);
});

router.delete('/:id_diagnostic', async (req, res) => {
    await diagnosticControllers.delete(req, res);
});


module.exports = router;