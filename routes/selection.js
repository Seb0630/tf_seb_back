var express = require('express');
var router = express.Router();

// Require controller module.
var selection_controller = require('../controllers/selectionController');

router.post('/selections', selection_controller.selections);
router.post('/create', selection_controller.create);
router.get('/clients', selection_controller.clients)

module.exports = router;