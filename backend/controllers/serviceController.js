// controllers/serviceController.js
const { Service, ServiceInvoice, Invoice, Patient, Centre } = require('../models/cisne.model');
const { Op } = require('sequelize');

/**
 * Controlador de Servicios
 * Maneja las operaciones CRUD de servicios terapéuticos
 */

// @desc    Obtener todos los servicios
// @route   GET /api/services
// @access  Public
exports.getAllServices = async (req, res) => {
  try {
    const { name, minPrice, maxPrice, date } = req.query;

    const whereClause = {};

    if (name) {
      whereClause.Name = {
        [Op.like]: `%${name}%`
      };
    }

    if (minPrice || maxPrice) {
      whereClause.Price = {};
      if (minPrice) whereClause.Price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) whereClause.Price[Op.lte] = parseFloat(maxPrice);
    }

    if (date) {
      whereClause.Service_Date = date;
    }

    const services = await Service.findAll({
      where: whereClause,
      include: [{
        model: ServiceInvoice,
        include: [{
          model: Invoice
        }]
      }],
      order: [['Service_Date', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    console.error('Error en getAllServices:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener servicios',
      error: error.message
    });
  }
};

// @desc    Obtener un servicio por ID
// @route   GET /api/services/:id
// @access  Public
exports.getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findByPk(id, {
      include: [
        {
          model: ServiceInvoice,
          include: [{
            model: Invoice
          }]
        },
        {
          model: Patient,
          as: 'patients'
        }
      ]
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Servicio no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Error en getServiceById:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener servicio',
      error: error.message
    });
  }
};

// @desc    Crear un nuevo servicio
// @route   POST /api/services
// @access  Private
exports.createService = async (req, res) => {
  try {
    const { Id_service_invoice, Name, Price, Tools, Room, Service_Date } = req.body;

    // Validar campos requeridos
    if (!Name) {
      return res.status(400).json({
        success: false,
        message: 'El nombre del servicio es requerido'
      });
    }

    // Si se proporciona Id_service_invoice, verificar que existe
    if (Id_service_invoice) {
      const invoice = await ServiceInvoice.findByPk(Id_service_invoice);
      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: 'Factura de servicio no encontrada'
        });
      }
    }

    const service = await Service.create({
      Id_service_invoice,
      Name,
      Price,
      Tools,
      Room,
      Service_Date
    });

    res.status(201).json({
      success: true,
      message: 'Servicio creado exitosamente',
      data: service
    });
  } catch (error) {
    console.error('Error en createService:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear servicio',
      error: error.message
    });
  }
};

// @desc    Actualizar un servicio
// @route   PUT /api/services/:id
// @access  Private
exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { Id_service_invoice, Name, Price, Tools, Room, Service_Date } = req.body;

    const service = await Service.findByPk(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Servicio no encontrado'
      });
    }

    await service.update({
      Id_service_invoice,
      Name,
      Price,
      Tools,
      Room,
      Service_Date
    });

    res.status(200).json({
      success: true,
      message: 'Servicio actualizado exitosamente',
      data: service
    });
  } catch (error) {
    console.error('Error en updateService:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar servicio',
      error: error.message
    });
  }
};

// @desc    Eliminar un servicio
// @route   DELETE /api/services/:id
// @access  Private
exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findByPk(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Servicio no encontrado'
      });
    }

    await service.destroy();

    res.status(200).json({
      success: true,
      message: 'Servicio eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error en deleteService:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar servicio',
      error: error.message
    });
  }
};

// @desc    Obtener pacientes que han pagado un servicio
// @route   GET /api/services/:id/patients
// @access  Private
exports.getServicePatients = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findByPk(id, {
      include: [{
        model: Patient,
        as: 'patients',
        include: [{
          model: require('../sequelize-models').User,
          attributes: ['email']
        }]
      }]
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Servicio no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      count: service.patients.length,
      data: service.patients
    });
  } catch (error) {
    console.error('Error en getServicePatients:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener pacientes del servicio',
      error: error.message
    });
  }
};

// @desc    Obtener servicios disponibles (próximos o sin fecha)
// @route   GET /api/services/available
// @access  Public
exports.getAvailableServices = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const services = await Service.findAll({
      where: {
        [Op.or]: [
          { Service_Date: { [Op.gte]: today } },
          { Service_Date: null }
        ]
      },
      order: [['Service_Date', 'ASC']]
    });

    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    console.error('Error en getAvailableServices:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener servicios disponibles',
      error: error.message
    });
  }
};

// @desc    Obtener servicios por rango de fecha
// @route   GET /api/services/by-date-range?startDate=xxx&endDate=xxx
// @access  Public
exports.getServicesByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate y endDate son requeridos'
      });
    }

    const services = await Service.findAll({
      where: {
        Service_Date: {
          [Op.between]: [startDate, endDate]
        }
      },
      order: [['Service_Date', 'ASC']]
    });

    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    console.error('Error en getServicesByDateRange:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener servicios por rango de fecha',
      error: error.message
    });
  }
};

// @desc    Obtener estadísticas de servicios
// @route   GET /api/services/stats
// @access  Private
exports.getServicesStats = async (req, res) => {
  try {
    const { sequelize } = require('../sequelize-models');

    const stats = await Service.findAll({
      attributes: [
        'Name',
        [sequelize.fn('COUNT', sequelize.col('Id_service')), 'count'],
        [sequelize.fn('AVG', sequelize.col('Price')), 'avgPrice'],
        [sequelize.fn('SUM', sequelize.col('Price')), 'totalRevenue']
      ],
      group: ['Name']
    });

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error en getServicesStats:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas de servicios',
      error: error.message
    });
  }
};