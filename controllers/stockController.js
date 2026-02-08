// controllers/stockController.js
const Item = require('../models/Item');

// COMPRAS: crear artículo o aumentar stock
async function addStock(req, res) {
  try {
    const { code, description, quantity } = req.body;
    if (!code || !quantity) {
      return res.status(400).json({ error: 'Faltan datos' });
    }
    const qty = Number(quantity);
    if (qty <= 0) {
      return res.status(400).json({ error: 'Cantidad debe ser > 0' });
    }

    let item = await Item.findOne({ code });
    if (!item) {
      if (!description) {
        return res.status(400).json({ error: 'Descripcion requerida para nuevo articulo' });
      }
      item = new Item({ code, description, stock: qty });
    } else {
      item.stock += qty;
    }
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Error al añadir stock', detalle: err.message });
  }
}

// VENTAS: sacar stock (si no obsoleto)
async function exitStock(req, res) {
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

// Obtener stock de un artículo
async function getItem(req, res) {
  try {
    const code = req.params.code;
    const item = await Item.findOne({ code });
    if (!item) return res.status(404).json({ error: 'Artículo no encontrado' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener artículo', detalle: err.message });
  }
}

// Obtener stock de todos los artículos
async function getAllItems(req, res) {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Error al listar artículos', detalle: err.message });
  }
}

// VENTAS: marcar obsoleto o vigente
async function setObsolete(req, res) {
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
  addStock,
  exitStock,
  getItem,
  getAllItems,
  setObsolete
};
