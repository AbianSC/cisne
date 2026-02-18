const express = require("express");
require("dotenv").config();
const cors = require("cors");

const app = express();

// ==================== MIDDLEWARES ====================

// CORS - Configuración para Ionic
const corsOptions = {
  origin: '*', // En producción especificar el dominio exacto
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== BASE DE DATOS ====================

const db = require("./models");

// Sincronizar base de datos
db.sequelize.sync()
  .then(() => {
    console.log("✅ sync db.");
  })
  .catch((err) => {
    console.error("❌ Error syncing database:", err);
  });

// En desarrollo, puedes descomentar para recrear las tablas
//BORRA y crea todo desde cero:
// db.sequelize.sync({ force: true }).then(() => {
//   console.log("Drop and re-sync db.");
// });
// Crea/ajusta sin borrar:
// db.sequelize.sync({ alter: true }).then(() => {
//   console.log("sync database");
// });

// ==================== RUTAS ====================

// Importar rutas
const userRoutes = require('./routes/userRoutes');
const centreRoutes = require('./routes/centreRoutes');
const therapistRoutes = require('./routes/therapistRoutes');
const patientRoutes = require('./routes/patientRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const courseRoutes = require('./routes/courseRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const authRoutes = require('./routes/authRoutes');

// Ruta raíz
app.get("/", (req, res) => {
  res.json({ 
    message: "Welcome to CISNE application.",
    version: "1.0.0",
    endpoints: {
      users: "/api/users",
      centres: "/api/centres",
      therapists: "/api/therapists",
      patients: "/api/patients",
      services: "/api/services",
      courses: "/api/courses",
      resources: "/api/resources",
      invoices: "/api/invoices",
      auth: "/api/auth"
    }
  });
});

// Health check
app.get("/health", async (req, res) => {
  try {
    await db.sequelize.authenticate();
    res.status(200).json({
      success: true,
      message: "Server is running",
      database: "Connected"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server is running but database is disconnected",
      error: error.message
    });
  }
});

// Montar rutas de la API
app.use('/api/users', userRoutes);
app.use('/api/centres', centreRoutes);
app.use('/api/therapists', therapistRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/auth', authRoutes);

// ==================== MANEJO DE ERRORES ====================

// Ruta no encontrada
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Manejador de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  res.status(statusCode).json({
    success: false,
    message: message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// ==================== INICIO DEL SERVIDOR ====================

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════════╗');
  console.log(`║  🚀 Servidor corriendo en puerto ${PORT}      ║`);
  console.log(`║  🌐 URL: http://localhost:${PORT}             ║`);
  console.log('╚════════════════════════════════════════════╝');
});

module.exports = app;