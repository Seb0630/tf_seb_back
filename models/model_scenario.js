const mongoose = require("mongoose");
// create new Schema for Question
const ScenarioSchema = new mongoose.Schema({
  scenario_id: Number,
  scenario_content: String
});

const Scenario = mongoose.model("Scenario", ScenarioSchema);
// create Advice model from Advice schema

module.exports = Scenario;