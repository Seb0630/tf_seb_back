const mongoose = require("mongoose");
// create new Schema for Question
const AdviceSchema = new mongoose.Schema({
    toolId: Number,
    adviceId: Number,
    title: String,
    content: String,
    color : String,
    links : Array
});

const AdviceCloneV1 = mongoose.model("AdviceCloneV1", AdviceSchema, "Clone_Advices");
// create Advice model from Advice schema

module.exports = AdviceCloneV1;