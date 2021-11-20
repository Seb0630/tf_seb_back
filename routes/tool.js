var express = require('express');
var router = express.Router();

// Require controller module.
var tool_controller = require('../controllers/toolController');

router.get('/tools', tool_controller.tools);
router.post('/create', tool_controller.create);
router.post('/delete', tool_controller.delete);

module.exports = router;