const db = require("../models");

const Course = db.Course;
const CourseInvoice = db.CourseInvoice;
const Invoice = db.Invoice;

const Centre = db.Centre;
const Therapist = db.Therapist;
const User = db.User;

const Posts = db.Posts; // tabla puente Centre-Course

const Op = db.Sequelize.Op;

const isAdmin = (req) => req.user?.role === "ADMIN";
const isCentre = (req) => req.user?.role === "CENTRE";

// Comprueba si un curso pertenece al centro logado (existe en POSTS)
const courseBelongsToCentre = async (courseId, centreId) => {
  const rel = await Posts.findOne({
    where: { Id_course: courseId, Id_user_centre: centreId }
  });
  return !!rel;
};

/**
 * CURSOS
 */

// GET /api/courses  (público, pero si mine=true exige token y role CENTRE/ADMIN)
exports.getAllCourses = async (req, res) => {
  try {
    const { name, teacher, type, minPrice, maxPrice, mine } = req.query;

    const whereClause = {};
    if (name) whereClause.Name = { [Op.like]: `%${name}%` };
    if (teacher) whereClause.Teacher = { [Op.like]: `%${teacher}%` };
    if (type) whereClause.Course_type = type;

    if (minPrice || maxPrice) {
      whereClause.Price = {};
      if (minPrice) whereClause.Price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) whereClause.Price[Op.lte] = parseFloat(maxPrice);
    }

    const include = [
      { model: CourseInvoice, include: [{ model: Invoice }] },
      { model: Centre, as: "centres", through: { attributes: ["Post_date"] } }
    ];

    // mine=true => devuelve SOLO los cursos del centro logado
    if (mine === "true") {
      if (!req.user) {
        return res.status(401).json({ success: false, message: "Necesitas iniciar sesión para usar mine=true." });
      }

      // ADMIN puede usar mine con centreId opcional (por si quieres ampliarlo luego).
      if (isCentre(req)) {
        include[1].where = { Id_user_centre: req.user.id };
        include[1].required = true;
      } else if (isAdmin(req)) {
        // admin: si pone mine=true sin más, devolvemos todos (o si quieres, podrías forzar centreId)
        // Aquí lo dejamos como "todos", porque admin ve todo.
      } else {
        return res.status(403).json({ success: false, message: "No tienes permisos para usar mine=true." });
      }
    }

    const courses = await Course.findAll({
      where: whereClause,
      include,
      order: [["Course_Date", "DESC"]]
    });

    return res.status(200).json({ success: true, count: courses.length, data: courses });
  } catch (error) {
    console.error("Error en getAllCourses:", error);
    return res.status(500).json({ success: false, message: "Error al obtener cursos", error: error.message });
  }
};

// GET /api/courses/:id  (público)
exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findByPk(id, {
      include: [
        { model: CourseInvoice, include: [{ model: Invoice }] },
        { model: Centre, as: "centres", through: { attributes: ["Post_date"] } },
        { model: Therapist, as: "therapists", through: { attributes: ["Buying_date"] } }
      ]
    });

    if (!course) return res.status(404).json({ success: false, message: "Curso no encontrado." });

    return res.status(200).json({ success: true, data: course });
  } catch (error) {
    console.error("Error en getCourseById:", error);
    return res.status(500).json({ success: false, message: "Error al obtener curso", error: error.message });
  }
};

// POST /api/courses  (ADMIN y CENTRE)
// - Si CENTRE: crea curso + lo asocia automáticamente en POSTS
// - Si ADMIN: crea curso (y opcionalmente puede asociarlo si envías centreId)
exports.createCourse = async (req, res) => {
  try {
    const {
      Id_course_invoice,
      Name,
      Teacher,
      Price,
      Course_type,
      Course_description,
      Course_Date,
      centreId // opcional para ADMIN
    } = req.body;

    if (!Name) {
      return res.status(400).json({ success: false, message: "El nombre del curso es requerido." });
    }

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Necesitas iniciar sesión." });
    }

    if (!isAdmin(req) && !isCentre(req)) {
      return res.status(403).json({ success: false, message: "No tienes permisos para crear cursos." });
    }

    if (Id_course_invoice) {
      const invoice = await CourseInvoice.findByPk(Id_course_invoice);
      if (!invoice) {
        return res.status(404).json({ success: false, message: "Factura de curso no encontrada." });
      }
    }

    const course = await Course.create({
      Id_course_invoice,
      Name,
      Teacher,
      Price,
      Course_type,
      Course_description,
      Course_Date
    });

    // Si crea un CENTRE -> asociar a su centro en POSTS
    if (isCentre(req)) {
      await Posts.create({
        Id_user_centre: req.user.id,
        Id_course: course.Id_course,
        Post_date: new Date()
      });
    }

    // Si crea un ADMIN y envía centreId -> asociar a ese centro (opcional)
    if (isAdmin(req) && centreId) {
      const centre = await Centre.findByPk(centreId);
      if (!centre) {
        return res.status(404).json({ success: false, message: "Centro no encontrado para asociar el curso." });
      }

      await Posts.create({
        Id_user_centre: centreId,
        Id_course: course.Id_course,
        Post_date: new Date()
      });
    }

    return res.status(201).json({
      success: true,
      message: "Curso creado correctamente.",
      data: course
    });
  } catch (error) {
    console.error("Error en createCourse:", error);
    return res.status(500).json({ success: false, message: "Error al crear curso", error: error.message });
  }
};

// PUT /api/courses/:id (ADMIN y CENTRE)
// - CENTRE solo si el curso es suyo
exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user) return res.status(401).json({ success: false, message: "Necesitas iniciar sesión." });

    const course = await Course.findByPk(id);
    if (!course) return res.status(404).json({ success: false, message: "Curso no encontrado." });

    if (isCentre(req)) {
      const ok = await courseBelongsToCentre(id, req.user.id);
      if (!ok) {
        return res.status(403).json({ success: false, message: "No puedes modificar un curso que no es de tu centro." });
      }
    } else if (!isAdmin(req)) {
      return res.status(403).json({ success: false, message: "No tienes permisos para modificar cursos." });
    }

    await course.update(req.body);

    return res.status(200).json({ success: true, message: "Curso actualizado correctamente.", data: course });
  } catch (error) {
    console.error("Error en updateCourse:", error);
    return res.status(500).json({ success: false, message: "Error al actualizar curso", error: error.message });
  }
};

// DELETE /api/courses/:id (ADMIN y CENTRE)
// - CENTRE solo si el curso es suyo
exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user) return res.status(401).json({ success: false, message: "Necesitas iniciar sesión." });

    const course = await Course.findByPk(id);
    if (!course) return res.status(404).json({ success: false, message: "Curso no encontrado." });

    if (isCentre(req)) {
      const ok = await courseBelongsToCentre(id, req.user.id);
      if (!ok) {
        return res.status(403).json({ success: false, message: "No puedes eliminar un curso que no es de tu centro." });
      }

      // borrar relación posts del centro con ese curso (para limpiar)
      await Posts.destroy({ where: { Id_user_centre: req.user.id, Id_course: id } });
    } else if (!isAdmin(req)) {
      return res.status(403).json({ success: false, message: "No tienes permisos para eliminar cursos." });
    }

    await course.destroy();

    return res.status(200).json({ success: true, message: "Curso eliminado correctamente." });
  } catch (error) {
    console.error("Error en deleteCourse:", error);
    return res.status(500).json({ success: false, message: "Error al eliminar curso", error: error.message });
  }
};

// GET /api/courses/:id/therapists (ADMIN y CENTRE)
exports.getCourseTherapists = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findByPk(id, {
      include: [{
        model: Therapist,
        as: "therapists",
        through: { attributes: ["Buying_date"] },
        include: [{ model: User, attributes: ["email", "role"] }]
      }]
    });

    if (!course) return res.status(404).json({ success: false, message: "Curso no encontrado." });

    return res.status(200).json({ success: true, count: course.therapists.length, data: course.therapists });
  } catch (error) {
    console.error("Error en getCourseTherapists:", error);
    return res.status(500).json({ success: false, message: "Error al obtener terapeutas del curso", error: error.message });
  }
};

// GET /api/courses/:id/centres (público)
exports.getCourseCentres = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findByPk(id, {
      include: [{
        model: Centre,
        as: "centres",
        through: { attributes: ["Post_date"] },
        include: [{ model: User, attributes: ["email", "role"] }]
      }]
    });

    if (!course) return res.status(404).json({ success: false, message: "Curso no encontrado." });

    return res.status(200).json({ success: true, count: course.centres.length, data: course.centres });
  } catch (error) {
    console.error("Error en getCourseCentres:", error);
    return res.status(500).json({ success: false, message: "Error al obtener centros del curso", error: error.message });
  }
};

// GET /api/courses/available (público)
exports.getAvailableCourses = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const courses = await Course.findAll({
      where: {
        [Op.or]: [
          { Course_Date: { [Op.gte]: today } },
          { Course_Date: null }
        ]
      },
      order: [["Course_Date", "ASC"]]
    });

    return res.status(200).json({ success: true, count: courses.length, data: courses });
  } catch (error) {
    console.error("Error en getAvailableCourses:", error);
    return res.status(500).json({ success: false, message: "Error al obtener cursos disponibles", error: error.message });
  }
};

// GET /api/courses/by-type/:type (público)
exports.getCoursesByType = async (req, res) => {
  try {
    const { type } = req.params;

    const courses = await Course.findAll({
      where: { Course_type: type },
      order: [["Course_Date", "ASC"]]
    });

    return res.status(200).json({ success: true, count: courses.length, data: courses });
  } catch (error) {
    console.error("Error en getCoursesByType:", error);
    return res.status(500).json({ success: false, message: "Error al obtener cursos por tipo", error: error.message });
  }
};

// GET /api/courses/by-teacher/:teacher (público)
exports.getCoursesByTeacher = async (req, res) => {
  try {
    const { teacher } = req.params;

    const courses = await Course.findAll({
      where: { Teacher: { [Op.like]: `%${teacher}%` } },
      order: [["Course_Date", "DESC"]]
    });

    return res.status(200).json({ success: true, count: courses.length, data: courses });
  } catch (error) {
    console.error("Error en getCoursesByTeacher:", error);
    return res.status(500).json({ success: false, message: "Error al obtener cursos por profesor", error: error.message });
  }
};

// GET /api/courses/stats (solo ADMIN)
exports.getCoursesStats = async (req, res) => {
  try {
    const stats = await Course.findAll({
      attributes: [
        "Course_type",
        [db.sequelize.fn("COUNT", db.sequelize.col("Id_course")), "count"],
        [db.sequelize.fn("AVG", db.sequelize.col("Price")), "avgPrice"],
        [db.sequelize.fn("SUM", db.sequelize.col("Price")), "totalRevenue"]
      ],
      group: ["Course_type"]
    });

    return res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error("Error en getCoursesStats:", error);
    return res.status(500).json({ success: false, message: "Error al obtener estadísticas de cursos", error: error.message });
  }
};