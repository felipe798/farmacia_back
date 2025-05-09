import express from "express";
import cors from "cors";
import * as dotenv from 'dotenv';
import db from "./app/models/index.js";
import authRoutes from "./app/routes/auth.routes.js";
import userRoutes from "./app/routes/user.routes.js";
import farmaciaRoutes from "./app/routes/farmacia.routes.js";
import bcrypt from "bcryptjs";

// Cargar variables de entorno
dotenv.config();

const app = express();

// Configuración CORS para permitir solicitudes del frontend
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ["http://localhost:3000"],
  credentials: true
};

app.use(cors(corsOptions));

// Parsear requests de content-type - application/json
app.use(express.json());

// Parsear requests de content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Ruta simple
app.get("/", (req, res) => {
  res.json({ message: "Bienvenido a la API de Farmacia." });
});

// Rutas
authRoutes(app);
userRoutes(app);
farmaciaRoutes(app);

// Puerto - utiliza la variable de entorno PORT si está disponible
const PORT = process.env.PORT || 8080;

// Secuencia de inicialización
async function inicializarBaseDeDatos() {
  try {
    // Determinar si se debe resetear la base de datos
    // En producción, es mejor usar { force: false }
    const shouldReset = process.env.NODE_ENV === 'production' ? false : true;
    
    // Sincronizar base de datos
    await db.sequelize.sync({ force: shouldReset });
    
    if (shouldReset) {
      console.log("Eliminando y re-sincronizando la base de datos.");
      
      // Crear roles
      await initial();
      
      // Crear datos de prueba
      await inicializarDatosDePrueba();
      
      // Crear usuario administrador
      await crearUsuarioAdmin();
      
      console.log("Base de datos inicializada correctamente");
    } else {
      console.log("Base de datos sincronizada sin reset.");
    }
  } catch (error) {
    console.error("Error al inicializar la base de datos:", error);
  }
}

// Iniciar servidor y base de datos
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}.`);
  inicializarBaseDeDatos();
});

// Función para crear roles iniciales
async function initial() {
  try {
    await db.role.create({
      id: 1,
      name: "user"
    });
   
    await db.role.create({
      id: 2,
      name: "moderator"
    });
  
    await db.role.create({
      id: 3,
      name: "admin"
    });

    console.log("Roles creados exitosamente");
  } catch (err) {
    console.error("Error al crear roles:", err);
    throw err; // Propagar error para manejo en inicializarBaseDeDatos
  }
}

// Función para inicializar datos de prueba
async function inicializarDatosDePrueba() {
  try {
    // Crear laboratorios
    const lab1 = await db.laboratorio.create({
      nombre: "Laboratorio Bayer",
      direccion: "Av. Principal 123",
      telefono: "999-888-777",
      email: "contacto@bayer.com"
    });

    const lab2 = await db.laboratorio.create({
      nombre: "Farmacorp",
      direccion: "Calle Secundaria 456",
      telefono: "111-222-333",
      email: "info@farmacorp.com"
    });

    // Crear medicamentos
    await db.medicamento.create({
      nombre: "Paracetamol",
      descripcion: "Analgésico y antipirético",
      precio: 5.50,
      stock: 100,
      fechaVencimiento: "2026-01-01",
      laboratorioId: lab1.id
    });

    await db.medicamento.create({
      nombre: "Ibuprofeno",
      descripcion: "Antiinflamatorio no esteroideo",
      precio: 7.80,
      stock: 80,
      fechaVencimiento: "2026-03-15",
      laboratorioId: lab1.id
    });

    await db.medicamento.create({
      nombre: "Amoxicilina",
      descripcion: "Antibiótico de amplio espectro",
      precio: 12.35,
      stock: 50,
      fechaVencimiento: "2025-12-10",
      laboratorioId: lab2.id
    });

    console.log("Datos de prueba creados exitosamente");
  } catch (err) {
    console.error("Error al crear datos de prueba:", err);
    throw err; // Propagar error para manejo en inicializarBaseDeDatos
  }
}

// Función para crear el usuario administrador
async function crearUsuarioAdmin() {
  try {
    // Credenciales del usuario administrador
    const adminUsername = "admin";
    const adminEmail = "admin@farmacia.com";
    const adminPassword = "Admin123!";
    
    // Encriptar la contraseña para asegurar compatibilidad con el inicio de sesión
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);
    
    // Verificar si el usuario ya existe
    const existingUser = await db.user.findOne({
      where: { username: adminUsername }
    });
    
    if (!existingUser) {
      // Buscar el rol de administrador
      const adminRole = await db.role.findOne({
        where: { name: "admin" }
      });
      
      if (!adminRole) {
        throw new Error("No se encontró el rol de administrador");
      }
      
      // Crear el usuario admin con contraseña encriptada
      const adminUser = await db.user.create({
        username: adminUsername,
        email: adminEmail,
        password: hashedPassword // Usar contraseña encriptada
      });
      
      // Asignar rol de administrador
      await adminUser.setRoles([adminRole]);
      
      console.log("Usuario administrador creado con éxito:");
      console.log("- Username:", adminUsername);
      console.log("- Email:", adminEmail);
      console.log("- Password:", adminPassword); // Contraseña sin encriptar (solo para referencia)
    } else {
      console.log("El usuario administrador ya existe.");
    }
  } catch (error) {
    console.error("Error al crear usuario administrador:", error);
    throw error; // Propagar error para manejo en inicializarBaseDeDatos
  }
}