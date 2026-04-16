<?php
$conn = new mysqli("localhost", "admin", "a", "hotel");
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
$conn->set_charset("utf8");

function printTable($result, $empty = "Sin resultados.") {
    if (!$result || $result->num_rows === 0) {
        echo "<p class='empty'>$empty</p>";
        return;
    }
    echo "<div class='table-wrap'><table><thead><tr>";
    while ($field = $result->fetch_field()) {
        echo "<th>" . htmlspecialchars($field->name) . "</th>";
    }
    echo "</tr></thead><tbody>";
    while ($row = $result->fetch_assoc()) {
        echo "<tr>";
        foreach ($row as $value) {
            echo "<td>" . htmlspecialchars($value ?? "NULL") . "</td>";
        }
        echo "</tr>";
    }
    echo "</tbody></table></div>";
}

function runQuery($conn, $sql) {
    $res = $conn->query($sql);
    if ($conn->error) echo "<p class='error'>Error MySQL: " . htmlspecialchars($conn->error) . "</p>";
    return $res;
}

$msg = "";
$msgType = "";

// ── Registrar reserva ──────────────────────────────────────────────────────
if (isset($_POST['do_reserva'])) {
    $cid    = (int)$_POST['cid'];
    $hid    = (int)$_POST['hid'];
    $rfi    = $conn->real_escape_string($_POST['rfi']);
    $rff    = $conn->real_escape_string($_POST['rff']);
    $rp     = (int)$_POST['rp'];
    $monto  = (float)$_POST['monto'];
    $metodo = $conn->real_escape_string($_POST['metodo']);

    $res = $conn->query("CALL registrar_reserva($cid,'$rfi','$rff',$rp,$hid,$monto,'$metodo')");
    if ($conn->error) {
        $msg = "Error: " . htmlspecialchars($conn->error);
        $msgType = "error";
    } else {
        $row = $res->fetch_assoc();
        $msg = $row['mensaje'] . " — ID: " . $row['id_reserva_generado'];
        $msgType = "ok";
        while ($conn->more_results()) $conn->next_result();
    }
}

// ── Cancelar reserva ────────────────────────────────────────────────────────
if (isset($_POST['do_cancel'])) {
    $id = (int)$_POST['cancel_id'];
    $conn->query("UPDATE Reservas SET estado='Cancelada' WHERE id_reserva=$id AND estado='Activa'");
    $msg = $conn->affected_rows > 0 ? "Reserva #$id cancelada." : "No se pudo cancelar (¿ya estaba cancelada o finalizada?).";
    $msgType = $conn->affected_rows > 0 ? "ok" : "error";
}

// ── Actualizar cliente ───────────────────────────────────────────────────────
if (isset($_POST['do_update_cliente'])) {
    $id    = (int)$_POST['uc_id'];
    $tipo  = $conn->real_escape_string($_POST['uc_tipo']);
    $tel   = $conn->real_escape_string($_POST['uc_tel']);
    $email = $conn->real_escape_string($_POST['uc_email']);
    $conn->query("UPDATE Clientes SET tipo_cliente='$tipo', telefono='$tel', email='$email' WHERE id_cliente=$id");
    $msg = $conn->error ? "Error: " . htmlspecialchars($conn->error) : "Cliente #$id actualizado.";
    $msgType = $conn->error ? "error" : "ok";
}

// ── Agregar servicio ─────────────────────────────────────────────────────────
if (isset($_POST['do_add_servicio'])) {
    $nombre    = $conn->real_escape_string($_POST['sv_nombre']);
    $precio    = (float)$_POST['sv_precio'];
    $id_reserva = (int)$_POST['sv_reserva'];
    $conn->query("INSERT INTO Servicios (nombre, precio, id_reserva) VALUES ('$nombre', $precio, $id_reserva)");
    $msg = $conn->error ? "Error: " . htmlspecialchars($conn->error) : "Servicio agregado correctamente.";
    $msgType = $conn->error ? "error" : "ok";
}

// ── Cambiar estado habitación ────────────────────────────────────────────────
if (isset($_POST['do_hab_estado'])) {
    $id     = (int)$_POST['hab_id'];
    $estado = $conn->real_escape_string($_POST['hab_estado']);
    $conn->query("UPDATE Habitaciones SET estado='$estado' WHERE id_habitacion=$id");
    $msg = $conn->error ? "Error: " . htmlspecialchars($conn->error) : "Habitación #$id → $estado.";
    $msgType = $conn->error ? "error" : "ok";
}

// ── Trigger test ─────────────────────────────────────────────────────────────
if (isset($_POST['test_traslape'])) {
    $conn->query("CALL registrar_reserva(1,'2025-03-01','2025-03-05',1,1,1000,'Efectivo')");
    while ($conn->more_results()) $conn->next_result();
    $msg = $conn->error
        ? "Trigger activado correctamente: " . htmlspecialchars($conn->error)
        : "¡No falló! Revisar trigger.";
    $msgType = $conn->error ? "ok" : "error";
}
if (isset($_POST['test_capacidad'])) {
    $conn->query("CALL registrar_reserva(1,'2025-06-01','2025-06-05',99,1,1000,'Efectivo')");
    while ($conn->more_results()) $conn->next_result();
    $msg = $conn->error
        ? "Trigger capacidad activado: " . htmlspecialchars($conn->error)
        : "¡No falló! Revisar trigger.";
    $msgType = $conn->error ? "ok" : "error";
}

// ── Función manual ────────────────────────────────────────────────────────────
$fn_costo = null;
if (isset($_POST['do_fn_costo'])) {
    $id = (int)$_POST['fn_reserva_id'];
    $r  = $conn->query("SELECT fn_costo_estancia($id) AS costo");
    if ($r) { $fn_costo = $r->fetch_assoc()['costo']; }
}
$fn_total = null;
if (isset($_POST['do_fn_total'])) {
    $id = (int)$_POST['fn_cliente_id'];
    $r  = $conn->query("SELECT fn_total_reservas_cliente($id) AS total");
    if ($r) { $fn_total = $r->fetch_assoc()['total']; }
}

// ── Disponibilidad ────────────────────────────────────────────────────────────
$disp_res = null;
if (isset($_POST['do_disp'])) {
    $fi = $conn->real_escape_string($_POST['fi']);
    $ff = $conn->real_escape_string($_POST['ff']);
    $p  = (int)$_POST['p'];
    $disp_res = $conn->query("CALL consultar_disponibilidad('$fi','$ff',$p)");
    if ($conn->error) {
        $msg = "Error: " . htmlspecialchars($conn->error);
        $msgType = "error";
        $disp_res = null;
    }
    while ($conn->more_results()) $conn->next_result();
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Hotel DB — Panel Administrativo</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
<style>
:root {
    --bg:       #0d0d0f;
    --surface:  #16161a;
    --border:   #2a2a32;
    --gold:     #c9a84c;
    --gold2:    #e8c97a;
    --text:     #e8e6e0;
    --muted:    #7a7875;
    --ok:       #4caf82;
    --err:      #cf5c5c;
    --radius:   8px;
    --font-display: 'Playfair Display', Georgia, serif;
    --font-body:    'DM Sans', sans-serif;
    --font-mono:    'DM Mono', monospace;
}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body {
    background: var(--bg);
    color: var(--text);
    font-family: var(--font-body);
    font-size: 14px;
    line-height: 1.6;
    min-height: 100vh;
}

/* ── Header ── */
header {
    border-bottom: 1px solid var(--border);
    padding: 28px 40px 20px;
    display: flex;
    align-items: flex-end;
    gap: 20px;
    position: sticky;
    top: 0;
    background: rgba(13,13,15,.95);
    backdrop-filter: blur(12px);
    z-index: 100;
}
header .logo {
    font-family: var(--font-display);
    font-size: 26px;
    color: var(--gold);
    letter-spacing: .04em;
}
header .logo span { color: var(--muted); font-size: 14px; font-family: var(--font-body); font-weight: 300; margin-left: 10px; }
header nav { margin-left: auto; display: flex; gap: 6px; flex-wrap: wrap; }
header nav a {
    color: var(--muted);
    text-decoration: none;
    font-size: 12px;
    font-family: var(--font-mono);
    padding: 5px 12px;
    border: 1px solid transparent;
    border-radius: var(--radius);
    transition: all .2s;
}
header nav a:hover { color: var(--gold); border-color: var(--border); }

/* ── Layout ── */
.container { max-width: 1300px; margin: 0 auto; padding: 40px; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; }
@media(max-width:900px){ .grid-2,.grid-3{ grid-template-columns:1fr; } }

/* ── Sections ── */
section {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 28px;
    margin-bottom: 24px;
}
section h2 {
    font-family: var(--font-display);
    font-size: 20px;
    color: var(--gold);
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 10px;
}
section h2 .tag {
    font-family: var(--font-mono);
    font-size: 10px;
    background: rgba(201,168,76,.12);
    color: var(--gold);
    border: 1px solid rgba(201,168,76,.3);
    padding: 2px 8px;
    border-radius: 4px;
    font-style: normal;
}
section h3 {
    font-size: 13px;
    font-weight: 500;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: .08em;
    margin: 18px 0 10px;
    font-family: var(--font-mono);
}
section h3:first-child { margin-top: 0; }

/* ── Forms ── */
.form-row { display: flex; flex-wrap: wrap; gap: 10px; align-items: flex-end; margin-bottom: 10px; }
.form-group { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 120px; }
label { font-size: 11px; color: var(--muted); font-family: var(--font-mono); text-transform: uppercase; letter-spacing: .06em; }
input, select {
    background: var(--bg);
    border: 1px solid var(--border);
    color: var(--text);
    padding: 8px 12px;
    border-radius: var(--radius);
    font-family: var(--font-body);
    font-size: 13px;
    outline: none;
    transition: border-color .2s;
    width: 100%;
}
input:focus, select:focus { border-color: var(--gold); }
select option { background: var(--surface); }

/* ── Buttons ── */
.btn {
    background: linear-gradient(135deg, var(--gold), var(--gold2));
    color: #111;
    border: none;
    padding: 8px 18px;
    border-radius: var(--radius);
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: opacity .2s, transform .1s;
    white-space: nowrap;
    letter-spacing: .04em;
}
.btn:hover { opacity: .88; }
.btn:active { transform: scale(.97); }
.btn-ghost {
    background: transparent;
    color: var(--muted);
    border: 1px solid var(--border);
    padding: 7px 14px;
}
.btn-ghost:hover { color: var(--text); border-color: var(--muted); background: transparent; }
.btn-danger {
    background: transparent;
    color: var(--err);
    border: 1px solid var(--err);
}
.btn-danger:hover { background: rgba(207,92,92,.12); }
.btn-group { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 10px; }

/* ── Tables ── */
.table-wrap { overflow-x: auto; margin-top: 12px; border-radius: var(--radius); border: 1px solid var(--border); }
table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
thead tr { background: rgba(201,168,76,.08); }
th {
    text-align: left;
    padding: 10px 14px;
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--gold);
    text-transform: uppercase;
    letter-spacing: .06em;
    border-bottom: 1px solid var(--border);
    white-space: nowrap;
}
td {
    padding: 9px 14px;
    border-bottom: 1px solid rgba(42,42,50,.7);
    color: var(--text);
    font-family: var(--font-mono);
}
tbody tr:last-child td { border-bottom: none; }
tbody tr:hover { background: rgba(255,255,255,.025); }

/* ── Badges ── */
.badge {
    display: inline-block;
    padding: 2px 9px;
    border-radius: 20px;
    font-size: 10px;
    font-family: var(--font-mono);
    font-weight: 500;
}
.badge-ok     { background: rgba(76,175,130,.15); color: var(--ok); }
.badge-warn   { background: rgba(201,168,76,.15);  color: var(--gold); }
.badge-err    { background: rgba(207,92,92,.15);   color: var(--err); }
.badge-muted  { background: rgba(122,120,117,.15); color: var(--muted); }

/* ── Messages ── */
.alert {
    padding: 12px 18px;
    border-radius: var(--radius);
    font-family: var(--font-mono);
    font-size: 12px;
    margin-bottom: 20px;
    border-left: 3px solid;
}
.alert-ok  { background: rgba(76,175,130,.1);  border-color: var(--ok);  color: var(--ok); }
.alert-err { background: rgba(207,92,92,.1);   border-color: var(--err); color: var(--err); }

/* ── Misc ── */
.empty { color: var(--muted); font-style: italic; font-size: 13px; padding: 14px 0; }
.kv { display: flex; gap: 12px; align-items: center; margin-top: 10px; }
.kv .val { font-family: var(--font-mono); font-size: 22px; color: var(--gold); font-weight: 500; }
.kv .key { font-size: 12px; color: var(--muted); }
hr.sep { border: none; border-top: 1px solid var(--border); margin: 20px 0; }
.info-box {
    background: rgba(201,168,76,.06);
    border: 1px solid rgba(201,168,76,.18);
    border-radius: var(--radius);
    padding: 12px 16px;
    font-size: 12px;
    color: var(--muted);
    font-family: var(--font-mono);
    line-height: 1.8;
}
.info-box b { color: var(--gold); }
</style>
</head>
<body>

<header>
    <div class="logo">Grand Hôtel <span>Panel Administrativo · Base de Datos Avanzadas</span></div>
    <nav>
        <a href="#consultas">Consultas</a>
        <a href="#vistas">Vistas</a>
        <a href="#procedimientos">Procedimientos</a>
        <a href="#funciones">Funciones</a>
        <a href="#gestion">Gestión</a>
        <a href="#triggers">Triggers</a>
        <a href="#seguridad">Seguridad</a>
    </nav>
</header>

<div class="container">

<?php if ($msg): ?>
<div class="alert alert-<?= $msgType === 'ok' ? 'ok' : 'err' ?>">
    <?= $msgType === 'ok' ? '✓' : '✗' ?> <?= $msg ?>
</div>
<?php endif; ?>

<!-- ═══════════════════════════ CONSULTAS ═══════════════════════════ -->
<section id="consultas">
    <h2>Consultas Avanzadas <span class="tag">JOIN · GROUP BY · SUBQUERY</span></h2>

    <h3>1 · Reservas con costo total (JOIN múltiple)</h3>
    <form method="POST">
        <div class="btn-group">
            <button class="btn btn-ghost" name="q1">Ejecutar consulta</button>
        </div>
    </form>
    <?php if (isset($_POST['q1'])): printTable(runQuery($conn,
        "SELECT r.id_reserva, c.nombre AS cliente, c.tipo_cliente,
                h.tipo AS habitacion, h.precio AS precio_noche,
                DATEDIFF(r.fecha_fin, r.fecha_inicio) AS noches,
                DATEDIFF(r.fecha_fin, r.fecha_inicio)*h.precio AS costo_total,
                r.estado
         FROM Reservas r
         JOIN Clientes c ON r.id_cliente=c.id_cliente
         JOIN Detalle_Reservas dr ON r.id_reserva=dr.id_reserva
         JOIN Habitaciones h ON dr.id_habitacion=h.id_habitacion
         ORDER BY r.id_reserva"
    )); endif; ?>

    <hr class="sep">

    <h3>2 · Clientes clasificados por tipo (GROUP BY)</h3>
    <form method="POST">
        <div class="btn-group">
            <button class="btn btn-ghost" name="q2">Ejecutar consulta</button>
        </div>
    </form>
    <?php if (isset($_POST['q2'])): printTable(runQuery($conn,
        "SELECT tipo_cliente, COUNT(*) AS total_clientes FROM Clientes GROUP BY tipo_cliente ORDER BY total_clientes DESC"
    )); endif; ?>

    <hr class="sep">

    <h3>3 · Clientes con pago mayor al promedio (Subconsulta)</h3>
    <form method="POST">
        <div class="btn-group">
            <button class="btn btn-ghost" name="q3">Ejecutar consulta</button>
        </div>
    </form>
    <?php if (isset($_POST['q3'])): printTable(runQuery($conn,
        "SELECT c.nombre, c.tipo_cliente, p.monto, p.metodo, p.fecha_pago
         FROM Pagos p
         JOIN Reservas r ON p.id_reserva=r.id_reserva
         JOIN Clientes c ON r.id_cliente=c.id_cliente
         WHERE p.monto > (SELECT AVG(monto) FROM Pagos)
         ORDER BY p.monto DESC"
    )); endif; ?>

    <hr class="sep">

    <h3>4 · Ingresos por día</h3>
    <form method="POST">
        <div class="btn-group">
            <button class="btn btn-ghost" name="q4">Ejecutar consulta</button>
        </div>
    </form>
    <?php if (isset($_POST['q4'])): printTable(runQuery($conn,
        "SELECT fecha_pago, COUNT(*) AS pagos, SUM(monto) AS ingresos_dia, AVG(monto) AS promedio
         FROM Pagos GROUP BY fecha_pago ORDER BY fecha_pago"
    )); endif; ?>

    <hr class="sep">

    <h3>5 · Reservas activas con cliente y habitación</h3>
    <form method="POST">
        <div class="btn-group">
            <button class="btn btn-ghost" name="q5">Ejecutar consulta</button>
        </div>
    </form>
    <?php if (isset($_POST['q5'])): printTable(runQuery($conn,
        "SELECT r.id_reserva, c.nombre, c.email, h.tipo AS habitacion, h.precio,
                r.fecha_inicio, r.fecha_fin, r.num_personas, r.estado
         FROM Reservas r
         JOIN Clientes c ON r.id_cliente=c.id_cliente
         JOIN Detalle_Reservas dr ON r.id_reserva=dr.id_reserva
         JOIN Habitaciones h ON dr.id_habitacion=h.id_habitacion
         WHERE r.estado='Activa' ORDER BY r.fecha_inicio"
    )); endif; ?>

    <hr class="sep">

    <h3>6 · Ingresos totales por mes</h3>
    <form method="POST">
        <div class="btn-group">
            <button class="btn btn-ghost" name="q6">Ejecutar consulta</button>
        </div>
    </form>
    <?php if (isset($_POST['q6'])): printTable(runQuery($conn,
        "SELECT MONTH(fecha_pago) AS mes, MONTHNAME(fecha_pago) AS nombre_mes,
                COUNT(*) AS num_pagos, SUM(monto) AS ingresos_totales
         FROM Pagos GROUP BY MONTH(fecha_pago) ORDER BY mes"
    )); endif; ?>

    <hr class="sep">

    <h3>7 · Clientes con más reservas que el promedio (Subconsulta anidada)</h3>
    <form method="POST">
        <div class="btn-group">
            <button class="btn btn-ghost" name="q7">Ejecutar consulta</button>
        </div>
    </form>
    <?php if (isset($_POST['q7'])): printTable(runQuery($conn,
        "SELECT c.nombre, c.tipo_cliente, COUNT(r.id_reserva) AS total_reservas
         FROM Clientes c
         JOIN Reservas r ON c.id_cliente=r.id_cliente
         GROUP BY c.id_cliente
         HAVING COUNT(r.id_reserva) > (
             SELECT AVG(total) FROM (SELECT COUNT(*) AS total FROM Reservas GROUP BY id_cliente) sub
         ) ORDER BY total_reservas DESC"
    )); endif; ?>

    <hr class="sep">

    <h3>8 · Ocupación de habitaciones por reservas activas</h3>
    <form method="POST">
        <div class="btn-group">
            <button class="btn btn-ghost" name="q8">Ejecutar consulta</button>
        </div>
    </form>
    <?php if (isset($_POST['q8'])): printTable(runQuery($conn,
        "SELECT h.id_habitacion, h.tipo, h.precio, h.capacidad,
                r.fecha_inicio, r.fecha_fin, r.num_personas, r.estado
         FROM Habitaciones h
         JOIN Detalle_Reservas dr ON h.id_habitacion=dr.id_habitacion
         JOIN Reservas r ON dr.id_reserva=r.id_reserva
         WHERE r.estado='Activa' ORDER BY h.id_habitacion"
    )); endif; ?>

    <hr class="sep">

    <h3>9 · Servicios consumidos por reserva</h3>
    <form method="POST">
        <div class="btn-group">
            <button class="btn btn-ghost" name="q9">Ejecutar consulta</button>
        </div>
    </form>
    <?php if (isset($_POST['q9'])): printTable(runQuery($conn,
        "SELECT r.id_reserva, c.nombre AS cliente, s.nombre AS servicio,
                s.precio, r.estado
         FROM Servicios s
         JOIN Reservas r ON s.id_reserva=r.id_reserva
         JOIN Clientes c ON r.id_cliente=c.id_cliente
         ORDER BY r.id_reserva"
    )); endif; ?>

    <hr class="sep">

    <h3>10 · Pagos por método</h3>
    <form method="POST">
        <div class="btn-group">
            <button class="btn btn-ghost" name="q10">Ejecutar consulta</button>
        </div>
    </form>
    <?php if (isset($_POST['q10'])): printTable(runQuery($conn,
        "SELECT metodo, COUNT(*) AS num_pagos, SUM(monto) AS total, AVG(monto) AS promedio
         FROM Pagos GROUP BY metodo ORDER BY total DESC"
    )); endif; ?>
</section>

<!-- ═══════════════════════════ VISTAS ═══════════════════════════ -->
<section id="vistas">
    <h2>Vistas <span class="tag">VIEW</span></h2>

    <h3>v_reservas — Vista completa de reservas con costos</h3>
    <form method="POST">
        <div class="btn-group">
            <button class="btn btn-ghost" name="v1">Ver v_reservas</button>
        </div>
    </form>
    <?php if (isset($_POST['v1'])): printTable(runQuery($conn, "SELECT * FROM v_reservas ORDER BY id_reserva")); endif; ?>

    <hr class="sep">

    <h3>v_historial_clientes — Gasto total por cliente</h3>
    <form method="POST">
        <div class="btn-group">
            <button class="btn btn-ghost" name="v2">Ver v_historial_clientes</button>
        </div>
    </form>
    <?php if (isset($_POST['v2'])): printTable(runQuery($conn, "SELECT * FROM v_historial_clientes ORDER BY gasto_total DESC")); endif; ?>

    <hr class="sep">

    <h3>Todas las tablas base</h3>
    <form method="POST">
        <div class="btn-group">
            <button class="btn btn-ghost" name="tb_clientes">Clientes</button>
            <button class="btn btn-ghost" name="tb_habitaciones">Habitaciones</button>
            <button class="btn btn-ghost" name="tb_reservas">Reservas</button>
            <button class="btn btn-ghost" name="tb_detalle">Detalle_Reservas</button>
            <button class="btn btn-ghost" name="tb_pagos">Pagos</button>
            <button class="btn btn-ghost" name="tb_servicios">Servicios</button>
        </div>
    </form>
    <?php
    if (isset($_POST['tb_clientes']))     printTable(runQuery($conn, "SELECT * FROM Clientes ORDER BY id_cliente"));
    if (isset($_POST['tb_habitaciones'])) printTable(runQuery($conn, "SELECT * FROM Habitaciones ORDER BY id_habitacion"));
    if (isset($_POST['tb_reservas']))     printTable(runQuery($conn, "SELECT * FROM Reservas ORDER BY id_reserva"));
    if (isset($_POST['tb_detalle']))      printTable(runQuery($conn, "SELECT * FROM Detalle_Reservas ORDER BY id_detalle"));
    if (isset($_POST['tb_pagos']))        printTable(runQuery($conn, "SELECT * FROM Pagos ORDER BY id_pago"));
    if (isset($_POST['tb_servicios']))    printTable(runQuery($conn, "SELECT * FROM Servicios ORDER BY id_servicio"));
    ?>
</section>

<!-- ═══════════════════════════ PROCEDIMIENTOS ═══════════════════════════ -->
<section id="procedimientos">
    <h2>Procedimientos Almacenados <span class="tag">STORED PROCEDURES</span></h2>

    <div class="grid-2">
        <div>
            <h3>consultar_disponibilidad()</h3>
            <form method="POST">
                <div class="form-row">
                    <div class="form-group">
                        <label>Fecha inicio</label>
                        <input type="date" name="fi" value="<?= htmlspecialchars($_POST['fi'] ?? '') ?>" required>
                    </div>
                    <div class="form-group">
                        <label>Fecha fin</label>
                        <input type="date" name="ff" value="<?= htmlspecialchars($_POST['ff'] ?? '') ?>" required>
                    </div>
                    <div class="form-group" style="max-width:90px">
                        <label>Personas</label>
                        <input type="number" name="p" min="1" value="<?= htmlspecialchars($_POST['p'] ?? '1') ?>" required>
                    </div>
                    <button class="btn" name="do_disp" style="align-self:flex-end">Buscar</button>
                </div>
            </form>
            <?php if ($disp_res !== null): printTable($disp_res, "Sin habitaciones disponibles para esas fechas."); endif; ?>
        </div>

        <div>
            <h3>registrar_reserva() <em style="font-size:11px;color:var(--muted)">(con transacción ACID)</em></h3>
            <form method="POST">
                <div class="form-row">
                    <div class="form-group">
                        <label>ID Cliente</label>
                        <input type="number" name="cid" min="1" value="<?= htmlspecialchars($_POST['cid'] ?? '') ?>" required>
                    </div>
                    <div class="form-group">
                        <label>ID Habitación</label>
                        <input type="number" name="hid" min="1" value="<?= htmlspecialchars($_POST['hid'] ?? '') ?>" required>
                    </div>
                    <div class="form-group">
                        <label>Personas</label>
                        <input type="number" name="rp" min="1" value="<?= htmlspecialchars($_POST['rp'] ?? '1') ?>" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Inicio</label>
                        <input type="date" name="rfi" value="<?= htmlspecialchars($_POST['rfi'] ?? '') ?>" required>
                    </div>
                    <div class="form-group">
                        <label>Fin</label>
                        <input type="date" name="rff" value="<?= htmlspecialchars($_POST['rff'] ?? '') ?>" required>
                    </div>
                    <div class="form-group">
                        <label>Monto pago</label>
                        <input type="number" name="monto" step="0.01" min="0.01" value="<?= htmlspecialchars($_POST['monto'] ?? '') ?>" required>
                    </div>
                    <div class="form-group" style="max-width:140px">
                        <label>Método</label>
                        <select name="metodo">
                            <option>Efectivo</option>
                            <option>Tarjeta</option>
                            <option>Transferencia</option>
                        </select>
                    </div>
                    <button class="btn" name="do_reserva" style="align-self:flex-end">Registrar</button>
                </div>
            </form>
        </div>
    </div>
</section>

<!-- ═══════════════════════════ FUNCIONES ═══════════════════════════ -->
<section id="funciones">
    <h2>Funciones Almacenadas <span class="tag">FUNCTIONS</span></h2>
    <div class="grid-2">
        <div>
            <h3>fn_costo_estancia(id_reserva)</h3>
            <form method="POST">
                <div class="form-row">
                    <div class="form-group">
                        <label>ID Reserva</label>
                        <input type="number" name="fn_reserva_id" min="1" value="<?= htmlspecialchars($_POST['fn_reserva_id'] ?? '1') ?>" required>
                    </div>
                    <button class="btn btn-ghost" name="do_fn_costo" style="align-self:flex-end">Calcular</button>
                </div>
            </form>
            <?php if ($fn_costo !== null): ?>
            <div class="kv">
                <span class="val">$<?= number_format($fn_costo, 2) ?></span>
                <span class="key">costo de hospedaje</span>
            </div>
            <?php endif; ?>
        </div>
        <div>
            <h3>fn_total_reservas_cliente(id_cliente)</h3>
            <form method="POST">
                <div class="form-row">
                    <div class="form-group">
                        <label>ID Cliente</label>
                        <input type="number" name="fn_cliente_id" min="1" value="<?= htmlspecialchars($_POST['fn_cliente_id'] ?? '1') ?>" required>
                    </div>
                    <button class="btn btn-ghost" name="do_fn_total" style="align-self:flex-end">Calcular</button>
                </div>
            </form>
            <?php if ($fn_total !== null): ?>
            <div class="kv">
                <span class="val"><?= $fn_total ?></span>
                <span class="key">reservas totales</span>
            </div>
            <?php endif; ?>
        </div>
    </div>
</section>

<!-- ═══════════════════════════ GESTIÓN ═══════════════════════════ -->
<section id="gestion">
    <h2>Gestión de Datos <span class="tag">INSERT · UPDATE · DELETE</span></h2>

    <div class="grid-2">
        <!-- Cancelar reserva -->
        <div>
            <h3>Cancelar reserva (UPDATE estado)</h3>
            <form method="POST">
                <div class="form-row">
                    <div class="form-group">
                        <label>ID Reserva</label>
                        <input type="number" name="cancel_id" min="1" required>
                    </div>
                    <button class="btn btn-danger" name="do_cancel" style="align-self:flex-end">Cancelar reserva</button>
                </div>
            </form>
        </div>

        <!-- Cambiar estado habitación -->
        <div>
            <h3>Cambiar estado de habitación</h3>
            <form method="POST">
                <div class="form-row">
                    <div class="form-group">
                        <label>ID Habitación</label>
                        <input type="number" name="hab_id" min="1" required>
                    </div>
                    <div class="form-group">
                        <label>Nuevo estado</label>
                        <select name="hab_estado">
                            <option>Disponible</option>
                            <option>Ocupada</option>
                            <option>Mantenimiento</option>
                        </select>
                    </div>
                    <button class="btn btn-ghost" name="do_hab_estado" style="align-self:flex-end">Actualizar</button>
                </div>
            </form>
        </div>

        <!-- Actualizar cliente -->
        <div>
            <h3>Actualizar cliente</h3>
            <form method="POST">
                <div class="form-row">
                    <div class="form-group">
                        <label>ID Cliente</label>
                        <input type="number" name="uc_id" min="1" required>
                    </div>
                    <div class="form-group">
                        <label>Tipo cliente</label>
                        <select name="uc_tipo">
                            <option>Normal</option>
                            <option>Frecuente</option>
                            <option>VIP</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" name="uc_email" placeholder="nuevo@email.com">
                    </div>
                    <div class="form-group">
                        <label>Teléfono</label>
                        <input type="text" name="uc_tel" placeholder="4420000000">
                    </div>
                    <button class="btn btn-ghost" name="do_update_cliente" style="align-self:flex-end">Guardar</button>
                </div>
            </form>
        </div>

        <!-- Agregar servicio -->
        <div>
            <h3>Agregar servicio a reserva (INSERT)</h3>
            <form method="POST">
                <div class="form-row">
                    <div class="form-group">
                        <label>ID Reserva</label>
                        <input type="number" name="sv_reserva" min="1" required>
                    </div>
                    <div class="form-group">
                        <label>Servicio</label>
                        <select name="sv_nombre">
                            <option>Spa</option>
                            <option>Room Service</option>
                            <option>Desayuno</option>
                            <option>Lavanderia</option>
                            <option>Transporte</option>
                            <option>Cena</option>
                            <option>Gimnasio</option>
                            <option>Bar</option>
                            <option>Tour</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Precio</label>
                        <input type="number" name="sv_precio" step="0.01" min="0.01" required>
                    </div>
                    <button class="btn btn-ghost" name="do_add_servicio" style="align-self:flex-end">Agregar</button>
                </div>
            </form>
        </div>
    </div>
</section>

<!-- ═══════════════════════════ TRIGGERS ═══════════════════════════ -->
<section id="triggers">
    <h2>Triggers <span class="tag">BEFORE INSERT</span></h2>

    <p style="color:var(--muted);font-size:13px;margin-bottom:16px;">
        Los botones de abajo intentan operaciones inválidas para verificar que los triggers las rechacen correctamente.
    </p>

    <div class="grid-3">
        <div>
            <h3>trg_no_traslape</h3>
            <p style="color:var(--muted);font-size:12px;margin-bottom:12px;">
                Intenta reservar la habitación 1 del 01–05 Mar 2025 (ya existe esa reserva → debe fallar).
            </p>
            <form method="POST">
                <button class="btn btn-danger" name="test_traslape">Probar traslape</button>
            </form>
        </div>
        <div>
            <h3>trg_no_sobreocupacion</h3>
            <p style="color:var(--muted);font-size:12px;margin-bottom:12px;">
                Intenta reservar la habitación 1 (capacidad 1) para 99 personas → debe fallar.
            </p>
            <form method="POST">
                <button class="btn btn-danger" name="test_capacidad">Probar sobreocupación</button>
            </form>
        </div>
        <div>
            <h3>Registro de triggers</h3>
            <form method="POST">
                <div class="btn-group">
                    <button class="btn btn-ghost" name="show_triggers">Ver triggers activos</button>
                </div>
            </form>
            <?php if (isset($_POST['show_triggers'])): printTable(runQuery($conn,
                "SELECT TRIGGER_NAME, EVENT_MANIPULATION, EVENT_OBJECT_TABLE, ACTION_TIMING
                 FROM information_schema.TRIGGERS
                 WHERE TRIGGER_SCHEMA = DATABASE()"
            )); endif; ?>
        </div>
    </div>
</section>

<!-- ═══════════════════════════ SEGURIDAD ═══════════════════════════ -->
<section id="seguridad">
    <h2>Seguridad — Usuarios y Permisos <span class="tag">GRANT · PRIVILEGES</span></h2>

    <div class="grid-3">
        <div class="info-box">
            <b>admin</b> / 'a'<br>
            GRANT <b>ALL PRIVILEGES</b> ON hotel.*<br>
            Acceso total: SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, TRIGGER, PROCEDURE…
        </div>
        <div class="info-box">
            <b>recepcionista</b> / 'r'<br>
            GRANT <b>SELECT, INSERT, UPDATE</b> ON hotel.*<br>
            Puede consultar datos, registrar reservas y actualizar registros. No puede eliminar ni modificar estructura.
        </div>
        <div class="info-box">
            <b>cliente</b> / 'c'<br>
            GRANT <b>SELECT</b> ON hotel.*<br>
            Solo lectura. Puede consultar vistas y tablas. Sin permisos de escritura.
        </div>
    </div>

    <hr class="sep">

    <div class="grid-2">
        <div>
            <h3>Ver usuarios del sistema</h3>
            <form method="POST">
                <div class="btn-group">
                    <button class="btn btn-ghost" name="show_users">Listar usuarios</button>
                </div>
            </form>
            <?php if (isset($_POST['show_users'])): printTable(runQuery($conn,
                "SELECT User AS usuario, Host AS host, account_locked AS bloqueado, password_expired AS pwd_expirado
                 FROM mysql.user
                 WHERE User IN ('admin','recepcionista','cliente')
                 ORDER BY User"
            )); endif; ?>
        </div>
        <div>
            <h3>Ver permisos (SHOW GRANTS)</h3>
            <form method="POST">
                <div class="form-row">
                    <div class="form-group">
                        <label>Usuario</label>
                        <select name="grant_user">
                            <option value="admin">admin</option>
                            <option value="recepcionista">recepcionista</option>
                            <option value="cliente">cliente</option>
                        </select>
                    </div>
                    <button class="btn btn-ghost" name="show_grants" style="align-self:flex-end">Ver permisos</button>
                </div>
            </form>
            <?php if (isset($_POST['show_grants'])):
                $u = $conn->real_escape_string($_POST['grant_user']);
                $r2 = $conn->query("SHOW GRANTS FOR '$u'@'localhost'");
                if ($r2): ?>
                <div class="table-wrap" style="margin-top:12px">
                    <table>
                        <thead><tr><th>Permisos otorgados</th></tr></thead>
                        <tbody>
                        <?php while ($g = $r2->fetch_row()): ?>
                            <tr><td><?= htmlspecialchars($g[0]) ?></td></tr>
                        <?php endwhile; ?>
                        </tbody>
                    </table>
                </div>
                <?php endif;
            endif; ?>
        </div>
    </div>

    <hr class="sep">

    <h3>Índices creados</h3>
    <form method="POST">
        <div class="btn-group">
            <button class="btn btn-ghost" name="show_indexes">Ver índices</button>
        </div>
    </form>
    <?php if (isset($_POST['show_indexes'])): printTable(runQuery($conn,
        "SELECT TABLE_NAME, INDEX_NAME, COLUMN_NAME, INDEX_TYPE, NON_UNIQUE
         FROM information_schema.STATISTICS
         WHERE TABLE_SCHEMA = DATABASE()
           AND INDEX_NAME != 'PRIMARY'
         ORDER BY TABLE_NAME, INDEX_NAME"
    )); endif; ?>

    <hr class="sep">

    <h3>Funciones y procedimientos registrados</h3>
    <form method="POST">
        <div class="btn-group">
            <button class="btn btn-ghost" name="show_routines">Ver rutinas</button>
        </div>
    </form>
    <?php if (isset($_POST['show_routines'])): printTable(runQuery($conn,
        "SELECT ROUTINE_NAME AS nombre, ROUTINE_TYPE AS tipo, DTD_IDENTIFIER AS retorno,
                CREATED AS creado, LAST_ALTERED AS modificado
         FROM information_schema.ROUTINES
         WHERE ROUTINE_SCHEMA = DATABASE()
         ORDER BY ROUTINE_TYPE, ROUTINE_NAME"
    )); endif; ?>
</section>

</div><!-- /container -->

<script>
// Save scroll position before any form submission, restore it on load.
document.addEventListener('submit', function () {
    sessionStorage.setItem('scrollY', window.scrollY);
});
window.addEventListener('load', function () {
    var y = sessionStorage.getItem('scrollY');
    if (y !== null) { window.scrollTo(0, parseInt(y)); sessionStorage.removeItem('scrollY'); }
});
</script>
</body>
</html>