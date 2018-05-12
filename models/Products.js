const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductsSchema = new Schema({
  name: {
    type: String,
    required: true,
    max: 30
  },
  facePath: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    required: true,
    max: 200
  },
  imgPaths: {
    type: [String],
    required: true
  },
  rank: {
    type: Number,
    default: 0
  },
  date: {
    type: String,
    default: Date.now
  }
});

module.exports = Products = mongoose.model("products", ProductsSchema);
