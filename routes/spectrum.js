var express = require('express');
var router = express.Router();

// Require controller module.
var spectrum_controller = require('../controllers/spectrumController');

router.post('/spectrums', spectrum_controller.spectrums);
router.post('/create', spectrum_controller.create);
router.post('/delete', spectrum_controller.delete);
router.post('/labels', spectrum_controller.labels);

module.exports = router;