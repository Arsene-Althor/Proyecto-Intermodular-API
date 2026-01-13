// routes/stockRoutes.js
const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');
const { requireLogin, requireRole } = require('../middleware/authMiddleware');

// Todas requieren estar autenticado
router.use(requireLogin);

// COMPRAS
router.post('/add', requireRole('compras'), stockController.addStock);

// VENTAS
router.post('/exit', requireRole('ventas'), stockController.exitStock);
router.put('/obsolete/:code', requireRole('ventas'), stockController.setObsolete);

// COMPRAS y VENTAS (solo login)
router.get('/item/:code', stockController.getItem);
router.get('/items', stockController.getAllItems);

module.exports = router;

