// routes/courseRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseTherapists,
  getCourseCentres,
  getAvailableCourses,
  getCoursesByType,
  getCoursesByTeacher,
  getCoursesStats
} = require('../controllers/courseController');

// Rutas especiales (deben ir antes de /:id)
router.get('/available', getAvailableCourses);
router.get('/stats', getCoursesStats);
router.get('/by-type/:type', getCoursesByType);
router.get('/by-teacher/:teacher', getCoursesByTeacher);

// Rutas base
router.route('/')
  .get(getAllCourses)
  .post(createCourse);

// Rutas por ID
router.route('/:id')
  .get(getCourseById)
  .put(updateCourse)
  .delete(deleteCourse);

// Terapeutas del curso
router.get('/:id/therapists', getCourseTherapists);

// Centros del curso
router.get('/:id/centres', getCourseCentres);

module.exports = router;