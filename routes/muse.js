var express = require('express');
var router = express.Router();

// Require controller module.
var muse_controller = require('../controllers/museController');

router.post('/words', muse_controller.words);
router.get('/word/:word_content/create', muse_controller.create);
router.get('/word/:word_content/delete', muse_controller.delete);
router.get('/groupwords/:groupId', muse_controller.groupwords);
router.get('/groups', muse_controller.groups);
router.get('/grouplist', muse_controller.grouplist);
router.post('/updateGroup', muse_controller.updateGroup);
router.post('/checkindexed', muse_controller.checkindexed);


module.exports = router;