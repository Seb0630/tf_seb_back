const mongoose = require("mongoose");
// create new Schema for Product
const QuestionSchema = new mongoose.Schema({
  toolId: Number,
  questionId: Number,
  content : String,
  displayId : Number,
  options: {
    type: Array,
    'default' : []
  }
});

const Question = mongoose.model("Question", QuestionSchema);
// create Question model from Question schema

module.exports = Question;