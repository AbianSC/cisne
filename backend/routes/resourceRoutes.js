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

// ======================
// RUTAS "FIJAS" 
// ======================

// Nuevas
router.get('/mine', verifyToken, requireRole("THERAPIST"), getMyResources);
router.get('/feed', verifyToken, requireRole("PATIENT"), getPatientFeed);

// Especiales
router.get('/search', searchResources);
router.get('/popular', getPopularResources);
router.get('/stats', verifyToken, requireRole("ADMIN"), getResourcesStats);

// Filtros
router.get('/by-type/:type', getResourcesByType);
router.get('/by-therapist/:therapistId', getResourcesByTherapist);

// ======================
// BASE
// ======================
router.route('/')
  .get(getAllResources)
  .post(verifyToken, requireRole("ADMIN", "THERAPIST"), createResource);

// ======================
// RUTAS POR ID
// ======================

// Sub-recursos (más específicas que /:id)
router.get('/:id/consumers', verifyToken, requireRole("ADMIN", "THERAPIST"), getResourceConsumers);
router.get('/:id/publishers', getResourcePublishers);

// Recurso por ID
router.route('/:id')
  .get(getResourceById)
  .put(verifyToken, requireRole("ADMIN", "THERAPIST"), updateResource)
  .delete(verifyToken, requireRole("ADMIN", "THERAPIST"), deleteResource);

module.exports = router;