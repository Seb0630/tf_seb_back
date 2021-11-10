const mongoose = require("mongoose");
// create new Schema for Question
const AdviceSchema = new mongoose.Schema({
  advice_id: Number,
  advice_content: String,
  advice_color : String,
  scenario_id : Number,
  eda_value : Number
});

const Advice = mongoose.model("Advice", AdviceSchema);
// create Advice model from Advice schema

module.exports = Advice;