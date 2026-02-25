const db = require("../models");

const Resource = db.Resource;
const Therapist = db.Therapist;
const Patient = db.Patient;
const User = db.User;

const Publish = db.Publish;
const Treats = db.Treats;
const Consume = db.Consume;

const Op = db.Sequelize.Op;

const isAdmin = (req) => req.user?.role === "ADMIN";
const isTherapist = (req) => req.user?.role === "THERAPIST";
const isPatient = (req) => req.user?.role === "PATIENT";

// Helper: ¿este recurso lo publicó el terapeuta logado?
async function resourcePublishedByTherapist(resourceId, therapistId) {
  const rel = await Publish.findOne({
    where: { Id_resource: resourceId, Id_user_therapist: therapistId }
  });
  return !!rel;
}

/**
 * GET /api/resources
 * Público
 */
exports.getAllResources = async (req, res) => {
  try {
    const { type, name } = req.query;

    const whereClause = {};
    if (type) whereClause.Resource_type = type;
    if (name) whereClause.Name = { [Op.like]: `%${name}%` };

    const resources = await Resource.findAll({
      where: whereClause,
      include: [
        {
          model: Therapist,
          as: 'publishers',
          through: { attributes: ['Publication_date'] },
          include: [{ model: User, attributes: ['email'] }]
        }
      ],
      order: [['Id_resource', 'DESC']]
    });

    return res.status(200).json({ success: true, count: resources.length, data: resources });
  } catch (error) {
    console.error('Error en getAllResources:', error);
    return res.status(500).json({ success: false, message: 'Error al obtener recursos', error: error.message });
  }
};

/**
 * GET /api/resources/:id
 * Público
 */
exports.getResourceById = async (req, res) => {
  try {
    const { id } = req.params;

    const resource = await Resource.findByPk(id, {
      include: [
        {
          model: Therapist,
          as: 'publishers',
          through: { attributes: ['Publication_date'] },
          include: [{ model: User, attributes: ['email'] }]
        },
        {
          model: Patient,
          as: 'consumers',
          include: [{ model: User, attributes: ['email'] }]
        }
      ]
    });

    if (!resource) return res.status(404).json({ success: false, message: 'Recurso no encontrado' });

    return res.status(200).json({ success: true, data: resource });
  } catch (error) {
    console.error('Error en getResourceById:', error);
    return res.status(500).json({ success: false, message: 'Error al obtener recurso', error: error.message });
  }
};

/**
 * POST /api/resources
 * Privado: ADMIN o THERAPIST
 * - Si THERAPIST: crea y lo asocia en PUBLISH automáticamente
 */
exports.createResource = async (req, res) => {
  try {
    const { Name, Resource_type, Resource_description } = req.body;

    if (!Name) {
      return res.status(400).json({ success: false, message: 'El nombre del recurso es requerido' });
    }
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Necesitas iniciar sesión." });
    }
    if (!isAdmin(req) && !isTherapist(req)) {
      return res.status(403).json({ success: false, message: "No tienes permisos para crear recursos." });
    }

    const resource = await Resource.create({
      Name,
      Resource_type: Resource_type || null,
      Resource_description: Resource_description || null
    });

    // ✅ si es terapeuta, creamos relación en PUBLISH
    if (isTherapist(req)) {
      await Publish.create({
        Id_user_therapist: req.user.id,
        Id_resource: resource.Id_resource,
        Publication_date: new Date()
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Recurso creado exitosamente',
      data: resource
    });
  } catch (error) {
    console.error('Error en createResource:', error);
    return res.status(500).json({ success: false, message: 'Error al crear recurso', error: error.message });
  }
};

/**
 * PUT /api/resources/:id
 * Privado: ADMIN o THERAPIST (solo si lo publicó)
 */
exports.updateResource = async (req, res) => {
  try {
    const { id } = req.params;
    const { Name, Resource_type, Resource_description } = req.body;

    if (!req.user) return res.status(401).json({ success: false, message: "Necesitas iniciar sesión." });

    const resource = await Resource.findByPk(id);
    if (!resource) return res.status(404).json({ success: false, message: 'Recurso no encontrado' });

    if (isTherapist(req) && !isAdmin(req)) {
      const ok = await resourcePublishedByTherapist(id, req.user.id);
      if (!ok) {
        return res.status(403).json({ success: false, message: "No puedes modificar un recurso que no has publicado." });
      }
    } else if (!isAdmin(req)) {
      return res.status(403).json({ success: false, message: "No tienes permisos para modificar recursos." });
    }

    await resource.update({
      Name: Name ?? resource.Name,
      Resource_type: Resource_type ?? resource.Resource_type,
      Resource_description: Resource_description ?? resource.Resource_description
    });

    return res.status(200).json({ success: true, message: 'Recurso actualizado exitosamente', data: resource });
  } catch (error) {
    console.error('Error en updateResource:', error);
    return res.status(500).json({ success: false, message: 'Error al actualizar recurso', error: error.message });
  }
};

/**
 * DELETE /api/resources/:id
 * Privado: ADMIN o THERAPIST (solo si lo publicó)
 */
exports.deleteResource = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user) return res.status(401).json({ success: false, message: "Necesitas iniciar sesión." });

    const resource = await Resource.findByPk(id);
    if (!resource) return res.status(404).json({ success: false, message: 'Recurso no encontrado' });

    if (isTherapist(req) && !isAdmin(req)) {
      const ok = await resourcePublishedByTherapist(id, req.user.id);
      if (!ok) {
        return res.status(403).json({ success: false, message: "No puedes eliminar un recurso que no has publicado." });
      }

      // limpiar relación publish del terapeuta con este recurso
      await Publish.destroy({ where: { Id_user_therapist: req.user.id, Id_resource: id } });
    } else if (!isAdmin(req)) {
      return res.status(403).json({ success: false, message: "No tienes permisos para eliminar recursos." });
    }

    await resource.destroy();
    return res.status(200).json({ success: true, message: 'Recurso eliminado exitosamente' });
  } catch (error) {
    console.error('Error en deleteResource:', error);
    return res.status(500).json({ success: false, message: 'Error al eliminar recurso', error: error.message });
  }
};

/**
 * GET /api/resources/by-type/:type
 * Público
 */
exports.getResourcesByType = async (req, res) => {
  try {
    const { type } = req.params;

    const resources = await Resource.findAll({
      where: { Resource_type: type },
      include: [{
        model: Therapist,
        as: 'publishers',
        through: { attributes: ['Publication_date'] }
      }]
    });

    return res.status(200).json({ success: true, count: resources.length, data: resources });
  } catch (error) {
    console.error('Error en getResourcesByType:', error);
    return res.status(500).json({ success: false, message: 'Error al obtener recursos por tipo', error: error.message });
  }
};

/**
 * GET /api/resources/by-therapist/:therapistId
 * Público
 */
exports.getResourcesByTherapist = async (req, res) => {
  try {
    const { therapistId } = req.params;

    const therapist = await Therapist.findByPk(therapistId, {
      include: [{
        model: Resource,
        as: 'resources',
        through: { attributes: ['Publication_date'] }
      }]
    });

    if (!therapist) return res.status(404).json({ success: false, message: 'Terapeuta no encontrado' });

    return res.status(200).json({ success: true, count: therapist.resources.length, data: therapist.resources });
  } catch (error) {
    console.error('Error en getResourcesByTherapist:', error);
    return res.status(500).json({ success: false, message: 'Error al obtener recursos por terapeuta', error: error.message });
  }
};

/**
 * GET /api/resources/:id/consumers
 * Privado: ADMIN/THERAPIST
 */
exports.getResourceConsumers = async (req, res) => {
  try {
    const { id } = req.params;

    const resource = await Resource.findByPk(id, {
      include: [{
        model: Patient,
        as: 'consumers',
        include: [{ model: User, attributes: ['email'] }]
      }]
    });

    if (!resource) return res.status(404).json({ success: false, message: 'Recurso no encontrado' });

    return res.status(200).json({ success: true, count: resource.consumers.length, data: resource.consumers });
  } catch (error) {
    console.error('Error en getResourceConsumers:', error);
    return res.status(500).json({ success: false, message: 'Error al obtener consumidores del recurso', error: error.message });
  }
};

/**
 * GET /api/resources/:id/publishers
 * Público
 */
exports.getResourcePublishers = async (req, res) => {
  try {
    const { id } = req.params;

    const resource = await Resource.findByPk(id, {
      include: [{
        model: Therapist,
        as: 'publishers',
        through: { attributes: ['Publication_date'] },
        include: [{ model: User, attributes: ['email'] }]
      }]
    });

    if (!resource) return res.status(404).json({ success: false, message: 'Recurso no encontrado' });

    return res.status(200).json({ success: true, count: resource.publishers.length, data: resource.publishers });
  } catch (error) {
    console.error('Error en getResourcePublishers:', error);
    return res.status(500).json({ success: false, message: 'Error al obtener publicadores del recurso', error: error.message });
  }
};

/**
 * GET /api/resources/popular
 * Público
 * (Arreglado: usa db.sequelize y db.Consume)
 */
exports.getPopularResources = async (req, res) => {
  try {
    const resources = await Resource.findAll({
      attributes: [
        'Id_resource',
        'Name',
        'Resource_type',
        'Resource_description',
        [db.sequelize.literal(`(SELECT COUNT(*) FROM CONSUME c WHERE c.Id_resource = Resource.Id_resource)`), 'consumption_count']
      ],
      order: [[db.sequelize.literal('consumption_count'), 'DESC']],
      limit: 10
    });

    return res.status(200).json({ success: true, count: resources.length, data: resources });
  } catch (error) {
    console.error('Error en getPopularResources:', error);
    return res.status(500).json({ success: false, message: 'Error al obtener recursos populares', error: error.message });
  }
};

/**
 * GET /api/resources/stats
 * Privado: ADMIN
 * (Arreglado)
 */
exports.getResourcesStats = async (req, res) => {
  try {
    const stats = await Resource.findAll({
      attributes: [
        'Resource_type',
        [db.sequelize.fn('COUNT', db.sequelize.col('Id_resource')), 'count']
      ],
      group: ['Resource_type']
    });

    const totalResources = await Resource.count();
    const totalConsumptions = await Consume.count();

    return res.status(200).json({
      success: true,
      data: {
        by_type: stats,
        total_resources: totalResources,
        total_consumptions: totalConsumptions
      }
    });
  } catch (error) {
    console.error('Error en getResourcesStats:', error);
    return res.status(500).json({ success: false, message: 'Error al obtener estadísticas de recursos', error: error.message });
  }
};

/**
 * GET /api/resources/search?q=xxx&type=yyy
 * Público
 */
exports.searchResources = async (req, res) => {
  try {
    const { q, type } = req.query;

    if (!q && !type) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere al menos un parámetro de búsqueda (q o type)'
      });
    }

    const whereClause = {};
    if (q) {
      whereClause[Op.or] = [
        { Name: { [Op.like]: `%${q}%` } },
        { Resource_description: { [Op.like]: `%${q}%` } }
      ];
    }
    if (type) whereClause.Resource_type = type;

    const resources = await Resource.findAll({
      where: whereClause,
      include: [{
        model: Therapist,
        as: 'publishers',
        through: { attributes: ['Publication_date'] }
      }]
    });

    return res.status(200).json({ success: true, count: resources.length, data: resources });
  } catch (error) {
    console.error('Error en searchResources:', error);
    return res.status(500).json({ success: false, message: 'Error al buscar recursos', error: error.message });
  }
};

// ======================
// ✅ NUEVAS
// ======================

/**
 * GET /api/resources/mine
 * THERAPIST: recursos que he publicado
 */
exports.getMyResources = async (req, res) => {
  try {
    const therapistId = req.user.id;

    const resources = await Resource.findAll({
      include: [{
        model: Therapist,
        as: 'publishers',
        where: { Id_user_therapist: therapistId },
        through: { attributes: ['Publication_date'] },
        required: true
      }],
      order: [['Id_resource', 'DESC']]
    });

    return res.status(200).json({ success: true, count: resources.length, data: resources });
  } catch (error) {
    console.error("Error en getMyResources:", error);
    return res.status(500).json({ success: false, message: "Error al obtener mis recursos", error: error.message });
  }
};

/**
 * GET /api/resources/feed
 * PATIENT: recursos publicados por terapeutas que le tratan (Treats)
 * (simple y rápido, ideal para tu tiempo)
 */
exports.getPatientFeed = async (req, res) => {
  try {
    const patientId = req.user.id;

    // terapeutas que tratan al paciente
    const treats = await Treats.findAll({
      where: { Id_user_patient: patientId },
      attributes: ["Id_user_therapist"]
    });
    const therapistIds = treats.map(t => t.Id_user_therapist);

    if (therapistIds.length === 0) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    const resources = await Resource.findAll({
      include: [{
        model: Therapist,
        as: "publishers",
        where: { Id_user_therapist: { [Op.in]: therapistIds } },
        through: { attributes: ["Publication_date"] },
        required: true,
        include: [{ model: User, attributes: ["email"] }]
      }],
      order: [["Id_resource", "DESC"]]
    });

    return res.status(200).json({ success: true, count: resources.length, data: resources });
  } catch (error) {
    console.error("Error en getPatientFeed:", error);
    return res.status(500).json({ success: false, message: "Error al obtener el feed", error: error.message });
  }
};