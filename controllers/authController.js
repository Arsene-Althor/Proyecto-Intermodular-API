// controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 * Login del usuario
 * POST /api/auth/login
 * Body: { email, password }
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password){
      return res.status(400).json({
        error: 'Email y contraseña son obligatorios'
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user){
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    const esCorrecta = await bcrypt.compare(password, user.password);

    if (!esCorrecta) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    //Validamos si el usuario esta activo
    if (!user.isActive){
      return res.status(403).json({
        error: 'Usuario desactivado'
      });
    }

    const token = jwt.sign(
      { user_id: user.user_id,
        email: user.email,
        role: user.role,
        isVIP: user.isVIP
      },
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      mensaje: '¡Bienvenido!',
      token: token,
      user: {
        user_id: user.user_id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

  } catch (err) {
    res.status(500).json({ error: 'Error en login', detalle: err.message });
  }
}

async function logout(req, res){
  try{
    //Borramos la sesión del servidor
    req.session.destroy((err) => {

      if (err){
        return res.status(500).json({error: 'No se pudo cerrar la sesión'});
      }

      return res.status(200).json({message: 'Sesión cerrada correctamente'});
    });
  } catch (err){
    res.status(500).json({error: 'Error al cerrar sesión', detalle: err.message});
  }
}

module.exports = { login, logout};