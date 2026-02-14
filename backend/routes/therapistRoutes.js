// routes/therapistRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllTherapists,
  getTherapistById,
  createTherapist,
  updateTherapist,
  deleteTherapist,
  getTherapistPatients,
  addPatientToTherapist,
  updateTreatmentReport,
  removePatientFromTherapist,
  getTherapistCourses,
  buyCourse,
  getTherapistResources,
  publishResource,
  getTherapistStats
} = require('../controllers/therapistController');

// Rutas base
router.route('/')
  .get(getAllTherapists)
  .post(createTherapist);

// Rutas por ID
router.route('/:id')
  .get(getTherapistById)
  .put(updateTherapist)
  .delete(deleteTherapist);

// Pacientes del terapeuta
router.route('/:id/patients')
  .get(getTherapistPatients)
  .post(addPatientToTherapist);

router.route('/:id/patients/:patientId')
  .put(updateTreatmentReport)
  .delete(removePatientFromTherapist);

// Cursos del terapeuta
router.route('/:id/courses')
  .get(getTherapistCourses)
  .post(buyCourse);

// Recursos del terapeuta
router.route('/:id/resources')
  .get(getTherapistResources)
  .post(publishResource);

// Estadísticas
router.get('/:id/stats', getTherapistStats);

module.exports = router;