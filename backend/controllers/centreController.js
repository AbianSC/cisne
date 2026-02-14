// controllers/centreController.js
const { Centre, User, Therapist, Service, Course, Employs, Posts } = require('../sequelize-models');
const { Op } = require('sequelize');

/**
 * Controlador de Centros
 * Maneja las operaciones CRUD y relaciones de centros de terapia
 */

// @desc    Obtener todos los centros
// @route   GET /api/centres
// @access  Public
exports.getAllCentres = async (req, res) => {
  try {
    const centres = await Centre.findAll({
      include: [
        {
          model: User,
          attributes: ['email']
        },
        {
          model: Service,
          required: false
        }
      ]
    });

    res.status(200).json({
      success: true,
      count: centres.length,
      data: centres
    });
  } catch (error) {
    console.error('Error en getAllCentres:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener centros',
      error: error.message
    });
  }
};

// @desc    Obtener un centro por ID
// @route   GET /api/centres/:id
// @access  Public
exports.getCentreById = async (req, res) => {
  try {
    const { id } = req.params;

    const centre = await Centre.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['email']
        },
        {
          model: Therapist,
          as: 'therapists',
          through: { attributes: ['Contract'] }
        },
        {
          model: Course,
          as: 'courses',
          through: { attributes: ['Post_date'] }
        }
      ]
    });

    if (!centre) {
      return res.status(404).json({
        success: false,
        message: 'Centro no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: centre
    });
  } catch (error) {
    console.error('Error en getCentreById:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener centro',
      error: error.message
    });
  }
};

// @desc    Crear un nuevo centro
// @route   POST /api/centres
// @access  Private
exports.createCentre = async (req, res) => {
  try {
    const { Id_user_centre, CIF, location, Id_service } = req.body;

    // Validar campos requeridos
    if (!Id_user_centre || !CIF) {
      return res.status(400).json({
        success: false,
        message: 'Id_user_centre y CIF son requeridos'
      });
    }

    // Verificar que el usuario existe
    const user = await User.findByPk(Id_user_centre);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar si el CIF ya existe
    const existingCentre = await Centre.findOne({ where: { CIF } });
    if (existingCentre) {
      return res.status(409).json({
        success: false,
        message: 'El CIF ya está registrado'
      });
    }

    // Verificar si el usuario ya es un centro
    const userCentre = await Centre.findOne({ where: { Id_user_centre } });
    if (userCentre) {
      return res.status(409).json({
        success: false,
        message: 'Este usuario ya está registrado como centro'
      });
    }

    const centre = await Centre.create({
      Id_user_centre,
      CIF,
      location,
      Id_service
    });

    res.status(201).json({
      success: true,
      message: 'Centro creado exitosamente',
      data: centre
    });
  } catch (error) {
    console.error('Error en createCentre:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear centro',
      error: error.message
    });
  }
};

// @desc    Actualizar un centro
// @route   PUT /api/centres/:id
// @access  Private
exports.updateCentre = async (req, res) => {
  try {
    const { id } = req.params;
    const { CIF, location, Id_service } = req.body;

    const centre = await Centre.findByPk(id);

    if (!centre) {
      return res.status(404).json({
        success: false,
        message: 'Centro no encontrado'
      });
    }

    // Verificar si el nuevo CIF ya existe (y no es el mismo centro)
    if (CIF && CIF !== centre.CIF) {
      const existingCentre = await Centre.findOne({ where: { CIF } });
      if (existingCentre) {
        return res.status(409).json({
          success: false,
          message: 'El CIF ya está registrado'
        });
      }
    }

    await centre.update({ CIF, location, Id_service });

    res.status(200).json({
      success: true,
      message: 'Centro actualizado exitosamente',
      data: centre
    });
  } catch (error) {
    console.error('Error en updateCentre:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar centro',
      error: error.message
    });
  }
};

// @desc    Eliminar un centro
// @route   DELETE /api/centres/:id
// @access  Private
exports.deleteCentre = async (req, res) => {
  try {
    const { id } = req.params;

    const centre = await Centre.findByPk(id);

    if (!centre) {
      return res.status(404).json({
        success: false,
        message: 'Centro no encontrado'
      });
    }

    await centre.destroy();

    res.status(200).json({
      success: true,
      message: 'Centro eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error en deleteCentre:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar centro',
      error: error.message
    });
  }
};

// @desc    Obtener terapeutas de un centro
// @route   GET /api/centres/:id/therapists
// @access  Public
exports.getCentreTherapists = async (req, res) => {
  try {
    const { id } = req.params;

    const centre = await Centre.findByPk(id, {
      include: [{
        model: Therapist,
        as: 'therapists',
        through: { attributes: ['Contract'] },
        include: [{
          model: User,
          attributes: ['email']
        }]
      }]
    });

    if (!centre) {
      return res.status(404).json({
        success: false,
        message: 'Centro no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      count: centre.therapists.length,
      data: centre.therapists
    });
  } catch (error) {
    console.error('Error en getCentreTherapists:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener terapeutas del centro',
      error: error.message
    });
  }
};

// @desc    Agregar terapeuta a un centro
// @route   POST /api/centres/:id/therapists
// @access  Private
exports.addTherapistToCentre = async (req, res) => {
  try {
    const { id } = req.params;
    const { Id_user_therapist, Contract } = req.body;

    if (!Id_user_therapist) {
      return res.status(400).json({
        success: false,
        message: 'Id_user_therapist es requerido'
      });
    }

    const centre = await Centre.findByPk(id);
    if (!centre) {
      return res.status(404).json({
        success: false,
        message: 'Centro no encontrado'
      });
    }

    const therapist = await Therapist.findByPk(Id_user_therapist);
    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: 'Terapeuta no encontrado'
      });
    }

    // Verificar si la relación ya existe
    const existingRelation = await Employs.findOne({
      where: {
        Id_user_centre: id,
        Id_user_therapist: Id_user_therapist
      }
    });

    if (existingRelation) {
      return res.status(409).json({
        success: false,
        message: 'El terapeuta ya está empleado en este centro'
      });
    }

    await centre.addTherapist(therapist, {
      through: { Contract: Contract || 'No especificado' }
    });

    res.status(201).json({
      success: true,
      message: 'Terapeuta agregado al centro exitosamente'
    });
  } catch (error) {
    console.error('Error en addTherapistToCentre:', error);
    res.status(500).json({
      success: false,
      message: 'Error al agregar terapeuta al centro',
      error: error.message
    });
  }
};

// @desc    Remover terapeuta de un centro
// @route   DELETE /api/centres/:id/therapists/:therapistId
// @access  Private
exports.removeTherapistFromCentre = async (req, res) => {
  try {
    const { id, therapistId } = req.params;

    const centre = await Centre.findByPk(id);
    if (!centre) {
      return res.status(404).json({
        success: false,
        message: 'Centro no encontrado'
      });
    }

    const therapist = await Therapist.findByPk(therapistId);
    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: 'Terapeuta no encontrado'
      });
    }

    await centre.removeTherapist(therapist);

    res.status(200).json({
      success: true,
      message: 'Terapeuta removido del centro exitosamente'
    });
  } catch (error) {
    console.error('Error en removeTherapistFromCentre:', error);
    res.status(500).json({
      success: false,
      message: 'Error al remover terapeuta del centro',
      error: error.message
    });
  }
};

// @desc    Obtener cursos publicados por un centro
// @route   GET /api/centres/:id/courses
// @access  Public
exports.getCentreCourses = async (req, res) => {
  try {
    const { id } = req.params;

    const centre = await Centre.findByPk(id, {
      include: [{
        model: Course,
        as: 'courses',
        through: { attributes: ['Post_date'] }
      }]
    });

    if (!centre) {
      return res.status(404).json({
        success: false,
        message: 'Centro no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      count: centre.courses.length,
      data: centre.courses
    });
  } catch (error) {
    console.error('Error en getCentreCourses:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener cursos del centro',
      error: error.message
    });
  }
};

// @desc    Publicar un curso en un centro
// @route   POST /api/centres/:id/courses
// @access  Private
exports.postCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { Id_course, Post_date } = req.body;

    if (!Id_course) {
      return res.status(400).json({
        success: false,
        message: 'Id_course es requerido'
      });
    }

    const centre = await Centre.findByPk(id);
    if (!centre) {
      return res.status(404).json({
        success: false,
        message: 'Centro no encontrado'
      });
    }

    const course = await Course.findByPk(Id_course);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Curso no encontrado'
      });
    }

    await centre.addCourse(course, {
      through: { Post_date: Post_date || new Date() }
    });

    res.status(201).json({
      success: true,
      message: 'Curso publicado exitosamente'
    });
  } catch (error) {
    console.error('Error en postCourse:', error);
    res.status(500).json({
      success: false,
      message: 'Error al publicar curso',
      error: error.message
    });
  }
};

// @desc    Buscar centros por ubicación
// @route   GET /api/centres/search?location=xxx
// @access  Public
exports.searchCentres = async (req, res) => {
  try {
    const { location, CIF } = req.query;

    const whereClause = {};

    if (location) {
      whereClause.location = {
        [Op.like]: `%${location}%`
      };
    }

    if (CIF) {
      whereClause.CIF = {
        [Op.like]: `%${CIF}%`
      };
    }

    const centres = await Centre.findAll({
      where: whereClause,
      include: [{
        model: User,
        attributes: ['email']
      }]
    });

    res.status(200).json({
      success: true,
      count: centres.length,
      data: centres
    });
  } catch (error) {
    console.error('Error en searchCentres:', error);
    res.status(500).json({
      success: false,
      message: 'Error al buscar centros',
      error: error.message
    });
  }
};