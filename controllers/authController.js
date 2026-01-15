// controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });
    
    const esCorrecta = await bcrypt.compare(password, user.password);
    if (!esCorrecta) return res.status(401).json({ error: 'Credenciales inválidas' });

    const token = jwt.sign(
      { user_id: user._id, email: user.email },
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );

    res.json({
      mensaje: '¡Bienvenido!',
      token: token
    });

  } catch (err) {
    res.status(500).json({ error: 'Error en login', detalle: err.message });
  }
}

module.exports = { login } ;
