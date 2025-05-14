
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin");

// Route pour créer un administrateur
router.post('/', async (req, res) => {
    await adminController.create(req, res);
});

// Route pours lister tous les administrateurs
router.get('/', async (req, res) => {
    await adminController.list(req, res);
});

// Route pour afficher un administrateur par ID
router.get('/:id', async (req, res) => {
    await adminController.show(req, res);
});

// Route pour mettre à jour un administrateur par ID
router.put('/:id', async (req, res) => {
    await adminController.update(req, res);
});

// **Nouvelle route pour supprimer un administrateur par ID**
router.delete('/:id', async (req, res) => {
    await adminController.delete(req, res);
});

module.exports = router;
