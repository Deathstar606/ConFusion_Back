const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GiftSchema = new Schema({
  /* name: { type: String, required: true }, */
  email: { type: String, required: true },
  value: { type: Number, required: true },
  quantity: { type: Number, required: true },
  phoneNumber: { type: String, required: true },
  total: { type: Number, required: true },
  payment_stat: { type: Boolean, default: false, required: true },
  transaction_id: { type: String, required: true }
}, { timestamps: true });

const Gift = mongoose.model('Gift', GiftSchema);
module.exports = Gift;