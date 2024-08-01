const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TicSchema = new Schema({
  email: { type: String, required: true },
  payment_stat: {type: Boolean, default: false, required: true},
  transaction_id: {type: String, required: true}
}, { timestamps: true })

const Ticket = mongoose.model('Ticket', TicSchema);
module.exports = Ticket;