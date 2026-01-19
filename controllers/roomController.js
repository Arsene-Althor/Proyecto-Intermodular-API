/* =====================================================
   ============= CONTROLLER DE HABITACION ==============
   =====================================================

   Este bloque se utiliza para:
    -getRoom: se tendra que poner la room_id por body y buscara la habitacion (http://localhost:3000/room/one)
    -getAllRooms: no ha hace falta poner nada en body simplemente bien la ruta (http://localhost:3000/room/all)

   ===================================================== */

//Controllers para Habitaciones
const Room = require('../models/Room')
const mongoose = require('mongoose');

// Obtener habitaciones por ID de habitacion
async function getRoom(req, res) {
  try {
    const {room_id} = req.body;
    const room = await Room.findOne({room_id})
    if (!room) return res.status(404).json({ error: 'Habitacion no encontrada' });
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener la habitacion', detalle: err.message });
  }
}

// Obtener todas las habitaciones
async function getAllRooms(req, res) {
  try {
    const room = await Room.find();
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: 'Error al listar las reservas', detalle: err.message });
  }
}

module.exports = {
    getAllRooms,
    getRoom
}