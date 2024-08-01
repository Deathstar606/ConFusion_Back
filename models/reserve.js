const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ResSchema = new Schema({
  people: { type: String, default: '', required: true },
  date: { type: String, default: '', required: true },
  time: { type: String, required: true },
  email: { type: String, required: true },
  payment_stat: {type: Boolean, default: false, required: true},
  transaction_id: {type: String, required: true}
}, { timestamps: true })

const Reservation = mongoose.model('Reservation', ResSchema);
module.exports = Reservation;