// controllers/invoiceController.js
const { Invoice, ServiceInvoice, CourseInvoice, Service, Course } = require('../sequelize-models');
const { Op } = require('sequelize');

/**
 * Controlador de Facturas
 * Maneja las operaciones CRUD de facturas, facturas de servicios y facturas de cursos
 */

// ==================== FACTURAS GENERALES ====================

// @desc    Obtener todas las facturas
// @route   GET /api/invoices
// @access  Private
exports.getAllInvoices = async (req, res) => {
  try {
    const { payment_status, payment_method, startDate, endDate } = req.query;

    const whereClause = {};

    if (payment_status) {
      whereClause.Payment_status = payment_status;
    }

    if (payment_method) {
      whereClause.Payment_method = payment_method;
    }

    if (startDate && endDate) {
      whereClause.Invoice_date = {
        [Op.between]: [startDate, endDate]
      };
    }

    const invoices = await Invoice.findAll({
      where: whereClause,
      include: [
        {
          model: ServiceInvoice,
          required: false
        },
        {
          model: CourseInvoice,
          required: false
        }
      ],
      order: [['Invoice_date', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: invoices.length,
      data: invoices
    });
  } catch (error) {
    console.error('Error en getAllInvoices:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener facturas',
      error: error.message
    });
  }
};

// @desc    Obtener una factura por ID
// @route   GET /api/invoices/:id
// @access  Private
exports.getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findByPk(id, {
      include: [
        {
          model: ServiceInvoice,
          include: [{
            model: Service
          }]
        },
        {
          model: CourseInvoice,
          include: [{
            model: Course
          }]
        }
      ]
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: invoice
    });
  } catch (error) {
    console.error('Error en getInvoiceById:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener factura',
      error: error.message
    });
  }
};

// @desc    Crear una nueva factura
// @route   POST /api/invoices
// @access  Private
exports.createInvoice = async (req, res) => {
  try {
    const { Invoice_number, Invoice_date, Tax_amount, Payment_method, Payment_status } = req.body;

    // Validar campos requeridos
    if (!Invoice_number || !Invoice_date) {
      return res.status(400).json({
        success: false,
        message: 'Invoice_number e Invoice_date son requeridos'
      });
    }

    // Verificar si el número de factura ya existe
    const existingInvoice = await Invoice.findOne({ where: { Invoice_number } });
    if (existingInvoice) {
      return res.status(409).json({
        success: false,
        message: 'El número de factura ya existe'
      });
    }

    const invoice = await Invoice.create({
      Invoice_number,
      Invoice_date,
      Tax_amount,
      Payment_method,
      Payment_status: Payment_status || 'Pendiente'
    });

    res.status(201).json({
      success: true,
      message: 'Factura creada exitosamente',
      data: invoice
    });
  } catch (error) {
    console.error('Error en createInvoice:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear factura',
      error: error.message
    });
  }
};

// @desc    Actualizar una factura
// @route   PUT /api/invoices/:id
// @access  Private
exports.updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { Invoice_number, Invoice_date, Tax_amount, Payment_method, Payment_status } = req.body;

    const invoice = await Invoice.findByPk(id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada'
      });
    }

    // Verificar si el nuevo número de factura ya existe (y no es la misma factura)
    if (Invoice_number && Invoice_number !== invoice.Invoice_number) {
      const existingInvoice = await Invoice.findOne({ where: { Invoice_number } });
      if (existingInvoice) {
        return res.status(409).json({
          success: false,
          message: 'El número de factura ya existe'
        });
      }
    }

    await invoice.update({
      Invoice_number,
      Invoice_date,
      Tax_amount,
      Payment_method,
      Payment_status
    });

    res.status(200).json({
      success: true,
      message: 'Factura actualizada exitosamente',
      data: invoice
    });
  } catch (error) {
    console.error('Error en updateInvoice:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar factura',
      error: error.message
    });
  }
};

// @desc    Eliminar una factura
// @route   DELETE /api/invoices/:id
// @access  Private
exports.deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findByPk(id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada'
      });
    }

    await invoice.destroy();

    res.status(200).json({
      success: true,
      message: 'Factura eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error en deleteInvoice:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar factura',
      error: error.message
    });
  }
};

// @desc    Actualizar estado de pago
// @route   PATCH /api/invoices/:id/payment-status
// @access  Private
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { Payment_status } = req.body;

    if (!Payment_status) {
      return res.status(400).json({
        success: false,
        message: 'Payment_status es requerido'
      });
    }

    const invoice = await Invoice.findByPk(id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada'
      });
    }

    await invoice.update({ Payment_status });

    res.status(200).json({
      success: true,
      message: 'Estado de pago actualizado exitosamente',
      data: invoice
    });
  } catch (error) {
    console.error('Error en updatePaymentStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar estado de pago',
      error: error.message
    });
  }
};

// ==================== FACTURAS DE SERVICIOS ====================

// @desc    Obtener todas las facturas de servicios
// @route   GET /api/invoices/services
// @access  Private
exports.getAllServiceInvoices = async (req, res) => {
  try {
    const serviceInvoices = await ServiceInvoice.findAll({
      include: [
        {
          model: Invoice
        },
        {
          model: Service
        }
      ]
    });

    res.status(200).json({
      success: true,
      count: serviceInvoices.length,
      data: serviceInvoices
    });
  } catch (error) {
    console.error('Error en getAllServiceInvoices:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener facturas de servicios',
      error: error.message
    });
  }
};

// @desc    Crear una factura de servicio
// @route   POST /api/invoices/services
// @access  Private
exports.createServiceInvoice = async (req, res) => {
  try {
    const { Invoice_number, Invoice_date, Tax_amount, Payment_method, Payment_status } = req.body;

    // Validar campos requeridos
    if (!Invoice_number || !Invoice_date) {
      return res.status(400).json({
        success: false,
        message: 'Invoice_number e Invoice_date son requeridos'
      });
    }

    // Crear la factura general primero
    const invoice = await Invoice.create({
      Invoice_number,
      Invoice_date,
      Tax_amount,
      Payment_method,
      Payment_status: Payment_status || 'Pendiente'
    });

    // Crear la factura de servicio
    const serviceInvoice = await ServiceInvoice.create({
      Id_service_invoice: invoice.Id_Invoice
    });

    // Obtener la factura completa
    const fullInvoice = await ServiceInvoice.findByPk(serviceInvoice.Id_service_invoice, {
      include: [{ model: Invoice }]
    });

    res.status(201).json({
      success: true,
      message: 'Factura de servicio creada exitosamente',
      data: fullInvoice
    });
  } catch (error) {
    console.error('Error en createServiceInvoice:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear factura de servicio',
      error: error.message
    });
  }
};

// ==================== FACTURAS DE CURSOS ====================

// @desc    Obtener todas las facturas de cursos
// @route   GET /api/invoices/courses
// @access  Private
exports.getAllCourseInvoices = async (req, res) => {
  try {
    const courseInvoices = await CourseInvoice.findAll({
      include: [
        {
          model: Invoice
        },
        {
          model: Course
        }
      ]
    });

    res.status(200).json({
      success: true,
      count: courseInvoices.length,
      data: courseInvoices
    });
  } catch (error) {
    console.error('Error en getAllCourseInvoices:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener facturas de cursos',
      error: error.message
    });
  }
};

// @desc    Crear una factura de curso
// @route   POST /api/invoices/courses
// @access  Private
exports.createCourseInvoice = async (req, res) => {
  try {
    const { Invoice_number, Invoice_date, Tax_amount, Payment_method, Payment_status } = req.body;

    // Validar campos requeridos
    if (!Invoice_number || !Invoice_date) {
      return res.status(400).json({
        success: false,
        message: 'Invoice_number e Invoice_date son requeridos'
      });
    }

    // Crear la factura general primero
    const invoice = await Invoice.create({
      Invoice_number,
      Invoice_date,
      Tax_amount,
      Payment_method,
      Payment_status: Payment_status || 'Pendiente'
    });

    // Crear la factura de curso
    const courseInvoice = await CourseInvoice.create({
      Id_course_invoice: invoice.Id_Invoice
    });

    // Obtener la factura completa
    const fullInvoice = await CourseInvoice.findByPk(courseInvoice.Id_course_invoice, {
      include: [{ model: Invoice }]
    });

    res.status(201).json({
      success: true,
      message: 'Factura de curso creada exitosamente',
      data: fullInvoice
    });
  } catch (error) {
    console.error('Error en createCourseInvoice:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear factura de curso',
      error: error.message
    });
  }
};

// ==================== ESTADÍSTICAS ====================

// @desc    Obtener estadísticas de facturación
// @route   GET /api/invoices/stats
// @access  Private
exports.getInvoicesStats = async (req, res) => {
  try {
    const { sequelize } = require('../sequelize-models');

    // Total de facturas
    const totalInvoices = await Invoice.count();

    // Facturas por estado
    const byStatus = await Invoice.findAll({
      attributes: [
        'Payment_status',
        [sequelize.fn('COUNT', sequelize.col('Id_Invoice')), 'count']
      ],
      group: ['Payment_status']
    });

    // Ingresos totales
    const totalRevenue = await Invoice.sum('Tax_amount');

    // Facturas de servicios vs cursos
    const serviceInvoicesCount = await ServiceInvoice.count();
    const courseInvoicesCount = await CourseInvoice.count();

    res.status(200).json({
      success: true,
      data: {
        total_invoices: totalInvoices,
        by_status: byStatus,
        total_revenue: totalRevenue || 0,
        service_invoices: serviceInvoicesCount,
        course_invoices: courseInvoicesCount
      }
    });
  } catch (error) {
    console.error('Error en getInvoicesStats:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas de facturación',
      error: error.message
    });
  }
};

// @desc    Obtener facturas pendientes
// @route   GET /api/invoices/pending
// @access  Private
exports.getPendingInvoices = async (req, res) => {
  try {
    const pendingInvoices = await Invoice.findAll({
      where: { Payment_status: 'Pendiente' },
      order: [['Invoice_date', 'ASC']]
    });

    res.status(200).json({
      success: true,
      count: pendingInvoices.length,
      data: pendingInvoices
    });
  } catch (error) {
    console.error('Error en getPendingInvoices:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener facturas pendientes',
      error: error.message
    });
  }
};