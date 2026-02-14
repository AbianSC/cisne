// controllers/patientController.js
const { Patient, User, Therapist, Service, Resource, Treats, Pays, Consume } = require('../sequelize-models');
const { Op } = require('sequelize');

/**
 * Controlador de Pacientes
 * Maneja las operaciones CRUD y relaciones de pacientes
 */

// @desc    Obtener todos los pacientes
// @route   GET /api/patients
// @access  Private
exports.getAllPatients = async (req, res) => {
  try {
    const { diagnosis } = req.query;

    const whereClause = {};
    if (diagnosis) {
      whereClause.diagnosis = {
        [Op.like]: `%${diagnosis}%`
      };
    }

    const patients = await Patient.findAll({
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
      count: patients.length,
      data: patients
    });
  } catch (error) {
    console.error('Error en getAllPatients:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener pacientes',
      error: error.message
    });
  }
};

// @desc    Obtener un paciente por ID
// @route   GET /api/patients/:id
// @access  Private
exports.getPatientById = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['email']
        },
        {
          model: Therapist,
          as: 'therapists',
          through: { attributes: ['report'] },
          include: [{
            model: User,
            attributes: ['email']
          }]
        },
        {
          model: Service,
          as: 'services'
        },
        {
          model: Resource,
          as: 'resources'
        }
      ]
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: patient
    });
  } catch (error) {
    console.error('Error en getPatientById:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener paciente',
      error: error.message
    });
  }
};

// @desc    Crear un nuevo paciente
// @route   POST /api/patients
// @access  Private
exports.createPatient = async (req, res) => {
  try {
    const { Id_user_patient, NIF, diagnosis } = req.body;

    // Validar campos requeridos
    if (!Id_user_patient || !NIF) {
      return res.status(400).json({
        success: false,
        message: 'Id_user_patient y NIF son requeridos'
      });
    }

    // Verificar que el usuario existe
    const user = await User.findByPk(Id_user_patient);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar si el NIF ya existe
    const existingPatient = await Patient.findOne({ where: { NIF } });
    if (existingPatient) {
      return res.status(409).json({
        success: false,
        message: 'El NIF ya está registrado'
      });
    }

    // Verificar si el usuario ya es un paciente
    const userPatient = await Patient.findOne({ where: { Id_user_patient } });
    if (userPatient) {
      return res.status(409).json({
        success: false,
        message: 'Este usuario ya está registrado como paciente'
      });
    }

    const patient = await Patient.create({
      Id_user_patient,
      NIF,
      diagnosis
    });

    res.status(201).json({
      success: true,
      message: 'Paciente creado exitosamente',
      data: patient
    });
  } catch (error) {
    console.error('Error en createPatient:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear paciente',
      error: error.message
    });
  }
};

// @desc    Actualizar un paciente
// @route   PUT /api/patients/:id
// @access  Private
exports.updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const { NIF, diagnosis } = req.body;

    const patient = await Patient.findByPk(id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }

    // Verificar si el nuevo NIF ya existe (y no es el mismo paciente)
    if (NIF && NIF !== patient.NIF) {
      const existingPatient = await Patient.findOne({ where: { NIF } });
      if (existingPatient) {
        return res.status(409).json({
          success: false,
          message: 'El NIF ya está registrado'
        });
      }
    }

    await patient.update({ NIF, diagnosis });

    res.status(200).json({
      success: true,
      message: 'Paciente actualizado exitosamente',
      data: patient
    });
  } catch (error) {
    console.error('Error en updatePatient:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar paciente',
      error: error.message
    });
  }
};

// @desc    Eliminar un paciente
// @route   DELETE /api/patients/:id
// @access  Private
exports.deletePatient = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findByPk(id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }

    await patient.destroy();

    res.status(200).json({
      success: true,
      message: 'Paciente eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error en deletePatient:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar paciente',
      error: error.message
    });
  }
};

// @desc    Obtener terapeutas de un paciente
// @route   GET /api/patients/:id/therapists
// @access  Private
exports.getPatientTherapists = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findByPk(id, {
      include: [{
        model: Therapist,
        as: 'therapists',
        through: { attributes: ['report'] },
        include: [{
          model: User,
          attributes: ['email']
        }]
      }]
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      count: patient.therapists.length,
      data: patient.therapists
    });
  } catch (error) {
    console.error('Error en getPatientTherapists:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener terapeutas del paciente',
      error: error.message
    });
  }
};

// @desc    Obtener historial médico completo
// @route   GET /api/patients/:id/medical-history
// @access  Private
exports.getMedicalHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['email']
        },
        {
          model: Therapist,
          as: 'therapists',
          through: { attributes: ['report'] },
          include: [{
            model: User,
            attributes: ['email']
          }]
        },
        {
          model: Service,
          as: 'services',
          include: [{
            model: require('../sequelize-models').ServiceInvoice,
            include: [{
              model: require('../sequelize-models').Invoice
            }]
          }]
        }
      ]
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }

    // Compilar historial
    const history = {
      patient: {
        Id_user_patient: patient.Id_user_patient,
        email: patient.User.email,
        NIF: patient.NIF,
        diagnosis: patient.diagnosis
      },
      therapists: patient.therapists.map(t => ({
        Id_user_therapist: t.Id_user_therapist,
        email: t.User.email,
        profession: t.Profession,
        report: t.Treats.report
      })),
      services: patient.services.map(s => ({
        Id_service: s.Id_service,
        name: s.Name,
        date: s.Service_Date,
        price: s.Price,
        invoice: s.ServiceInvoice?.Invoice
      }))
    };

    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error en getMedicalHistory:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener historial médico',
      error: error.message
    });
  }
};

// @desc    Obtener servicios pagados por un paciente
// @route   GET /api/patients/:id/services
// @access  Private
exports.getPatientServices = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findByPk(id, {
      include: [{
        model: Service,
        as: 'services'
      }]
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      count: patient.services.length,
      data: patient.services
    });
  } catch (error) {
    console.error('Error en getPatientServices:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener servicios del paciente',
      error: error.message
    });
  }
};

// @desc    Pagar un servicio
// @route   POST /api/patients/:id/services
// @access  Private
exports.payService = async (req, res) => {
  try {
    const { id } = req.params;
    const { Id_service } = req.body;

    if (!Id_service) {
      return res.status(400).json({
        success: false,
        message: 'Id_service es requerido'
      });
    }

    const patient = await Patient.findByPk(id);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }

    const service = await Service.findByPk(Id_service);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Servicio no encontrado'
      });
    }

    // Verificar si ya pagó el servicio
    const existingPayment = await Pays.findOne({
      where: {
        Id_user_patient: id,
        Id_service: Id_service
      }
    });

    if (existingPayment) {
      return res.status(409).json({
        success: false,
        message: 'El servicio ya ha sido pagado'
      });
    }

    await patient.addService(service);

    res.status(201).json({
      success: true,
      message: 'Servicio pagado exitosamente'
    });
  } catch (error) {
    console.error('Error en payService:', error);
    res.status(500).json({
      success: false,
      message: 'Error al pagar servicio',
      error: error.message
    });
  }
};

// @desc    Obtener recursos consumidos por un paciente
// @route   GET /api/patients/:id/resources
// @access  Private
exports.getPatientResources = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findByPk(id, {
      include: [{
        model: Resource,
        as: 'resources'
      }]
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      count: patient.resources.length,
      data: patient.resources
    });
  } catch (error) {
    console.error('Error en getPatientResources:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener recursos del paciente',
      error: error.message
    });
  }
};

// @desc    Consumir un recurso
// @route   POST /api/patients/:id/resources
// @access  Private
exports.consumeResource = async (req, res) => {
  try {
    const { id } = req.params;
    const { Id_resource } = req.body;

    if (!Id_resource) {
      return res.status(400).json({
        success: false,
        message: 'Id_resource es requerido'
      });
    }

    const patient = await Patient.findByPk(id);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }

    const resource = await Resource.findByPk(Id_resource);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Recurso no encontrado'
      });
    }

    await patient.addResource(resource);

    res.status(201).json({
      success: true,
      message: 'Recurso consumido exitosamente'
    });
  } catch (error) {
    console.error('Error en consumeResource:', error);
    res.status(500).json({
      success: false,
      message: 'Error al consumir recurso',
      error: error.message
    });
  }
};

// @desc    Obtener estadísticas de un paciente
// @route   GET /api/patients/:id/stats
// @access  Private
exports.getPatientStats = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findByPk(id, {
      include: [
        { model: Therapist, as: 'therapists' },
        { model: Service, as: 'services' },
        { model: Resource, as: 'resources' }
      ]
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }

    // Calcular total gastado en servicios
    const totalSpent = patient.services.reduce((sum, service) => {
      return sum + parseFloat(service.Price || 0);
    }, 0);

    const stats = {
      diagnosis: patient.diagnosis,
      total_therapists: patient.therapists.length,
      total_services: patient.services.length,
      total_resources: patient.resources.length,
      total_spent: totalSpent.toFixed(2)
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error en getPatientStats:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
};

// @desc    Buscar pacientes por diagnóstico
// @route   GET /api/patients/search?diagnosis=xxx
// @access  Private
exports.searchPatients = async (req, res) => {
  try {
    const { diagnosis, NIF } = req.query;

    const whereClause = {};

    if (diagnosis) {
      whereClause.diagnosis = {
        [Op.like]: `%${diagnosis}%`
      };
    }

    if (NIF) {
      whereClause.NIF = {
        [Op.like]: `%${NIF}%`
      };
    }

    const patients = await Patient.findAll({
      where: whereClause,
      include: [{
        model: User,
        attributes: ['email']
      }]
    });

    res.status(200).json({
      success: true,
      count: patients.length,
      data: patients
    });
  } catch (error) {
    console.error('Error en searchPatients:', error);
    res.status(500).json({
      success: false,
      message: 'Error al buscar pacientes',
      error: error.message
    });
  }
};