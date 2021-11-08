const mongoose = require("mongoose");
// create new Schema for Product
const ProductSchema = new mongoose.Schema({
  id: Number,
  cover: String,
  images : Array,
  name : String,
  code : String,
  sku : String,
  tags: Array,
  price : Number,
  priceSale : Number,
  totalRating : Number,
  totalReview : Number,
  ratings : Array,
  reviews : Array,
  colors : Array,
  status : String,
  inventoryType : String,
  sizes : Array,
  available : Number,
  description : String,
  sold : Number,
  category : String,
  gender : String,
  taxes: Boolean
},{
  timestamps : true
});

const Product = mongoose.model("Product", ProductSchema);
// create Product model from Product schema

module.exports = Product;