//Controlers para Reservas
const Reservation = require('../models/Reservation');
const User = require('../models/User');
const Room = require('../models/Room');
const mongoose = require('mongoose');

// Añadir reserva
//Fata validación para existencia de usuario y habitación
async function addReservation(req, res) {
  try {
    const { room_id, user_id, check_in, check_out, price} = req.body;
    if (!room_id || !user_id || !check_in || !check_out || !price) {
      return res.status(400).json({ error: 'Faltan datos' });
    }

    const createdBy = req.user.user_id;

    //Validaciones para datos introducidos
    let user = await User.findOne({user_id});
    if(!user) return res.status(400).json({error: 'El usuario introducido no exite'});

    let room = await Room.findOne({room_id});
    if(!room) return res.status(400).json({error: 'La habitación introducida no existe'});


    const precioNum = Number.parseFloat(price).valueOf();

    if(isNaN(precioNum) || precioNum <= 0){
      return res.status(400).json(precioNum);
    }

    let nuevaEntrada = new Date(check_in);
    nuevaEntrada.setHours(12,0);

    let nuevaSalida = new Date(check_out);
    nuevaSalida.setHours(11,0);

    let ayer = new Date();
    ayer.setDate(ayer.getDate()-1);
    ayer.setHours(12,0);

    if(nuevaEntrada < ayer) return res.status(400).json({ error: 'La fecha de entrada no puede ser inferior a la fecha actual' });
    if(nuevaEntrada >= nuevaSalida) return res.status(400).json({ error: 'La fecha de entrada no puede ser superiror a la de salida' });
   
    let new_id;
    let ultimo_id = await Reservation.findOne()
      .sort({ createdAt: -1 })
      .select('reservation_id');

    if(!ultimo_id){
      // En caso de no tener ninguna reserva la creamos automaticamente con el primer id 
      new_id = "RSV-001"
    }else{
      //Generamos el nuevo id de reserva
      let arr_id = ultimo_id.reservation_id.split("-");
      num_id = parseInt(arr_id[1])
      new_id = "RSV-" + String(num_id + 1).padStart(3, '0');
    }
     //Buscamos todas las reservas no canceladas de esa habitación para validar que no este ocupada
    let reservations = await Reservation.find({room_id : room_id , cancelation_date: null });
    let correcto = true;
    if (reservations.length != 0) {
       for(let r of reservations){
          if (nuevaEntrada < r.check_out && nuevaSalida > r.check_in){
            correcto = false;
            break;
          }
        }
    }

    if(correcto){
          let reservation = new Reservation({reservation_id: new_id, room_id ,user_id, check_in: nuevaEntrada, check_out: nuevaSalida , price: precioNum,createdBy });
          await reservation.save();
          return res.json(reservation)
    }else{
          return res.status(400).json({ error: 'La habitación ya se encuentra reservada'})
    }

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Error al insertar reserva', detalle: err.message, erroresValidacion: err.errors });
  }
}

// Cancelar una reserva
async function cancelReservation(req, res) {
  try {
    const { reservation_id , price } = req.body;
    if (!reservation_id || !price) {
      return res.status(400).json({ error: 'Faltan datos' });
    }

    const reservation = await Reservation.findOne({ reservation_id });
    if (!reservation) return res.status(404).json({ error: 'Reserva no encontrado' });

    if (reservation.cancelation_date !== null) {
      return res.status(400).json({ error: 'La reserva ya estaba cancelada anteriormente' });
    }

    let newPrice = parseFloat(price);
    if(isNaN(newPrice) || newPrice < 0){
      return res.status(400).json({ error: "El precio debe ser un número mayor o igual a 0" });
    }

    reservation.price = newPrice;
    reservation.cancelation_date = new Date();
    await reservation.save();
    
    res.json({ mensaje: 'Cancelada correctamente', reservation});
  } catch (err) {
    res.status(500).json({ error: 'Error al cancelar la reserva ', detalle: err.message });
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
    let hoy = new Date();
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
    const { reservation_id, room_id ,user_id, check_in, check_out, price } = req.body;

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
    //Falta validación precio valido
    reservation.price = price;

    await reservation.save();
    return res.json({ mensaje: 'Reserva modificada correctamente', reservation });

  } catch (err) {
    res.status(500).json({ error: 'Error al realizar la actualización ', detalle: err.message });
  }
}

//Funcion para calcularPrecio pendiente utilizar
async function calculatePrice(user_id,room_id,check_in, check_out){
  if(!user_id || !room_id || !check_in || !check_out) return { error: 'Faltan datos'};

  //Validamos que los datos sean correctos

  const user = await User.findOne({user_id});
  const room = await Room.findOne({room_id});

  if(!user || !room) return { error: 'Los datos introducidos no son validos'};

  let nuevaEntrada = new Date(check_in);
  nuevaEntrada.setHours(12,0,0,0);

  let nuevaSalida = new Date(check_out);
  nuevaSalida.setHours(11,0,0,0);

  const diferencia = nuevaSalida - nuevaEntrada;

  const dias = Math.ceil(diferencia / (1000 * 60 * 60 * 24));

  let precioReserva = dias * room.price_per_night;

  if(user.isVIP == true){
    let descuento = precioReserva * 0.20;
    precioReserva = precioReserva - descuento;
  }
  return precioReserva;

}

module.exports = {
  addReservation,
  cancelReservation,
  getReservation,
  getAllReservations,
  getActiveReservations,
  updateReservation
};
