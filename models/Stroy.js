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
  videoURL: {
    type: String
  },
  name: {
    type: String,
    required: name
  },
  avatar: {
    type: String,
    required: true
  },
  likes: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "users"
      }
    }
  ],
  date: {
    type: Date,
    default: Date.now()
  }
});

module.exports = Stories = mongoose.model("stories", StorySchema);
