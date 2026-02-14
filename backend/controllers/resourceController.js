// controllers/resourceController.js
const { Resource, Therapist, Patient, User } = require('../sequelize-models');
const { Op } = require('sequelize');

/**
 * Controlador de Recursos
 * Maneja las operaciones CRUD de recursos educativos
 */

// @desc    Obtener todos los recursos
// @route   GET /api/resources
// @access  Public
exports.getAllResources = async (req, res) => {
  try {
    const { type, name } = req.query;

    const whereClause = {};

    if (type) {
      whereClause.Resource_type = type;
    }

    if (name) {
      whereClause.Name = {
        [Op.like]: `%${name}%`
      };
    }

    const resources = await Resource.findAll({
      where: whereClause,
      include: [
        {
          model: Therapist,
          as: 'publishers',
          through: { attributes: ['Publication_date'] },
          include: [{
            model: User,
            attributes: ['email']
          }]
        }
      ],
      order: [['Id_resource', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: resources.length,
      data: resources
    });
  } catch (error) {
    console.error('Error en getAllResources:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener recursos',
      error: error.message
    });
  }
};

// @desc    Obtener un recurso por ID
// @route   GET /api/resources/:id
// @access  Public
exports.getResourceById = async (req, res) => {
  try {
    const { id } = req.params;

    const resource = await Resource.findByPk(id, {
      include: [
        {
          model: Therapist,
          as: 'publishers',
          through: { attributes: ['Publication_date'] },
          include: [{
            model: User,
            attributes: ['email']
          }]
        },
        {
          model: Patient,
          as: 'consumers',
          include: [{
            model: User,
            attributes: ['email']
          }]
        }
      ]
    });

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Recurso no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: resource
    });
  } catch (error) {
    console.error('Error en getResourceById:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener recurso',
      error: error.message
    });
  }
};

// @desc    Crear un nuevo recurso
// @route   POST /api/resources
// @access  Private
exports.createResource = async (req, res) => {
  try {
    const { Name, Resource_type, Resource_description } = req.body;

    // Validar campos requeridos
    if (!Name) {
      return res.status(400).json({
        success: false,
        message: 'El nombre del recurso es requerido'
      });
    }

    const resource = await Resource.create({
      Name,
      Resource_type,
      Resource_description
    });

    res.status(201).json({
      success: true,
      message: 'Recurso creado exitosamente',
      data: resource
    });
  } catch (error) {
    console.error('Error en createResource:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear recurso',
      error: error.message
    });
  }
};

// @desc    Actualizar un recurso
// @route   PUT /api/resources/:id
// @access  Private
exports.updateResource = async (req, res) => {
  try {
    const { id } = req.params;
    const { Name, Resource_type, Resource_description } = req.body;

    const resource = await Resource.findByPk(id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Recurso no encontrado'
      });
    }

    await resource.update({
      Name,
      Resource_type,
      Resource_description
    });

    res.status(200).json({
      success: true,
      message: 'Recurso actualizado exitosamente',
      data: resource
    });
  } catch (error) {
    console.error('Error en updateResource:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar recurso',
      error: error.message
    });
  }
};

// @desc    Eliminar un recurso
// @route   DELETE /api/resources/:id
// @access  Private
exports.deleteResource = async (req, res) => {
  try {
    const { id } = req.params;

    const resource = await Resource.findByPk(id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Recurso no encontrado'
      });
    }

    await resource.destroy();

    res.status(200).json({
      success: true,
      message: 'Recurso eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error en deleteResource:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar recurso',
      error: error.message
    });
  }
};

// @desc    Obtener recursos por tipo
// @route   GET /api/resources/by-type/:type
// @access  Public
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

    res.status(200).json({
      success: true,
      count: resources.length,
      data: resources
    });
  } catch (error) {
    console.error('Error en getResourcesByType:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener recursos por tipo',
      error: error.message
    });
  }
};

// @desc    Obtener recursos publicados por un terapeuta específico
// @route   GET /api/resources/by-therapist/:therapistId
// @access  Public
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
    console.error('Error en getResourcesByTherapist:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener recursos por terapeuta',
      error: error.message
    });
  }
};

// @desc    Obtener pacientes que han consumido un recurso
// @route   GET /api/resources/:id/consumers
// @access  Private
exports.getResourceConsumers = async (req, res) => {
  try {
    const { id } = req.params;

    const resource = await Resource.findByPk(id, {
      include: [{
        model: Patient,
        as: 'consumers',
        include: [{
          model: User,
          attributes: ['email']
        }]
      }]
    });

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Recurso no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      count: resource.consumers.length,
      data: resource.consumers
    });
  } catch (error) {
    console.error('Error en getResourceConsumers:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener consumidores del recurso',
      error: error.message
    });
  }
};

// @desc    Obtener terapeutas que han publicado un recurso
// @route   GET /api/resources/:id/publishers
// @access  Public
exports.getResourcePublishers = async (req, res) => {
  try {
    const { id } = req.params;

    const resource = await Resource.findByPk(id, {
      include: [{
        model: Therapist,
        as: 'publishers',
        through: { attributes: ['Publication_date'] },
        include: [{
          model: User,
          attributes: ['email']
        }]
      }]
    });

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Recurso no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      count: resource.publishers.length,
      data: resource.publishers
    });
  } catch (error) {
    console.error('Error en getResourcePublishers:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener publicadores del recurso',
      error: error.message
    });
  }
};

// @desc    Obtener recursos más populares
// @route   GET /api/resources/popular
// @access  Public
exports.getPopularResources = async (req, res) => {
  try {
    const { sequelize } = require('../sequelize-models');

    const resources = await Resource.findAll({
      attributes: [
        'Id_resource',
        'Name',
        'Resource_type',
        'Resource_description',
        [
          sequelize.literal('(SELECT COUNT(*) FROM CONSUME WHERE CONSUME.Id_resource = Resource.Id_resource)'),
          'consumption_count'
        ]
      ],
      order: [[sequelize.literal('consumption_count'), 'DESC']],
      limit: 10
    });

    res.status(200).json({
      success: true,
      count: resources.length,
      data: resources
    });
  } catch (error) {
    console.error('Error en getPopularResources:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener recursos populares',
      error: error.message
    });
  }
};

// @desc    Obtener estadísticas de recursos
// @route   GET /api/resources/stats
// @access  Private
exports.getResourcesStats = async (req, res) => {
  try {
    const { sequelize } = require('../sequelize-models');

    const stats = await Resource.findAll({
      attributes: [
        'Resource_type',
        [sequelize.fn('COUNT', sequelize.col('Id_resource')), 'count']
      ],
      group: ['Resource_type']
    });

    const totalResources = await Resource.count();
    const totalConsumptions = await sequelize.models.Consume.count();

    res.status(200).json({
      success: true,
      data: {
        by_type: stats,
        total_resources: totalResources,
        total_consumptions: totalConsumptions
      }
    });
  } catch (error) {
    console.error('Error en getResourcesStats:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas de recursos',
      error: error.message
    });
  }
};

// @desc    Buscar recursos
// @route   GET /api/resources/search?q=xxx
// @access  Public
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

    if (type) {
      whereClause.Resource_type = type;
    }

    const resources = await Resource.findAll({
      where: whereClause,
      include: [{
        model: Therapist,
        as: 'publishers',
        through: { attributes: ['Publication_date'] }
      }]
    });

    res.status(200).json({
      success: true,
      count: resources.length,
      data: resources
    });
  } catch (error) {
    console.error('Error en searchResources:', error);
    res.status(500).json({
      success: false,
      message: 'Error al buscar recursos',
      error: error.message
    });
  }
};