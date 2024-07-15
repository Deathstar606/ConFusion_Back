const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String },
  address: { type: String, required: true },
  email: { type: String, required: true },
  order_type: { type: String, required: true },
  order_stat: { type: Boolean, default: false },
  phoneNumber: { type: String, required: true },
  total: { type: Number, required: true },
  payment_stat: { type: Boolean, default: false, required: true },
  transaction_id: { type: String, required: true },
  items: []
}, { timestamps: true });

const Order = mongoose.model('Order', OrderSchema);
module.exports = Order;