//Controlers para Reservas
const Reservation = require('../models/Reservation');
const mongoose = require('mongoose');

// Añadir reserva
//Fata validación para existencia de usuario y habitación
async function addReservation(req, res) {
  try {
    const { room_id, user_id, check_in, check_out } = req.body;
    if (!room_id || !user_id || !check_in || !check_out) {
      return res.status(400).json({ error: 'Faltan datos' });
    }

    const nuevaEntrada = new Date(check_in);
    const nuevaSalida = new Date(check_out);
    const ahora = new Date();
    let new_id;
    let ultimo_id = await Reservation.findOne()
      .sort({ createdAt: -1 })
      .select('reservation_id');

    if(nuevaEntrada < ahora) return res.status(400).json({ error: 'La fecha de entrada no puede ser inferior a la fecha actual' });
    if(nuevaEntrada > nuevaSalida) return res.status(400).json({ error: 'La fecha de entrada no puede ser superiror a la de salida' });
    
  

    if(!ultimo_id){
      // En caso de no tener ninguna reserva la creamos automaticamente con el primer id 
      new_id = "RSV-001"
      const reservation = new Reservation({ reservation_id: new_id, room_id ,user_id, check_in, check_out });
      await reservation.save();
      return res.json(reservation)
    }else{
      //Generamos el nuevo id de reserva
      let arr_id = ultimo_id.reservation_id.split("-");
      num_id = parseInt(arr_id[1])
      new_id = "RSV-" + String(num_id + 1).padStart(3, '0');

      //Buscamos todas las reservas no canceladas de esa habitación para validar que no este ocupada
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
          return res.status(400).json({ error: 'La habitación ya se encuentra reservada'})
        }
      }
    }
    
  } catch (err) {
    res.status(500).json({ error: 'Error al insertar reserva', detalle: err.message });
  }
}

// Cancelar una reserva
async function cancelReservation(req, res) {
  try {
    const { reservation_id } = req.body;
    if (!reservation_id) {
      return res.status(400).json({ error: 'Faltan datos' });
    }

    const reservation = await Reservation.findOne({ reservation_id });
    if (!reservation) return res.status(404).json({ error: 'Reserva no encontrado' });

    if (reservation.cancelation_date !== null) {
      return res.status(400).json({ error: 'La reserva ya estaba cancelada anteriormente' });
    }

    reservation.cancelation_date = new Date();
    await reservation.save();
    
    res.json({ mensaje: 'Cancelada correctamente', reservation});
  } catch (err) {
    res.json({ mensaje: 'Reserva cancelada correctamente', reservation });
  }
}

// Obtener una reserva
async function getReservation(req, res) {
  try {
    const {reservation_id} = req.body;
    const reservation = await Reservation.findOne({reservation_id})
    if (!reservation) return res.status(404).json({ error: 'Reserva no encontrada' });
    res.json(reservation);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener la reserva', detalle: err.message });
  }
}

// Obtener todas las reservas
async function getAllReservations(req, res) {
  try {
    const reservations = await Reservation.find();
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ error: 'Error al listar las reservas', detalle: err.message });
  }
}

async function getActiveReservations(req, res){
  
  try{
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const reservations = await Reservation.find({cancelation_date : null, check_out: { $gte: hoy }});
    if(!reservations || reservations.length === 0){
      return res.status(200).json([]);
    }

    res.json(reservations)

  }catch(err){
    res.status(500).json({ error: 'Error al listar las reservas', detalle: err.message });
  }
}

// Modificar reserva
async function updateReservation(req, res) {
  try {
    const { reservation_id, room_id ,user_id, check_in, check_out  } = req.body;

    const reservation = await Reservation.findOne({ reservation_id });
    if (!reservation){
       return res.status(404).json({ error: 'Reserva no encontrada' });
    }
    //Falta validación room exite y no esta ocupada
    reservation.room_id = room_id;
    reservation.check_in = check_in;
    reservation.check_out = check_out;
    //Falta validación user existe
    reservation.user_id = user_id;

    await reservation.save();
    return res.json({ mensaje: 'Reserva modificada correctamente', reservation });

  } catch (err) {
    res.status(500).json({ error: 'Error al realizar la actualización ', detalle: err.message });
  }
}

module.exports = {
  addReservation,
  cancelReservation,
  getReservation,
  getAllReservations,
  getActiveReservations,
  updateReservation
};
