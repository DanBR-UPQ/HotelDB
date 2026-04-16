import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

const ENTITY_CONFIG = {
  clientes: {
    label: 'Clientes',
    endpoint: '/clientes',
    fields: ['nombre', 'email', 'telefono', 'tipo_cliente'],
    fieldLabels: { nombre: 'Nombre', email: 'Email', telefono: 'Teléfono', tipo_cliente: 'Tipo cliente' },
  },
  habitaciones: {
    label: 'Habitaciones',
    endpoint: '/habitaciones',
    fields: ['tipo', 'precio', 'capacidad', 'estado'],
    fieldLabels: { tipo: 'Tipo', precio: 'Precio', capacidad: 'Capacidad', estado: 'Estado' },
  },
  reservas: {
    label: 'Reservas',
    endpoint: '/reservas',
    fields: ['id_cliente', 'fecha_inicio', 'fecha_fin', 'num_personas', 'estado'],
    fieldLabels: { id_cliente: 'ID cliente', fecha_inicio: 'Inicio', fecha_fin: 'Fin', num_personas: 'Personas', estado: 'Estado' },
  },
  pagos: {
    label: 'Pagos',
    endpoint: '/pagos',
    fields: ['id_reserva', 'monto', 'fecha_pago', 'metodo'],
    fieldLabels: { id_reserva: 'ID reserva', monto: 'Monto', fecha_pago: 'Fecha', metodo: 'Método' },
  },
  servicios: {
    label: 'Servicios',
    endpoint: '/servicios',
    fields: ['nombre', 'precio', 'id_reserva'],
    fieldLabels: { nombre: 'Nombre', precio: 'Precio', id_reserva: 'ID reserva' },
  },
};

const EMPTY_RESULTS = Object.fromEntries(Object.keys(ENTITY_CONFIG).map(k => [k, []]));

export default function UsuarioPag() {
  const [activeEntity, setActiveEntity] = useState('habitaciones');
  const [data, setData] = useState(EMPTY_RESULTS);
  const [selectedItem, setSelectedItem] = useState(null);
  const [lookupId, setLookupId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const activeConfig = useMemo(() => ENTITY_CONFIG[activeEntity], [activeEntity]);

  const handleAuthError = (err) => {
    if ((err?.message || '').includes('401')) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return true;
    }
    return false;
  };

  const fetchAll = async (entity = activeEntity) => {
    const cfg = ENTITY_CONFIG[entity];
    setLoading(true); setError('');
    try {
      const res = await api.get(cfg.endpoint);
      setData(prev => ({ ...prev, [entity]: Array.isArray(res) ? res : [] }));
    } catch (err) {
      if (!handleAuthError(err)) setError(`No se pudieron cargar ${cfg.label.toLowerCase()}.`);
    } finally { setLoading(false); }
  };

  const fetchById = async () => {
    if (!lookupId) return setError('Escribe un ID.');
    setLoading(true); setError('');
    try {
      const res = await api.get(`${activeConfig.endpoint}/${lookupId}`);
      setSelectedItem(res);
    } catch (err) {
      if (!handleAuthError(err)) { setSelectedItem(null); setError('No encontrado.'); }
    } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchAll(activeEntity);
    setSelectedItem(null);
    setLookupId('');
    setError('');
  }, [activeEntity]);

  const list = data[activeEntity] || [];

  return (
    <div style={{ padding: 16, maxWidth: 1100, margin: '0 auto' }}>
      <h1>Consulta de registros</h1>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {Object.entries(ENTITY_CONFIG).map(([k, cfg]) => (
          <button key={k} onClick={() => setActiveEntity(k)}
            style={{ padding: '8px 12px', border: '1px solid #ccc', background: k === activeEntity ? '#eee' : '#fff', cursor: 'pointer' }}>
            {cfg.label}
          </button>
        ))}
      </div>

      {error && <div style={{ color: 'crimson', marginBottom: 12 }}>{error}</div>}
      {loading && <div style={{ marginBottom: 12 }}>Cargando...</div>}

      <div style={{ marginBottom: 12 }}>
        <button onClick={() => fetchAll(activeEntity)} style={{ padding: '8px 12px', marginRight: 8 }}>Refrescar</button>
        <input type="number" placeholder="Buscar por ID" value={lookupId}
          onChange={(e) => setLookupId(e.target.value)}
          style={{ padding: 8, width: 140, marginRight: 8 }} />
        <button onClick={fetchById} style={{ padding: '8px 12px' }}>Buscar</button>
      </div>

      {selectedItem && (
        <pre style={{ background: '#f5f5f5', padding: 12, marginBottom: 12, borderRadius: 4 }}>
          {JSON.stringify(selectedItem, null, 2)}
        </pre>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={th}>ID</th>
            {activeConfig.fields.map(f => <th key={f} style={th}>{activeConfig.fieldLabels[f] || f}</th>)}
          </tr>
        </thead>
        <tbody>
          {list.length ? list.map((item, idx) => {
            const id = item.id ?? item.ID ?? item.id_cliente ?? item.id_habitacion ?? item.id_reserva ?? item.id_pago ?? item.id_servicio ?? idx;
            return (
              <tr key={id}>
                <td style={td}>{id}</td>
                {activeConfig.fields.map(f => <td key={f} style={td}>{item[f] ?? ''}</td>)}
              </tr>
            );
          }) : (
            <tr><td style={td} colSpan={activeConfig.fields.length + 1}>Sin datos</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

const th = { borderBottom: '1px solid #ccc', textAlign: 'left', padding: 8, background: '#fafafa' };
const td = { borderBottom: '1px solid #eee', padding: 8 };