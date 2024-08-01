const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LocalSchema = new Schema({
  name: { type: String, required: true },
  iframe: { type: String, required: true }
}, { timestamps: true });

const Location = mongoose.model('Location', LocalSchema);
module.exports = Location;