const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const HeadSchema = new Schema({
  image: { type: String, required: true },
  head: { type: String, required: true },
  subhead: { type: String, required: true },
  action: { type: String, required: true }
}, { timestamps: true });

const Head = mongoose.model('Head', HeadSchema);
module.exports = Head;