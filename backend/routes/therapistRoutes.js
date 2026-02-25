const { verifyToken, requireRole } = require("../middlewares/authJwt");
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
  getTherapistStats,
  getMyPatients,
  assignPatientToMe
} = require('../controllers/therapistController');

// Rutas base
router.route('/')
  .get(getAllTherapists)
  .post(createTherapist);

// ✅ THERAPIST (rutas cómodas para el frontend)

router.get('/me/patients', verifyToken, requireRole("THERAPIST"), getMyPatients);
router.post('/me/patients', verifyToken, requireRole("THERAPIST"), assignPatientToMe);

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