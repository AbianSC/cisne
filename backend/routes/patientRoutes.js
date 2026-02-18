// routes/patientRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  getPatientTherapists,
  getMedicalHistory,
  getPatientServices,
  payService,
  getPatientResources,
  consumeResource,
  getPatientStats,
  searchPatients
} = require('../controllers/patientController');

// Rutas base
router.route('/')
  .get(getAllPatients)
  .post(createPatient);

// Búsqueda
router.get('/search', searchPatients);

// Rutas por ID
router.route('/:id')
  .get(getPatientById)
  .put(updatePatient)
  .delete(deletePatient);

// Terapeutas del paciente
router.get('/:id/therapists', getPatientTherapists);

// Servicios del paciente
router.route('/:id/services')
  .get(getPatientServices)
  .post(payService);

// Recursos del paciente
router.route('/:id/resources')
  .get(getPatientResources)
  .post(consumeResource);

module.exports = router;