const express = require("express");
const router = express.Router();
const nameController = require('../controllers/getAllName');

//router.get('/', numparcController.getAllNumparc);
router.get('/',  async (req, res)=>{
    await nameController.getAllName(req, res);
})

module.exports = router;
