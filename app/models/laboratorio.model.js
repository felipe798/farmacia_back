export default (sequelize, Sequelize) => {
    const Laboratorio = sequelize.define("laboratorios", {
      nombre: {
        type: Sequelize.STRING,
        allowNull: false
      },
      direccion: {
        type: Sequelize.STRING
      },
      telefono: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      }
    });
  
    return Laboratorio;
  };