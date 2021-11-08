var changeCase = require('change-case');
const Product = require('../models/model_product');


// Display list of all products.
exports.products = async function(req, res) {
    try {
        const products = await Product.find({}).select({});
        res.send(products);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.product = async function(req, res) {
    try {
        const products = await Product.find({}).select({}).lean();
        const product = products.find((_product) => changeCase.paramCase(_product.name) === req.params.name);
        res.send(product);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.create = async function(req, res) {
    try {
    //    const random_id = Math.floor(Math.random() * (10000 - 1000 + 1)) + 1000;
        const products = await Product.find({}).select({}).lean();

        var body_values = req.body;
        body_values.id = products.length + 1;
        body_values.cover = "/static/mock-images/products/product_23.jpg";
        body_values.status = "sale";
        body_values.inventoryType = "in_stock";
        body_values.images = ["/static/mock-images/products/product_1.jpg"];
        
        const new_product = new Product(body_values);
        const product = await new_product.save();

        res.send(product);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.edit = async function(req, res) {
    try {
        const product = await Product.findOneAndUpdate({id : req.body.id}, req.body, {
            new: true
        });
        res.send(product);
    } catch (error) {
        res.status(500).send(error);
    }
};


