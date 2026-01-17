//Controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcrypt');

async function registroUser(req, res){
    try{
        const {
        name,
        surname,
        email,
        password,
        confirmPassword,
        dni,
        birthDate,
        gender,
        city
    } = req.body;

    if (password != confirmPassword){
        return res.status(400).json({error: 'Las contraseñas no coincides'});
    }

    //Validar que no exista ya el email o DNI
    const userExists = await User.findOne({
        $or: [{email}, {dni}]
    });

    if (userExists){
        return res.status(400).json({error: 'El email o DNI ya están registrados'});
    }

    const newUser = new User({
        name,
        surname,
        email,
        password,
        dni,
        birthDate: new Date(birthDate),
        gender,
        city,
        role: 'client'
    });

    //Guardar en mongo
    await newUser.save();

    } catch (err){
        res.status(400).json({error: err.message});
    }

}