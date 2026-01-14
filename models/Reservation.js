// Modelo para reservas
const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  id_room:{
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'El ID de la habitación es obligatorio']
    },
  id_user: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'El ID del usuario es obligatorio']
    },
  check_in: {
        type: Date,
        required: [true, 'La fecha de entrada es obligatoria']
    },
    check_out: {
        type: Date,
        required: [true, 'La fecha de salida es obligatoria']
    },
    cancelation_date: {
        type: Date,
        default: null
    }

},{ timestamps: true }//Añadira dos campos automaticametne:
//  Fecha de creación y de modificación "createdAt" y "updatedAt"
);

const Reservation = mongoose.model('Reservation', reservationSchema);
module.exports = Reservation;