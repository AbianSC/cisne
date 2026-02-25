// routes/resourceRoutes.js
const express = require('express');
const router = express.Router();

const { verifyToken, requireRole } = require("../middlewares/authJwt");

const {
  getAllResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
  getResourcesByType,
  getResourcesByTherapist,
  getResourceConsumers,
  getResourcePublishers,
  getPopularResources,
  getResourcesStats,
  searchResources,

  // NUEVAS
  getMyResources,
  getPatientFeed
} = require('../controllers/resourceController');

// ✅ NUEVAS (antes de /:id)
router.get('/mine', verifyToken, requireRole("THERAPIST"), getMyResources);
router.get('/feed', verifyToken, requireRole("PATIENT"), getPatientFeed);

// Rutas especiales (deben ir antes de /:id)
router.get('/search', searchResources);
router.get('/popular', getPopularResources);
router.get('/stats', verifyToken, requireRole("ADMIN"), getResourcesStats); // stats mejor solo admin
router.get('/by-type/:type', getResourcesByType);
router.get('/by-therapist/:therapistId', getResourcesByTherapist);

// Rutas base
router.route('/')
  .get(getAllResources)
  .post(verifyToken, requireRole("ADMIN", "THERAPIST"), createResource); // ✅ privado

// Rutas por ID
router.route('/:id')
  .get(getResourceById)
  .put(verifyToken, requireRole("ADMIN", "THERAPIST"), updateResource)   // ✅ privado
  .delete(verifyToken, requireRole("ADMIN", "THERAPIST"), deleteResource); // ✅ privado

// Consumidores y publicadores
router.get('/:id/consumers', verifyToken, requireRole("ADMIN", "THERAPIST"), getResourceConsumers);
router.get('/:id/publishers', getResourcePublishers);

module.exports = router;