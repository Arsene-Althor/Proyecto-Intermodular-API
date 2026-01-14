// Modelo para reservas
const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  id_room:{
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'El ID de la habitación es obligatorio'],
    trim: true
    },
  id_user: {
        type: mongoose.Schema.Types.ObjectId,
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
    cancelation_date: {
        type: Date,
        default: null,
        trim: true
    }

},{ timestamps: true }//Añadira dos campos automaticametne:
//  Fecha de creación y de modificación "createdAt" y "updatedAt"
);

const Reservation = mongoose.model('Reservation', reservationSchema);
module.exports = Reservation;