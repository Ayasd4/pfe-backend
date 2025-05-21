const express = require("express");
const router = express.Router();
const detailsController = require("../controllers/detailsOrder")

router.get('/:id_ordre', async (req, res) => {
    await detailsController.getDetailsOrder(req, res);
})


module.exports = router;