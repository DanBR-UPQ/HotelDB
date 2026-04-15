import React, { useEffect, useMemo, useState } from 'react';
import {api} from '../services/api'; // Ajusta la ruta si tu instancia axios vive en otro archivo

const EMPTY_RESULTS = {
  clientes: [],
  habitaciones: [],
  reservas: [],
  detalleReservas: [],
  pagos: [],
  servicios: [],
};

const EMPTY_FORMS = {
  clientes: { nombre: '', email: '', telefono: '', tipo_cliente: 'Normal' },
  habitaciones: { tipo: '', precio: '', capacidad: '', estado: 'Disponible' },
  reservas: { id_cliente: '', fecha_inicio: '', fecha_fin: '', num_personas: '', estado: 'Activa' },
  detalleReservas: { id_reserva: '', id_habitacion: '' },
  pagos: { id_reserva: '', monto: '', fecha_pago: '', metodo: '' },
  servicios: { nombre: '', precio: '', id_reserva: '' },
};

const ENTITY_CONFIG = {
  clientes: {
    label: 'Clientes',
    endpoint: '/clientes',
    fields: ['nombre', 'email', 'telefono', 'tipo_cliente'],
    fieldLabels: {
      nombre: 'Nombre',
      email: 'Email',
      telefono: 'Teléfono',
      tipo_cliente: 'Tipo cliente',
    },
    types: { nombre: 'text', email: 'email', telefono: 'text', tipo_cliente: 'text' },
  },
  habitaciones: {
    label: 'Habitaciones',
    endpoint: '/habitaciones',
    fields: ['tipo', 'precio', 'capacidad', 'estado'],
    fieldLabels: {
      tipo: 'Tipo',
      precio: 'Precio',
      capacidad: 'Capacidad',
      estado: 'Estado',
    },
    types: { tipo: 'text', precio: 'number', capacidad: 'number', estado: 'text' },
  },
  reservas: {
    label: 'Reservas',
    endpoint: '/reservas',
    fields: ['id_cliente', 'fecha_inicio', 'fecha_fin', 'num_personas', 'estado'],
    fieldLabels: {
      id_cliente: 'ID cliente',
      fecha_inicio: 'Fecha inicio',
      fecha_fin: 'Fecha fin',
      num_personas: 'Núm. personas',
      estado: 'Estado',
    },
    types: { id_cliente: 'number', fecha_inicio: 'date', fecha_fin: 'date', num_personas: 'number', estado: 'text' },
  },
  detalleReservas: {
    label: 'Detalle reservas',
    endpoint: '/detalle-reservas',
    fields: ['id_reserva', 'id_habitacion'],
    fieldLabels: {
      id_reserva: 'ID reserva',
      id_habitacion: 'ID habitación',
    },
    types: { id_reserva: 'number', id_habitacion: 'number' },
  },
  pagos: {
    label: 'Pagos',
    endpoint: '/pagos',
    fields: ['id_reserva', 'monto', 'fecha_pago', 'metodo'],
    fieldLabels: {
      id_reserva: 'ID reserva',
      monto: 'Monto',
      fecha_pago: 'Fecha pago',
      metodo: 'Método',
    },
    types: { id_reserva: 'number', monto: 'number', fecha_pago: 'date', metodo: 'text' },
  },
  servicios: {
    label: 'Servicios',
    endpoint: '/servicios',
    fields: ['nombre', 'precio', 'id_reserva'],
    fieldLabels: {
      nombre: 'Nombre',
      precio: 'Precio',
      id_reserva: 'ID reserva',
    },
    types: { nombre: 'text', precio: 'number', id_reserva: 'number' },
  },
};

function toInputValue(value) {
  return value === null || value === undefined ? '' : value;
}

function normalizePayload(form, config) {
  const payload = {};
  config.fields.forEach((field) => {
    const raw = form[field];
    if (raw === '') {
      payload[field] = '';
      return;
    }

    if (config.types[field] === 'number') {
      payload[field] = Number(raw);
    } else {
      payload[field] = raw;
    }
  });
  return payload;
}

export default function AdminPag() {
  const [activeEntity, setActiveEntity] = useState('clientes');
  const [data, setData] = useState(EMPTY_RESULTS);
  const [forms, setForms] = useState(EMPTY_FORMS);
  const [editingId, setEditingId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [lookupId, setLookupId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const activeConfig = useMemo(() => ENTITY_CONFIG[activeEntity], [activeEntity]);

  const handleAuthError = (err) => {
    const msg = err?.message || '';
    if (msg.includes('401')) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return true;
    }
    return false;
  };

  const fetchAll = async (entity = activeEntity) => {
    const config = ENTITY_CONFIG[entity];
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await api.get(config.endpoint);
      const items = res
      setData((prev) => ({ ...prev, [entity]: Array.isArray(items) ? items : [] }));
    } catch (err) {
      if (!handleAuthError(err)) {
        setError(`No se pudieron cargar ${config.label.toLowerCase()}.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchById = async () => {
    if (!lookupId) {
      setError('Escribe un ID para buscar.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await api.get(`${activeConfig.endpoint}/${lookupId}`);
      const item = res.data?.data ?? res.data ?? null;
      setSelectedItem(item);
    } catch (err) {
      if (!handleAuthError(err)) {
        setSelectedItem(null);
        setError('No se encontró el registro.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll(activeEntity);
    setSelectedItem(null);
    setEditingId(null);
    setLookupId('');
    setError('');
    setMessage('');
  }, [activeEntity]);

  const handleChange = (field, value) => {
    setForms((prev) => ({
      ...prev,
      [activeEntity]: {
        ...prev[activeEntity],
        [field]: value,
      },
    }));
  };

  const resetForm = () => {
    setForms((prev) => ({
      ...prev,
      [activeEntity]: EMPTY_FORMS[activeEntity],
    }));
    setEditingId(null);
  };

  const startEdit = (item) => {
    setEditingId(item.id ?? item.ID ?? item.Id ?? item.id_cliente ?? item.id_habitacion ?? item.id_reserva ?? item.id_pago ?? item.id_servicio ?? null);
    const next = {};
    activeConfig.fields.forEach((field) => {
      next[field] = toInputValue(item[field]);
    });
    setForms((prev) => ({
      ...prev,
      [activeEntity]: next,
    }));
    setMessage('');
    setError('');
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const payload = normalizePayload(forms[activeEntity], activeConfig);
      if (editingId) {
        await api.put(`${activeConfig.endpoint}/${editingId}`, payload);
        setMessage('Registro actualizado.');
      } else {
        await api.post(activeConfig.endpoint, payload);
        setMessage('Registro creado.');
      }
      resetForm();
      await fetchAll(activeEntity);
    } catch (err) {
      if (!handleAuthError(err)) {
        setError('No se pudo guardar el registro.');
      }
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (id) => {
    if (!window.confirm('¿Seguro que quieres eliminar este registro?')) return;

    setLoading(true);
    setError('');
    setMessage('');
    try {
      await api.delete(`${activeConfig.endpoint}/${id}`);
      setMessage('Registro eliminado.');
      await fetchAll(activeEntity);
      if (editingId === id) resetForm();
    } catch (err) {
      if (!handleAuthError(err)) {
        setError('No se pudo eliminar el registro.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field) => {
    const type = activeConfig.types[field] || 'text';
    const label = activeConfig.fieldLabels[field] || field;
    const value = forms[activeEntity][field];

    return (
      <label key={field} style={{ display: 'block', marginBottom: 10 }}>
        <div style={{ marginBottom: 4 }}>{label}</div>
        <input
          type={type}
          value={toInputValue(value)}
          onChange={(e) => handleChange(field, e.target.value)}
          style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
        />
      </label>
    );
  };

  const activeList = data[activeEntity] || [];

  return (
    <div style={{ padding: 16, maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ marginBottom: 12 }}>AdminPag</h1>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {Object.entries(ENTITY_CONFIG).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => setActiveEntity(key)}
            style={{
              padding: '8px 12px',
              border: '1px solid #ccc',
              background: key === activeEntity ? '#eaeaea' : 'white',
              cursor: 'pointer',
            }}
          >
            {cfg.label}
          </button>
        ))}
      </div>

      {error && <div style={{ marginBottom: 12, color: 'crimson' }}>{error}</div>}
      {message && <div style={{ marginBottom: 12, color: 'green' }}>{message}</div>}
      {loading && <div style={{ marginBottom: 12 }}>Cargando...</div>}

      <section style={{ border: '1px solid #ddd', padding: 16, marginBottom: 16 }}>
        <h2 style={{ marginTop: 0 }}>{activeConfig.label}</h2>

        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <button onClick={() => fetchAll(activeEntity)} style={{ padding: '8px 12px' }}>
            Refrescar lista
          </button>
          <input
            type="number"
            placeholder="Buscar por ID"
            value={lookupId}
            onChange={(e) => setLookupId(e.target.value)}
            style={{ padding: 8, width: 160 }}
          />
          <button onClick={fetchById} style={{ padding: '8px 12px' }}>
            Buscar
          </button>
        </div>

        {selectedItem && (
          <div style={{ marginBottom: 12, padding: 12, background: '#f7f7f7' }}>
            <strong>Resultado de búsqueda:</strong>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(selectedItem, null, 2)}</pre>
          </div>
        )}

        <form onSubmit={submitForm} style={{ marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            {activeConfig.fields.map(renderField)}
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button type="submit" style={{ padding: '8px 12px' }}>
              {editingId ? 'Actualizar' : 'Crear'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} style={{ padding: '8px 12px' }}>
                Cancelar edición
              </button>
            )}
          </div>
        </form>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>ID</th>
                {activeConfig.fields.map((field) => (
                  <th key={field} style={thStyle}>
                    {activeConfig.fieldLabels[field] || field}
                  </th>
                ))}
                <th style={thStyle}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {activeList.length > 0 ? (
                activeList.map((item, index) => {
                  const id = item.id ?? item.ID ?? item.Id ?? item.id_cliente ?? item.id_habitacion ?? item.id_reserva ?? item.id_pago ?? item.id_servicio ?? index;
                  return (
                    <tr key={id}>
                      <td style={tdStyle}>{id}</td>
                      {activeConfig.fields.map((field) => (
                        <td key={field} style={tdStyle}>
                          {item[field] ?? ''}
                        </td>
                      ))}
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <button type="button" onClick={() => startEdit(item)} style={{ padding: '6px 10px' }}>
                            Editar
                          </button>
                          <button type="button" onClick={() => removeItem(id)} style={{ padding: '6px 10px' }}>
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td style={tdStyle} colSpan={activeConfig.fields.length + 2}>
                    No hay registros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

const thStyle = {
  borderBottom: '1px solid #ccc',
  textAlign: 'left',
  padding: 8,
  fontWeight: 600,
  background: '#fafafa',
};

const tdStyle = {
  borderBottom: '1px solid #eee',
  padding: 8,
  verticalAlign: 'top',
};
