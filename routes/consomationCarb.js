const express = require("express");
const router = express.Router();
const consomationCarbController = require("../controllers/consomationCarb");

// Get all fuel consumption records
router.get('/', async (req, res) => {
    // If search parameters are provided, use search function
    if (Object.keys(req.query).length > 0) {
        await consomationCarbController.search(req, res);
    } else {
        await consomationCarbController.list(req, res);
    }
});

// Search fuel consumption records by numPark
router.get('/search/numpark/:numPark', async (req, res) => {
    req.query.numPark = req.params.numPark;
    await consomationCarbController.search(req, res);
});

// Export fuel consumption records to PDF
router.get('/export/pdf', async (req, res) => {
    await consomationCarbController.exportToPdf(req, res);
});

// Get fuel consumption record by ID
router.get('/:idConsomation', async (req, res) => {
    await consomationCarbController.show(req, res);
});

// Create new fuel consumption record
router.post('/', async (req, res) => {
    await consomationCarbController.create(req, res);
});

// Update fuel consumption record
router.put('/:idConsomation', async (req, res) => {
    await consomationCarbController.update(req, res);
});

// Delete fuel consumption record
router.delete('/:idConsomation', async (req, res) => {
    await consomationCarbController.delete(req, res);
});

module.exports = router;