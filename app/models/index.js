import { Sequelize } from "sequelize";
import config from "../config/db.config.js";

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

export default db;