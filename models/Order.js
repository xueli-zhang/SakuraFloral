const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  productName: {
    type: String,
    required: true,
    max: 30
  },
  orderNum: {
    type: String,
    required: true
  },
  clientNum: {
    type: String,
    required: true,
    max: 200
  },
  date: {
    type: String,
    default: Date.now
  }
});

module.exports = Order = mongoose.model("orders", OrderSchema);
