const mongoose = require("mongoose");
// create new Schema for Product
const SelectionSchema = new mongoose.Schema({
  toolId: Number,
  username : String,
  selection: Object
},{
  timestamps : true
});

const Selection = mongoose.model("Selection", SelectionSchema);
// create Selection model from Selection schema

module.exports = Selection;