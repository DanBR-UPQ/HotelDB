const pool = require('../config/db');

// ============================================================
// CLIENTES
// ============================================================

const getClientes = async (req, res) => {
    try {
        const query = `SELECT * FROM Clientes ORDER BY id_cliente ASC`;
        const response = await pool.query(query);
        res.json(response.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al listar clientes' });
    }
};

const getClienteById = async (req, res) => {
    const { id } = req.params;
    try {
        const query = `SELECT * FROM Clientes WHERE id_cliente = $1`;
        const response = await pool.query(query, [id]);
        if (response.rows.length === 0)
            return res.status(404).json({ msg: 'Cliente no encontrado' });
        res.json(response.rows[0]);
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

        const query = `
            INSERT INTO Clientes (nombre, email, telefono, tipo_cliente)
            VALUES ($1, $2, $3, $4) RETURNING *
        `;
        const response = await pool.query(query, [
            nombre,
            email || null,
            telefono || null,
            tipo_cliente || 'Normal'
        ]);
        res.status(201).json({ msg: 'Cliente creado con éxito', cliente: response.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el cliente' });
    }
};

const actualizarCliente = async (req, res) => {
    const { id } = req.params;
    const { nombre, email, telefono, tipo_cliente } = req.body;
    try {
        const query = `
            UPDATE Clientes
            SET nombre = $1, email = $2, telefono = $3, tipo_cliente = $4
            WHERE id_cliente = $5 RETURNING *
        `;
        const response = await pool.query(query, [nombre, email, telefono, tipo_cliente, id]);
        if (response.rows.length === 0)
            return res.status(404).json({ msg: 'Cliente no encontrado' });
        res.json({ msg: 'Cliente actualizado', cliente: response.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el cliente' });
    }
};

const eliminarCliente = async (req, res) => {
    const { id } = req.params;
    try {
        const query = `DELETE FROM Clientes WHERE id_cliente = $1 RETURNING *`;
        const response = await pool.query(query, [id]);
        if (response.rows.length === 0)
            return res.status(404).json({ msg: 'Cliente no encontrado' });
        res.json({ msg: 'Cliente eliminado', cliente: response.rows[0] });
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
        const query = `SELECT * FROM Habitaciones ORDER BY id_habitacion ASC`;
        const response = await pool.query(query);
        res.json(response.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al listar habitaciones' });
    }
};

const getHabitacionById = async (req, res) => {
    const { id } = req.params;
    try {
        const query = `SELECT * FROM Habitaciones WHERE id_habitacion = $1`;
        const response = await pool.query(query, [id]);
        if (response.rows.length === 0)
            return res.status(404).json({ msg: 'Habitación no encontrada' });
        res.json(response.rows[0]);
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

        const query = `
            INSERT INTO Habitaciones (tipo, precio, capacidad, estado)
            VALUES ($1, $2, $3, $4) RETURNING *
        `;
        const response = await pool.query(query, [tipo, precio, capacidad, estado || 'Disponible']);
        res.status(201).json({ msg: 'Habitación creada con éxito', habitacion: response.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear la habitación' });
    }
};

const actualizarHabitacion = async (req, res) => {
    const { id } = req.params;
    const { tipo, precio, capacidad, estado } = req.body;
    try {
        const query = `
            UPDATE Habitaciones
            SET tipo = $1, precio = $2, capacidad = $3, estado = $4
            WHERE id_habitacion = $5 RETURNING *
        `;
        const response = await pool.query(query, [tipo, precio, capacidad, estado, id]);
        if (response.rows.length === 0)
            return res.status(404).json({ msg: 'Habitación no encontrada' });
        res.json({ msg: 'Habitación actualizada', habitacion: response.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar la habitación' });
    }
};

const eliminarHabitacion = async (req, res) => {
    const { id } = req.params;
    try {
        const query = `DELETE FROM Habitaciones WHERE id_habitacion = $1 RETURNING *`;
        const response = await pool.query(query, [id]);
        if (response.rows.length === 0)
            return res.status(404).json({ msg: 'Habitación no encontrada' });
        res.json({ msg: 'Habitación eliminada', habitacion: response.rows[0] });
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
        const query = `SELECT * FROM Reservas ORDER BY id_reserva ASC`;
        const response = await pool.query(query);
        res.json(response.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al listar reservas' });
    }
};

const getReservaById = async (req, res) => {
    const { id } = req.params;
    try {
        const query = `SELECT * FROM Reservas WHERE id_reserva = $1`;
        const response = await pool.query(query, [id]);
        if (response.rows.length === 0)
            return res.status(404).json({ msg: 'Reserva no encontrada' });
        res.json(response.rows[0]);
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

        const query = `
            INSERT INTO Reservas (id_cliente, fecha_inicio, fecha_fin, num_personas, estado)
            VALUES ($1, $2, $3, $4, $5) RETURNING *
        `;
        const response = await pool.query(query, [
            id_cliente, fecha_inicio, fecha_fin, num_personas, estado || 'Activa'
        ]);
        res.status(201).json({ msg: 'Reserva creada con éxito', reserva: response.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear la reserva' });
    }
};

const actualizarReserva = async (req, res) => {
    const { id } = req.params;
    const { id_cliente, fecha_inicio, fecha_fin, num_personas, estado } = req.body;
    try {
        const query = `
            UPDATE Reservas
            SET id_cliente = $1, fecha_inicio = $2, fecha_fin = $3, num_personas = $4, estado = $5
            WHERE id_reserva = $6 RETURNING *
        `;
        const response = await pool.query(query, [id_cliente, fecha_inicio, fecha_fin, num_personas, estado, id]);
        if (response.rows.length === 0)
            return res.status(404).json({ msg: 'Reserva no encontrada' });
        res.json({ msg: 'Reserva actualizada', reserva: response.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar la reserva' });
    }
};

const eliminarReserva = async (req, res) => {
    const { id } = req.params;
    try {
        const query = `DELETE FROM Reservas WHERE id_reserva = $1 RETURNING *`;
        const response = await pool.query(query, [id]);
        if (response.rows.length === 0)
            return res.status(404).json({ msg: 'Reserva no encontrada' });
        res.json({ msg: 'Reserva eliminada', reserva: response.rows[0] });
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
        const query = `SELECT * FROM Detalle_Reservas ORDER BY id_detalle ASC`;
        const response = await pool.query(query);
        res.json(response.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al listar detalles de reservas' });
    }
};

const getDetalleReservaById = async (req, res) => {
    const { id } = req.params;
    try {
        const query = `SELECT * FROM Detalle_Reservas WHERE id_detalle = $1`;
        const response = await pool.query(query, [id]);
        if (response.rows.length === 0)
            return res.status(404).json({ msg: 'Detalle no encontrado' });
        res.json(response.rows[0]);
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

        const query = `
            INSERT INTO Detalle_Reservas (id_reserva, id_habitacion)
            VALUES ($1, $2) RETURNING *
        `;
        const response = await pool.query(query, [id_reserva, id_habitacion]);
        res.status(201).json({ msg: 'Detalle creado con éxito', detalle: response.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el detalle' });
    }
};

const actualizarDetalleReserva = async (req, res) => {
    const { id } = req.params;
    const { id_reserva, id_habitacion } = req.body;
    try {
        const query = `
            UPDATE Detalle_Reservas
            SET id_reserva = $1, id_habitacion = $2
            WHERE id_detalle = $3 RETURNING *
        `;
        const response = await pool.query(query, [id_reserva, id_habitacion, id]);
        if (response.rows.length === 0)
            return res.status(404).json({ msg: 'Detalle no encontrado' });
        res.json({ msg: 'Detalle actualizado', detalle: response.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el detalle' });
    }
};

const eliminarDetalleReserva = async (req, res) => {
    const { id } = req.params;
    try {
        const query = `DELETE FROM Detalle_Reservas WHERE id_detalle = $1 RETURNING *`;
        const response = await pool.query(query, [id]);
        if (response.rows.length === 0)
            return res.status(404).json({ msg: 'Detalle no encontrado' });
        res.json({ msg: 'Detalle eliminado', detalle: response.rows[0] });
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
        const query = `SELECT * FROM Pagos ORDER BY id_pago ASC`;
        const response = await pool.query(query);
        res.json(response.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al listar pagos' });
    }
};

const getPagoById = async (req, res) => {
    const { id } = req.params;
    try {
        const query = `SELECT * FROM Pagos WHERE id_pago = $1`;
        const response = await pool.query(query, [id]);
        if (response.rows.length === 0)
            return res.status(404).json({ msg: 'Pago no encontrado' });
        res.json(response.rows[0]);
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

        const query = `
            INSERT INTO Pagos (id_reserva, monto, fecha_pago, metodo)
            VALUES ($1, $2, $3, $4) RETURNING *
        `;
        const response = await pool.query(query, [id_reserva, monto, fecha_pago, metodo]);
        res.status(201).json({ msg: 'Pago registrado con éxito', pago: response.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el pago' });
    }
};

const actualizarPago = async (req, res) => {
    const { id } = req.params;
    const { id_reserva, monto, fecha_pago, metodo } = req.body;
    try {
        const query = `
            UPDATE Pagos
            SET id_reserva = $1, monto = $2, fecha_pago = $3, metodo = $4
            WHERE id_pago = $5 RETURNING *
        `;
        const response = await pool.query(query, [id_reserva, monto, fecha_pago, metodo, id]);
        if (response.rows.length === 0)
            return res.status(404).json({ msg: 'Pago no encontrado' });
        res.json({ msg: 'Pago actualizado', pago: response.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el pago' });
    }
};

const eliminarPago = async (req, res) => {
    const { id } = req.params;
    try {
        const query = `DELETE FROM Pagos WHERE id_pago = $1 RETURNING *`;
        const response = await pool.query(query, [id]);
        if (response.rows.length === 0)
            return res.status(404).json({ msg: 'Pago no encontrado' });
        res.json({ msg: 'Pago eliminado', pago: response.rows[0] });
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
        const query = `SELECT * FROM Servicios ORDER BY id_servicio ASC`;
        const response = await pool.query(query);
        res.json(response.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al listar servicios' });
    }
};

const getServicioById = async (req, res) => {
    const { id } = req.params;
    try {
        const query = `SELECT * FROM Servicios WHERE id_servicio = $1`;
        const response = await pool.query(query, [id]);
        if (response.rows.length === 0)
            return res.status(404).json({ msg: 'Servicio no encontrado' });
        res.json(response.rows[0]);
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

        const query = `
            INSERT INTO Servicios (nombre, precio, id_reserva)
            VALUES ($1, $2, $3) RETURNING *
        `;
        const response = await pool.query(query, [nombre, precio, id_reserva]);
        res.status(201).json({ msg: 'Servicio creado con éxito', servicio: response.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el servicio' });
    }
};

const actualizarServicio = async (req, res) => {
    const { id } = req.params;
    const { nombre, precio, id_reserva } = req.body;
    try {
        const query = `
            UPDATE Servicios
            SET nombre = $1, precio = $2, id_reserva = $3
            WHERE id_servicio = $4 RETURNING *
        `;
        const response = await pool.query(query, [nombre, precio, id_reserva, id]);
        if (response.rows.length === 0)
            return res.status(404).json({ msg: 'Servicio no encontrado' });
        res.json({ msg: 'Servicio actualizado', servicio: response.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el servicio' });
    }
};

const eliminarServicio = async (req, res) => {
    const { id } = req.params;
    try {
        const query = `DELETE FROM Servicios WHERE id_servicio = $1 RETURNING *`;
        const response = await pool.query(query, [id]);
        if (response.rows.length === 0)
            return res.status(404).json({ msg: 'Servicio no encontrado' });
        res.json({ msg: 'Servicio eliminado', servicio: response.rows[0] });
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