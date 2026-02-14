// routes/serviceRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getServicePatients,
  getAvailableServices,
  getServicesByDateRange,
  getServicesStats
} = require('../controllers/serviceController');

// Rutas especiales (deben ir antes de /:id)
router.get('/available', getAvailableServices);
router.get('/by-date-range', getServicesByDateRange);
router.get('/stats', getServicesStats);

// Rutas base
router.route('/')
  .get(getAllServices)
  .post(createService);

// Rutas por ID
router.route('/:id')
  .get(getServiceById)
  .put(updateService)
  .delete(deleteService);

// Pacientes del servicio
router.get('/:id/patients', getServicePatients);

module.exports = router;