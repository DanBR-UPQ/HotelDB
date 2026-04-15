const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/CRUDController');

// ============================================================
// CLIENTES
// ============================================================
router.get('/clientes',          ctrl.getClientes);
router.get('/clientes/:id',      ctrl.getClienteById);
router.post('/clientes',         ctrl.crearCliente);
router.put('/clientes/:id',      ctrl.actualizarCliente);
router.delete('/clientes/:id',   ctrl.eliminarCliente);

// ============================================================
// HABITACIONES
// ============================================================
router.get('/habitaciones',        ctrl.getHabitaciones);
router.get('/habitaciones/:id',    ctrl.getHabitacionById);
router.post('/habitaciones',       ctrl.crearHabitacion);
router.put('/habitaciones/:id',    ctrl.actualizarHabitacion);
router.delete('/habitaciones/:id', ctrl.eliminarHabitacion);

// ============================================================
// RESERVAS
// ============================================================
router.get('/reservas',        ctrl.getReservas);
router.get('/reservas/:id',    ctrl.getReservaById);
router.post('/reservas',       ctrl.crearReserva);
router.put('/reservas/:id',    ctrl.actualizarReserva);
router.delete('/reservas/:id', ctrl.eliminarReserva);

// ============================================================
// DETALLE_RESERVAS
// ============================================================
router.get('/detalle-reservas',        ctrl.getDetalleReservas);
router.get('/detalle-reservas/:id',    ctrl.getDetalleReservaById);
router.post('/detalle-reservas',       ctrl.crearDetalleReserva);
router.put('/detalle-reservas/:id',    ctrl.actualizarDetalleReserva);
router.delete('/detalle-reservas/:id', ctrl.eliminarDetalleReserva);

// ============================================================
// PAGOS
// ============================================================
router.get('/pagos',        ctrl.getPagos);
router.get('/pagos/:id',    ctrl.getPagoById);
router.post('/pagos',       ctrl.crearPago);
router.put('/pagos/:id',    ctrl.actualizarPago);
router.delete('/pagos/:id', ctrl.eliminarPago);

// ============================================================
// SERVICIOS
// ============================================================
router.get('/servicios',        ctrl.getServicios);
router.get('/servicios/:id',    ctrl.getServicioById);
router.post('/servicios',       ctrl.crearServicio);
router.put('/servicios/:id',    ctrl.actualizarServicio);
router.delete('/servicios/:id', ctrl.eliminarServicio);

module.exports = router;