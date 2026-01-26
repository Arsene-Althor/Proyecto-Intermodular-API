//Controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcrypt');

async function generateUserId(role) {
    
    //Variable para guardar el prefijo del userid
    let prefix;

    if (role == 'client'){
        prefix = 'CLI-';

    } else{
        prefix = 'EMP-';

    }

    //Busca el ultimo usuario que tenga el prefijo asignado
    const lastUser = await User.findOne({user_id: new RegExp(`^${prefix}`)})
        .sort({createdAt: -1})
        .select('user_id');

    //Si no hay último usuario empezara poo 001
    if(!lastUser){
        return `${prefix}00001`
    }

    //Extraemos numero del ultimo user_id
    //Ej: "Client-005" → split("-") → ["Client", "005"] → parseInt("005") → 5
    const arr_id = lastUser.user_id.split("-");
    const num_id = parseInt(arr_id[1]);

    //Generar nuevo ID con número +1
    const new_id = `${prefix}${String(num_id + 1).padStart(5, '0')}`;

    return new_id

}

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

    if(!email){
        return res.status(400).json({error: 'El email es obligatorio'});
    }

    if(!dni){
        return res.status(400).json({error: 'El DNI es obligatorio'});
    }

    //Validar que no exista ya el email o DNI
    const userExists = await User.findOne({
        $or: [{email}, {dni}]
    });

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

    //Generamos el user_id de manerra automatica
    const userID = await generateUserId('client');


    //Cogemos los datos ingresados por el usuario para luego guardar
    const newUser = new User({
        user_id: userID,
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

    if(!email){
        return res.status(400).json({error: 'El email es obligatorio'});
    }

    if(!dni){
        return res.status(400).json({error: 'El DNI es obligatorio'});
    }

    //Validar que no exista ya el email o DNI
    const userExists = await User.findOne({
        $or: [{email}, {dni}]
    });

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

    //Generamos el user_id de manerra automatica
    const userID = await generateUserId('employee');


    //Cogemos los datos ingresados por el usuario para luego guardar
    const newUser = new User({
        user_id: userID,
        name,
        surname,
        email,
        password: hashedPassword,
        dni,
        birthDate: new Date(birthDate),
        gender,
        city,
        role: 'employee'
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

async function getAllUsers(req, res){
    try{

    let users = await User.find().select('-password');
    return res.status(200).json(users);

    } catch (err){
        return res.status(400).json({error: err.message});

        
    }
}

async function modifyUser(req, res){
    try{

        const {userId} = req.params;
        const updates = req.body;

        //Comprobamos si existe
        const userExists = await User.findOne({user_id: userId});

        if (!userExists){
            return res.status(404).json({error: 'Usuario no encontrado'});
        }

        //Implementamos medidas para evitar que se borre el ID o el rol del usuario
        if (updates.user_id) delete updates.user_id;

        if (updates.role) delete updates.user_id;

        //Validar email/dni duplicados
        if (updates.email || updates.dni){
            const duplicateCheck = await User.findOne({
                $or: [{email: updates.email}, {dni: updates.dni}],
                _id: {$ne: userId} // <- Sirve para excluir usuario actual
            });

            if (duplicateCheck){
                const field = duplicateCheck.email === updates.email ? 'email': 'dni';

                return res.status(400).json({
                    error: `El ${field} ya esta registrado por otro usuario`
                });
            }
        }
        
        //Cambiar contraseña (con validacion)
        if (updates.password){
            if (updates.password !== updates.confirmPassword){
                return res.status(400).json({error: 'Las contraseñas no coinciden'});
            }

            //Expresiones regulares para validar el dormato de contraseña
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

            if (!passwordRegex.test(updates.password)){
                return res.status(400).json({error: 'Contraseña debil'});
            }
            updates.password = await bcrypt.hash(updates.password, 10);
            delete updates.confirmPassword;
        }

        //Actualizar
        updates.updatedAt = new Date();
        const updatedUser = await User.findOneAndUpdate(
            {user_id: userId},
            updates,
            {new: true, runValidators: true}
        ).select('-password');

        return res.status(200).json({
            message: 'Usuario actualizado exitosamente',
            user: updatedUser
        });


    } catch (err){
        return res.status(404).json({error: 'Error al modificar usuario ', detalle:err.message});
    }
}

async function removeUsers(req, res){

}

module.exports = {registroUser,addEmployee, getAllUsers, removeUsers, modifyUser};