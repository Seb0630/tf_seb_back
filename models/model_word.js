const mongoose = require("mongoose");
// create new Schema for Word
const WordSchema = new mongoose.Schema({
  wordContent: String,
  relatedWordsGoogle: Array,
  relatedWordsWiki : Array
},
{
    timestamps : true
});

const Word = mongoose.model("Word", WordSchema);
// create Advice model from Advice schema

module.exports = Word;