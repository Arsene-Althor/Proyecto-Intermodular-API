// index.js
//Modificacion 3
const express = require('express');
const session = require('express-session');
const authRoutes = require('./routes/authRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const roomRoutes = require('./routes/roomRoutes')
const dbConnection = require('./db');
require('dotenv').config();

const app = express();

// Middlewares básicos
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Sesión (almacenada en memoria)
app.use(session({
  secret: 'secreto-examen',
  resave: false,
  saveUninitialized: false
}));

dbConnection();

// Rutas
app.use('/auth', authRoutes);
app.use('/reservation',reservationRoutes)
app.use('/room',roomRoutes) //RUTAS DEFINIDAS Y FUNCIONALES, FALTAN DEFINIR BIEN ROLES
//app.use('/user',userRoutes)


// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en ${PORT}`);
});
