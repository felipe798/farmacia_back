export default (sequelize, Sequelize) => {
    const Medicamento = sequelize.define("medicamentos", {
      nombre: {
        type: Sequelize.STRING,
        allowNull: false
      },
      descripcion: {
        type: Sequelize.TEXT
      },
      precio: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      stock: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      fechaVencimiento: {
        type: Sequelize.DATE
      }
    });
  
    return Medicamento;
  };