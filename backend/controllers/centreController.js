// controllers/centreController.js
const db = require("../models");
const Centre = db.Centre;
const User = db.User;
const Therapist = db.Therapist;
const Employs = db.Employs;
const Course = db.Course;
const Service = db.Service;

const Op = db.Sequelize.Op;

const isAdmin = (req) => req.user?.role === "ADMIN";
const isCentre = (req) => req.user?.role === "CENTRE";

// CENTRE solo puede operar sobre su propio id (req.user.id)
function assertCentreOwnership(req, centreId) {
  if (isAdmin(req)) return; // admin puede todo
  if (!isCentre(req)) {
    const err = new Error("No tienes permisos.");
    err.statusCode = 403;
    throw err;
  }
  if (Number(req.user.id) !== Number(centreId)) {
    const err = new Error("No puedes gestionar un centro que no es el tuyo.");
    err.statusCode = 403;
    throw err;
  }
}

/**
 * Controlador de Centros
 */

// GET /api/centres (public)
exports.getAllCentres = async (req, res) => {
  try {
    const centres = await Centre.findAll({
      include: [
        { model: User, attributes: ["email", "role"] },
        { model: Service, attributes: ["Id_service", "Name"], required: false }
      ]
    });

    res.status(200).json({ success: true, count: centres.length, data: centres });
  } catch (error) {
    console.error("Error en getAllCentres:", error);
    res.status(500).json({ success: false, message: "Error al obtener centros", error: error.message });
  }
};

// GET /api/centres/:id (public)
exports.getCentreById = async (req, res) => {
  try {
    const { id } = req.params;

    const centre = await Centre.findByPk(id, {
      include: [
        { model: User, attributes: ["email", "role"] },
        { model: Service, attributes: ["Id_service", "Name"], required: false }
      ]
    });

    if (!centre) return res.status(404).json({ success: false, message: "Centro no encontrado" });

    res.status(200).json({ success: true, data: centre });
  } catch (error) {
    console.error("Error en getCentreById:", error);
    res.status(500).json({ success: false, message: "Error al obtener centro", error: error.message });
  }
};

// POST /api/centres (ADMIN)
exports.createCentre = async (req, res) => {
  try {
    const { Id_user_centre, CIF, name, location, Id_service } = req.body;

    if (!Id_user_centre || !CIF || !name) {
      return res.status(400).json({ success: false, message: "Id_user_centre, CIF y name son requeridos" });
    }

    const user = await User.findByPk(Id_user_centre);
    if (!user) return res.status(404).json({ success: false, message: "Usuario no encontrado" });

    const existingCIF = await Centre.findOne({ where: { CIF } });
    if (existingCIF) return res.status(409).json({ success: false, message: "El CIF ya está registrado" });

    const existingCentreUser = await Centre.findOne({ where: { Id_user_centre } });
    if (existingCentreUser) {
      return res.status(409).json({ success: false, message: "Este usuario ya está registrado como centro" });
    }

    if (Id_service) {
      const service = await Service.findByPk(Id_service);
      if (!service) return res.status(404).json({ success: false, message: "Servicio no encontrado" });
    }

    const centre = await Centre.create({ Id_user_centre, CIF, name, location, Id_service });

    res.status(201).json({ success: true, message: "Centro creado exitosamente", data: centre });
  } catch (error) {
    console.error("Error en createCentre:", error);
    res.status(500).json({ success: false, message: "Error al crear centro", error: error.message });
  }
};

// PUT /api/centres/:id (ADMIN o el propio CENTRE)
exports.updateCentre = async (req, res) => {
  try {
    const { id } = req.params;
    assertCentreOwnership(req, id);

    // ✅ FIX: faltaba "name"
    const { CIF, name, location, Id_service } = req.body;

    const centre = await Centre.findByPk(id);
    if (!centre) return res.status(404).json({ success: false, message: "Centro no encontrado" });

    if (CIF && CIF !== centre.CIF) {
      const existingCIF = await Centre.findOne({ where: { CIF } });
      if (existingCIF) return res.status(409).json({ success: false, message: "El CIF ya está registrado" });
    }

    if (Id_service) {
      const service = await Service.findByPk(Id_service);
      if (!service) return res.status(404).json({ success: false, message: "Servicio no encontrado" });
    }

    await centre.update({
      CIF: CIF ?? centre.CIF,
      name: name ?? centre.name,
      location: location ?? centre.location,
      Id_service: Id_service ?? centre.Id_service
    });

    res.status(200).json({ success: true, message: "Centro actualizado exitosamente", data: centre });
  } catch (error) {
    console.error("Error en updateCentre:", error);
    res.status(error.statusCode || 500).json({ success: false, message: error.message || "Error al actualizar centro" });
  }
};

// DELETE /api/centres/:id (ADMIN)
exports.deleteCentre = async (req, res) => {
  try {
    const { id } = req.params;

    const centre = await Centre.findByPk(id);
    if (!centre) return res.status(404).json({ success: false, message: "Centro no encontrado" });

    await centre.destroy();

    res.status(200).json({ success: true, message: "Centro eliminado exitosamente" });
  } catch (error) {
    console.error("Error en deleteCentre:", error);
    res.status(500).json({ success: false, message: "Error al eliminar centro", error: error.message });
  }
};

// GET /api/centres/:id/therapists (public)
exports.getCentreTherapists = async (req, res) => {
  try {
    const { id } = req.params;

    const centre = await Centre.findByPk(id, {
      include: [{
        model: Therapist,
        as: "therapists",
        through: { attributes: ["Contract"] },
        include: [{ model: User, attributes: ["email", "role"] }]
      }]
    });

    if (!centre) return res.status(404).json({ success: false, message: "Centro no encontrado" });

    res.status(200).json({ success: true, count: centre.therapists.length, data: centre.therapists });
  } catch (error) {
    console.error("Error en getCentreTherapists:", error);
    res.status(500).json({ success: false, message: "Error al obtener terapeutas del centro", error: error.message });
  }
};

// POST /api/centres/:id/therapists (ADMIN o el propio CENTRE)
exports.addTherapistToCentre = async (req, res) => {
  try {
    const { id } = req.params;
    assertCentreOwnership(req, id);

    const { Id_user_therapist, Contract } = req.body;

    if (!Id_user_therapist) {
      return res.status(400).json({ success: false, message: "Id_user_therapist es requerido" });
    }

    const centre = await Centre.findByPk(id);
    if (!centre) return res.status(404).json({ success: false, message: "Centro no encontrado" });

    const therapist = await Therapist.findByPk(Id_user_therapist);
    if (!therapist) return res.status(404).json({ success: false, message: "Terapeuta no encontrado" });

    const existingRelation = await Employs.findOne({
      where: { Id_user_centre: id, Id_user_therapist }
    });

    if (existingRelation) {
      return res.status(409).json({ success: false, message: "El terapeuta ya está empleado en este centro" });
    }

    await centre.addTherapist(therapist, { through: { Contract: Contract || "No especificado" } });

    res.status(201).json({ success: true, message: "Terapeuta agregado al centro exitosamente" });
  } catch (error) {
    console.error("Error en addTherapistToCentre:", error);
    res.status(error.statusCode || 500).json({ success: false, message: error.message || "Error al agregar terapeuta" });
  }
};

// DELETE /api/centres/:id/therapists/:therapistId (ADMIN o el propio CENTRE)
exports.removeTherapistFromCentre = async (req, res) => {
  try {
    const { id, therapistId } = req.params;
    assertCentreOwnership(req, id);

    const centre = await Centre.findByPk(id);
    if (!centre) return res.status(404).json({ success: false, message: "Centro no encontrado" });

    const therapist = await Therapist.findByPk(therapistId);
    if (!therapist) return res.status(404).json({ success: false, message: "Terapeuta no encontrado" });

    await centre.removeTherapist(therapist);

    res.status(200).json({ success: true, message: "Terapeuta removido del centro exitosamente" });
  } catch (error) {
    console.error("Error en removeTherapistFromCentre:", error);
    res.status(error.statusCode || 500).json({ success: false, message: error.message || "Error al remover terapeuta" });
  }
};

// GET /api/centres/:id/courses (public)
exports.getCentreCourses = async (req, res) => {
  try {
    const { id } = req.params;

    const centre = await Centre.findByPk(id, {
      include: [{ model: Course, as: "courses", through: { attributes: ["Post_date"] } }]
    });

    if (!centre) return res.status(404).json({ success: false, message: "Centro no encontrado" });

    res.status(200).json({ success: true, count: centre.courses.length, data: centre.courses });
  } catch (error) {
    console.error("Error en getCentreCourses:", error);
    res.status(500).json({ success: false, message: "Error al obtener cursos del centro", error: error.message });
  }
};

// POST /api/centres/:id/courses (ADMIN o el propio CENTRE)
exports.postCourse = async (req, res) => {
  try {
    const { id } = req.params;
    assertCentreOwnership(req, id);

    const { Id_course, Post_date } = req.body;

    if (!Id_course) return res.status(400).json({ success: false, message: "Id_course es requerido" });

    const centre = await Centre.findByPk(id);
    if (!centre) return res.status(404).json({ success: false, message: "Centro no encontrado" });

    const course = await Course.findByPk(Id_course);
    if (!course) return res.status(404).json({ success: false, message: "Curso no encontrado" });

    await centre.addCourse(course, { through: { Post_date: Post_date || new Date() } });

    res.status(201).json({ success: true, message: "Curso publicado exitosamente" });
  } catch (error) {
    console.error("Error en postCourse:", error);
    res.status(error.statusCode || 500).json({ success: false, message: error.message || "Error al publicar curso" });
  }
};

// GET /api/centres/search (public)
exports.searchCentres = async (req, res) => {
  try {
    const { location, CIF } = req.query;

    const whereClause = {};
    if (location) whereClause.location = { [Op.like]: `%${location}%` };
    if (CIF) whereClause.CIF = { [Op.like]: `%${CIF}%` };

    const centres = await Centre.findAll({
      where: whereClause,
      include: [{ model: User, attributes: ["email", "role"] }]
    });

    res.status(200).json({ success: true, count: centres.length, data: centres });
  } catch (error) {
    console.error("Error en searchCentres:", error);
    res.status(500).json({ success: false, message: "Error al buscar centros", error: error.message });
  }
};

// ======================
// NUEVOS /me (comodidad)
// ======================
exports.getMyCentreTherapists = (req, res) => {
  // El centre logado es req.user.id
  req.params.id = req.user.id;
  return exports.getCentreTherapists(req, res);
};

exports.addTherapistToMyCentre = (req, res) => {
  req.params.id = req.user.id;
  return exports.addTherapistToCentre(req, res);
};

exports.removeTherapistFromMyCentre = (req, res) => {
  req.params.id = req.user.id;
  return exports.removeTherapistFromCentre(req, res);
};

exports.getMyCentreCourses = (req, res) => {
  req.params.id = req.user.id;
  return exports.getCentreCourses(req, res);
};

exports.postCourseToMyCentre = (req, res) => {
  req.params.id = req.user.id;
  return exports.postCourse(req, res);
};
