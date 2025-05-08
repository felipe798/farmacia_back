export default {
    HOST: "localhost",
    USER: "root",
    PASSWORD: "", // Cambia esto por tu contraseña de MySQL
    DB: "bd_Farmacia",
    dialect: "mysql",
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  };