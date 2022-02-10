const mongoose = require("mongoose");
// create new Schema for Group
const GroupSchema = new mongoose.Schema({
  sign : String,
  alpha : String,
  groupName : String,
  words: Array
},{
  timestamps : false
});

const Group = mongoose.model("Group", GroupSchema);
// create Group model from Group schema

module.exports = Group;