// routes/resourceRoutes.js
const express = require('express');
const router = express.Router();
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
  searchResources
} = require('../controllers/resourceController');

// Rutas especiales (deben ir antes de /:id)
router.get('/search', searchResources);
router.get('/popular', getPopularResources);
router.get('/stats', getResourcesStats);
router.get('/by-type/:type', getResourcesByType);
router.get('/by-therapist/:therapistId', getResourcesByTherapist);

// Rutas base
router.route('/')
  .get(getAllResources)
  .post(createResource);

// Rutas por ID
router.route('/:id')
  .get(getResourceById)
  .put(updateResource)
  .delete(deleteResource);

// Consumidores y publicadores
router.get('/:id/consumers', getResourceConsumers);
router.get('/:id/publishers', getResourcePublishers);

module.exports = router;