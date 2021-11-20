var express = require('express');
var router = express.Router();

// Require controller module.
var question_controller = require('../controllers/questionController');

router.post('/questions', question_controller.questions);
router.post('/create', question_controller.create);
router.post('/delete', question_controller.delete);
router.post('/reorder', question_controller.reorder);

module.exports = router;