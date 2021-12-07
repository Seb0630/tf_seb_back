var express = require('express');
var router = express.Router();

// Require controller module.
var muse_controller = require('../controllers/museController');

router.post('/words', muse_controller.words);
router.get('/word/:word_content/create', muse_controller.create);
router.get('/word/:word_content/delete', muse_controller.delete);


module.exports = router;