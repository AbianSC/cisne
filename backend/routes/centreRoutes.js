// routes/centreRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllCentres,
  getCentreById,
  createCentre,
  updateCentre,
  deleteCentre,
  getCentreTherapists,
  addTherapistToCentre,
  removeTherapistFromCentre,
  getCentreCourses,
  postCourse,
  searchCentres
} = require('../controllers/centreController');

// Rutas base
router.route('/')
  .get(getAllCentres)
  .post(createCentre);

// Búsqueda
router.get('/search', searchCentres);

// Rutas por ID
router.route('/:id')
  .get(getCentreById)
  .put(updateCentre)
  .delete(deleteCentre);

// Terapeutas del centro
router.route('/:id/therapists')
  .get(getCentreTherapists)
  .post(addTherapistToCentre);

router.delete('/:id/therapists/:therapistId', removeTherapistFromCentre);

// Cursos del centro
router.route('/:id/courses')
  .get(getCentreCourses)
  .post(postCourse);

module.exports = router;