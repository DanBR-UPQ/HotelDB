-- Base de datos hotel: gestiona clientes, habitaciones, reservas, pagos y servicios

DROP DATABASE IF EXISTS hotel;
CREATE DATABASE hotel;
USE hotel;

-- Tabla Clientes: almacena información personal y de clasificación de los clientes
CREATE TABLE Clientes (
    id_cliente  INT          AUTO_INCREMENT PRIMARY KEY,          -- Identificador único del cliente (PK)
    nombre      VARCHAR(100) NOT NULL,                            -- Nombre completo del cliente
    email       VARCHAR(100) UNIQUE,                              -- Correo electrónico único del cliente
    telefono    VARCHAR(15)  UNIQUE,                              -- Número telefónico único del cliente
    tipo_cliente VARCHAR(20) NOT NULL DEFAULT 'Normal'            -- Clasificación del cliente: Normal, Frecuente o VIP
                             CHECK (tipo_cliente IN ('Normal','Frecuente','VIP'))
);

-- Tabla Habitaciones: contiene los datos físicos y tarifarios de las habitaciones del hotel
CREATE TABLE Habitaciones (
    id_habitacion INT           AUTO_INCREMENT PRIMARY KEY,       -- Identificador único de la habitación (PK)
    tipo          VARCHAR(20)   NOT NULL                          -- Tipo de habitación: Individual, Doble o Suite
                                CHECK (tipo IN ('Individual','Doble','Suite')),
    precio        DECIMAL(10,2) NOT NULL CHECK (precio > 0),      -- Costo por noche en pesos (mayor que cero)
    capacidad     INT           NOT NULL CHECK (capacidad > 0),   -- Número máximo de personas permitidas
    estado        VARCHAR(20)   NOT NULL DEFAULT 'Disponible'     -- Estado actual: Disponible, Ocupada o Mantenimiento
                                CHECK (estado IN ('Disponible','Ocupada','Mantenimiento'))
);

-- Tabla Reservas: registra las reservas realizadas por los clientes
CREATE TABLE Reservas (
    id_reserva   INT  AUTO_INCREMENT PRIMARY KEY,                 -- Identificador único de la reserva (PK)
    id_cliente   INT  NOT NULL,                                   -- FK al cliente que realiza la reserva
    fecha_inicio DATE NOT NULL,                                   -- Fecha de inicio de la estancia
    fecha_fin    DATE NOT NULL,                                   -- Fecha de fin de la estancia (debe ser mayor a fecha_inicio)
    num_personas INT NOT NULL CHECK (num_personas > 0),           -- Cantidad de personas en la reserva
    estado       VARCHAR(20) NOT NULL DEFAULT 'Activa'            -- Estado de la reserva: Activa, Finalizada o Cancelada
                             CHECK (estado IN ('Activa','Finalizada','Cancelada')),
    CONSTRAINT chk_fechas CHECK (fecha_fin > fecha_inicio),       -- La fecha de salida debe ser posterior a la de entrada
    FOREIGN KEY (id_cliente) REFERENCES Clientes(id_cliente)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Tabla Detalle_Reservas: tabla intermedia que relaciona reservas con habitaciones (relación N:M)
CREATE TABLE Detalle_Reservas (
    id_detalle    INT AUTO_INCREMENT PRIMARY KEY,                 -- Identificador único del detalle (PK)
    id_reserva    INT NOT NULL,                                   -- FK a la reserva asociada
    id_habitacion INT NOT NULL,                                   -- FK a la habitación asignada
    FOREIGN KEY (id_reserva)    REFERENCES Reservas(id_reserva)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_habitacion) REFERENCES Habitaciones(id_habitacion)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Tabla Pagos: almacena los pagos realizados por cada reserva
CREATE TABLE Pagos (
    id_pago    INT           AUTO_INCREMENT PRIMARY KEY,          -- Identificador único del pago (PK)
    id_reserva INT           NOT NULL,                            -- FK a la reserva asociada al pago
    monto      DECIMAL(10,2) NOT NULL CHECK (monto > 0),          -- Cantidad pagada (mayor que cero)
    fecha_pago DATE          NOT NULL,                            -- Fecha en que se realizó el pago
    metodo     VARCHAR(20)   NOT NULL                             -- Método de pago: Efectivo, Tarjeta o Transferencia
               CHECK (metodo IN ('Efectivo','Tarjeta','Transferencia')),
    FOREIGN KEY (id_reserva) REFERENCES Reservas(id_reserva)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Tabla Servicios: registra servicios adicionales contratados dentro de una reserva
CREATE TABLE Servicios (
    id_servicio INT           AUTO_INCREMENT PRIMARY KEY,         -- Identificador único del servicio (PK)
    nombre      VARCHAR(50)   NOT NULL,                           -- Nombre del servicio adicional
    precio      DECIMAL(10,2) NOT NULL CHECK (precio > 0),        -- Costo del servicio (mayor que cero)
    id_reserva  INT           NOT NULL,                           -- FK a la reserva con la que se asocia el servicio
    FOREIGN KEY (id_reserva) REFERENCES Reservas(id_reserva)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================================
-- INSERCIÓN DE DATOS
-- ============================================================

-- Clientes
INSERT INTO Clientes (nombre, email, telefono, tipo_cliente) VALUES
('Juan Perez',      'juan1@gmail.com',      '4421111111', 'Frecuente'),
('Ana Lopez',       'ana2@gmail.com',        '4422222222', 'Normal'),
('Carlos Ramirez',  'carlos3@gmail.com',     '4423333333', 'VIP'),
('Maria Gonzalez',  'maria4@gmail.com',      '4424444444', 'Normal'),
('Luis Hernandez',  'luis5@gmail.com',       '4425555555', 'Frecuente'),
('Sofia Martinez',  'sofia6@gmail.com',      '4426666666', 'VIP'),
('Pedro Sanchez',   'pedro7@gmail.com',      '4427777777', 'Normal'),
('Laura Torres',    'laura8@gmail.com',      '4428888888', 'Frecuente'),
('Diego Flores',    'diego9@gmail.com',      '4429999999', 'Normal'),
('Fernanda Cruz',   'fernanda10@gmail.com',  '4421010101', 'VIP'),
('Jorge Morales',   'jorge11@gmail.com',     '4421212121', 'Frecuente'),
('Paola Ortiz',     'paola12@gmail.com',     '4421313131', 'Normal'),
('Ricardo Vega',    'ricardo13@gmail.com',   '4421414141', 'VIP'),
('Daniela Rojas',   'daniela14@gmail.com',   '4421515151', 'Normal'),
('Hugo Castro',     'hugo15@gmail.com',      '4421616161', 'Frecuente'),
('Andrea Navarro',  'andrea16@gmail.com',    '4421717171', 'VIP'),
('Miguel Silva',    'miguel17@gmail.com',    '4421818181', 'Normal'),
('Valeria Mendoza', 'valeria18@gmail.com',   '4421919191', 'Frecuente'),
('Oscar Pineda',    'oscar19@gmail.com',     '4422020202', 'VIP'),
('Gabriela Reyes',  'gabriela20@gmail.com',  '4422121212', 'Normal');

-- Habitaciones
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

-- Reservas
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

-- Detalle de reservas
INSERT INTO Detalle_Reservas (id_reserva, id_habitacion) VALUES
(1,1),(2,2),(3,3),(4,4),(5,5),
(6,6),(7,7),(8,8),(9,9),(10,10),
(11,11),(12,12),(13,13),(14,14),(15,15),
(16,16),(17,17),(18,18),(19,19),(20,20);

-- Pagos
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

-- Servicios
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