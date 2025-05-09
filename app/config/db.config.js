export default {
  HOST: "dpg-d0e3f5gdl3ps73bac4k0-a.oregon-postgres.render.com", // Completa aquí con el hostname real de Render
  USER: "root", // Reemplaza con tu nombre de usuario real
  PASSWORD: "3y8XhLvvEAkZWbzPXZE56XWWtQyfvvGa",
  DB: "bd_farmacia",
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false // Necesario para conexiones a bases de datos en Render
    }
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};