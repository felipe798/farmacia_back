import db from "../models/index.js";
const Laboratorio = db.laboratorio;
const Medicamento = db.medicamento;

// Crear y guardar un nuevo laboratorio
const createLaboratorio = async (req, res) => {
  try {
    // Validar request
    if (!req.body.nombre) {
      res.status(400).send({
        message: "El nombre del laboratorio es obligatorio."
      });
      return;
    }

    // Crear un laboratorio
    const laboratorio = {
      nombre: req.body.nombre,
      direccion: req.body.direccion,
      telefono: req.body.telefono,
      email: req.body.email
    };

    // Guardar laboratorio en la base de datos
    const data = await Laboratorio.create(laboratorio);
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Ocurrió un error al crear el laboratorio."
    });
  }
};

// Obtener todos los laboratorios de la base de datos
const findAllLaboratorios = async (req, res) => {
  try {
    const data = await Laboratorio.findAll();
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Ocurrió un error al obtener los laboratorios."
    });
  }
};

// Encontrar un laboratorio por id
const findOneLaboratorio = async (req, res) => {
  const id = req.params.id;

  try {
    const data = await Laboratorio.findByPk(id, {
      include: [
        {
          model: Medicamento,
          as: "medicamentos"
        }
      ]
    });
    if (data) {
      res.send(data);
    } else {
      res.status(404).send({
        message: `No se encontró el laboratorio con id=${id}.`
      });
    }
  } catch (err) {
    res.status(500).send({
      message: "Error al obtener el laboratorio con id=" + id
    });
  }
};

// Actualizar un laboratorio por id
const updateLaboratorio = async (req, res) => {
  const id = req.params.id;

  try {
    const num = await Laboratorio.update(req.body, {
      where: { id: id }
    });

    if (num == 1) {
      res.send({
        message: "El laboratorio fue actualizado exitosamente."
      });
    } else {
      res.send({
        message: `No se pudo actualizar el laboratorio con id=${id}. Tal vez el laboratorio no fue encontrado o req.body está vacío!`
      });
    }
  } catch (err) {
    res.status(500).send({
      message: "Error al actualizar el laboratorio con id=" + id
    });
  }
};

// Eliminar un laboratorio por id
const deleteLaboratorio = async (req, res) => {
  const id = req.params.id;

  try {
    const num = await Laboratorio.destroy({
      where: { id: id }
    });

    if (num == 1) {
      res.send({
        message: "El laboratorio fue eliminado exitosamente!"
      });
    } else {
      res.send({
        message: `No se pudo eliminar el laboratorio con id=${id}. Tal vez el laboratorio no fue encontrado!`
      });
    }
  } catch (err) {
    res.status(500).send({
      message: "No se pudo eliminar el laboratorio con id=" + id
    });
  }
};

export default {
  createLaboratorio,
  findAllLaboratorios,
  findOneLaboratorio,
  updateLaboratorio,
  deleteLaboratorio
};