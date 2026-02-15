// controllers/courseController.js
const { Course, CourseInvoice, Invoice, Centre, Therapist } = require('../models/cisne.model');
const { Op } = require('sequelize');

/**
 * Controlador de Cursos
 * Maneja las operaciones CRUD de cursos de formación
 */

// @desc    Obtener todos los cursos
// @route   GET /api/courses
// @access  Public
exports.getAllCourses = async (req, res) => {
  try {
    const { name, teacher, type, minPrice, maxPrice } = req.query;

    const whereClause = {};

    if (name) {
      whereClause.Name = {
        [Op.like]: `%${name}%`
      };
    }

    if (teacher) {
      whereClause.Teacher = {
        [Op.like]: `%${teacher}%`
      };
    }

    if (type) {
      whereClause.Course_type = type;
    }

    if (minPrice || maxPrice) {
      whereClause.Price = {};
      if (minPrice) whereClause.Price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) whereClause.Price[Op.lte] = parseFloat(maxPrice);
    }

    const courses = await Course.findAll({
      where: whereClause,
      include: [{
        model: CourseInvoice,
        include: [{
          model: Invoice
        }]
      }],
      order: [['Course_Date', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    console.error('Error en getAllCourses:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener cursos',
      error: error.message
    });
  }
};

// @desc    Obtener un curso por ID
// @route   GET /api/courses/:id
// @access  Public
exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findByPk(id, {
      include: [
        {
          model: CourseInvoice,
          include: [{
            model: Invoice
          }]
        },
        {
          model: Centre,
          as: 'centres',
          through: { attributes: ['Post_date'] }
        },
        {
          model: Therapist,
          as: 'therapists',
          through: { attributes: ['Buying_date'] }
        }
      ]
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Curso no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Error en getCourseById:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener curso',
      error: error.message
    });
  }
};

// @desc    Crear un nuevo curso
// @route   POST /api/courses
// @access  Private
exports.createCourse = async (req, res) => {
  try {
    const { Id_course_invoice, Name, Teacher, Price, Course_type, Course_description, Course_Date } = req.body;

    // Validar campos requeridos
    if (!Name) {
      return res.status(400).json({
        success: false,
        message: 'El nombre del curso es requerido'
      });
    }

    // Si se proporciona Id_course_invoice, verificar que existe
    if (Id_course_invoice) {
      const invoice = await CourseInvoice.findByPk(Id_course_invoice);
      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: 'Factura de curso no encontrada'
        });
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

    res.status(201).json({
      success: true,
      message: 'Curso creado exitosamente',
      data: course
    });
  } catch (error) {
    console.error('Error en createCourse:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear curso',
      error: error.message
    });
  }
};

// @desc    Actualizar un curso
// @route   PUT /api/courses/:id
// @access  Private
exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { Id_course_invoice, Name, Teacher, Price, Course_type, Course_description, Course_Date } = req.body;

    const course = await Course.findByPk(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Curso no encontrado'
      });
    }

    await course.update({
      Id_course_invoice,
      Name,
      Teacher,
      Price,
      Course_type,
      Course_description,
      Course_Date
    });

    res.status(200).json({
      success: true,
      message: 'Curso actualizado exitosamente',
      data: course
    });
  } catch (error) {
    console.error('Error en updateCourse:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar curso',
      error: error.message
    });
  }
};

// @desc    Eliminar un curso
// @route   DELETE /api/courses/:id
// @access  Private
exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findByPk(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Curso no encontrado'
      });
    }

    await course.destroy();

    res.status(200).json({
      success: true,
      message: 'Curso eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error en deleteCourse:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar curso',
      error: error.message
    });
  }
};

// @desc    Obtener terapeutas que han comprado un curso
// @route   GET /api/courses/:id/therapists
// @access  Private
exports.getCourseTherapists = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findByPk(id, {
      include: [{
        model: Therapist,
        as: 'therapists',
        through: { attributes: ['Buying_date'] },
        include: [{
          model: require('../sequelize-models').User,
          attributes: ['email']
        }]
      }]
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Curso no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      count: course.therapists.length,
      data: course.therapists
    });
  } catch (error) {
    console.error('Error en getCourseTherapists:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener terapeutas del curso',
      error: error.message
    });
  }
};

// @desc    Obtener centros que publican un curso
// @route   GET /api/courses/:id/centres
// @access  Public
exports.getCourseCentres = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findByPk(id, {
      include: [{
        model: Centre,
        as: 'centres',
        through: { attributes: ['Post_date'] },
        include: [{
          model: require('../sequelize-models').User,
          attributes: ['email']
        }]
      }]
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Curso no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      count: course.centres.length,
      data: course.centres
    });
  } catch (error) {
    console.error('Error en getCourseCentres:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener centros del curso',
      error: error.message
    });
  }
};

// @desc    Obtener cursos disponibles (próximos o sin fecha)
// @route   GET /api/courses/available
// @access  Public
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
      order: [['Course_Date', 'ASC']]
    });

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    console.error('Error en getAvailableCourses:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener cursos disponibles',
      error: error.message
    });
  }
};

// @desc    Obtener cursos por tipo
// @route   GET /api/courses/by-type/:type
// @access  Public
exports.getCoursesByType = async (req, res) => {
  try {
    const { type } = req.params;

    const courses = await Course.findAll({
      where: { Course_type: type },
      order: [['Course_Date', 'ASC']]
    });

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    console.error('Error en getCoursesByType:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener cursos por tipo',
      error: error.message
    });
  }
};

// @desc    Obtener cursos por profesor
// @route   GET /api/courses/by-teacher/:teacher
// @access  Public
exports.getCoursesByTeacher = async (req, res) => {
  try {
    const { teacher } = req.params;

    const courses = await Course.findAll({
      where: {
        Teacher: {
          [Op.like]: `%${teacher}%`
        }
      },
      order: [['Course_Date', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    console.error('Error en getCoursesByTeacher:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener cursos por profesor',
      error: error.message
    });
  }
};

// @desc    Obtener estadísticas de cursos
// @route   GET /api/courses/stats
// @access  Private
exports.getCoursesStats = async (req, res) => {
  try {
    const { sequelize } = require('../sequelize-models');

    const stats = await Course.findAll({
      attributes: [
        'Course_type',
        [sequelize.fn('COUNT', sequelize.col('Id_course')), 'count'],
        [sequelize.fn('AVG', sequelize.col('Price')), 'avgPrice'],
        [sequelize.fn('SUM', sequelize.col('Price')), 'totalRevenue']
      ],
      group: ['Course_type']
    });

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error en getCoursesStats:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas de cursos',
      error: error.message
    });
  }
};