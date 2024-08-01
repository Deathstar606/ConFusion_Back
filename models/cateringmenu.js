const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CaterMenuSchema = new Schema({
  image: { type: String, required: true },
  description: { type: String, required: true },
}, { timestamps: true });

const CaterMenu = mongoose.model('CaterMenu', CaterMenuSchema);
module.exports = CaterMenu;