// models/Item.js
const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  code: { type: String, unique: true, required: true },
  description: { type: String, required: true },
  stock: { type: Number, default: 0, min: 0 },
  obsolete: { type: Boolean, default: false }
});

const Item = mongoose.model('Item', itemSchema);
module.exports = Item;
