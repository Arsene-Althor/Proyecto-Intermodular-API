// controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcrypt');


async function login(req, res) {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });

    req.session.user = { id: user._id, username: user.username, role: user.role };
    res.json({ message: 'Login correcto', role: user.role });
  } catch (err) {
    res.status(500).json({ error: 'Error en login', detalle: err.message });
  }
}

function logout(req, res) {
  req.session.destroy(() => {
    res.json({ message: 'Sesión cerrada' });
  });
}

module.exports = { login, logout };
