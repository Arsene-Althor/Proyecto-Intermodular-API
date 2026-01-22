//routes/authRoutes.js
const express = require('express');
const router = express.Router();
const {registroUser, addEmployee, getAllUsers, removeUsers, modifyUser} = require ('../controllers/userController.js')

router.post('/register', registroUser);

router.post('/add', addEmployee);

router.get('/get', getAllUsers);

router.patch('/modif', modifyUser);

router.delete('/remove', removeUsers);

module.exports = router;
