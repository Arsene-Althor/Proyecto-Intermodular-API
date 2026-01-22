/* =====================================================
   ============= CONTROLLER DE HABITACION ==============
   =====================================================

   Este bloque se utiliza para:
    -getRoom: se tendra que poner la room_id por body y buscara la habitacion | route.get(http://localhost:3000/room/one)
    -getAllRooms: no ha hace falta poner nada en body simplemente bien la ruta | route.get(http://localhost:3000/room/all)
    -createRoom: se tendra que poner todas las especificaciones de una habitacion para crearla | route.post (http://localhost:3000/room/create)
    -deleteRoom: se tendra que poner la room_id por body y elimina la habitacion | route.delete(http://localhost:3000/room/delete)

   ===================================================== */


/* =====================================================
              CONTROLES PARA HABITACION
   ===================================================== */
const Room = require('../models/Room')
const mongoose = require('mongoose');

/* =====================================================
              OBTENER HABITACION POR ID
   ===================================================== */
async function getRoom(req, res) {
  try {
    const { room_id } = req.body;
    const room = await Room.findOne({ room_id })
    if (!room) return res.status(404).json({ error: 'Habitacion no encontrada' });
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener la habitacion', detalle: err.message });
  }
}

/* =====================================================
              OBTENER TODAS LAS HABITACIONES
   ===================================================== */
async function getAllRooms(req, res) {
  try {
    const room = await Room.find();
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: 'Error al listar las reservas', detalle: err.message });
  }
}

/* =====================================================
              CREAR UNA NUEVA HABITACIÓN
   ===================================================== */
async function createRoom(req, res) {
  try {
    const {
      room_id,
      type,
      description,
      image,
      price_per_night,
      rate,
      max_occupancy,
      isAvailable
    } = req.body;

    // Comprobamos campos obligatorios
    if (
      !room_id ||
      !type ||
      !description ||
      !image ||
      !price_per_night ||
      !max_occupancy
    ) {
      return res.status(400).json({
        message: "Faltan campos obligatorios"
      });
    }

    // Comprobamos si la habitación ya existe
    const roomExists = await Room.findOne({ room_id });
    if (roomExists) {
      return res.status(409).json({
        message: "La habitación ya existe"
      });
    }

    // Creamos la nueva habitación (db.rooms.insertOne)
    const newRoom = await Room.create({
      room_id: String(room_id).trim(),
      type,
      description,
      image,
      price_per_night,
      rate: rate ?? 0,
      max_occupancy,
      isAvailable: isAvailable ?? true
    });

    // Respuesta correcta
    res.status(201).json({
      message: "Habitación creada correctamente",
      room: newRoom
    });
  } catch (error) {
    res.status(500).json({
      error: "Error al crear la habitación",
      detalle: error.message
    });
  }
};


/* =====================================================
              ELIMINAR UNA NUEVA HABITACIÓN
   ===================================================== */

async function deleteRoom(req, res) {
  try {
    const { room_id } = req.body;

    // Validamos que llegue el room_id
    if (!room_id) {
      return res.status(400).json({
        message: "El room_id es obligatorio"
      });
    }

    // Buscamos y eliminamos la habitación
    const deletedRoom = await Room.findOneAndDelete({ room_id });

    // Si no existe
    if (!deletedRoom) {
      return res.status(404).json({
        message: "Habitación no encontrada"
      });
    }

    // Respuesta correcta
    res.json({
      message: "Habitación eliminada correctamente",
      room: deletedRoom
    });
  } catch (error) {
    res.status(500).json({
      error: "Error al eliminar la habitación",
      detalle: error.message
    });
  }
};

module.exports = {
  getAllRooms,
  getRoom,
  createRoom,
  deleteRoom
}