// Rutas para reservas
const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const { requireLogin, requireRole } = require('../middleware/authMiddleware');

// Todas requieren estar autenticado
router.use(requireLogin);

// Añadir Reserva
router.post('/add', requireRole('cliente'), reservationController.addReservation);

// Eliminar y modificar reserva
router.post('/delete', requireRole('admin'), reservationController.deleteReservation);
router.put('/update', requireRole('admin'), reservationController.updateReservation);

// Obtener reservas
router.get('/reservation/:_id',requireRole("admin"), reservationController.getReservation);
router.get('/allreservations', reservationController.getAllReservations);

module.exports = router;