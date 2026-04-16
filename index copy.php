<?php
$conn = new mysqli("localhost", "admin", "a", "hotel");

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

function printTable($result) {
    if (!$result) return;
    echo "<table border='1' cellpadding='5'><tr>";
    while ($field = $result->fetch_field()) {
        echo "<th>{$field->name}</th>";
    }
    echo "</tr>";
    while ($row = $result->fetch_assoc()) {
        echo "<tr>";
        foreach ($row as $value) {
            echo "<td>$value</td>";
        }
        echo "</tr>";
    }
    echo "</table><br>";
}
?>

<h2> Hotel DB Demo Panel</h2>

<!-- ================= CONSULTAS ================= -->

<h3> Consultas Avanzadas</h3>
<form method="POST">
    <button name="q1">Reservas con costo (JOIN)</button>
    <button name="q2">Clientes por tipo (GROUP BY)</button>
    <button name="q3">Pagos mayores al promedio (SUBQUERY)</button>
</form>

<?php
if (isset($_POST['q1'])) {
    $res = $conn->query("
        SELECT r.id_reserva, c.nombre, h.tipo,
        DATEDIFF(r.fecha_fin, r.fecha_inicio) AS noches,
        h.precio,
        DATEDIFF(r.fecha_fin, r.fecha_inicio)*h.precio AS total
        FROM Reservas r
        JOIN Clientes c ON r.id_cliente=c.id_cliente
        JOIN Detalle_Reservas dr ON r.id_reserva=dr.id_reserva
        JOIN Habitaciones h ON dr.id_habitacion=h.id_habitacion
    ");
    printTable($res);
}

if (isset($_POST['q2'])) {
    $res = $conn->query("
        SELECT tipo_cliente, COUNT(*) total
        FROM Clientes
        GROUP BY tipo_cliente
    ");
    printTable($res);
}

if (isset($_POST['q3'])) {
    $res = $conn->query("
        SELECT c.nombre, p.monto
        FROM Pagos p
        JOIN Reservas r ON p.id_reserva=r.id_reserva
        JOIN Clientes c ON r.id_cliente=c.id_cliente
        WHERE p.monto > (SELECT AVG(monto) FROM Pagos)
    ");
    printTable($res);
}
?>

<!-- ================= VISTAS ================= -->

<h3> Vistas</h3>
<form method="POST">
    <button name="v1">Ver v_reservas</button>
    <button name="v2">Ver historial clientes</button>
</form>

<?php
if (isset($_POST['v1'])) {
    $res = $conn->query("SELECT * FROM v_reservas");
    printTable($res);
}

if (isset($_POST['v2'])) {
    $res = $conn->query("SELECT * FROM v_historial_clientes");
    printTable($res);
}
?>

<!-- ================= PROCEDIMIENTOS ================= -->

<h3> Procedimientos</h3>

<h4>🔍 Consultar disponibilidad</h4>
<form method="POST">
    Inicio: <input type="date" name="fi" required>
    Fin: <input type="date" name="ff" required>
    Personas: <input type="number" name="p" required>
    <button name="disp">Buscar</button>
</form>

<?php
if (isset($_POST['disp'])) {
    $fi = $_POST['fi'];
    $ff = $_POST['ff'];
    $p  = $_POST['p'];

    $res = $conn->query("CALL consultar_disponibilidad('$fi','$ff',$p)");
    printTable($res);
    $conn->next_result();
}
?>

<h4> Registrar reserva</h4>
<form method="POST">
    Cliente ID: <input type="number" name="cid" required>
    Habitación ID: <input type="number" name="hid" required><br>
    Inicio: <input type="date" name="rfi" required>
    Fin: <input type="date" name="rff" required>
    Personas: <input type="number" name="rp" required><br>
    Pago: <input type="number" name="monto" required>
    Método: 
    <select name="metodo">
        <option>Efectivo</option>
        <option>Tarjeta</option>
        <option>Transferencia</option>
    </select>
    <button name="reserva">Registrar</button>
</form>

<?php
if (isset($_POST['reserva'])) {
    try {
        $sql = "CALL registrar_reserva(
            {$_POST['cid']},
            '{$_POST['rfi']}',
            '{$_POST['rff']}',
            {$_POST['rp']},
            {$_POST['hid']},
            {$_POST['monto']},
            '{$_POST['metodo']}'
        )";

        $res = $conn->query($sql);
        printTable($res);
        $conn->next_result();
    } catch (Exception $e) {
        echo "<b style='color:red'>Error: " . $e->getMessage() . "</b>";
    }
}
?>

<!-- ================= TRIGGERS ================= -->

<h3> Trigger Tests</h3>
<form method="POST">
    <button name="test_trigger">Probar traslape (debe fallar)</button>
</form>

<?php
if (isset($_POST['test_trigger'])) {
    try {
        // intenta duplicar habitación en mismas fechas
        $conn->query("CALL registrar_reserva(1,'2025-03-01','2025-03-05',1,1,1000,'Efectivo')");
        echo "No falló (raro)";
    } catch (Exception $e) {
        echo "<b style='color:red'>Trigger activado: " . $e->getMessage() . "</b>";
    }
}
?>

<!-- ================= SEGURIDAD ================= -->

<h3> Seguridad (demo simple)</h3>
<p>Para probar seguridad, cambia credenciales en el código:</p>
<ul>
    <li>admin / a</li>
    <li>recepcionista / r</li>
    <li>cliente / c</li>
</ul>
