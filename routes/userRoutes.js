//routes/authRoutes.js
const express = require('express');
const router = express.Router();
const {registroUser, addEmployee, getAllUsers, removeUsers, modifyUser} = require ('../controllers/userController.js');
const {requireLogin, requireRole, requireOwnerOrAdmin} = require('../middleware/authMiddleware.js');

//Ruta publica, no necesita autenticar
router.post('/register', registroUser);

//Protegidas (requiere que se logueen)
router.post('/add', requireLogin, requireRole(['employee','admin','client']), addEmployee); //POST /api/users/add (solo admin)

router.get('/get', requireLogin, getAllUsers); //GET /api/users/get (solo usuarios logueados)

router.patch('/modify/:userId', requireLogin, requireOwnerOrAdmin, modifyUser); // PATCH /api/users/modif/:userId

router.delete('/remove', requireLogin, requireRole(['admin']), removeUsers); // DELETE /api/users/remove/:userId (solo admin)

module.exports = router;
