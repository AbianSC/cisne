const db = require("../models");
const Patient = db.Patient;
const User = db.User;
const Therapist = db.Therapist;
const Service = db.Service;
const Resource = db.Resource;
const Pays = db.Pays;

const Op = db.Sequelize.Op;

/**
 * Controlador de Pacientes
 * Maneja operaciones CRUD y relaciones de pacientes
 */

// @desc    Obtener todos los pacientes
// @route   GET /api/patients
// @access  Private
exports.getAllPatients = async (req, res) => {
  try {
    const { diagnosis } = req.query;

    const whereClause = {};
    if (diagnosis) {
      whereClause.diagnosis = { [Op.like]: `%${diagnosis}%` };
    }

    const patients = await Patient.findAll({
      where: whereClause,
      include: [{ model: User, attributes: ["email", "role"] }]
    });

    res.status(200).json({ success: true, count: patients.length, data: patients });
  } catch (error) {
    console.error("Error en getAllPatients:", error);
    res.status(500).json({ success: false, message: "Error al obtener pacientes", error: error.message });
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
        { model: User, attributes: ["email", "role"] },
        {
          model: Therapist,
          as: "therapists",
          through: { attributes: ["report"] },
          include: [{ model: User, attributes: ["email", "role"] }]
        },
        { model: Service, as: "services" },
        { model: Resource, as: "resources" }
      ]
    });

    if (!patient) {
      return res.status(404).json({ success: false, message: "Paciente no encontrado" });
    }

    res.status(200).json({ success: true, data: patient });
  } catch (error) {
    console.error("Error en getPatientById:", error);
    res.status(500).json({ success: false, message: "Error al obtener paciente", error: error.message });
  }
};

// @desc    Crear un nuevo paciente
// @route   POST /api/patients
// @access  Private
exports.createPatient = async (req, res) => {
  try {
    const { Id_user_patient, firstname, lastname, NIF, diagnosis } = req.body;

    if (!Id_user_patient || !firstname || !lastname || !NIF) {
      return res.status(400).json({
        success: false,
        message: "Id_user_patient, nombre, apellidos y NIF son requeridos"
      });
    }

    const user = await User.findByPk(Id_user_patient);
    if (!user) return res.status(404).json({ success: false, message: "Usuario no encontrado" });

    const existingPatientNif = await Patient.findOne({ where: { NIF } });
    if (existingPatientNif) return res.status(409).json({ success: false, message: "El NIF ya está registrado" });

    const existingPatientUser = await Patient.findOne({ where: { Id_user_patient } });
    if (existingPatientUser) {
      return res.status(409).json({ success: false, message: "Este usuario ya está registrado como paciente" });
    }

    const patient = await Patient.create({
      Id_user_patient,
      firstname,
      lastname,
      NIF,
      diagnosis
    });

    res.status(201).json({ success: true, message: "Paciente creado exitosamente", data: patient });
  } catch (error) {
    console.error("Error en createPatient:", error);
    res.status(500).json({ success: false, message: "Error al crear paciente", error: error.message });
  }
};

// @desc    Actualizar un paciente
// @route   PUT /api/patients/:id
// @access  Private
exports.updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstname, lastname, NIF, diagnosis } = req.body;

    const patient = await Patient.findByPk(id);
    if (!patient) return res.status(404).json({ success: false, message: "Paciente no encontrado" });

    if (NIF && NIF !== patient.NIF) {
      const existingPatient = await Patient.findOne({ where: { NIF } });
      if (existingPatient) return res.status(409).json({ success: false, message: "El NIF ya está registrado" });
    }

    await patient.update({
      firtsname: firstname ?? patient.firtsname,
      lastname: lastname ?? patient.lastname,
      NIF: NIF ?? patient.NIF,
      diagnosis: diagnosis ?? patient.diagnosis
    });

    res.status(200).json({ success: true, message: "Paciente actualizado exitosamente", data: patient });
  } catch (error) {
    console.error("Error en updatePatient:", error);
    res.status(500).json({ success: false, message: "Error al actualizar paciente", error: error.message });
  }
};

// @desc    Eliminar un paciente
// @route   DELETE /api/patients/:id
// @access  Private
exports.deletePatient = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findByPk(id);
    if (!patient) return res.status(404).json({ success: false, message: "Paciente no encontrado" });

    await patient.destroy();

    res.status(200).json({ success: true, message: "Paciente eliminado exitosamente" });
  } catch (error) {
    console.error("Error en deletePatient:", error);
    res.status(500).json({ success: false, message: "Error al eliminar paciente", error: error.message });
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
        as: "therapists",
        through: { attributes: ["report"] },
        include: [{ model: User, attributes: ["email", "role"] }]
      }]
    });

    if (!patient) return res.status(404).json({ success: false, message: "Paciente no encontrado" });

    res.status(200).json({ success: true, count: patient.therapists.length, data: patient.therapists });
  } catch (error) {
    console.error("Error en getPatientTherapists:", error);
    res.status(500).json({ success: false, message: "Error al obtener terapeutas del paciente", error: error.message });
  }
};

// @desc    Obtener servicios pagados por un paciente
// @route   GET /api/patients/:id/services
// @access  Private
exports.getPatientServices = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findByPk(id, {
      include: [{ model: Service, as: "services" }]
    });

    if (!patient) return res.status(404).json({ success: false, message: "Paciente no encontrado" });

    res.status(200).json({ success: true, count: patient.services.length, data: patient.services });
  } catch (error) {
    console.error("Error en getPatientServices:", error);
    res.status(500).json({ success: false, message: "Error al obtener servicios del paciente", error: error.message });
  }
};

// @desc    Pagar un servicio
// @route   POST /api/patients/:id/services
// @access  Private
exports.payService = async (req, res) => {
  try {
    const { id } = req.params;
    const { Id_service } = req.body;

    if (!Id_service) return res.status(400).json({ success: false, message: "Id_service es requerido" });

    const patient = await Patient.findByPk(id);
    if (!patient) return res.status(404).json({ success: false, message: "Paciente no encontrado" });

    const service = await Service.findByPk(Id_service);
    if (!service) return res.status(404).json({ success: false, message: "Servicio no encontrado" });

    const existingPayment = await Pays.findOne({
      where: { Id_user_patient: id, Id_service }
    });

    if (existingPayment) {
      return res.status(409).json({ success: false, message: "El servicio ya ha sido pagado" });
    }

    await patient.addService(service);

    res.status(201).json({ success: true, message: "Servicio pagado exitosamente" });
  } catch (error) {
    console.error("Error en payService:", error);
    res.status(500).json({ success: false, message: "Error al pagar servicio", error: error.message });
  }
};

// @desc    Obtener recursos consumidos por un paciente
// @route   GET /api/patients/:id/resources
// @access  Private
exports.getPatientResources = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findByPk(id, {
      include: [{ model: Resource, as: "resources" }]
    });

    if (!patient) return res.status(404).json({ success: false, message: "Paciente no encontrado" });

    res.status(200).json({ success: true, count: patient.resources.length, data: patient.resources });
  } catch (error) {
    console.error("Error en getPatientResources:", error);
    res.status(500).json({ success: false, message: "Error al obtener recursos del paciente", error: error.message });
  }
};

// @desc    Consumir un recurso
// @route   POST /api/patients/:id/resources
// @access  Private
exports.consumeResource = async (req, res) => {
  try {
    const { id } = req.params;
    const { Id_resource } = req.body;

    if (!Id_resource) return res.status(400).json({ success: false, message: "Id_resource es requerido" });

    const patient = await Patient.findByPk(id);
    if (!patient) return res.status(404).json({ success: false, message: "Paciente no encontrado" });

    const resource = await Resource.findByPk(Id_resource);
    if (!resource) return res.status(404).json({ success: false, message: "Recurso no encontrado" });

    await patient.addResource(resource);

    res.status(201).json({ success: true, message: "Recurso consumido exitosamente" });
  } catch (error) {
    console.error("Error en consumeResource:", error);
    res.status(500).json({ success: false, message: "Error al consumir recurso", error: error.message });
  }
};

// @desc    Buscar pacientes por diagnóstico o NIF
// @route   GET /api/patients/search?diagnosis=xxx&NIF=yyy
// @access  Private
exports.searchPatients = async (req, res) => {
  try {
    const { diagnosis, NIF } = req.query;

    const whereClause = {};

    if (diagnosis) whereClause.diagnosis = { [Op.like]: `%${diagnosis}%` };
    if (NIF) whereClause.NIF = { [Op.like]: `%${NIF}%` };

    const patients = await Patient.findAll({
      where: whereClause,
      include: [{ model: User, attributes: ["email", "role"] }]
    });

    res.status(200).json({ success: true, count: patients.length, data: patients });
  } catch (error) {
    console.error("Error en searchPatients:", error);
    res.status(500).json({ success: false, message: "Error al buscar pacientes", error: error.message });
  }
};

