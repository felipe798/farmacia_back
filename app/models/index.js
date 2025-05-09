import { Sequelize } from "sequelize";
import config from "../config/db.config.js";
import bcrypt from "bcryptjs"; // Asegúrate de instalar bcryptjs

import defineUser from "./user.model.js";
import defineRole from "./role.model.js";
import defineMedicamento from "./medicamento.model.js";
import defineLaboratorio from "./laboratorio.model.js";
import defineOrdenCompra from "./ordenCompra.model.js";
import defineDetalleOrdenCompra from "./detalleOrdenCompra.model.js";

const sequelize = new Sequelize(
  config.DB,
  config.USER,
  config.PASSWORD,
  {
    host: config.HOST,
    dialect: config.dialect,
    dialectOptions: config.dialectOptions,
    pool: {
      max: config.pool.max,
      min: config.pool.min,
      acquire: config.pool.acquire,
      idle: config.pool.idle
    }
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Definir modelos
db.user = defineUser(sequelize, Sequelize);
db.role = defineRole(sequelize, Sequelize);
db.medicamento = defineMedicamento(sequelize, Sequelize);
db.laboratorio = defineLaboratorio(sequelize, Sequelize);
db.ordenCompra = defineOrdenCompra(sequelize, Sequelize);
db.detalleOrdenCompra = defineDetalleOrdenCompra(sequelize, Sequelize);

// Establecer relaciones
db.role.belongsToMany(db.user, {
  through: "user_roles",
  foreignKey: "roleId",
  otherKey: "userId"
});

db.user.belongsToMany(db.role, {
  through: "user_roles",
  foreignKey: "userId",
  otherKey: "roleId"
});

// Relaciones de farmacia
db.laboratorio.hasMany(db.medicamento, { foreignKey: 'laboratorioId' });
db.medicamento.belongsTo(db.laboratorio, { foreignKey: 'laboratorioId' });

db.user.hasMany(db.ordenCompra, { foreignKey: 'userId' });
db.ordenCompra.belongsTo(db.user, { foreignKey: 'userId' });

db.ordenCompra.hasMany(db.detalleOrdenCompra, { foreignKey: 'ordenCompraId' });
db.detalleOrdenCompra.belongsTo(db.ordenCompra, { foreignKey: 'ordenCompraId' });

db.medicamento.hasMany(db.detalleOrdenCompra, { foreignKey: 'medicamentoId' });
db.detalleOrdenCompra.belongsTo(db.medicamento, { foreignKey: 'medicamentoId' });

db.ROLES = ["user", "admin", "moderator"];

// Función para inicializar la base de datos con roles y usuario admin
db.inicializarBD = async () => {
  try {
    // Inicializar roles
    await db.role.bulkCreate([
      { id: 1, name: "user" },
      { id: 2, name: "moderator" },
      { id: 3, name: "admin" }
    ]);
    
    console.log("Roles creados exitosamente");
    
    // Crear usuario admin
    const adminUsername = "admin";
    const adminEmail = "admin@farmacia.com";
    const adminPassword = "Admin123!";
    
    // Encriptar manualmente la contraseña para asegurar compatibilidad
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);
    
    // Verificar si el usuario ya existe
    const existingUser = await db.user.findOne({
      where: { username: adminUsername }
    });
    
    if (!existingUser) {
      // Crear usuario admin
      const adminUser = await db.user.create({
        username: adminUsername,
        email: adminEmail,
        password: hashedPassword
      });
      
      // Asignar rol de admin
      await adminUser.setRoles([3]); // El ID 3 es para el rol "admin"
      
      console.log("Usuario administrador creado exitosamente:");
      console.log("- Username:", adminUsername);
      console.log("- Email:", adminEmail);
      console.log("- Password:", adminPassword);
    } else {
      console.log("El usuario administrador ya existe");
    }
    
    return true;
  } catch (error) {
    console.error("Error al inicializar la base de datos:", error);
    return false;
  }
};

export default db;