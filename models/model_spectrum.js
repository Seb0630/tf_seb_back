const mongoose = require("mongoose");
// create new Schema for Question
const SpectrumSchema = new mongoose.Schema({
  row_id : Number,
  spectrum_title : String,
  scenario_id : Number,
  label_m_100 : String,
  label_m_50 : String,
  label_0 : String,
  label_p_50 : String,
  label_p_100 : String
});

const Spectrum = mongoose.model("Spectrum", SpectrumSchema);
// create Spectrum model from Spectrum schema

module.exports = Spectrum;