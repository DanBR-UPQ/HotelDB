import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

// Recepcionista: sin DELETE. Solo ver, buscar, crear y (opcional) editar.
// Entidades permitidas
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
    label: 'Asignar habitación',
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

const EMPTY_RESULTS = Object.fromEntries(Object.keys(ENTITY_CONFIG).map(k => [k, []]));
const EMPTY_FORMS = {
  clientes: { nombre: '', email: '', telefono: '', tipo_cliente: 'Normal' },
  reservas: { id_cliente: '', fecha_inicio: '', fecha_fin: '', num_personas: '', estado: 'Activa' },
  detalleReservas: { id_reserva: '', id_habitacion: '' },
  pagos: { id_reserva: '', monto: '', fecha_pago: '', metodo: '' },
  servicios: { nombre: '', precio: '', id_reserva: '' },
};

function toInputValue(v) {
  return v === null || v === undefined ? '' : v;
}

function normalizePayload(form, config) {
  const payload = {};
  config.fields.forEach((f) => {
    const raw = form[f];
    if (raw === '') return (payload[f] = '');
    payload[f] = config.types[f] === 'number' ? Number(raw) : raw;
  });
  return payload;
}

export default function RecepPag() {
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
    const cfg = ENTITY_CONFIG[entity];
    setLoading(true); setError(''); setMessage('');
    try {
      const res = await api.get(cfg.endpoint);
      const items = res; // ya viene como json
      setData(prev => ({ ...prev, [entity]: Array.isArray(items) ? items : [] }));
    } catch (err) {
      if (!handleAuthError(err)) setError(`No se pudieron cargar ${cfg.label.toLowerCase()}.`);
    } finally { setLoading(false); }
  };

  const fetchById = async () => {
    if (!lookupId) return setError('Escribe un ID.');
    setLoading(true); setError(''); setMessage('');
    try {
      const res = await api.get(`${activeConfig.endpoint}/${lookupId}`);
      const item = res;
      setSelectedItem(item);
    } catch (err) {
      if (!handleAuthError(err)) { setSelectedItem(null); setError('No encontrado.'); }
    } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchAll(activeEntity);
    setSelectedItem(null); setEditingId(null); setLookupId(''); setError(''); setMessage('');
  }, [activeEntity]);

  const handleChange = (f, v) => {
    setForms(prev => ({ ...prev, [activeEntity]: { ...prev[activeEntity], [f]: v } }));
  };

  const resetForm = () => {
    setForms(prev => ({ ...prev, [activeEntity]: EMPTY_FORMS[activeEntity] }));
    setEditingId(null);
  };

  const startEdit = (item) => {
    const id = item.id ?? item.ID ?? item.Id ?? item.id_cliente ?? item.id_reserva ?? item.id_pago ?? item.id_servicio ?? null;
    setEditingId(id);
    const next = {};
    activeConfig.fields.forEach(f => next[f] = toInputValue(item[f]));
    setForms(prev => ({ ...prev, [activeEntity]: next }));
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setMessage('');
    try {
      const payload = normalizePayload(forms[activeEntity], activeConfig);
      if (editingId) {
        await api.put(`${activeConfig.endpoint}/${editingId}`, payload);
        setMessage('Actualizado.');
      } else {
        await api.post(activeConfig.endpoint, payload);
        setMessage('Creado.');
      }
      resetForm();
      await fetchAll(activeEntity);
    } catch (err) {
      if (!handleAuthError(err)) setError('No se pudo guardar.');
    } finally { setLoading(false); }
  };

  const renderField = (f) => {
    const type = activeConfig.types[f] || 'text';
    const label = activeConfig.fieldLabels[f] || f;
    const value = forms[activeEntity][f];
    return (
      <label key={f} style={{ display: 'block', marginBottom: 10 }}>
        <div style={{ marginBottom: 4 }}>{label}</div>
        <input
          type={type}
          value={toInputValue(value)}
          onChange={(e) => handleChange(f, e.target.value)}
          style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
        />
      </label>
    );
  };

  const list = data[activeEntity] || [];

  return (
    <div style={{ padding: 16, maxWidth: 1100, margin: '0 auto' }}>
      <h1>RecepPag</h1>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {Object.entries(ENTITY_CONFIG).map(([k, cfg]) => (
          <button key={k} onClick={() => setActiveEntity(k)} style={{ padding: '8px 12px', border: '1px solid #ccc', background: k===activeEntity?'#eee':'#fff' }}>
            {cfg.label}
          </button>
        ))}
      </div>

      {error && <div style={{ color: 'crimson', marginBottom: 12 }}>{error}</div>}
      {message && <div style={{ color: 'green', marginBottom: 12 }}>{message}</div>}
      {loading && <div style={{ marginBottom: 12 }}>Cargando...</div>}

      <div style={{ marginBottom: 12 }}>
        <button onClick={() => fetchAll(activeEntity)} style={{ padding: '8px 12px', marginRight: 8 }}>Refrescar</button>
        <input type="number" placeholder="ID" value={lookupId} onChange={(e)=>setLookupId(e.target.value)} style={{ padding: 8, width: 140, marginRight: 8 }} />
        <button onClick={fetchById} style={{ padding: '8px 12px' }}>Buscar</button>
      </div>

      {selectedItem && (
        <pre style={{ background:'#f5f5f5', padding:12, marginBottom:12 }}>{JSON.stringify(selectedItem, null, 2)}</pre>
      )}

      <form onSubmit={submitForm} style={{ marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
          {activeConfig.fields.map(renderField)}
        </div>
        <div style={{ marginTop: 12 }}>
          <button type="submit" style={{ padding: '8px 12px', marginRight: 8 }}>{editingId ? 'Actualizar' : 'Crear'}</button>
          {editingId && <button type="button" onClick={resetForm} style={{ padding: '8px 12px' }}>Cancelar</button>}
        </div>
      </form>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={th}>ID</th>
            {activeConfig.fields.map(f => <th key={f} style={th}>{activeConfig.fieldLabels[f]||f}</th>)}
            <th style={th}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {list.length ? list.map((item, idx) => {
            const id = item.id ?? item.ID ?? item.Id ?? item.id_cliente ?? item.id_reserva ?? item.id_pago ?? item.id_servicio ?? idx;
            return (
              <tr key={id}>
                <td style={td}>{id}</td>
                {activeConfig.fields.map(f => <td key={f} style={td}>{item[f] ?? ''}</td>)}
                <td style={td}>
                  <button onClick={() => startEdit(item)} style={{ padding: '6px 10px' }}>Editar</button>
                </td>
              </tr>
            );
          }) : (
            <tr><td style={td} colSpan={activeConfig.fields.length+2}>Sin datos</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

const th = { borderBottom:'1px solid #ccc', textAlign:'left', padding:8, background:'#fafafa' };
const td = { borderBottom:'1px solid #eee', padding:8 };
