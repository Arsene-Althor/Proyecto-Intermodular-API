// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { kMaxLength } = require('buffer');

//Expresiones regulares para validaciones
const regex = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  dni: /^[0-9]{8}[A-Z]$/, // 8 numeros + una letra mayuscula
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*&])[A-Za-z\d@$!%*&]{8,}$/ //Al menos 1 mayuscula, minuscula, numero y caracter especial, minimo 8 caracteres

};

//Modelo del user
const userSchema = new mongoose.Schema({
  name:{
    type: String,
    required: [true, 'El nombre del usuario es algo obligatorio'],
    trim: true,
    maxlenght: [100, 'El nombre excede los 100 caracteres'],
    minlenght: [1, 'El nombre no puede estar vacio']
  },
  surname:{
    type: String,
    required: [true, 'El Apellido del usuario es algo obligatorio'],
    trim: true,
    maxlength: [100, 'El apellido no puede exceder 100 caracteres'],
    minlength: [1, 'El apellido no puede estar vacío']
  },
  email:{
    type: String,
    required: [true, 'El email del usuario es algo obligatorio'],
    unique: true,
    trim: true,
    lowercase: true,
    sparse: true, //Permite null sin violar unique
    validate: { //Validador para formato del email
      validator: function (value){
        return regex.email.test(value);
      },
      message: 'El formato del email no es válido (ej: usuario@dominio.com)'
    }
  },
  password:{
    type: String,
    required: [true, 'La contraseña del usuario es algo obligatorio'],
    trim: true,
    minlenght: [8, 'La contraseña debe tener mínimo 8 caracteres'],
    validate: { //Validador para formato de la contraseña
      validator: function (value){
        return regex.password.test(value);
      },
      message: 'La contraseña debe contener al menos: 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial (@$!%*&)'
    },
    select: false //No devuelve la constraseña en queries por defecto
  },
  dni:{
    type: String,
    required: [true, 'El dni del usuario es algo obligatorio'],
    trim: true,
    unique: true,
    uppercase: true,
    sparse: true,
    validate: { //Validador para formato del dni
      validator: function (value){
        return regex.dni.test(value);
      },
      message: 'El DNI debe tener formato válido: 8 números seguidos de 1 letra (ej: 12345678A, sin Ñ)'
    },
  },
  birthDate:{
    type: Date,
    required: [true, 'La fecha de nacimiento del usuario es algo obligatorio'],
    trim: true
  },
  city:{
    type: String,
    default: null,
    trim: true
  },
  gender:{
    type: String,
    enum: ["M", "F", "Other"],
    required: [true, 'El genero del usuario es algo obligatorio'],
    trim: true
  },
  profileImage:{
    type: String,
    default: null
  },
  role:{
    type: String,
    enum: ["admin", "employee", "client"],
    required: [true, 'El rol del usuario es algo obligatorio'],
    trim: true
  },
  isVIP:{
    type: Boolean,
    default: false
  },
  isActive:{
    type: Boolean,
    default: true
  },
  createdAt:{
    type: Date,
    default: Date.now
  },
  updatedAt:{
    type: Date,
    default: Date.now
  }
});



// Método para comparar contraseñas
userSchema.methods.comparePassword = async function (plain) {
  const res = await bcrypt.compare(plain, this.password);
  return res;
};



const User = mongoose.model('User', userSchema);
module.exports = User;
