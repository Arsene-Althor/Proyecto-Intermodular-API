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
const Reservation = require("../models/Reservation");

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
/* =====================================================
          HABITACIONES DISPONIBLES POR FECHA
   ===================================================== */

   async function getAvailableRooms(req, res) {
  try {
    console.log("QUERY RAW:", req.query); //prueba

    const { checkIn, checkOut, guests = 1 } = req.query;

    if (!checkIn || !checkOut) {
      return res.status(400).json({ error: "Faltan checkIn o checkOut" });
    }

    const ci = parseYMD(checkIn);
    const co = parseYMD(checkOut);

    console.log("PARSED ci/co:", ci.toISOString(), co.toISOString()); //prueba

    if (isNaN(ci.getTime()) || isNaN(co.getTime())) {
      return res.status(400).json({ error: "Formato de fecha inválido (usa YYYY-MM-DD)" });
    }
    if (ci >= co) {
      return res.status(400).json({ error: "checkIn debe ser anterior a checkOut" });
    }

    // Reservas solapadas NO canceladas (campo real: cancelation_date)
    const overlappingReservations = await Reservation.find({
      cancelation_date: null,
      check_in: { $lt: co },
      check_out: { $gt: ci }
    }).select({ room_id: 1, _id: 0 });

    const occupiedIds = overlappingReservations.map(r => String(r.room_id).trim());

    const available = await Room.find({
      max_occupancy: { $gte: Number(guests) },
      room_id: { $nin: occupiedIds }
    });

    return res.json(available);
  } catch (err) {
    console.error("❌ getAvailableRooms ERROR:", err);
    return res.status(500).json({ error: "Error buscando disponibilidad", detail: err.message });
  }
}

function parseYMD(s) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0)); // UTC 00:00
}

/* =====================================================
                  MODIFICAR HABITACIÓN
   ===================================================== */

async function updateRoom(req, res) {
  try {
    console.log("BODY UPDATE:", req.body);

    const { room_id } = req.body;
    if (!room_id) return res.status(400).json({ message: "room_id obligatorio" });

    // Whitelist (porque additionalProperties:false)
    const data = {
      type: req.body.type,
      description: req.body.description,
      image: req.body.image,
      price_per_night: req.body.price_per_night,
      rate: req.body.rate,
      max_occupancy: req.body.max_occupancy,
      isAvailable: req.body.isAvailable,
    };

    // Limpia undefined
    Object.keys(data).forEach(k => data[k] === undefined && delete data[k]);

    // Normaliza strings
    if (data.type) data.type = String(data.type).trim();
    if (data.description) data.description = String(data.description).trim();
    if (data.image) data.image = String(data.image).trim();

    // Enum estricto
    const allowedTypes = ["Individual", "Doble", "Suite"];
    if (data.type && !allowedTypes.includes(data.type)) {
      return res.status(400).json({ message: `type inválido. Usa: ${allowedTypes.join(", ")}` });
    }

    // Tipos (IMPORTANTE)
    if (data.price_per_night !== undefined) data.price_per_night = Number(data.price_per_night);
    if (data.rate !== undefined) data.rate = Number(data.rate);

    if (data.max_occupancy !== undefined) {
      data.max_occupancy = parseInt(data.max_occupancy, 10); // 👈 int sí o sí
    }

    if (data.isAvailable !== undefined) data.isAvailable = Boolean(data.isAvailable);

    const updated = await Room.findOneAndUpdate(
      { room_id: String(room_id).trim() },
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ message: "Habitación no encontrada" });

    return res.json({ message: "Habitación actualizada", room: updated });

  } catch (error) {
    console.error("UPDATE ERROR FULL:", JSON.stringify(error, null, 2));
    return res.status(500).json({ error: "Error al actualizar", detalle: error.message });
  }
}

module.exports = {
  getAllRooms,
  getRoom,
  createRoom,
  deleteRoom,
  getAvailableRooms,
  updateRoom
}