// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

function requireLogin(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if(!token) return res.status(401).json({ error: 'Acceso denegado. Debes iniciar sesión.' });

  try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();

  }catch(error){
    res.status(403).json({ error: 'Token inválido o expirado' });
  }

}

//Falta implementar require role
function requireRole(role) {
  return (req, res, next) => {
    if (!req.session.user || req.session.user.role !== role) {
      return res.status(403).json({ error: 'No tienes permisos' });
    }
    next();
  };
}

module.exports = { requireLogin, requireRole };
