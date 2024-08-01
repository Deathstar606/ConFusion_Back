const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CaterOrderSchema = new Schema({
  caterId: { type: String, required: true },
  people: { type: Number, required: true },
  phoneNumber: { type: String, required: true },
  email: { type: String, required: true },
}, { timestamps: true });

const CaterOrder = mongoose.model('CaterOrder', CaterOrderSchema);
module.exports = CaterOrder;