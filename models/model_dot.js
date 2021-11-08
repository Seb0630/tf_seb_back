const mongoose = require("mongoose");
// create new Schema for Question
const DotSchema = new mongoose.Schema({
  id: Number,
  size: String,
  color: String,
  bg_color : String,
  position: Number,
  label: Number,
  row: Number,
  advice_id : Number,
  scenario_id : Number
});

const Dot = mongoose.model("Dot", DotSchema);
// create Dot model from Dot schema

module.exports = Dot;