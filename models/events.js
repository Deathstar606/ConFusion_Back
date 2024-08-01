const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EventSchema = new Schema({
  image: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  action: {type: Boolean}
}, { timestamps: true });

const Event = mongoose.model('Event', EventSchema);
module.exports = Event;