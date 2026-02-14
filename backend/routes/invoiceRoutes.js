// routes/invoiceRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  updatePaymentStatus,
  getAllServiceInvoices,
  createServiceInvoice,
  getAllCourseInvoices,
  createCourseInvoice,
  getInvoicesStats,
  getPendingInvoices
} = require('../controllers/invoiceController');

// Rutas especiales (deben ir antes de otras rutas)
router.get('/stats', getInvoicesStats);
router.get('/pending', getPendingInvoices);

// Facturas de servicios
router.route('/services')
  .get(getAllServiceInvoices)
  .post(createServiceInvoice);

// Facturas de cursos
router.route('/courses')
  .get(getAllCourseInvoices)
  .post(createCourseInvoice);

// Rutas base
router.route('/')
  .get(getAllInvoices)
  .post(createInvoice);

// Rutas por ID
router.route('/:id')
  .get(getInvoiceById)
  .put(updateInvoice)
  .delete(deleteInvoice);

// Actualizar estado de pago
router.patch('/:id/payment-status', updatePaymentStatus);

module.exports = router;