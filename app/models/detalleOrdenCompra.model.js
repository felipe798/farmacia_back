export default (sequelize, Sequelize) => {
    const DetalleOrdenCompra = sequelize.define("detalleOrdenCompras", {
      cantidad: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      precioUnitario: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      subtotal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      }
    });
  
    return DetalleOrdenCompra;
  };