// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true }, // hash
  role: { type: String, enum: ['compras', 'ventas'], required: true }
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function (plain) {
  const res = await bcrypt.compare(plain, this.password);
  return res;
};



const User = mongoose.model('User', userSchema);
module.exports = User;
