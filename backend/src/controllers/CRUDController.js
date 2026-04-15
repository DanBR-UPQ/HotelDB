const pool = require('../config/db');

// ============================================================
// CLIENTES
// ============================================================

const getClientes = async (req, res) => {
    try {
        const [rows] = await pool.query(`SELECT * FROM Clientes ORDER BY id_cliente ASC`);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al listar clientes' });
    }
};

const getClienteById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query(`SELECT * FROM Clientes WHERE id_cliente = ?`, [id]);
        if (rows.length === 0)
            return res.status(404).json({ msg: 'Cliente no encontrado' });
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el cliente' });
    }
};

const crearCliente = async (req, res) => {
    const { nombre, email, telefono, tipo_cliente } = req.body;
    try {
        if (!nombre)
            return res.status(400).json({ msg: 'El nombre es obligatorio' });

        const [result] = await pool.query(
            `INSERT INTO Clientes (nombre, email, telefono, tipo_cliente) VALUES (?, ?, ?, ?)`,
            [nombre, email || null, telefono || null, tipo_cliente || 'Normal']
        );
        const [rows] = await pool.query(`SELECT * FROM Clientes WHERE id_cliente = ?`, [result.insertId]);
        res.status(201).json({ msg: 'Cliente creado con éxito', cliente: rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el cliente' });
    }
};

const actualizarCliente = async (req, res) => {
    const { id } = req.params;
    const { nombre, email, telefono, tipo_cliente } = req.body;
    try {
        const [result] = await pool.query(
            `UPDATE Clientes SET nombre = ?, email = ?, telefono = ?, tipo_cliente = ? WHERE id_cliente = ?`,
            [nombre, email, telefono, tipo_cliente, id]
        );
        if (result.affectedRows === 0)
            return res.status(404).json({ msg: 'Cliente no encontrado' });
        const [rows] = await pool.query(`SELECT * FROM Clientes WHERE id_cliente = ?`, [id]);
        res.json({ msg: 'Cliente actualizado', cliente: rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el cliente' });
    }
};

const eliminarCliente = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query(`SELECT * FROM Clientes WHERE id_cliente = ?`, [id]);
        if (rows.length === 0)
            return res.status(404).json({ msg: 'Cliente no encontrado' });
        await pool.query(`DELETE FROM Clientes WHERE id_cliente = ?`, [id]);
        res.json({ msg: 'Cliente eliminado', cliente: rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el cliente' });
    }
};

// ============================================================
// HABITACIONES
// ============================================================

const getHabitaciones = async (req, res) => {
    try {
        const [rows] = await pool.query(`SELECT * FROM Habitaciones ORDER BY id_habitacion ASC`);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al listar habitaciones' });
    }
};

const getHabitacionById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query(`SELECT * FROM Habitaciones WHERE id_habitacion = ?`, [id]);
        if (rows.length === 0)
            return res.status(404).json({ msg: 'Habitación no encontrada' });
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener la habitación' });
    }
};

const crearHabitacion = async (req, res) => {
    const { tipo, precio, capacidad, estado } = req.body;
    try {
        if (!tipo || !precio || !capacidad)
            return res.status(400).json({ msg: 'Tipo, precio y capacidad son obligatorios' });

        const [result] = await pool.query(
            `INSERT INTO Habitaciones (tipo, precio, capacidad, estado) VALUES (?, ?, ?, ?)`,
            [tipo, precio, capacidad, estado || 'Disponible']
        );
        const [rows] = await pool.query(`SELECT * FROM Habitaciones WHERE id_habitacion = ?`, [result.insertId]);
        res.status(201).json({ msg: 'Habitación creada con éxito', habitacion: rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear la habitación' });
    }
};

const actualizarHabitacion = async (req, res) => {
    const { id } = req.params;
    const { tipo, precio, capacidad, estado } = req.body;
    try {
        const [result] = await pool.query(
            `UPDATE Habitaciones SET tipo = ?, precio = ?, capacidad = ?, estado = ? WHERE id_habitacion = ?`,
            [tipo, precio, capacidad, estado, id]
        );
        if (result.affectedRows === 0)
            return res.status(404).json({ msg: 'Habitación no encontrada' });
        const [rows] = await pool.query(`SELECT * FROM Habitaciones WHERE id_habitacion = ?`, [id]);
        res.json({ msg: 'Habitación actualizada', habitacion: rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar la habitación' });
    }
};

const eliminarHabitacion = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query(`SELECT * FROM Habitaciones WHERE id_habitacion = ?`, [id]);
        if (rows.length === 0)
            return res.status(404).json({ msg: 'Habitación no encontrada' });
        await pool.query(`DELETE FROM Habitaciones WHERE id_habitacion = ?`, [id]);
        res.json({ msg: 'Habitación eliminada', habitacion: rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar la habitación' });
    }
};

// ============================================================
// RESERVAS
// ============================================================

const getReservas = async (req, res) => {
    try {
        const [rows] = await pool.query(`SELECT * FROM Reservas ORDER BY id_reserva ASC`);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al listar reservas' });
    }
};

const getReservaById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query(`SELECT * FROM Reservas WHERE id_reserva = ?`, [id]);
        if (rows.length === 0)
            return res.status(404).json({ msg: 'Reserva no encontrada' });
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener la reserva' });
    }
};

const crearReserva = async (req, res) => {
    const { id_cliente, fecha_inicio, fecha_fin, num_personas, estado } = req.body;
    try {
        if (!id_cliente || !fecha_inicio || !fecha_fin || !num_personas)
            return res.status(400).json({ msg: 'id_cliente, fecha_inicio, fecha_fin y num_personas son obligatorios' });

        const [result] = await pool.query(
            `INSERT INTO Reservas (id_cliente, fecha_inicio, fecha_fin, num_personas, estado) VALUES (?, ?, ?, ?, ?)`,
            [id_cliente, fecha_inicio, fecha_fin, num_personas, estado || 'Activa']
        );
        const [rows] = await pool.query(`SELECT * FROM Reservas WHERE id_reserva = ?`, [result.insertId]);
        res.status(201).json({ msg: 'Reserva creada con éxito', reserva: rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear la reserva' });
    }
};

const actualizarReserva = async (req, res) => {
    const { id } = req.params;
    const { id_cliente, fecha_inicio, fecha_fin, num_personas, estado } = req.body;
    try {
        const [result] = await pool.query(
            `UPDATE Reservas SET id_cliente = ?, fecha_inicio = ?, fecha_fin = ?, num_personas = ?, estado = ? WHERE id_reserva = ?`,
            [id_cliente, fecha_inicio, fecha_fin, num_personas, estado, id]
        );
        if (result.affectedRows === 0)
            return res.status(404).json({ msg: 'Reserva no encontrada' });
        const [rows] = await pool.query(`SELECT * FROM Reservas WHERE id_reserva = ?`, [id]);
        res.json({ msg: 'Reserva actualizada', reserva: rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar la reserva' });
    }
};

const eliminarReserva = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query(`SELECT * FROM Reservas WHERE id_reserva = ?`, [id]);
        if (rows.length === 0)
            return res.status(404).json({ msg: 'Reserva no encontrada' });
        await pool.query(`DELETE FROM Reservas WHERE id_reserva = ?`, [id]);
        res.json({ msg: 'Reserva eliminada', reserva: rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar la reserva' });
    }
};

// ============================================================
// DETALLE_RESERVAS
// ============================================================

const getDetalleReservas = async (req, res) => {
    try {
        const [rows] = await pool.query(`SELECT * FROM Detalle_Reservas ORDER BY id_detalle ASC`);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al listar detalles de reservas' });
    }
};

const getDetalleReservaById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query(`SELECT * FROM Detalle_Reservas WHERE id_detalle = ?`, [id]);
        if (rows.length === 0)
            return res.status(404).json({ msg: 'Detalle no encontrado' });
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el detalle' });
    }
};

const crearDetalleReserva = async (req, res) => {
    const { id_reserva, id_habitacion } = req.body;
    try {
        if (!id_reserva || !id_habitacion)
            return res.status(400).json({ msg: 'id_reserva e id_habitacion son obligatorios' });

        const [result] = await pool.query(
            `INSERT INTO Detalle_Reservas (id_reserva, id_habitacion) VALUES (?, ?)`,
            [id_reserva, id_habitacion]
        );
        const [rows] = await pool.query(`SELECT * FROM Detalle_Reservas WHERE id_detalle = ?`, [result.insertId]);
        res.status(201).json({ msg: 'Detalle creado con éxito', detalle: rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el detalle' });
    }
};

const actualizarDetalleReserva = async (req, res) => {
    const { id } = req.params;
    const { id_reserva, id_habitacion } = req.body;
    try {
        const [result] = await pool.query(
            `UPDATE Detalle_Reservas SET id_reserva = ?, id_habitacion = ? WHERE id_detalle = ?`,
            [id_reserva, id_habitacion, id]
        );
        if (result.affectedRows === 0)
            return res.status(404).json({ msg: 'Detalle no encontrado' });
        const [rows] = await pool.query(`SELECT * FROM Detalle_Reservas WHERE id_detalle = ?`, [id]);
        res.json({ msg: 'Detalle actualizado', detalle: rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el detalle' });
    }
};

const eliminarDetalleReserva = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query(`SELECT * FROM Detalle_Reservas WHERE id_detalle = ?`, [id]);
        if (rows.length === 0)
            return res.status(404).json({ msg: 'Detalle no encontrado' });
        await pool.query(`DELETE FROM Detalle_Reservas WHERE id_detalle = ?`, [id]);
        res.json({ msg: 'Detalle eliminado', detalle: rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el detalle' });
    }
};

// ============================================================
// PAGOS
// ============================================================

const getPagos = async (req, res) => {
    try {
        const [rows] = await pool.query(`SELECT * FROM Pagos ORDER BY id_pago ASC`);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al listar pagos' });
    }
};

const getPagoById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query(`SELECT * FROM Pagos WHERE id_pago = ?`, [id]);
        if (rows.length === 0)
            return res.status(404).json({ msg: 'Pago no encontrado' });
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el pago' });
    }
};

const crearPago = async (req, res) => {
    const { id_reserva, monto, fecha_pago, metodo } = req.body;
    try {
        if (!id_reserva || !monto || !fecha_pago || !metodo)
            return res.status(400).json({ msg: 'id_reserva, monto, fecha_pago y metodo son obligatorios' });

        const [result] = await pool.query(
            `INSERT INTO Pagos (id_reserva, monto, fecha_pago, metodo) VALUES (?, ?, ?, ?)`,
            [id_reserva, monto, fecha_pago, metodo]
        );
        const [rows] = await pool.query(`SELECT * FROM Pagos WHERE id_pago = ?`, [result.insertId]);
        res.status(201).json({ msg: 'Pago registrado con éxito', pago: rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el pago' });
    }
};

const actualizarPago = async (req, res) => {
    const { id } = req.params;
    const { id_reserva, monto, fecha_pago, metodo } = req.body;
    try {
        const [result] = await pool.query(
            `UPDATE Pagos SET id_reserva = ?, monto = ?, fecha_pago = ?, metodo = ? WHERE id_pago = ?`,
            [id_reserva, monto, fecha_pago, metodo, id]
        );
        if (result.affectedRows === 0)
            return res.status(404).json({ msg: 'Pago no encontrado' });
        const [rows] = await pool.query(`SELECT * FROM Pagos WHERE id_pago = ?`, [id]);
        res.json({ msg: 'Pago actualizado', pago: rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el pago' });
    }
};

const eliminarPago = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query(`SELECT * FROM Pagos WHERE id_pago = ?`, [id]);
        if (rows.length === 0)
            return res.status(404).json({ msg: 'Pago no encontrado' });
        await pool.query(`DELETE FROM Pagos WHERE id_pago = ?`, [id]);
        res.json({ msg: 'Pago eliminado', pago: rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el pago' });
    }
};

// ============================================================
// SERVICIOS
// ============================================================

const getServicios = async (req, res) => {
    try {
        const [rows] = await pool.query(`SELECT * FROM Servicios ORDER BY id_servicio ASC`);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al listar servicios' });
    }
};

const getServicioById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query(`SELECT * FROM Servicios WHERE id_servicio = ?`, [id]);
        if (rows.length === 0)
            return res.status(404).json({ msg: 'Servicio no encontrado' });
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el servicio' });
    }
};

const crearServicio = async (req, res) => {
    const { nombre, precio, id_reserva } = req.body;
    try {
        if (!nombre || !precio || !id_reserva)
            return res.status(400).json({ msg: 'nombre, precio e id_reserva son obligatorios' });

        const [result] = await pool.query(
            `INSERT INTO Servicios (nombre, precio, id_reserva) VALUES (?, ?, ?)`,
            [nombre, precio, id_reserva]
        );
        const [rows] = await pool.query(`SELECT * FROM Servicios WHERE id_servicio = ?`, [result.insertId]);
        res.status(201).json({ msg: 'Servicio creado con éxito', servicio: rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el servicio' });
    }
};

const actualizarServicio = async (req, res) => {
    const { id } = req.params;
    const { nombre, precio, id_reserva } = req.body;
    try {
        const [result] = await pool.query(
            `UPDATE Servicios SET nombre = ?, precio = ?, id_reserva = ? WHERE id_servicio = ?`,
            [nombre, precio, id_reserva, id]
        );
        if (result.affectedRows === 0)
            return res.status(404).json({ msg: 'Servicio no encontrado' });
        const [rows] = await pool.query(`SELECT * FROM Servicios WHERE id_servicio = ?`, [id]);
        res.json({ msg: 'Servicio actualizado', servicio: rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el servicio' });
    }
};

const eliminarServicio = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query(`SELECT * FROM Servicios WHERE id_servicio = ?`, [id]);
        if (rows.length === 0)
            return res.status(404).json({ msg: 'Servicio no encontrado' });
        await pool.query(`DELETE FROM Servicios WHERE id_servicio = ?`, [id]);
        res.json({ msg: 'Servicio eliminado', servicio: rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el servicio' });
    }
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
    // Clientes
    getClientes, getClienteById, crearCliente, actualizarCliente, eliminarCliente,
    // Habitaciones
    getHabitaciones, getHabitacionById, crearHabitacion, actualizarHabitacion, eliminarHabitacion,
    // Reservas
    getReservas, getReservaById, crearReserva, actualizarReserva, eliminarReserva,
    // Detalle_Reservas
    getDetalleReservas, getDetalleReservaById, crearDetalleReserva, actualizarDetalleReserva, eliminarDetalleReserva,
    // Pagos
    getPagos, getPagoById, crearPago, actualizarPago, eliminarPago,
    // Servicios
    getServicios, getServicioById, crearServicio, actualizarServicio, eliminarServicio,
};