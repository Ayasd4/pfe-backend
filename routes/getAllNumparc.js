const express = require("express");
const router = express.Router();
const numparcController = require('../controllers/getAllNumparc');

//router.get('/', numparcController.getAllNumparc);
router.get('/',  async (req, res)=>{
    await numparcController.getAllNumparc(req, res);
})

module.exports = router;
