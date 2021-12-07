const mongoose = require("mongoose");
// create new Schema for Stats
const StatsSchema = new mongoose.Schema({
  word : String,
  count: {
      type:Number,
      default : 0
  },
  sum_pos : {
    type:Number,
    default : 0
  }
});
StatsSchema.index({ word: 1, count: -1 });    //---Index----
const Stats = mongoose.model("Stats", StatsSchema);
// create Stats model from Stats schema

module.exports = Stats;