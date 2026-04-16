-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
--              UNIVERSIDAD POLITÉCNICA DE QUERÉTARO
--   INGENIERÍA EN TECNOLOGÍAS DE LA INFORMACIÓN E INNOVACIÓN DIGITAL
--                     BASE DE DATOS AVANZADAS
--                       PROYECTO FINAL
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
--  Base de datos: hotel
--  Gestión de clientes, habitaciones, reservas, pagos y servicios
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
--                      IMPLEMENTACIÓN (TABLAS E INSERTS)
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

DROP DATABASE IF EXISTS hotel;
CREATE DATABASE hotel;
USE hotel;

CREATE TABLE Clientes (
    id_cliente   INT          AUTO_INCREMENT PRIMARY KEY,
    nombre       VARCHAR(100) NOT NULL,
    email        VARCHAR(100) UNIQUE,
    telefono     VARCHAR(15)  UNIQUE,
    tipo_cliente VARCHAR(20)  NOT NULL DEFAULT 'Normal'
                 CHECK (tipo_cliente IN ('Normal','Frecuente','VIP'))
);

CREATE TABLE Habitaciones (
    id_habitacion INT           AUTO_INCREMENT PRIMARY KEY,
    tipo          VARCHAR(20)   NOT NULL
                  CHECK (tipo IN ('Individual','Doble','Suite')),
    precio        DECIMAL(10,2) NOT NULL CHECK (precio > 0),
    capacidad     INT           NOT NULL CHECK (capacidad > 0),
    estado        VARCHAR(20)   NOT NULL DEFAULT 'Disponible'
                  CHECK (estado IN ('Disponible','Ocupada','Mantenimiento'))
);

CREATE TABLE Reservas (
    id_reserva   INT  AUTO_INCREMENT PRIMARY KEY,
    id_cliente   INT  NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin    DATE NOT NULL,
    num_personas INT  NOT NULL CHECK (num_personas > 0),
    estado       VARCHAR(20) NOT NULL DEFAULT 'Activa'
                 CHECK (estado IN ('Activa','Finalizada','Cancelada')),
    CONSTRAINT chk_fechas CHECK (fecha_fin > fecha_inicio),
    FOREIGN KEY (id_cliente) REFERENCES Clientes(id_cliente)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE Detalle_Reservas (
    id_detalle    INT AUTO_INCREMENT PRIMARY KEY,
    id_reserva    INT NOT NULL,
    id_habitacion INT NOT NULL,
    FOREIGN KEY (id_reserva)    REFERENCES Reservas(id_reserva)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_habitacion) REFERENCES Habitaciones(id_habitacion)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE Pagos (
    id_pago    INT           AUTO_INCREMENT PRIMARY KEY,
    id_reserva INT           NOT NULL,
    monto      DECIMAL(10,2) NOT NULL CHECK (monto > 0),
    fecha_pago DATE          NOT NULL,
    metodo     VARCHAR(20)   NOT NULL
               CHECK (metodo IN ('Efectivo','Tarjeta','Transferencia')),
    FOREIGN KEY (id_reserva) REFERENCES Reservas(id_reserva)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE Servicios (
    id_servicio INT           AUTO_INCREMENT PRIMARY KEY,
    nombre      VARCHAR(50)   NOT NULL,
    precio      DECIMAL(10,2) NOT NULL CHECK (precio > 0),
    id_reserva  INT           NOT NULL,
    FOREIGN KEY (id_reserva) REFERENCES Reservas(id_reserva)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- Inserts Clientes
INSERT INTO Clientes (nombre, email, telefono, tipo_cliente) VALUES
('Juan Perez',      'juan1@gmail.com',       '4421111111', 'Frecuente'),
('Ana Lopez',       'ana2@gmail.com',         '4422222222', 'Normal'),
('Carlos Ramirez',  'carlos3@gmail.com',      '4423333333', 'VIP'),
('Maria Gonzalez',  'maria4@gmail.com',       '4424444444', 'Normal'),
('Luis Hernandez',  'luis5@gmail.com',        '4425555555', 'Frecuente'),
('Sofia Martinez',  'sofia6@gmail.com',       '4426666666', 'VIP'),
('Pedro Sanchez',   'pedro7@gmail.com',       '4427777777', 'Normal'),
('Laura Torres',    'laura8@gmail.com',       '4428888888', 'Frecuente'),
('Diego Flores',    'diego9@gmail.com',       '4429999999', 'Normal'),
('Fernanda Cruz',   'fernanda10@gmail.com',   '4421010101', 'VIP'),
('Jorge Morales',   'jorge11@gmail.com',      '4421212121', 'Frecuente'),
('Paola Ortiz',     'paola12@gmail.com',      '4421313131', 'Normal'),
('Ricardo Vega',    'ricardo13@gmail.com',    '4421414141', 'VIP'),
('Daniela Rojas',   'daniela14@gmail.com',    '4421515151', 'Normal'),
('Hugo Castro',     'hugo15@gmail.com',       '4421616161', 'Frecuente'),
('Andrea Navarro',  'andrea16@gmail.com',     '4421717171', 'VIP'),
('Miguel Silva',    'miguel17@gmail.com',     '4421818181', 'Normal'),
('Valeria Mendoza', 'valeria18@gmail.com',    '4421919191', 'Frecuente'),
('Oscar Pineda',    'oscar19@gmail.com',      '4422020202', 'VIP'),
('Gabriela Reyes',  'gabriela20@gmail.com',   '4422121212', 'Normal');

-- Inserts Habitaciones
INSERT INTO Habitaciones (tipo, precio, capacidad, estado) VALUES
('Individual', 500.00, 1, 'Disponible'),
('Doble',      800.00, 2, 'Disponible'),
('Suite',     1500.00, 4, 'Disponible'),
('Individual', 520.00, 1, 'Ocupada'),
('Doble',      850.00, 2, 'Disponible'),
('Suite',     1600.00, 4, 'Mantenimiento'),
('Individual', 480.00, 1, 'Disponible'),
('Doble',      780.00, 2, 'Ocupada'),
('Suite',     1550.00, 4, 'Disponible'),
('Individual', 510.00, 1, 'Disponible'),
('Doble',      820.00, 2, 'Disponible'),
('Suite',     1700.00, 5, 'Disponible'),
('Individual', 530.00, 1, 'Ocupada'),
('Doble',      790.00, 2, 'Disponible'),
('Suite',     1650.00, 4, 'Disponible'),
('Individual', 495.00, 1, 'Disponible'),
('Doble',      810.00, 2, 'Mantenimiento'),
('Suite',     1800.00, 5, 'Disponible'),
('Individual', 505.00, 1, 'Disponible'),
('Doble',      830.00, 2, 'Disponible');

-- Inserts Reservas
INSERT INTO Reservas (id_cliente, fecha_inicio, fecha_fin, num_personas, estado) VALUES
(1,  '2025-03-01', '2025-03-05', 1, 'Activa'),
(2,  '2025-03-02', '2025-03-06', 2, 'Activa'),
(3,  '2025-03-03', '2025-03-07', 3, 'Finalizada'),
(4,  '2025-03-04', '2025-03-08', 1, 'Activa'),
(5,  '2025-03-05', '2025-03-09', 2, 'Cancelada'),
(6,  '2025-03-06', '2025-03-10', 4, 'Activa'),
(7,  '2025-03-07', '2025-03-11', 1, 'Finalizada'),
(8,  '2025-03-08', '2025-03-12', 2, 'Activa'),
(9,  '2025-03-09', '2025-03-13', 4, 'Activa'),
(10, '2025-03-10', '2025-03-14', 1, 'Finalizada'),
(11, '2025-03-11', '2025-03-15', 2, 'Activa'),
(12, '2025-03-12', '2025-03-16', 5, 'Activa'),
(13, '2025-03-13', '2025-03-17', 1, 'Finalizada'),
(14, '2025-03-14', '2025-03-18', 2, 'Activa'),
(15, '2025-03-15', '2025-03-19', 4, 'Cancelada'),
(16, '2025-03-16', '2025-03-20', 1, 'Activa'),
(17, '2025-03-17', '2025-03-21', 2, 'Finalizada'),
(18, '2025-03-18', '2025-03-22', 5, 'Activa'),
(19, '2025-03-19', '2025-03-23', 1, 'Activa'),
(20, '2025-03-20', '2025-03-24', 2, 'Finalizada');

-- Inserts Detalle_Reservas
INSERT INTO Detalle_Reservas (id_reserva, id_habitacion) VALUES
(1,1),(2,2),(3,3),(4,4),(5,5),
(6,6),(7,7),(8,8),(9,9),(10,10),
(11,11),(12,12),(13,13),(14,14),(15,15),
(16,16),(17,17),(18,18),(19,19),(20,20);

-- Inserts Pagos
INSERT INTO Pagos (id_reserva, monto, fecha_pago, metodo) VALUES
(1,  2000.00, '2025-03-01', 'Efectivo'),
(2,  3200.00, '2025-03-02', 'Tarjeta'),
(3,  4500.00, '2025-03-03', 'Transferencia'),
(4,  2800.00, '2025-03-04', 'Efectivo'),
(5,  1500.00, '2025-03-05', 'Tarjeta'),
(6,  3600.00, '2025-03-06', 'Transferencia'),
(7,  4000.00, '2025-03-07', 'Efectivo'),
(8,  3100.00, '2025-03-08', 'Tarjeta'),
(9,  2900.00, '2025-03-09', 'Transferencia'),
(10, 5000.00, '2025-03-10', 'Efectivo'),
(11, 2700.00, '2025-03-11', 'Tarjeta'),
(12, 3300.00, '2025-03-12', 'Transferencia'),
(13, 4100.00, '2025-03-13', 'Efectivo'),
(14, 2600.00, '2025-03-14', 'Tarjeta'),
(15, 1800.00, '2025-03-15', 'Transferencia'),
(16, 3500.00, '2025-03-16', 'Efectivo'),
(17, 4200.00, '2025-03-17', 'Tarjeta'),
(18, 3000.00, '2025-03-18', 'Transferencia'),
(19, 2800.00, '2025-03-19', 'Efectivo'),
(20, 4600.00, '2025-03-20', 'Tarjeta');

-- Inserts Servicios
INSERT INTO Servicios (nombre, precio, id_reserva) VALUES
('Spa',          500.00, 1),  ('Room Service', 300.00, 2),
('Desayuno',     150.00, 3),  ('Lavanderia',   200.00, 4),
('Transporte',   400.00, 5),  ('Cena',         350.00, 6),
('Gimnasio',     100.00, 7),  ('Bar',          250.00, 8),
('Tour',         600.00, 9),  ('Spa',          500.00, 10),
('Room Service', 300.00, 11), ('Desayuno',     150.00, 12),
('Lavanderia',   200.00, 13), ('Transporte',   400.00, 14),
('Cena',         350.00, 15), ('Gimnasio',     100.00, 16),
('Bar',          250.00, 17), ('Tour',         600.00, 18),
('Spa',          500.00, 19), ('Room Service', 300.00, 20);


-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
--                         CONSULTAS AVANZADAS
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-- 1. Reservas con costo
SELECT
    r.id_reserva,
    c.nombre AS cliente,
    h.tipo AS tipo_habitacion,
    DATEDIFF(r.fecha_fin, r.fecha_inicio) AS noches,
    h.precio,
    (DATEDIFF(r.fecha_fin, r.fecha_inicio) * h.precio) AS costo_total
FROM Reservas r
JOIN Clientes c          ON r.id_cliente      = c.id_cliente
JOIN Detalle_Reservas dr ON r.id_reserva      = dr.id_reserva
JOIN Habitaciones h      ON dr.id_habitacion  = h.id_habitacion;

-- 2. Clientes clasificados
SELECT
    tipo_cliente,
    COUNT(*) AS total_clientes
FROM Clientes
GROUP BY tipo_cliente;

-- 3. Clientes con pago mayor al promedio
--    a) Subconsulta
SELECT
    c.nombre,
    p.monto
FROM Pagos p
JOIN Reservas r ON p.id_reserva = r.id_reserva
JOIN Clientes c ON r.id_cliente = c.id_cliente
WHERE p.monto > (SELECT AVG(monto) FROM Pagos);

-- 4. Ingresos por periodo
SELECT
    fecha_pago,
    SUM(monto) AS ingresos
FROM Pagos
GROUP BY fecha_pago
ORDER BY fecha_pago;

-- 5. Mostrar reservas activas con cliente y habitación
--    a) JOIN
SELECT
    r.id_reserva,
    c.nombre,
    r.fecha_inicio,
    r.fecha_fin,
    r.estado
FROM Reservas r
JOIN Clientes c ON r.id_cliente = c.id_cliente
WHERE r.estado = 'Activa';

-- 6. Calcular ingresos totales por periodo
SELECT
    MONTH(fecha_pago) AS mes,
    SUM(monto) AS ingresos_totales
FROM Pagos
GROUP BY MONTH(fecha_pago)
ORDER BY mes;

-- 7. Mostrar clientes con más reservas que el promedio
--    a) Subconsulta
SELECT
    c.nombre,
    COUNT(r.id_reserva) AS total_reservas
FROM Clientes c
JOIN Reservas r ON c.id_cliente = r.id_cliente
GROUP BY c.id_cliente
HAVING COUNT(r.id_reserva) > (
    SELECT AVG(total)
    FROM (
        SELECT COUNT(*) AS total
        FROM Reservas
        GROUP BY id_cliente
    ) AS sub
);

-- 8. Mostrar ocupación de habitaciones por fecha
SELECT
    h.id_habitacion,
    h.tipo,
    r.fecha_inicio,
    r.fecha_fin,
    r.estado
FROM Habitaciones h
JOIN Detalle_Reservas dr ON h.id_habitacion = dr.id_habitacion
JOIN Reservas r           ON dr.id_reserva  = r.id_reserva
WHERE r.estado = 'Activa';


-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
--                          VISTAS E ÍNDICES
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-- Función: Costo de estancia
DELIMITER $$
CREATE FUNCTION fn_costo_estancia(p_id_reserva INT)
RETURNS DECIMAL(10,2)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_costo DECIMAL(10,2);
    SELECT DATEDIFF(r.fecha_fin, r.fecha_inicio) * h.precio
    INTO v_costo
    FROM Reservas r
    JOIN Detalle_Reservas dr ON r.id_reserva     = dr.id_reserva
    JOIN Habitaciones h      ON dr.id_habitacion = h.id_habitacion
    WHERE r.id_reserva = p_id_reserva
    LIMIT 1;
    RETURN v_costo;
END $$
DELIMITER ;

-- Función: Total reservas cliente
DELIMITER $$
CREATE FUNCTION fn_total_reservas_cliente(p_id_cliente INT)
RETURNS INT
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_total INT;
    SELECT COUNT(*) INTO v_total
    FROM Reservas
    WHERE id_cliente = p_id_cliente;
    RETURN v_total;
END $$
DELIMITER ;

-- Vista: reservas
CREATE VIEW v_reservas AS
SELECT
    r.id_reserva,
    c.nombre                              AS cliente,
    c.tipo_cliente,
    h.tipo                                AS tipo_habitacion,
    h.precio                              AS precio_por_noche,
    r.fecha_inicio,
    r.fecha_fin,
    DATEDIFF(r.fecha_fin, r.fecha_inicio) AS noches,
    fn_costo_estancia(r.id_reserva)       AS costo_hospedaje,
    r.estado                              AS estado_reserva
FROM Reservas r
JOIN Clientes         c  ON r.id_cliente     = c.id_cliente
JOIN Detalle_Reservas dr ON r.id_reserva     = dr.id_reserva
JOIN Habitaciones     h  ON dr.id_habitacion = h.id_habitacion;

-- Vista: historial_clientes
CREATE VIEW v_historial_clientes AS
SELECT
    c.id_cliente,
    c.nombre,
    c.tipo_cliente,
    fn_total_reservas_cliente(c.id_cliente)      AS total_reservas,
    SUM(fn_costo_estancia(r.id_reserva))         AS gasto_hospedaje,
    COALESCE(SUM(s.precio), 0)                   AS gasto_servicios,
    SUM(fn_costo_estancia(r.id_reserva))
        + COALESCE(SUM(s.precio), 0)             AS gasto_total
FROM Clientes c
JOIN Reservas r       ON c.id_cliente = r.id_cliente
LEFT JOIN Servicios s ON r.id_reserva = s.id_reserva
GROUP BY c.id_cliente, c.nombre, c.tipo_cliente;

-- Índice: acelera búsquedas de reservas por cliente
CREATE INDEX idx_reservas_cliente   ON Reservas(id_cliente);

-- Índice: acelera verificación de traslapes y consultas de ocupación
CREATE INDEX idx_detalle_habitacion ON Detalle_Reservas(id_habitacion);


-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
--                      TRIGGERS Y TRANSACCIONES
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-- Trigger: Evitar traslapes de fechas
DELIMITER $$
CREATE TRIGGER trg_no_traslape
BEFORE INSERT ON Detalle_Reservas
FOR EACH ROW
BEGIN
    DECLARE v_count INT;
    SELECT COUNT(*)
    INTO v_count
    FROM Detalle_Reservas dr
    JOIN Reservas r_existente ON dr.id_reserva  = r_existente.id_reserva
    JOIN Reservas r_nueva     ON r_nueva.id_reserva = NEW.id_reserva
    WHERE dr.id_habitacion     = NEW.id_habitacion
      AND r_nueva.fecha_inicio < r_existente.fecha_fin
      AND r_nueva.fecha_fin    > r_existente.fecha_inicio;

    IF v_count > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: Traslape de fechas en la misma habitación';
    END IF;
END $$
DELIMITER ;

-- Trigger: Evitar sobreocupación
DELIMITER $$
CREATE TRIGGER trg_no_sobreocupacion
BEFORE INSERT ON Detalle_Reservas
FOR EACH ROW
BEGIN
    DECLARE v_capacidad INT;
    DECLARE v_personas  INT;

    SELECT capacidad    INTO v_capacidad FROM Habitaciones WHERE id_habitacion = NEW.id_habitacion;
    SELECT num_personas INTO v_personas  FROM Reservas     WHERE id_reserva    = NEW.id_reserva;

    IF v_personas > v_capacidad THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: Excede la capacidad de la habitación';
    END IF;
END $$
DELIMITER ;

-- Procedimiento: Consultar disponibilidad
DELIMITER $$
CREATE PROCEDURE consultar_disponibilidad(
    IN p_fecha_inicio DATE,
    IN p_fecha_fin    DATE,
    IN p_num_personas INT
)
BEGIN
    IF p_fecha_inicio >= p_fecha_fin THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'La fecha de inicio debe ser antes de la de fin';
    END IF;

    SELECT h.id_habitacion, h.tipo, h.precio, h.capacidad, h.estado
    FROM Habitaciones h
    WHERE h.estado != 'Mantenimiento'
      AND (p_num_personas IS NULL OR h.capacidad >= p_num_personas)
      AND NOT EXISTS (
          SELECT 1
          FROM Detalle_Reservas dr
          JOIN Reservas r ON dr.id_reserva = r.id_reserva
          WHERE dr.id_habitacion = h.id_habitacion
            AND r.estado         = 'Activa'
            AND r.fecha_inicio   < p_fecha_fin
            AND r.fecha_fin      > p_fecha_inicio
      )
    ORDER BY h.precio;
END $$
DELIMITER ;

-- Procedimiento: Registrar reserva
--   Transacción: Registro completo
--     · INSERT reserva
--     · INSERT detalle
--     · INSERT pago
--     · COMMIT / ROLLBACK
DELIMITER $$
CREATE PROCEDURE registrar_reserva(
    IN p_id_cliente    INT,
    IN p_fecha_inicio  DATE,
    IN p_fecha_fin     DATE,
    IN p_num_personas  INT,
    IN p_id_habitacion INT,
    IN p_monto_pago    DECIMAL(10,2),
    IN p_metodo_pago   VARCHAR(20)
)
BEGIN
    DECLARE v_capacidad INT;
    DECLARE v_estado    VARCHAR(20);
    DECLARE v_ocupada   INT;
    DECLARE v_id_reserva INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    SELECT capacidad, estado
    INTO v_capacidad, v_estado
    FROM Habitaciones
    WHERE id_habitacion = p_id_habitacion
    FOR UPDATE;

    IF v_capacidad IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La habitación no existe';
    END IF;
    IF v_estado = 'Mantenimiento' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La habitación está en mantenimiento';
    END IF;
    IF p_num_personas > v_capacidad THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La habitación no tiene capacidad para el número de personas indicado';
    END IF;

    SELECT COUNT(*) INTO v_ocupada
    FROM Detalle_Reservas dr
    JOIN Reservas r ON dr.id_reserva = r.id_reserva
    WHERE dr.id_habitacion = p_id_habitacion
      AND r.estado IN ('Activa', 'Finalizada')
      AND r.fecha_inicio   < p_fecha_fin
      AND r.fecha_fin      > p_fecha_inicio;

    IF v_ocupada > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La habitación ya está reservada en ese período';
    END IF;

    INSERT INTO Reservas (id_cliente, fecha_inicio, fecha_fin, num_personas, estado)
    VALUES (p_id_cliente, p_fecha_inicio, p_fecha_fin, p_num_personas, 'Activa');
    SET v_id_reserva = LAST_INSERT_ID();

    INSERT INTO Detalle_Reservas (id_reserva, id_habitacion)
    VALUES (v_id_reserva, p_id_habitacion);

    INSERT INTO Pagos (id_reserva, monto, fecha_pago, metodo)
    VALUES (v_id_reserva, p_monto_pago, CURDATE(), p_metodo_pago);

    COMMIT;
    SELECT 'Reserva registrada exitosamente' AS mensaje, v_id_reserva AS id_reserva_generado;
END $$
DELIMITER ;

-- Prueba: habitaciones disponibles del 10 al 15 de marzo para 2 personas
CALL consultar_disponibilidad('2025-03-10', '2025-03-15', 2);

-- Prueba: registrar reserva para Ana López, habitación 2, del 20 al 25 de marzo
CALL registrar_reserva(2, '2025-03-20', '2025-03-25', 2, 2, 4000.00, 'Tarjeta');


-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
--                    SEGURIDAD (USUARIOS Y PERMISOS)
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-- Crear usuarios del sistema
CREATE USER 'admin'@'localhost'         IDENTIFIED BY 'a';
CREATE USER 'recepcionista'@'localhost' IDENTIFIED BY 'r';
CREATE USER 'cliente'@'localhost'       IDENTIFIED BY 'c';

-- admin: acceso total a la base de datos
GRANT ALL PRIVILEGES ON hotel.* TO 'admin'@'localhost';

-- recepcionista: puede consultar, insertar y actualizar — registrar reservas
GRANT SELECT, INSERT, UPDATE ON hotel.* TO 'recepcionista'@'localhost';

-- cliente: solo lectura — consultar vistas y tablas
GRANT SELECT ON hotel.* TO 'cliente'@'localhost';

FLUSH PRIVILEGES;