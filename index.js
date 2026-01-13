// index.js
//Modificacion 3
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const stockRoutes = require('./routes/stockRoutes');

const app = express();

// Middlewares básicos
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Sesión (almacenada en memoria
app.use(session({
  secret: 'secreto-examen',
  resave: false,
  saveUninitialized: false
}));

// Conexión a MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/examen_stock')
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error MongoDB', err));

// Rutas
app.use('/auth', authRoutes);
app.use('/stock', stockRoutes);

// Puerto
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
