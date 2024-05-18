const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const menuItemSchema = new Schema({
  label: { type: String, default: '' },
  featured: { type: Boolean, default: false },
  name: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  description: { type: String, required: true },
  ingreds: { type: String, required: true },
}, { timestamps: true });

const DishSchema = new Schema({
  name: { type: String, required: true },
  items: [menuItemSchema]
});

const Dish = mongoose.model('Dish', DishSchema);
module.exports = Dish;