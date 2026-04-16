-- =============================================================================
--              UNIVERSIDAD POLITÉCNICA DE QUERÉTARO
--   INGENIERÍA EN TECNOLOGÍAS DE LA INFORMACIÓN E INNOVACIÓN DIGITAL
--                     BASE DE DATOS AVANZADAS
--                         PROYECTO FINAL
-- =============================================================================
--  Base de datos : hotel
--  Descripción   : Sistema de gestión hotelera que administra clientes,
--                  habitaciones, reservas, pagos y servicios adicionales.
--                  Incluye control de integridad referencial, validación de
--                  disponibilidad, lógica de negocio encapsulada en funciones
--                  y procedimientos almacenados, y un modelo de seguridad
--                  basado en roles de usuario.
-- =============================================================================


-- =============================================================================
--                      IMPLEMENTACIÓN (TABLAS E INSERTS)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Eliminación y creación de la base de datos
-- Se elimina primero para garantizar un entorno limpio en cada ejecución
-- del script, evitando conflictos con versiones previas del esquema.
-- -----------------------------------------------------------------------------
DROP DATABASE IF EXISTS hotel;
CREATE DATABASE hotel;
USE hotel;

-- -----------------------------------------------------------------------------
-- TABLA: Clientes
-- Almacena la información de cada huésped registrado en el sistema.
-- El campo tipo_cliente permite diferenciar el nivel de fidelidad del cliente
-- (Normal, Frecuente, VIP), lo que puede usarse para aplicar tarifas o
-- beneficios diferenciados. La restricción CHECK garantiza que solo se
-- acepten los valores del dominio definido por el negocio.
-- Los campos email y teléfono son únicos para evitar registros duplicados
-- de un mismo cliente con datos de contacto distintos.
-- -----------------------------------------------------------------------------
CREATE TABLE Clientes (
    id_cliente   INT          AUTO_INCREMENT PRIMARY KEY,
    nombre       VARCHAR(100) NOT NULL,
    email        VARCHAR(100) UNIQUE,
    telefono     VARCHAR(15)  UNIQUE,
    tipo_cliente VARCHAR(20)  NOT NULL DEFAULT 'Normal'
                 CHECK (tipo_cliente IN ('Normal','Frecuente','VIP'))
);

-- -----------------------------------------------------------------------------
-- TABLA: Habitaciones
-- Registra cada habitación física del hotel con sus características de
-- capacidad, precio por noche y estado operativo actual.
-- El campo tipo clasifica las habitaciones en tres categorías comerciales
-- (Individual, Doble, Suite), mientras que el campo estado refleja si la
-- habitación puede recibir reservas (Disponible), ya está ocupada (Ocupada)
-- o se encuentra fuera de servicio temporalmente (Mantenimiento).
-- Los CHECK en precio y capacidad aseguran que no se inserten valores
-- lógicamente inválidos (cero o negativos).
-- -----------------------------------------------------------------------------
CREATE TABLE Habitaciones (
    id_habitacion INT           AUTO_INCREMENT PRIMARY KEY,
    tipo          VARCHAR(20)   NOT NULL
                  CHECK (tipo IN ('Individual','Doble','Suite')),
    precio        DECIMAL(10,2) NOT NULL CHECK (precio > 0),
    capacidad     INT           NOT NULL CHECK (capacidad > 0),
    estado        VARCHAR(20)   NOT NULL DEFAULT 'Disponible'
                  CHECK (estado IN ('Disponible','Ocupada','Mantenimiento'))
);

-- -----------------------------------------------------------------------------
-- TABLA: Reservas
-- Núcleo del sistema; vincula un cliente con un período de estancia.
-- Cada reserva define las fechas de inicio y fin, el número de personas
-- y su estado en el ciclo de vida (Activa, Finalizada, Cancelada).
-- La restricción chk_fechas impone que la fecha de salida sea siempre
-- posterior a la de llegada, evitando reservas ilógicas.
-- La llave foránea hacia Clientes usa ON DELETE RESTRICT para impedir
-- eliminar un cliente que aún tenga reservas asociadas, protegiendo la
-- integridad histórica del negocio.
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- TABLA: Detalle_Reservas
-- Tabla de relación muchos-a-muchos entre Reservas y Habitaciones.
-- Permite que una reserva pueda incluir más de una habitación (p. ej.,
-- grupo familiar) y que el historial de ocupación de cada habitación
-- quede registrado de forma independiente.
-- ON DELETE CASCADE en id_reserva garantiza que al eliminar una reserva
-- se eliminen automáticamente sus registros de detalle, evitando huérfanos.
-- ON DELETE RESTRICT en id_habitacion impide eliminar una habitación que
-- tiene historial de ocupación, preservando la trazabilidad.
-- -----------------------------------------------------------------------------
CREATE TABLE Detalle_Reservas (
    id_detalle    INT AUTO_INCREMENT PRIMARY KEY,
    id_reserva    INT NOT NULL,
    id_habitacion INT NOT NULL,
    FOREIGN KEY (id_reserva)    REFERENCES Reservas(id_reserva)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_habitacion) REFERENCES Habitaciones(id_habitacion)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- -----------------------------------------------------------------------------
-- TABLA: Pagos
-- Registra los pagos realizados por cada reserva.
-- Una reserva puede tener múltiples pagos (pagos parciales, señas, etc.).
-- El campo metodo restringe los medios de pago aceptados (Efectivo,
-- Tarjeta, Transferencia) para asegurar consistencia en los reportes.
-- ON DELETE RESTRICT impide eliminar una reserva que ya tiene pagos
-- registrados, protegiendo la integridad contable del sistema.
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- TABLA: Servicios
-- Almacena los servicios adicionales contratados dentro de una reserva
-- (spa, room service, transporte, etc.).
-- La relación directa con Reservas permite calcular el gasto total
-- de un huésped sumando el costo de la habitación más los servicios.
-- ON DELETE CASCADE elimina los servicios si la reserva asociada
-- es eliminada, manteniendo la consistencia del esquema.
-- -----------------------------------------------------------------------------
CREATE TABLE Servicios (
    id_servicio INT           AUTO_INCREMENT PRIMARY KEY,
    nombre      VARCHAR(50)   NOT NULL,
    precio      DECIMAL(10,2) NOT NULL CHECK (precio > 0),
    id_reserva  INT           NOT NULL,
    FOREIGN KEY (id_reserva) REFERENCES Reservas(id_reserva)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- -----------------------------------------------------------------------------
-- DATOS INICIALES: Clientes
-- Se insertan 20 clientes de prueba distribuidos entre los tres tipos
-- (Normal, Frecuente, VIP) para representar una base de huéspedes diversa.
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- DATOS INICIALES: Habitaciones
-- Se insertan 20 habitaciones distribuidas entre los tres tipos (Individual,
-- Doble, Suite) con distintos precios y estados. Algunas se dejan en estado
-- Ocupada y Mantenimiento para representar condiciones reales de operación
-- al momento de las pruebas.
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- DATOS INICIALES: Reservas
-- 20 reservas distribuidas a lo largo del mes de marzo de 2025.
-- Los estados varían (Activa, Finalizada, Cancelada) para permitir
-- pruebas de las consultas de filtrado y agregación.
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- DATOS INICIALES: Detalle_Reservas
-- Cada reserva se asigna a una habitación distinta para crear un escenario
-- de ocupación completo que permita probar los triggers de traslape y
-- sobreocupación, así como el procedimiento de consulta de disponibilidad.
-- -----------------------------------------------------------------------------
INSERT INTO Detalle_Reservas (id_reserva, id_habitacion) VALUES
(1,1),(2,2),(3,3),(4,4),(5,5),
(6,6),(7,7),(8,8),(9,9),(10,10),
(11,11),(12,12),(13,13),(14,14),(15,15),
(16,16),(17,17),(18,18),(19,19),(20,20);

-- -----------------------------------------------------------------------------
-- DATOS INICIALES: Pagos
-- Un pago por reserva que cubre la estancia completa. Los montos varían
-- para producir datos heterogéneos útiles en las consultas de ingresos
-- y en la subconsulta de clientes con pago superior al promedio.
-- Los tres métodos de pago (Efectivo, Tarjeta, Transferencia) están
-- representados para validar los reportes por método de cobro.
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- DATOS INICIALES: Servicios
-- Un servicio por reserva para representar consumos adicionales durante
-- la estancia. La variedad de nombres (Spa, Room Service, Desayuno, etc.)
-- permite consultas de gasto por tipo de servicio y por cliente.
-- -----------------------------------------------------------------------------
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


-- =============================================================================
--                          CONSULTAS AVANZADAS
-- =============================================================================

-- -----------------------------------------------------------------------------
-- CONSULTA 1: Reservas con costo total calculado
-- Propósito : Obtener para cada reserva el cliente, el tipo de habitación,
--             el número de noches y el costo total de la estancia.
-- Técnica   : JOIN entre cuatro tablas. El costo se calcula multiplicando
--             la diferencia de días (DATEDIFF) por el precio por noche.
-- Utilidad  : Sirve como base para facturación y auditoría de cargos.
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- CONSULTA 2: Clientes clasificados por tipo
-- Propósito : Contar cuántos clientes pertenecen a cada categoría de fidelidad.
-- Técnica   : GROUP BY sobre el campo tipo_cliente con COUNT agregado.
-- Utilidad  : Permite visualizar la distribución del perfil de la clientela
--             para tomar decisiones de marketing o programas de lealtad.
-- -----------------------------------------------------------------------------
SELECT
    tipo_cliente,
    COUNT(*) AS total_clientes
FROM Clientes
GROUP BY tipo_cliente;

-- -----------------------------------------------------------------------------
-- CONSULTA 3: Clientes con pago superior al promedio general
-- Propósito : Identificar a los clientes cuyo pago individual supera
--             el promedio de todos los pagos registrados en el sistema.
-- Técnica   : Subconsulta escalar en la cláusula WHERE para calcular AVG(monto)
--             y usarlo como umbral de comparación dinámica.
-- Utilidad  : Detecta clientes de alto valor económico para el hotel;
--             útil para acciones de fidelización o upgrades de servicio.
-- -----------------------------------------------------------------------------
SELECT
    c.nombre,
    p.monto
FROM Pagos p
JOIN Reservas r ON p.id_reserva = r.id_reserva
JOIN Clientes c ON r.id_cliente = c.id_cliente
WHERE p.monto > (SELECT AVG(monto) FROM Pagos);

-- -----------------------------------------------------------------------------
-- CONSULTA 4: Ingresos diarios por fecha de pago
-- Propósito : Sumar los ingresos totales agrupados por cada fecha de cobro.
-- Técnica   : SUM con GROUP BY sobre fecha_pago, ordenado cronológicamente.
-- Utilidad  : Permite generar reportes de flujo de caja diario para
--             contabilidad y análisis de temporadas de mayor afluencia.
-- -----------------------------------------------------------------------------
SELECT
    fecha_pago,
    SUM(monto) AS ingresos
FROM Pagos
GROUP BY fecha_pago
ORDER BY fecha_pago;

-- -----------------------------------------------------------------------------
-- CONSULTA 5: Reservas activas con datos del cliente
-- Propósito : Listar únicamente las reservas en estado Activa junto con
--             el nombre del cliente y las fechas correspondientes.
-- Técnica   : JOIN con filtro WHERE sobre el estado de la reserva.
-- Utilidad  : Empleada en la recepción del hotel para gestionar las
--             llegadas y salidas del día o de la semana en curso.
-- -----------------------------------------------------------------------------
SELECT
    r.id_reserva,
    c.nombre,
    r.fecha_inicio,
    r.fecha_fin,
    r.estado
FROM Reservas r
JOIN Clientes c ON r.id_cliente = c.id_cliente
WHERE r.estado = 'Activa';

-- -----------------------------------------------------------------------------
-- CONSULTA 6: Ingresos totales por mes
-- Propósito : Calcular los ingresos acumulados agrupados por mes del año.
-- Técnica   : Función MONTH() para extraer el mes numérico de fecha_pago,
--             luego SUM y GROUP BY sobre ese valor.
-- Utilidad  : Facilita análisis de estacionalidad y comparativas mensuales
--             de rentabilidad para la dirección financiera del hotel.
-- -----------------------------------------------------------------------------
SELECT
    MONTH(fecha_pago) AS mes,
    SUM(monto) AS ingresos_totales
FROM Pagos
GROUP BY MONTH(fecha_pago)
ORDER BY mes;

-- -----------------------------------------------------------------------------
-- CONSULTA 7: Clientes con más reservas que el promedio
-- Propósito : Identificar a los clientes que reservan con mayor frecuencia
--             que la media del conjunto total de clientes.
-- Técnica   : Subconsulta en la cláusula HAVING; se calcula el promedio
--             de reservas por cliente mediante una subconsulta derivada
--             (FROM subconsulta), y se usa como umbral de comparación.
-- Utilidad  : Detecta clientes frecuentes que podrían ser candidatos para
--             el programa de fidelización o tarifas preferenciales.
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- CONSULTA 8: Ocupación de habitaciones en reservas activas
-- Propósito : Mostrar qué habitaciones están actualmente asociadas a una
--             reserva vigente, indicando el período de ocupación.
-- Técnica   : JOIN de tres tablas filtrando por estado = 'Activa'.
-- Utilidad  : Apoya la gestión operativa de housekeeping para conocer
--             qué habitaciones no deben ser reasignadas en un período dado.
-- -----------------------------------------------------------------------------
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


-- =============================================================================
--                          VISTAS E ÍNDICES
-- =============================================================================

-- -----------------------------------------------------------------------------
-- FUNCIÓN: fn_costo_estancia
-- Propósito  : Calcular el costo total de hospedaje (sin servicios adicionales)
--              de una reserva específica, multiplicando el número de noches
--              por el precio por noche de la habitación asignada.
-- Parámetro  : p_id_reserva INT — identificador de la reserva a evaluar.
-- Retorno    : DECIMAL(10,2) con el importe total de la estancia.
-- Justifica  : Encapsula un cálculo recurrente que se usa tanto en la vista
--              v_reservas como en v_historial_clientes, evitando duplicar
--              la lógica en múltiples consultas y garantizando consistencia
--              en todos los puntos del sistema donde se requiera este dato.
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- FUNCIÓN: fn_total_reservas_cliente
-- Propósito  : Contar el número total de reservas (en cualquier estado) que
--              tiene registradas un cliente determinado.
-- Parámetro  : p_id_cliente INT — identificador del cliente a consultar.
-- Retorno    : INT con el conteo total de reservas del cliente.
-- Justifica  : Aísla una métrica de frecuencia de uso que se consume en la
--              vista v_historial_clientes y que puede reutilizarse en
--              procedimientos de actualización de tipo de cliente o en
--              consultas ad-hoc de análisis de comportamiento.
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- VISTA: v_reservas
-- Propósito  : Exponer una consulta desnormalizada y lista para consumo
--              que combina los datos de Reservas, Clientes, Detalle_Reservas
--              y Habitaciones en un único objeto de solo lectura.
-- Columnas   : id_reserva, cliente, tipo_cliente, tipo_habitacion,
--              precio_por_noche, fecha_inicio, fecha_fin, noches,
--              costo_hospedaje, estado_reserva.
-- Justifica  : Simplifica el acceso a la información más solicitada por
--              recepción y reportes; oculta la complejidad de los JOINs
--              y el uso de funciones a los consumidores de la capa de
--              presentación, mejorando la mantenibilidad del sistema.
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- VISTA: v_historial_clientes
-- Propósito  : Consolidar el perfil económico de cada cliente: total de
--              reservas, gasto en hospedaje, gasto en servicios adicionales
--              y gasto total acumulado.
-- Columnas   : id_cliente, nombre, tipo_cliente, total_reservas,
--              gasto_hospedaje, gasto_servicios, gasto_total.
-- Notas      : COALESCE en gasto_servicios evita NULL cuando un cliente
--              no ha contratado servicios adicionales.
-- Justifica  : Proporciona en una sola consulta la visión 360° del cliente,
--              indispensable para la toma de decisiones de fidelización,
--              segmentación comercial y elaboración de reportes ejecutivos.
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- ÍNDICE: idx_reservas_cliente  (sobre Reservas.id_cliente)
-- Problema que resuelve:
--   Sin este índice, cualquier consulta que filtre o agrupe reservas por
--   cliente (WHERE id_cliente = X, JOIN con Clientes, HAVING COUNT...)
--   obliga al motor a realizar un escaneo completo de la tabla Reservas
--   (Full Table Scan). Con la tabla creciendo con el historial de años,
--   esto se vuelve cada vez más costoso.
-- Beneficio  : Al indexar id_cliente, MySQL puede localizar directamente
--              las filas del cliente buscado sin recorrer toda la tabla,
--              acelerando las consultas 7 y 5, la función fn_total_reservas
--              y la vista v_historial_clientes que filtran por este campo.
-- -----------------------------------------------------------------------------
CREATE INDEX idx_reservas_cliente   ON Reservas(id_cliente);

-- -----------------------------------------------------------------------------
-- ÍNDICE: idx_detalle_habitacion  (sobre Detalle_Reservas.id_habitacion)
-- Problema que resuelve:
--   El trigger trg_no_traslape y el procedimiento consultar_disponibilidad
--   ejecutan subconsultas que buscan si una habitación ya tiene reservas
--   activas en un período determinado. Sin índice sobre id_habitacion,
--   cada verificación recorre toda la tabla Detalle_Reservas, lo que
--   implica un Full Scan en cada INSERT o llamada al procedimiento.
-- Beneficio  : Permite al motor saltar directamente a los registros de la
--              habitación consultada, reduciendo drásticamente el tiempo
--              de respuesta en operaciones de alta frecuencia como la
--              consulta de disponibilidad y la validación de traslapes.
-- -----------------------------------------------------------------------------
CREATE INDEX idx_detalle_habitacion ON Detalle_Reservas(id_habitacion);


-- =============================================================================
--                       TRIGGERS Y TRANSACCIONES
-- =============================================================================

-- -----------------------------------------------------------------------------
-- TRIGGER: trg_no_traslape
-- Evento    : BEFORE INSERT en Detalle_Reservas
-- Problema que resuelve:
--   Sin este trigger, es posible asignar la misma habitación a dos reservas
--   cuyas fechas se solapan, generando un conflicto operativo real: dos
--   grupos de huéspedes con derecho a ocupar la misma habitación el mismo día.
-- Lógica    : Antes de insertar un nuevo registro de detalle, cuenta cuántas
--             reservas activas ya registradas involucran la misma habitación
--             y cuyos rangos de fechas se intersecan con el de la reserva
--             nueva. Si existe al menos una, lanza un error SQLSTATE 45000
--             con un mensaje descriptivo, abortando el INSERT.
-- Condición de traslape (intervalo A con intervalo B):
--             A.inicio < B.fin  AND  A.fin > B.inicio
-- Impacto   : Garantiza la integridad de negocio a nivel de base de datos,
--             independientemente de la capa de aplicación que realice la
--             inserción.
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- TRIGGER: trg_no_sobreocupacion
-- Evento    : BEFORE INSERT en Detalle_Reservas
-- Problema que resuelve:
--   Sin este trigger, una habitación Individual (capacidad 1) podría ser
--   asignada a una reserva con num_personas = 3, violando la restricción
--   física del alojamiento y generando una situación inmanejable en la
--   operación real del hotel.
-- Lógica    : Recupera la capacidad máxima de la habitación que se intenta
--             asignar y el número de personas de la reserva entrante.
--             Si las personas exceden la capacidad, lanza un error SQLSTATE
--             45000 que aborta el INSERT e informa el motivo.
-- Impacto   : Protege la integridad operativa asegurando que ninguna
--             habitación sea asignada a más personas de las que puede
--             alojar según su configuración física registrada.
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- PROCEDIMIENTO: consultar_disponibilidad
-- Propósito  : Devolver el catálogo de habitaciones que pueden ser reservadas
--              para un período y número de personas específicos.
-- Parámetros :
--   · p_fecha_inicio DATE  — Fecha de llegada deseada.
--   · p_fecha_fin    DATE  — Fecha de salida deseada.
--   · p_num_personas INT   — Número de huéspedes a alojar.
-- Lógica     :
--   1. Valida que la fecha de inicio sea anterior a la de fin; de lo
--      contrario lanza un error descriptivo.
--   2. Filtra habitaciones que NO estén en Mantenimiento.
--   3. Filtra habitaciones con capacidad suficiente para el grupo.
--   4. Excluye habitaciones que ya tengan una reserva Activa cuyas fechas
--      se solapen con el período solicitado (NOT EXISTS + subconsulta).
--   5. Ordena los resultados por precio ascendente para facilitar la
--      selección al recepcionista.
-- Justifica  : Centraliza la lógica de búsqueda de disponibilidad, que de
--              otro modo se repetiría y podría implementarse de forma
--              inconsistente en distintas partes del sistema o aplicación.
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- PROCEDIMIENTO: registrar_reserva
-- Propósito  : Registrar de forma atómica una nueva reserva completa:
--              creación de la reserva, asignación de habitación y registro
--              del pago inicial, todo dentro de una única transacción.
-- Parámetros :
--   · p_id_cliente    INT          — Cliente que realiza la reserva.
--   · p_fecha_inicio  DATE         — Fecha de llegada.
--   · p_fecha_fin     DATE         — Fecha de salida.
--   · p_num_personas  INT          — Número de huéspedes.
--   · p_id_habitacion INT          — Habitación seleccionada.
--   · p_monto_pago    DECIMAL      — Importe a registrar como pago.
--   · p_metodo_pago   VARCHAR(20)  — Medio de pago utilizado.
-- Lógica y validaciones:
--   1. Bloquea la fila de la habitación con FOR UPDATE para evitar
--      condiciones de carrera en entornos concurrentes.
--   2. Verifica existencia de la habitación; error si no existe.
--   3. Rechaza habitaciones en Mantenimiento.
--   4. Valida que el número de personas no exceda la capacidad.
--   5. Comprueba traslape de fechas con reservas Activas o Finalizadas.
--   6. Si todas las validaciones pasan, inserta en Reservas,
--      Detalle_Reservas y Pagos dentro de un START TRANSACTION...COMMIT.
--   7. Si cualquier validación falla o ocurre una excepción SQL,
--      el EXIT HANDLER ejecuta ROLLBACK y relanza el error (RESIGNAL).
-- Justifica  : Garantiza atomicidad: o todas las operaciones se completan
--              con éxito o ninguna persiste en la base de datos, evitando
--              estados inconsistentes (p. ej., reserva sin habitación o
--              habitación asignada sin pago registrado).
-- -----------------------------------------------------------------------------
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

    -- Manejador de errores: ante cualquier excepción SQL se deshace
    -- toda la transacción para garantizar atomicidad e integridad.
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- Bloqueo a nivel de fila para prevenir condiciones de carrera
    -- cuando múltiples sesiones intenten reservar la misma habitación
    -- en el mismo instante (concurrencia).
    SELECT capacidad, estado
    INTO v_capacidad, v_estado
    FROM Habitaciones
    WHERE id_habitacion = p_id_habitacion
    FOR UPDATE;

    -- Validación 1: La habitación debe existir en el catálogo.
    IF v_capacidad IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La habitación no existe';
    END IF;

    -- Validación 2: La habitación no debe estar en mantenimiento.
    IF v_estado = 'Mantenimiento' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La habitación está en mantenimiento';
    END IF;

    -- Validación 3: El grupo no debe superar la capacidad de la habitación.
    IF p_num_personas > v_capacidad THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La habitación no tiene capacidad para el número de personas indicado';
    END IF;

    -- Validación 4: No debe existir traslape de fechas con reservas
    -- previas (Activas o Finalizadas) para la misma habitación.
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

    -- Operación 1: Crear el encabezado de la reserva.
    INSERT INTO Reservas (id_cliente, fecha_inicio, fecha_fin, num_personas, estado)
    VALUES (p_id_cliente, p_fecha_inicio, p_fecha_fin, p_num_personas, 'Activa');
    SET v_id_reserva = LAST_INSERT_ID();

    -- Operación 2: Asignar la habitación a la reserva recién creada.
    INSERT INTO Detalle_Reservas (id_reserva, id_habitacion)
    VALUES (v_id_reserva, p_id_habitacion);

    -- Operación 3: Registrar el pago inicial de la reserva.
    INSERT INTO Pagos (id_reserva, monto, fecha_pago, metodo)
    VALUES (v_id_reserva, p_monto_pago, CURDATE(), p_metodo_pago);

    COMMIT;
    SELECT 'Reserva registrada exitosamente' AS mensaje, v_id_reserva AS id_reserva_generado;
END $$
DELIMITER ;

-- -----------------------------------------------------------------------------
-- PRUEBA 1: Consultar disponibilidad del 10 al 15 de marzo para 2 personas.
-- Se espera que el procedimiento devuelva habitaciones no ocupadas en ese
-- periodo con capacidad >= 2 y estado diferente a Mantenimiento.
-- -----------------------------------------------------------------------------
CALL consultar_disponibilidad('2025-03-10', '2025-03-15', 2);

-- -----------------------------------------------------------------------------
-- PRUEBA 2: Registrar una nueva reserva para Ana López (id=2),
-- habitación 2, del 20 al 25 de marzo, 2 personas, pago de $4,000 con Tarjeta.
-- La transacción debe completarse exitosamente ya que la habitación 2
-- no tiene reservas activas en ese período.
-- -----------------------------------------------------------------------------
CALL registrar_reserva(2, '2025-03-20', '2025-03-25', 2, 2, 4000.00, 'Tarjeta');


-- =============================================================================
--                    SEGURIDAD (USUARIOS Y PERMISOS)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- MODELO DE SEGURIDAD BASADO EN ROLES
-- El sistema define tres roles con distintos niveles de privilegio,
-- siguiendo el principio de mínimo privilegio (least privilege):
-- cada usuario recibe únicamente los permisos estrictamente necesarios
-- para cumplir su función dentro del hotel.
-- -----------------------------------------------------------------------------

-- Usuario: admin
-- Rol      : Administrador de base de datos.
-- Privilegio: ALL PRIVILEGES sobre hotel.* — puede crear, modificar y
--             eliminar cualquier objeto o dato de la base.
-- Justifica : El administrador necesita control total para mantenimiento,
--             respaldos, ajustes de esquema y auditoría del sistema.
CREATE USER 'admin'@'localhost'         IDENTIFIED BY 'a';

-- Usuario: recepcionista
-- Rol      : Personal operativo de recepción del hotel.
-- Privilegio: SELECT, INSERT, UPDATE — puede consultar datos, registrar
--             nuevas reservas y actualizar estados, pero NO puede eliminar
--             registros ni modificar la estructura del esquema.
-- Justifica : La recepción necesita operar el día a día (check-in,
--             check-out, pagos) sin capacidad de borrar históricos ni
--             alterar reglas del sistema.
CREATE USER 'recepcionista'@'localhost' IDENTIFIED BY 'r';

-- Usuario: cliente
-- Rol      : Huésped o usuario de consulta externa (p. ej., portal web).
-- Privilegio: SELECT únicamente — puede leer información como
--             disponibilidad y catálogo de servicios, sin poder
--             modificar ningún dato.
-- Justifica : Aplica el principio de mínimo privilegio para usuarios
--             no confiables; si esta cuenta fuera comprometida, no
--             podría alterarse ningún dato del sistema.
CREATE USER 'cliente'@'localhost'       IDENTIFIED BY 'c';

-- Asignación de privilegios según el rol definido para cada usuario.
GRANT ALL PRIVILEGES ON hotel.* TO 'admin'@'localhost';
GRANT SELECT, INSERT, UPDATE ON hotel.* TO 'recepcionista'@'localhost';
GRANT SELECT ON hotel.* TO 'cliente'@'localhost';

-- Recarga la tabla de privilegios en memoria para que los cambios
-- sean efectivos de inmediato en todas las sesiones activas.
FLUSH PRIVILEGES;