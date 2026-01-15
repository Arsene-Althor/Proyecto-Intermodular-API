//Controlers para Reservas
const Reservation = require('../models/Reservation');
const mongoose = require('mongoose');

// Añadir reserva
async function addReservation(req, res) {
  try {
    const { room_id, user_id, check_in, check_out } = req.body;
    if (!room_id || !user_id || !check_in || !check_out) {
      return res.status(400).json({ error: 'Faltan datos' });
    }

    const nuevaEntrada = new Date(check_in);
    const nuevaSalida = new Date(check_out);
    let new_id;
    let ultimo_id = await Reservation.findOne()
      .sort({ createdAt: -1 })
      .select('reservation_id');

    if(!ultimo_id){
      new_id = "RSV-001"
      const reservation = new Reservation({ reservation_id: new_id, room_id ,user_id, check_in, check_out });
      await reservation.save();
      return res.json(reservation)
    }else{
      let arr_id = ultimo_id.reservation_id.split("-");
      num_id = parseInt(arr_id[1])
      new_id = "RSV-" + String(num_id + 1).padStart(3, '0');
      let reservations = await Reservation.find({room_id : room_id , cancelation_date: null });
    if (reservations.length === 0) {
      const reservation = new Reservation({reservation_id: new_id, room_id ,user_id, check_in, check_out });
      await reservation.save();
      return res.json(reservation)
    } else {
      let correcto = true;
      for(let r of reservations){
        if (nuevaEntrada < r.check_out && nuevaSalida > r.check_in){
          correcto = false;
          break;
        }
      }

      if(correcto){
        reservation = new Reservation({reservation_id: new_id, room_id ,user_id, check_in, check_out });
        await reservation.save();
        return res.json(reservation)
      }else{
        return res.json({ error: 'La habitación ya se encuentra reservada'})
      }
    }
    }
    
  } catch (err) {
    res.status(500).json({ error: 'Error al insertar reserva', detalle: err.message });
  }
}

// Eliminar una reserva
async function deleteReservation(req, res) {
  try {
    const { code, quantity } = req.body;
    if (!code || !quantity) {
      return res.status(400).json({ error: 'Faltan datos' });
    }
    const qty = Number(quantity);
    if (qty <= 0) {
      return res.status(400).json({ error: 'Cantidad debe ser > 0' });
    }

    const item = await Item.findOne({ code });
    if (!item) return res.status(404).json({ error: 'Artículo no encontrado' });
    if (item.obsolete) {
      return res.status(400).json({ error: 'Artículo obsoleto, no se puede vender' });
    }
    if (item.stock < qty) {
      return res.status(400).json({ error: 'Stock insuficiente' });
    }

    item.stock -= qty;
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Error al sacar stock', detalle: err.message });
  }
}

// Obtener una reserva
async function getReservation(req, res) {
  try {
    const {id} = req.body;
    const reservation = await Reservation.findById(id)
    if (!reservation) return res.status(404).json({ error: 'Reserva no encontrada' });
    res.json(reservation);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener artículo', detalle: err.message });
  }
}

// Obtener todas las reservas
async function getAllReservations(req, res) {
  try {
    console.log("Intentando leer de la DB:", mongoose.connection.name);
    const reservations = await Reservation.find();
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ error: 'Error al listar artículos', detalle: err.message });
  }
}

// Modificar reserva
async function updateReservation(req, res) {
  try {
    const { code } = req.params;
    const { obsolete } = req.body; // true / false

    const item = await Item.findOne({ code });
    if (!item) return res.status(404).json({ error: 'Artículo no encontrado' });

    item.obsolete = Boolean(obsolete);
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Error al cambiar estado obsoleto', detalle: err.message });
  }
}

module.exports = {
  addReservation,
  deleteReservation,
  getReservation,
  getAllReservations,
  updateReservation
};
