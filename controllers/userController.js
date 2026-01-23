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

    if(!name){
        return res.status(400).json({error: 'El nombre es obligatorio'});
    }

    if(!surname){
        return res.status(400).json({error: 'El apellido es obligatorio'});
    }

    if(!password){
        return res.status(400).json({error: 'La contraseña es obligatoria'})
    }

    if (password != confirmPassword){
        return res.status(400).json({error: 'Las contraseñas no coincides'});
    }

    //Validar que no exista ya el email o DNI
    const userExists = await User.findOne({
        $or: [{email}, {dni}]
    });

    if(!email){
        return res.status(400).json({error: 'El email es obligatorio'});
    }

    if(!dni){
        return res.status(400).json({error: 'El DNI es obligatorio'});
    }

    if (userExists){
        return res.status(400).json({error: 'El email o DNI ya están registrados'});
    }

    if(!birthDate){
        return res.status(400).json({error: 'La fecha de nacimiento es obligatoria'})
    }

    if(!gender){
        return res.status(400).json({error: 'El genero es obligatorio'})
    }


    //Incriptamos la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);


    //Cogemos los datos ingresados por el usuario para luego guardar
    const newUser = new User({
        name,
        surname,
        email,
        password: hashedPassword,
        dni,
        birthDate: new Date(birthDate),
        gender,
        city,
        role: 'client'
    });

    //Guardar en mongo
    await newUser.save();

    //Convertir el documento Mongoose a objeto plano JavaScript
    const userResponse = newUser.toObject();

    //Eliminamos la contraseña antes de enviar
    delete userResponse.password

    return res.status(201).json({
        message: 'Usuario registrado exitosamente',
        user: userResponse
    })

    } catch (err){
        return res.status(400).json({error: err.message});
        
        
    }

}

async function addEmployee(req, res){
    try{

    

    } catch (err){
        res.status(400).json({error: err.message});

        
    }
}

async function getAllUsers(req, res){
    try{

    let users = await User.find().select('-password');
    return res.status(200).json(users);

    } catch (err){
        return res.status(400).json({error: err.message});

        
    }
}

async function modifyUser(req, res){

}

async function removeUsers(req, res){

}

module.exports = {registroUser,addEmployee, getAllUsers, removeUsers, modifyUser};