const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ResSeatSchema = new Schema({
  image: { type: String, required: true },
  seat_value: { type: Number, required: true }
}, { timestamps: true });

const ResSeat = mongoose.model('ResSeat', ResSeatSchema);
module.exports = ResSeat;