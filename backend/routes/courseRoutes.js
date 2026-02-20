const express = require("express");
const router = express.Router();

const { verifyToken, requireRole } = require("../middlewares/authJwt");
const courseController = require("../controllers/courseController");

// mine=true => exige token
const authIfMine = (req, res, next) => {
  if (req.query.mine === "true") return verifyToken(req, res, next);
  return next();
};

// Especiales
router.get("/available", courseController.getAvailableCourses);
router.get("/by-type/:type", courseController.getCoursesByType);
router.get("/by-teacher/:teacher", courseController.getCoursesByTeacher);

router.get("/stats", verifyToken, requireRole("ADMIN"), courseController.getCoursesStats);

// Base
router.get("/", authIfMine, courseController.getAllCourses);
router.post("/", verifyToken, requireRole("ADMIN", "CENTRE"), courseController.createCourse);

// Por ID
router.get("/:id", courseController.getCourseById);
router.put("/:id", verifyToken, requireRole("ADMIN", "CENTRE"), courseController.updateCourse);
router.delete("/:id", verifyToken, requireRole("ADMIN", "CENTRE"), courseController.deleteCourse);

// Relaciones
router.get("/:id/therapists", verifyToken, requireRole("ADMIN", "CENTRE"), courseController.getCourseTherapists);
router.get("/:id/centres", courseController.getCourseCentres);

module.exports = router;