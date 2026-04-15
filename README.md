# API Hotel – Guía de Consumo

##  Base URL (this is already in api.js)

```
http://localhost:4000/db
```



# 👤 CLIENTES

| Método | Endpoint        | Descripción        |
| ------ | --------------- | ------------------ |
| GET    | `/clientes`     | Listar clientes    |
| GET    | `/clientes/:id` | Obtener cliente    |
| POST   | `/clientes`     | Crear cliente      |
| PUT    | `/clientes/:id` | Actualizar cliente |
| DELETE | `/clientes/:id` | Eliminar cliente   |

### Body (POST / PUT)

```json
{
  "nombre": "Juan",
  "email": "juan@mail.com",
  "telefono": "123456",
  "tipo_cliente": "VIP"
}
```

* `nombre` obligatorio
* `tipo_cliente` default: `"Normal"`

---

# 🛏️ HABITACIONES

| Método | Endpoint            |
| ------ | ------------------- |
| GET    | `/habitaciones`     |
| GET    | `/habitaciones/:id` |
| POST   | `/habitaciones`     |
| PUT    | `/habitaciones/:id` |
| DELETE | `/habitaciones/:id` |

### Body

```json
{
  "tipo": "Suite",
  "precio": 1500,
  "capacidad": 2,
  "estado": "Disponible"
}
```

* Requeridos: `tipo`, `precio`, `capacidad`
* `estado` default: `"Disponible"`

---

# 📅 RESERVAS

| Método | Endpoint        |
| ------ | --------------- |
| GET    | `/reservas`     |
| GET    | `/reservas/:id` |
| POST   | `/reservas`     |
| PUT    | `/reservas/:id` |
| DELETE | `/reservas/:id` |

### Body

```json
{
  "id_cliente": 1,
  "fecha_inicio": "2026-05-01",
  "fecha_fin": "2026-05-05",
  "num_personas": 2,
  "estado": "Activa"
}
```

* Todos obligatorios excepto `estado` (default `"Activa"`)

---

# 📋 DETALLE_RESERVAS

| Método | Endpoint                |
| ------ | ----------------------- |
| GET    | `/detalle-reservas`     |
| GET    | `/detalle-reservas/:id` |
| POST   | `/detalle-reservas`     |
| PUT    | `/detalle-reservas/:id` |
| DELETE | `/detalle-reservas/:id` |

### Body

```json
{
  "id_reserva": 1,
  "id_habitacion": 2
}
```

---

# 💳 PAGOS

| Método | Endpoint     |
| ------ | ------------ |
| GET    | `/pagos`     |
| GET    | `/pagos/:id` |
| POST   | `/pagos`     |
| PUT    | `/pagos/:id` |
| DELETE | `/pagos/:id` |

### Body

```json
{
  "id_reserva": 1,
  "monto": 3000,
  "fecha_pago": "2026-05-01",
  "metodo": "Tarjeta"
}
```

---

# 🛎️ SERVICIOS

| Método | Endpoint         |
| ------ | ---------------- |
| GET    | `/servicios`     |
| GET    | `/servicios/:id` |
| POST   | `/servicios`     |
| PUT    | `/servicios/:id` |
| DELETE | `/servicios/:id` |

### Body

```json
{
  "nombre": "Spa",
  "precio": 500,
  "id_reserva": 1
}
```

---

# ⚠️ Errores

| Código | Significado        |
| ------ | ------------------ |
| 400    | Datos faltantes    |
| 404    | No encontrado      |
| 500    | Error del servidor |

---

# 🔄 Flujo recomendado (frontend)

1. Crear cliente
2. Crear reserva
3. Asignar habitación (`detalle-reservas`)
4. Registrar pago
5. Agregar servicios

---
