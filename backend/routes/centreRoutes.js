// routes/centreRoutes.js
const express = require("express");
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

  searchCentres,

  // NUEVOS (recomendados)
  getMyCentreTherapists,
  addTherapistToMyCentre,
  removeTherapistFromMyCentre,
  getMyCentreCourses,
  postCourseToMyCentre
} = require("../controllers/centreController");

const { verifyToken, requireRole } = require("../middlewares/authJwt");

// Públicas
router.get("/search", searchCentres);
router.get("/", getAllCentres);
router.get("/:id", getCentreById);

// ====== NUEVOS (sin :id) -> mejor para frontend ======
router.get(
  "/me/therapists",
  verifyToken,
  requireRole("CENTRE", "ADMIN"),
  getMyCentreTherapists
);

router.post(
  "/me/therapists",
  verifyToken,
  requireRole("CENTRE", "ADMIN"),
  addTherapistToMyCentre
);

router.delete(
  "/me/therapists/:therapistId",
  verifyToken,
  requireRole("CENTRE", "ADMIN"),
  removeTherapistFromMyCentre
);

router.get(
  "/me/courses",
  verifyToken,
  requireRole("CENTRE", "ADMIN"),
  getMyCentreCourses
);

router.post(
  "/me/courses",
  verifyToken,
  requireRole("CENTRE", "ADMIN"),
  postCourseToMyCentre
);

// ====== CRUD Centro (restringido) ======
// Normalmente esto debería ser ADMIN (porque el centro se crea en register),
// pero lo dejo como ADMIN para no abrir agujeros.
router.post("/", verifyToken, requireRole("ADMIN"), createCentre);
router.put("/:id", verifyToken, requireRole("ADMIN", "CENTRE"), updateCentre);
router.delete("/:id", verifyToken, requireRole("ADMIN"), deleteCentre);

// ====== Endpoints existentes (mantengo) pero con seguridad ======

// Terapeutas del centro (GET público OK)
router.get("/:id/therapists", getCentreTherapists);

// Contratar/desvincular: privado
router.post("/:id/therapists", verifyToken, requireRole("ADMIN", "CENTRE"), addTherapistToCentre);
router.delete("/:id/therapists/:therapistId", verifyToken, requireRole("ADMIN", "CENTRE"), removeTherapistFromCentre);

// Cursos del centro (GET público OK)
router.get("/:id/courses", getCentreCourses);

// Publicar curso: privado
router.post("/:id/courses", verifyToken, requireRole("ADMIN", "CENTRE"), postCourse);

module.exports = router;