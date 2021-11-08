var express = require('express');
var router = express.Router();

// Require controller module.
var product_controller = require('../controllers/productController');

router.get('/all_products', product_controller.products);
router.get('/product_detail/:name', product_controller.product);
router.post('/create', product_controller.create);
router.post('/edit', product_controller.edit);

module.exports = router;