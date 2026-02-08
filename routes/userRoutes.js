//routes/authRoutes.js
const express = require('express');
const router = express.Router();
const {registroUser, addEmployee, getAllUsers, removeUsers, modifyUser, updateDiscount} = require ('../controllers/userController.js');
const {requireLogin, requireRole, requireOwnerOrAdmin} = require('../middleware/authMiddleware.js');

//Ruta publica, no necesita autenticar
router.post('/register', registroUser);

//Protegidas (requiere que se logueen)
router.post('/add', requireLogin, requireRole(['employee','admin','client']), addEmployee); //POST /api/users/add (solo admin)

router.get('/get', requireLogin, getAllUsers); //GET /api/users/get (solo usuarios logueados)

router.patch('/modify/:userId', requireLogin, requireOwnerOrAdmin, modifyUser); // PATCH /api/users/modif/:userId

router.delete('/remove/:userId', requireLogin, requireRole(['admin', 'employee']), removeUsers); // DELETE /api/users/remove/:userId

router.patch('/update/:userId', requireLogin, requireRole(['admin', 'employee']), updateDiscount); // PATCH /api/users/update/:userId

module.exports = router;
