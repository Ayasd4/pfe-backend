const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploads');

router.get('/', uploadController.listUploads);

module.exports = router;
