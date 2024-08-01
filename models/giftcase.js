const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GiftCaseSchema = new Schema({
  image: { type: String, required: true },
  card_value: { type: Number, required: true },
  purchase_value: { type: Number, required: true }
}, { timestamps: true });

const GiftCase = mongoose.model('GiftCase', GiftCaseSchema);
module.exports = GiftCase;