import db from "../models/index.js";
const OrdenCompra = db.ordenCompra;
const DetalleOrdenCompra = db.detalleOrdenCompra;
const Medicamento = db.medicamento;
const User = db.user;

// Crear y guardar una nueva orden de compra
const createOrdenCompra = async (req, res) => {
  try {
    // Crear una orden de compra
    const ordenCompra = {
      userId: req.userId, // Usuario autenticado
      fecha: new Date(),
      estado: "pendiente",
      total: 0 // Se calculará después
    };

    // Guardar orden de compra en la base de datos
    const ordenCreada = await OrdenCompra.create(ordenCompra);
    
    // Si hay detalles, crearlos
    if (req.body.detalles && req.body.detalles.length > 0) {
      let total = 0;
      
      for (const detalle of req.body.detalles) {
        // Verificar stock
        const medicamento = await Medicamento.findByPk(detalle.medicamentoId);
        if (!medicamento || medicamento.stock < detalle.cantidad) {
          throw new Error(`Stock insuficiente para el medicamento con ID ${detalle.medicamentoId}`);
        }
        
        // Calcular subtotal
        const subtotal = medicamento.precio * detalle.cantidad;
        total += subtotal;
        
        // Crear detalle
        await DetalleOrdenCompra.create({
          ordenCompraId: ordenCreada.id,
          medicamentoId: detalle.medicamentoId,
          cantidad: detalle.cantidad,
          precioUnitario: medicamento.precio,
          subtotal: subtotal
        });
        
        // Actualizar stock
        await medicamento.update({
          stock: medicamento.stock - detalle.cantidad
        });
      }
      
      // Actualizar total en la orden
      await ordenCreada.update({ total });
    }
    
    res.status(201).send({
      message: "Orden de compra creada exitosamente",
      orden: ordenCreada
    });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Ocurrió un error al crear la orden de compra."
    });
  }
};

// Obtener todas las órdenes de compra
const findAllOrdenCompras = async (req, res) => {
  try {
    const data = await OrdenCompra.findAll({
      include: [
        {
          model: User,
          attributes: ['username', 'email']
        },
        {
          model: DetalleOrdenCompra,
          include: [
            {
              model: Medicamento,
              attributes: ['nombre', 'precio']
            }
          ]
        }
      ]
    });
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Ocurrió un error al obtener las órdenes de compra."
    });
  }
};

// Encontrar una orden de compra por id
const findOneOrdenCompra = async (req, res) => {
  const id = req.params.id;

  try {
    const data = await OrdenCompra.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['username', 'email']
        },
        {
          model: DetalleOrdenCompra,
          include: [
            {
              model: Medicamento,
              attributes: ['nombre', 'precio']
            }
          ]
        }
      ]
    });
    
    if (data) {
      res.send(data);
    } else {
      res.status(404).send({
        message: `No se encontró la orden de compra con id=${id}.`
      });
    }
  } catch (err) {
    res.status(500).send({
      message: "Error al obtener la orden de compra con id=" + id
    });
  }
};

// Actualizar el estado de una orden de compra
const updateEstadoOrdenCompra = async (req, res) => {
  const id = req.params.id;
  const { estado } = req.body;
  
  // Validar estado
  if (!estado || !['pendiente', 'completada', 'cancelada'].includes(estado)) {
    return res.status(400).send({
      message: "El estado proporcionado no es válido. Debe ser 'pendiente', 'completada' o 'cancelada'."
    });
  }

  try {
    const ordenCompra = await OrdenCompra.findByPk(id);
    
    if (!ordenCompra) {
      return res.status(404).send({
        message: `No se encontró la orden de compra con id=${id}.`
      });
    }
    
    // Si se cancela una orden que estaba completada, restaurar el stock
    if (ordenCompra.estado === 'completada' && estado === 'cancelada') {
      const detalles = await DetalleOrdenCompra.findAll({
        where: { ordenCompraId: id },
        include: [{ model: Medicamento }]
      });
      
      for (const detalle of detalles) {
        await detalle.medicamento.update({
          stock: detalle.medicamento.stock + detalle.cantidad
        });
      }
    }
    
    // Si se completa una orden que estaba cancelada, reducir el stock
    if (ordenCompra.estado === 'cancelada' && estado === 'completada') {
      const detalles = await DetalleOrdenCompra.findAll({
        where: { ordenCompraId: id },
        include: [{ model: Medicamento }]
      });
      
      for (const detalle of detalles) {
        // Verificar stock
        if (detalle.medicamento.stock < detalle.cantidad) {
          return res.status(400).send({
            message: `Stock insuficiente para el medicamento "${detalle.medicamento.nombre}"`
          });
        }
        
        await detalle.medicamento.update({
          stock: detalle.medicamento.stock - detalle.cantidad
        });
      }
    }
    
    // Actualizar estado
    await ordenCompra.update({ estado });
    
    res.send({
      message: `El estado de la orden de compra se actualizó a "${estado}" exitosamente.`
    });
  } catch (err) {
    res.status(500).send({
      message: "Error al actualizar el estado de la orden de compra: " + err.message
    });
  }
};

// Obtener todas las órdenes de compra de un usuario específico
const findUserOrdenCompras = async (req, res) => {
  try {
    const data = await OrdenCompra.findAll({
      where: { userId: req.userId },
      include: [
        {
          model: DetalleOrdenCompra,
          include: [
            {
              model: Medicamento,
              attributes: ['nombre', 'precio']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Ocurrió un error al obtener las órdenes de compra del usuario."
    });
  }
};

// Cancelar una orden de compra
const cancelarOrdenCompra = async (req, res) => {
  const id = req.params.id;

  try {
    const ordenCompra = await OrdenCompra.findByPk(id);
    
    if (!ordenCompra) {
      return res.status(404).send({
        message: `No se encontró la orden de compra con id=${id}.`
      });
    }
    
    // Verificar si el usuario actual es el dueño de la orden
    if (ordenCompra.userId !== req.userId && !req.userRoles.includes('ROLE_ADMIN')) {
      return res.status(403).send({
        message: "No tiene permiso para cancelar esta orden."
      });
    }
    
    // Solo se puede cancelar si está pendiente
    if (ordenCompra.estado !== 'pendiente') {
      return res.status(400).send({
        message: `No se puede cancelar una orden que ya está ${ordenCompra.estado}.`
      });
    }
    
    // Obtener detalles para restaurar stock
    const detalles = await DetalleOrdenCompra.findAll({
      where: { ordenCompraId: id },
      include: [{ model: Medicamento }]
    });
    
    // Restaurar stock
    for (const detalle of detalles) {
      await detalle.medicamento.update({
        stock: detalle.medicamento.stock + detalle.cantidad
      });
    }
    
    // Actualizar estado a cancelada
    await ordenCompra.update({ estado: 'cancelada' });
    
    res.send({
      message: "Orden de compra cancelada exitosamente."
    });
  } catch (err) {
    res.status(500).send({
      message: "Error al cancelar la orden de compra: " + err.message
    });
  }
};

// Generar reporte de ventas por periodo
const generarReporteVentas = async (req, res) => {
  const { fechaInicio, fechaFin } = req.query;
  
  try {
    // Validar fechas
    const inicio = fechaInicio ? new Date(fechaInicio) : new Date(0);
    const fin = fechaFin ? new Date(fechaFin) : new Date();
    
    // Ajustar la fecha final para incluir todo el día
    fin.setHours(23, 59, 59, 999);
    
    // Buscar órdenes completadas en el periodo
    const ordenes = await OrdenCompra.findAll({
      where: {
        estado: 'completada',
        fecha: {
          [db.Sequelize.Op.between]: [inicio, fin]
        }
      },
      include: [
        {
          model: User,
          attributes: ['username', 'email']
        },
        {
          model: DetalleOrdenCompra,
          include: [
            {
              model: Medicamento,
              attributes: ['nombre', 'precio']
            }
          ]
        }
      ]
    });
    
    // Calcular totales
    let totalVentas = 0;
    let medicamentosVendidos = {};
    
    ordenes.forEach(orden => {
      totalVentas += parseFloat(orden.total);
      
      orden.detalleOrdenCompras.forEach(detalle => {
        const medicamentoNombre = detalle.medicamento.nombre;
        
        if (!medicamentosVendidos[medicamentoNombre]) {
          medicamentosVendidos[medicamentoNombre] = {
            cantidad: 0,
            total: 0
          };
        }
        
        medicamentosVendidos[medicamentoNombre].cantidad += detalle.cantidad;
        medicamentosVendidos[medicamentoNombre].total += parseFloat(detalle.subtotal);
      });
    });
    
    // Convertir a array para ordenar por cantidad vendida
    const medicamentosMasVendidos = Object.entries(medicamentosVendidos).map(([nombre, datos]) => ({
      nombre,
      cantidad: datos.cantidad,
      total: datos.total
    })).sort((a, b) => b.cantidad - a.cantidad);
    
    res.send({
      periodo: {
        inicio: inicio.toISOString().split('T')[0],
        fin: fin.toISOString().split('T')[0]
      },
      totalVentas: totalVentas.toFixed(2),
      cantidadOrdenes: ordenes.length,
      medicamentosMasVendidos: medicamentosMasVendidos.slice(0, 5), // Top 5
      ordenes
    });
  } catch (err) {
    res.status(500).send({
      message: "Error al generar el reporte de ventas: " + err.message
    });
  }
};

export default {
  createOrdenCompra,
  findAllOrdenCompras,
  findOneOrdenCompra,
  updateEstadoOrdenCompra,
  findUserOrdenCompras,
  cancelarOrdenCompra,
  generarReporteVentas
};