export default (sequelize, Sequelize) => {
    const OrdenCompra = sequelize.define("ordenCompras", {
      fecha: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      estado: {
        type: Sequelize.ENUM('pendiente', 'completada', 'cancelada'),
        defaultValue: 'pendiente'
      },
      total: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      }
    });
  
    return OrdenCompra;
  };