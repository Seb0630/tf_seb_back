const mongoose = require("mongoose");
// create new Schema for Tool
const ToolSchema = new mongoose.Schema({
  toolId : Number,
  content: String
});

const Tool = mongoose.model("Tool", ToolSchema);
// create Tool model from Tool schema

module.exports = Tool;