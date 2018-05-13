const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StorySchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "users"
  },
  text: {
    type: String,
    required: true
  },
  demoPaths: {
    type: [String]
  },
  videoUrl: {
    type: String
  },
  name: {
    type: String
  },
  avatar: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now()
  }
});

module.exports = Stories = mongoose.model("stories", StorySchema);
