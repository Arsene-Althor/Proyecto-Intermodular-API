// Rutas para reservas
const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const { requireLogin, requireRole } = require('../middleware/authMiddleware');

// Todas requieren estar autenticado
//router.use(requireLogin);

//Faltan Roles
// Añadir Reserva
router.post('/add',requireLogin, reservationController.addReservation);

// Eliminar y modificar reserva
router.post('/cancel', reservationController.cancelReservation);
router.put('/update', reservationController.updateReservation);

// Obtener reservas
router.get('/one',reservationController.getReservation);
router.get('/all', reservationController.getAllReservations);
router.get('/allActive', reservationController.getActiveReservations);

module.exports = router;