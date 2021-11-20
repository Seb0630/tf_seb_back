const mongoose = require("mongoose");
// create new Schema for Question
const SpectrumSchema = new mongoose.Schema({
    toolId : Number,
    spectrumId : Number,
    content : String,
    label_m_100 : String,
    label_m_50 : String,
    label_0 : String,
    label_p_50 : String,
    label_p_100 : String
});

const SpectrumCloneV1 = mongoose.model("SpectrumCloneV1", SpectrumSchema, "Rules_Spectrums");
// create Spectrum model from Spectrum schema

module.exports = SpectrumCloneV1;