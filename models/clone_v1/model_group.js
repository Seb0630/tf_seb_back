const mongoose = require("mongoose");
// create new Schema for Group
const GroupSchema = new mongoose.Schema({
  groupName : String,
  words: Array
},{
  timestamps : false
});

const Group = mongoose.model("Group", GroupSchema);
// create Group model from Group schema

module.exports = Group;