// Modelo para reservas
const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  reservation_id:{
    type : String,
    required: [true, 'El ID de la reserva es obligatorio'],
    trim: true,
    unique: true
  },  
  room_id:{
    type: String,
    required: [true, 'El ID de la habitación es obligatorio'],
    trim: true
    },
  user_id: {
        type: String,
        required: [true, 'El ID del usuario es obligatorio'],
        trim: true
    },
  check_in: {
        type: Date,
        required: [true, 'La fecha de entrada es obligatoria'],
        trim: true
    },
    check_out: {
        type: Date,
        required: [true, 'La fecha de salida es obligatoria'],
        trim: true
    },
    price:{
      type: Number,
      required: [true, 'El precio es obligatorio'],
      min:[0.01 , 'El precio debe ser mayor que 0']
      
    },
    cancelation_date: {
        type: Date,
        default: null,
        trim: true
    },
    createdBy:{
      type: String,
      required: [true, 'El ID del crador es obligatorio'],
      trim: true,
    }


},{ timestamps: true }//Añadira dos campos automaticametne:
//  Fecha de creación y de modificación "createdAt" y "updatedAt"
);

const Reservation = mongoose.model('Reservation', reservationSchema);
module.exports = Reservation;