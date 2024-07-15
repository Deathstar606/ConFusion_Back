const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const HomeSchema = new Schema({
  name: { type: String, required: true, default: "" },
  header: { type: String, default: "" },
  description: { type: String, default: "" },
  action: { type: String, default: "" },
  image: { type: String, default: "" },
}, { timestamps: true });

const Home = mongoose.model('Home', HomeSchema);
module.exports = Home;