// controllers/therapistController.js
const { Therapist, User, Centre, Patient, Course, Resource, Treats, Employs, Buys, Publish } = require('../models/cisne.model');
const { Op } = require('sequelize');

/**
 * Controlador de Terapeutas
 * Maneja las operaciones CRUD y relaciones de terapeutas
 */

// @desc    Obtener todos los terapeutas
// @route   GET /api/therapists
// @access  Public
exports.getAllTherapists = async (req, res) => {
  try {
    const { profession } = req.query;

    const whereClause = {};
    if (profession) {
      whereClause.Profession = {
        [Op.like]: `%${profession}%`
      };
    }

    const therapists = await Therapist.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          attributes: ['email']
        }
      ]
    });

    res.status(200).json({
      success: true,
      count: therapists.length,
      data: therapists
    });
  } catch (error) {
    console.error('Error en getAllTherapists:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener terapeutas',
      error: error.message
    });
  }
};

// @desc    Obtener un terapeuta por ID
// @route   GET /api/therapists/:id
// @access  Public
exports.getTherapistById = async (req, res) => {
  try {
    const { id } = req.params;

    const therapist = await Therapist.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['email']
        },
        {
          model: Centre,
          as: 'centres',
          through: { attributes: ['Contract'] }
        },
        {
          model: Patient,
          as: 'patients',
          through: { attributes: ['report'] },
          include: [{
            model: User,
            attributes: ['email']
          }]
        }
      ]
    });

    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: 'Terapeuta no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: therapist
    });
  } catch (error) {
    console.error('Error en getTherapistById:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener terapeuta',
      error: error.message
    });
  }
};

// @desc    Crear un nuevo terapeuta
// @route   POST /api/therapists
// @access  Private
exports.createTherapist = async (req, res) => {
  try {
    const { Id_user_therapist, NIF, Society_Id, Profession } = req.body;

    // Validar campos requeridos
    if (!Id_user_therapist || !NIF) {
      return res.status(400).json({
        success: false,
        message: 'Id_user_therapist y NIF son requeridos'
      });
    }

    // Verificar que el usuario existe
    const user = await User.findByPk(Id_user_therapist);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar si el NIF ya existe
    const existingTherapist = await Therapist.findOne({ where: { NIF } });
    if (existingTherapist) {
      return res.status(409).json({
        success: false,
        message: 'El NIF ya está registrado'
      });
    }

    // Verificar si el usuario ya es un terapeuta
    const userTherapist = await Therapist.findOne({ where: { Id_user_therapist } });
    if (userTherapist) {
      return res.status(409).json({
        success: false,
        message: 'Este usuario ya está registrado como terapeuta'
      });
    }

    const therapist = await Therapist.create({
      Id_user_therapist,
      NIF,
      Society_Id,
      Profession
    });

    res.status(201).json({
      success: true,
      message: 'Terapeuta creado exitosamente',
      data: therapist
    });
  } catch (error) {
    console.error('Error en createTherapist:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear terapeuta',
      error: error.message
    });
  }
};

// @desc    Actualizar un terapeuta
// @route   PUT /api/therapists/:id
// @access  Private
exports.updateTherapist = async (req, res) => {
  try {
    const { id } = req.params;
    const { NIF, Society_Id, Profession } = req.body;

    const therapist = await Therapist.findByPk(id);

    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: 'Terapeuta no encontrado'
      });
    }

    // Verificar si el nuevo NIF ya existe (y no es el mismo terapeuta)
    if (NIF && NIF !== therapist.NIF) {
      const existingTherapist = await Therapist.findOne({ where: { NIF } });
      if (existingTherapist) {
        return res.status(409).json({
          success: false,
          message: 'El NIF ya está registrado'
        });
      }
    }

    await therapist.update({ NIF, Society_Id, Profession });

    res.status(200).json({
      success: true,
      message: 'Terapeuta actualizado exitosamente',
      data: therapist
    });
  } catch (error) {
    console.error('Error en updateTherapist:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar terapeuta',
      error: error.message
    });
  }
};

// @desc    Eliminar un terapeuta
// @route   DELETE /api/therapists/:id
// @access  Private
exports.deleteTherapist = async (req, res) => {
  try {
    const { id } = req.params;

    const therapist = await Therapist.findByPk(id);

    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: 'Terapeuta no encontrado'
      });
    }

    await therapist.destroy();

    res.status(200).json({
      success: true,
      message: 'Terapeuta eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error en deleteTherapist:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar terapeuta',
      error: error.message
    });
  }
};

// @desc    Obtener pacientes de un terapeuta
// @route   GET /api/therapists/:id/patients
// @access  Private
exports.getTherapistPatients = async (req, res) => {
  try {
    const { id } = req.params;

    const therapist = await Therapist.findByPk(id, {
      include: [{
        model: Patient,
        as: 'patients',
        through: { attributes: ['report'] },
        include: [{
          model: User,
          attributes: ['email']
        }]
      }]
    });

    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: 'Terapeuta no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      count: therapist.patients.length,
      data: therapist.patients
    });
  } catch (error) {
    console.error('Error en getTherapistPatients:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener pacientes del terapeuta',
      error: error.message
    });
  }
};

// @desc    Agregar paciente a un terapeuta (iniciar tratamiento)
// @route   POST /api/therapists/:id/patients
// @access  Private
exports.addPatientToTherapist = async (req, res) => {
  try {
    const { id } = req.params;
    const { Id_user_patient, report } = req.body;

    if (!Id_user_patient) {
      return res.status(400).json({
        success: false,
        message: 'Id_user_patient es requerido'
      });
    }

    const therapist = await Therapist.findByPk(id);
    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: 'Terapeuta no encontrado'
      });
    }

    const patient = await Patient.findByPk(Id_user_patient);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }

    // Verificar si la relación ya existe
    const existingRelation = await Treats.findOne({
      where: {
        Id_user_therapist: id,
        Id_user_patient: Id_user_patient
      }
    });

    if (existingRelation) {
      return res.status(409).json({
        success: false,
        message: 'El paciente ya está siendo tratado por este terapeuta'
      });
    }

    await therapist.addPatient(patient, {
      through: { report: report || 'Tratamiento iniciado' }
    });

    res.status(201).json({
      success: true,
      message: 'Paciente agregado al terapeuta exitosamente'
    });
  } catch (error) {
    console.error('Error en addPatientToTherapist:', error);
    res.status(500).json({
      success: false,
      message: 'Error al agregar paciente al terapeuta',
      error: error.message
    });
  }
};

// @desc    Actualizar reporte de tratamiento
// @route   PUT /api/therapists/:id/patients/:patientId
// @access  Private
exports.updateTreatmentReport = async (req, res) => {
  try {
    const { id, patientId } = req.params;
    const { report } = req.body;

    if (!report) {
      return res.status(400).json({
        success: false,
        message: 'El reporte es requerido'
      });
    }

    const treats = await Treats.findOne({
      where: {
        Id_user_therapist: id,
        Id_user_patient: patientId
      }
    });

    if (!treats) {
      return res.status(404).json({
        success: false,
        message: 'Relación terapeuta-paciente no encontrada'
      });
    }

    await treats.update({ report });

    res.status(200).json({
      success: true,
      message: 'Reporte actualizado exitosamente',
      data: treats
    });
  } catch (error) {
    console.error('Error en updateTreatmentReport:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar reporte',
      error: error.message
    });
  }
};

// @desc    Remover paciente de un terapeuta
// @route   DELETE /api/therapists/:id/patients/:patientId
// @access  Private
exports.removePatientFromTherapist = async (req, res) => {
  try {
    const { id, patientId } = req.params;

    const therapist = await Therapist.findByPk(id);
    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: 'Terapeuta no encontrado'
      });
    }

    const patient = await Patient.findByPk(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }

    await therapist.removePatient(patient);

    res.status(200).json({
      success: true,
      message: 'Paciente removido del terapeuta exitosamente'
    });
  } catch (error) {
    console.error('Error en removePatientFromTherapist:', error);
    res.status(500).json({
      success: false,
      message: 'Error al remover paciente del terapeuta',
      error: error.message
    });
  }
};

// @desc    Obtener cursos comprados por un terapeuta
// @route   GET /api/therapists/:id/courses
// @access  Private
exports.getTherapistCourses = async (req, res) => {
  try {
    const { id } = req.params;

    const therapist = await Therapist.findByPk(id, {
      include: [{
        model: Course,
        as: 'courses',
        through: { attributes: ['Buying_date'] }
      }]
    });

    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: 'Terapeuta no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      count: therapist.courses.length,
      data: therapist.courses
    });
  } catch (error) {
    console.error('Error en getTherapistCourses:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener cursos del terapeuta',
      error: error.message
    });
  }
};

// @desc    Comprar un curso
// @route   POST /api/therapists/:id/courses
// @access  Private
exports.buyCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { Id_course, Buying_date } = req.body;

    if (!Id_course) {
      return res.status(400).json({
        success: false,
        message: 'Id_course es requerido'
      });
    }

    const therapist = await Therapist.findByPk(id);
    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: 'Terapeuta no encontrado'
      });
    }

    const course = await Course.findByPk(Id_course);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Curso no encontrado'
      });
    }

    await therapist.addCourse(course, {
      through: { Buying_date: Buying_date || new Date() }
    });

    res.status(201).json({
      success: true,
      message: 'Curso comprado exitosamente'
    });
  } catch (error) {
    console.error('Error en buyCourse:', error);
    res.status(500).json({
      success: false,
      message: 'Error al comprar curso',
      error: error.message
    });
  }
};

// @desc    Obtener recursos publicados por un terapeuta
// @route   GET /api/therapists/:id/resources
// @access  Public
exports.getTherapistResources = async (req, res) => {
  try {
    const { id } = req.params;

    const therapist = await Therapist.findByPk(id, {
      include: [{
        model: Resource,
        as: 'resources',
        through: { attributes: ['Publication_date'] }
      }]
    });

    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: 'Terapeuta no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      count: therapist.resources.length,
      data: therapist.resources
    });
  } catch (error) {
    console.error('Error en getTherapistResources:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener recursos del terapeuta',
      error: error.message
    });
  }
};

// @desc    Publicar un recurso
// @route   POST /api/therapists/:id/resources
// @access  Private
exports.publishResource = async (req, res) => {
  try {
    const { id } = req.params;
    const { Id_resource, Publication_date } = req.body;

    if (!Id_resource) {
      return res.status(400).json({
        success: false,
        message: 'Id_resource es requerido'
      });
    }

    const therapist = await Therapist.findByPk(id);
    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: 'Terapeuta no encontrado'
      });
    }

    const resource = await Resource.findByPk(Id_resource);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Recurso no encontrado'
      });
    }

    await therapist.addResource(resource, {
      through: { Publication_date: Publication_date || new Date() }
    });

    res.status(201).json({
      success: true,
      message: 'Recurso publicado exitosamente'
    });
  } catch (error) {
    console.error('Error en publishResource:', error);
    res.status(500).json({
      success: false,
      message: 'Error al publicar recurso',
      error: error.message
    });
  }
};

// @desc    Obtener estadísticas de un terapeuta
// @route   GET /api/therapists/:id/stats
// @access  Private
exports.getTherapistStats = async (req, res) => {
  try {
    const { id } = req.params;

    const therapist = await Therapist.findByPk(id, {
      include: [
        { model: Patient, as: 'patients' },
        { model: Course, as: 'courses' },
        { model: Resource, as: 'resources' },
        { model: Centre, as: 'centres' }
      ]
    });

    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: 'Terapeuta no encontrado'
      });
    }

    const stats = {
      total_patients: therapist.patients.length,
      total_courses: therapist.courses.length,
      total_resources: therapist.resources.length,
      total_centres: therapist.centres.length,
      profession: therapist.Profession
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error en getTherapistStats:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
};