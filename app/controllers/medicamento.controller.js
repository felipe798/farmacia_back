import db from "../models/index.js";
const Medicamento = db.medicamento;
const Laboratorio = db.laboratorio;

// Crear y guardar un nuevo medicamento
const createMedicamento = async (req, res) => {
  try {
    // Validar request
    if (!req.body.nombre || !req.body.precio) {
      res.status(400).send({
        message: "El nombre y precio del medicamento son obligatorios."
      });
      return;
    }

    // Crear un medicamento
    const medicamento = {
      nombre: req.body.nombre,
      descripcion: req.body.descripcion,
      precio: req.body.precio,
      stock: req.body.stock || 0,
      fechaVencimiento: req.body.fechaVencimiento,
      laboratorioId: req.body.laboratorioId
    };

    // Guardar medicamento en la base de datos
    const data = await Medicamento.create(medicamento);
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Ocurrió un error al crear el medicamento."
    });
  }
};

// Obtener todos los medicamentos de la base de datos
const findAllMedicamentos = async (req, res) => {
  try {
    const data = await Medicamento.findAll({
      include: [
        {
          model: Laboratorio,
          as: "laboratorio"
        }
      ]
    });
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Ocurrió un error al obtener los medicamentos."
    });
  }
};

// Encontrar un medicamento por id
const findOneMedicamento = async (req, res) => {
  const id = req.params.id;

  try {
    const data = await Medicamento.findByPk(id, {
      include: [
        {
          model: Laboratorio,
          as: "laboratorio"
        }
      ]
    });
    if (data) {
      res.send(data);
    } else {
      res.status(404).send({
        message: `No se encontró el medicamento con id=${id}.`
      });
    }
  } catch (err) {
    res.status(500).send({
      message: "Error al obtener el medicamento con id=" + id
    });
  }
};

// Actualizar un medicamento por id
const updateMedicamento = async (req, res) => {
  const id = req.params.id;

  try {
    const num = await Medicamento.update(req.body, {
      where: { id: id }
    });

    if (num == 1) {
      res.send({
        message: "El medicamento fue actualizado exitosamente."
      });
    } else {
      res.send({
        message: `No se pudo actualizar el medicamento con id=${id}. Tal vez el medicamento no fue encontrado o req.body está vacío!`
      });
    }
  } catch (err) {
    res.status(500).send({
      message: "Error al actualizar el medicamento con id=" + id
    });
  }
};

// Eliminar un medicamento por id
const deleteMedicamento = async (req, res) => {
  const id = req.params.id;

  try {
    const num = await Medicamento.destroy({
      where: { id: id }
    });

    if (num == 1) {
      res.send({
        message: "El medicamento fue eliminado exitosamente!"
      });
    } else {
      res.send({
        message: `No se pudo eliminar el medicamento con id=${id}. Tal vez el medicamento no fue encontrado!`
      });
    }
  } catch (err) {
    res.status(500).send({
      message: "No se pudo eliminar el medicamento con id=" + id
    });
  }
};

export default {
  createMedicamento,
  findAllMedicamentos,
  findOneMedicamento,
  updateMedicamento,
  deleteMedicamento
};