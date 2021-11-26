var express = require('express');
var router = express.Router();

// Require controller module.
var advice_controller = require('../controllers/adviceController');

router.post('/advices', advice_controller.advices);
router.post('/create', advice_controller.create);
router.post('/delete', advice_controller.delete);

module.exports = router;