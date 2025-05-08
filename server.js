import express from "express";
import cors from "cors";
import db from "./app/models/index.js";
import authRoutes from "./app/routes/auth.routes.js";
import userRoutes from "./app/routes/user.routes.js";
import farmaciaRoutes from "./app/routes/farmacia.routes.js";

const app = express();

const corsOptions = {
  origin: "http://localhost:3000" // URL de tu frontend
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

// Puerto
const PORT = process.env.PORT || 8080;

// Sincronizar base de datos
// En producción, deberías usar { force: false }
db.sequelize.sync({ force: true }).then(() => {
  console.log("Eliminando y re-sincronizando la base de datos.");
  initial(); // Función para inicializar roles
  inicializarDatosDePrueba(); // Función para inicializar datos de prueba
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}.`);
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
  }
}