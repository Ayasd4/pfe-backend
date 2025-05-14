const express = require("express");
const router = express.Router();
const agenceController = require('../controllers/agence');

router.post('/', agenceController.create);
router.get('/', agenceController.list);
router.get('/:id_agence', agenceController.show); // Correction de la route
router.put('/:id_agence', agenceController.update);
router.delete('/:id_agence', agenceController.delete);

module.exports = router;
