import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../services/api'; // ajusta la ruta si es necesario

// ─── Paleta y estilos base ────────────────────────────────────────────────────
const S = {
  shell: {
    display: 'flex', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif",
    background: '#F5F3EE', color: '#1A1915',
  },
  sidebar: {
    width: 220, flexShrink: 0, background: '#1A1915', color: '#F5F3EE',
    display: 'flex', flexDirection: 'column', padding: '0',
  },
  logo: {
    padding: '28px 20px 20px', borderBottom: '1px solid #2E2D28',
  },
  logoTitle: { fontSize: 17, fontWeight: 700, letterSpacing: '-0.3px', color: '#F5F3EE' },
  logoSub: { fontSize: 11, color: '#888580', marginTop: 2 },
  navItem: (active) => ({
    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px',
    fontSize: 13, cursor: 'pointer', color: active ? '#F5F3EE' : '#888580',
    background: active ? '#2E2D28' : 'transparent',
    borderLeft: active ? '2px solid #C9B896' : '2px solid transparent',
    transition: 'all 0.15s',
  }),
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' },
  topbar: {
    background: '#fff', borderBottom: '1px solid #E8E5DF',
    padding: '14px 28px', display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
  },
  pageTitle: { fontSize: 20, fontWeight: 700, letterSpacing: '-0.3px' },
  content: { padding: 28, flex: 1 },
  metrics: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 16, marginBottom: 24,
  },
  metricCard: {
    background: '#fff', border: '1px solid #E8E5DF', borderRadius: 12,
    padding: '16px 20px',
  },
  metricLabel: { fontSize: 12, color: '#888580', fontWeight: 500, marginBottom: 6 },
  metricValue: { fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px' },
  metricSub: { fontSize: 11, color: '#B0ADA8', marginTop: 4 },
  card: {
    background: '#fff', border: '1px solid #E8E5DF',
    borderRadius: 12, marginBottom: 20, overflow: 'hidden',
  },
  cardHeader: {
    padding: '14px 20px', borderBottom: '1px solid #E8E5DF',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  cardTitle: { fontSize: 13, fontWeight: 600, color: '#888580', textTransform: 'uppercase', letterSpacing: '0.5px' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: {
    padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600,
    color: '#B0ADA8', background: '#FAFAF8', borderBottom: '1px solid #E8E5DF',
    textTransform: 'uppercase', letterSpacing: '0.5px',
  },
  td: { padding: '11px 16px', borderBottom: '1px solid #F0EDE8', verticalAlign: 'middle' },
  btn: (variant = 'default') => ({
    padding: variant === 'sm' ? '5px 12px' : '8px 16px',
    fontSize: variant === 'sm' ? 12 : 13,
    fontWeight: 500, cursor: 'pointer', borderRadius: 8,
    border: variant === 'primary' ? 'none' : '1px solid #E8E5DF',
    background: variant === 'primary' ? '#1A1915' : '#fff',
    color: variant === 'primary' ? '#F5F3EE' : '#1A1915',
    transition: 'opacity 0.15s',
  }),
  btnDanger: {
    padding: '5px 12px', fontSize: 12, fontWeight: 500, cursor: 'pointer',
    borderRadius: 8, border: '1px solid #F5C4C4', background: '#FEF2F2',
    color: '#A32D2D', transition: 'opacity 0.15s',
  },
  input: {
    padding: '8px 12px', border: '1px solid #E8E5DF', borderRadius: 8,
    fontSize: 13, background: '#fff', color: '#1A1915', outline: 'none',
    fontFamily: "'DM Sans', sans-serif",
  },
  select: {
    padding: '8px 12px', border: '1px solid #E8E5DF', borderRadius: 8,
    fontSize: 13, background: '#fff', color: '#1A1915', outline: 'none',
    fontFamily: "'DM Sans', sans-serif",
  },
  formGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 14, padding: '16px 20px',
  },
  formGroup: { display: 'flex', flexDirection: 'column', gap: 5 },
  formLabel: { fontSize: 12, fontWeight: 600, color: '#888580' },
  modal: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  modalBox: {
    background: '#fff', borderRadius: 16, width: 560, maxWidth: '90vw',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  },
  modalHeader: {
    padding: '20px 24px 16px', borderBottom: '1px solid #E8E5DF',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  modalTitle: { fontSize: 16, fontWeight: 700 },
  modalFooter: {
    padding: '16px 24px', borderTop: '1px solid #E8E5DF',
    display: 'flex', justifyContent: 'flex-end', gap: 10,
  },
  tag: (color) => ({
    display: 'inline-flex', alignItems: 'center', padding: '3px 10px',
    borderRadius: 20, fontSize: 11, fontWeight: 600,
    ...colorMap[color] || colorMap.default,
  }),
  searchBar: {
    padding: '12px 20px', borderBottom: '1px solid #E8E5DF',
    display: 'flex', gap: 10, alignItems: 'center',
  },
  tabBar: {
    display: 'flex', gap: 0, borderBottom: '1px solid #E8E5DF',
    padding: '0 20px',
  },
  tab: (active) => ({
    padding: '12px 16px', fontSize: 13, cursor: 'pointer', fontWeight: 500,
    color: active ? '#1A1915' : '#B0ADA8',
    borderBottom: active ? '2px solid #1A1915' : '2px solid transparent',
    marginBottom: -1, transition: 'all 0.15s',
  }),
};

const colorMap = {
  Activa:       { background: '#E6F9F0', color: '#0F6E56' },
  Finalizada:   { background: '#EEF4FF', color: '#2D4EAA' },
  Cancelada:    { background: '#FEF2F2', color: '#A32D2D' },
  Disponible:   { background: '#F0FDF4', color: '#166534' },
  Ocupada:      { background: '#FFFBEB', color: '#854F0B' },
  Mantenimiento:{ background: '#FEF2F2', color: '#A32D2D' },
  VIP:          { background: '#F3F0FF', color: '#5B21B6' },
  Frecuente:    { background: '#EFF6FF', color: '#1E40AF' },
  Normal:       { background: '#F5F3EE', color: '#5F5E5A' },
  Individual:   { background: '#F5F3EE', color: '#44403C' },
  Doble:        { background: '#F0F9FF', color: '#0369A1' },
  Suite:        { background: '#FFF7ED', color: '#9A3412' },
  Efectivo:     { background: '#F0FDF4', color: '#166534' },
  Tarjeta:      { background: '#EFF6FF', color: '#1E40AF' },
  Transferencia:{ background: '#F3F0FF', color: '#5B21B6' },
  default:      { background: '#F5F3EE', color: '#5F5E5A' },
};

// ─── Componentes pequeños ─────────────────────────────────────────────────────
const Tag = ({ value }) => <span style={S.tag(value)}>{value}</span>;

const Metric = ({ label, value, sub, color }) => (
  <div style={S.metricCard}>
    <div style={S.metricLabel}>{label}</div>
    <div style={{ ...S.metricValue, color: color || '#1A1915' }}>{value}</div>
    {sub && <div style={S.metricSub}>{sub}</div>}
  </div>
);

const StatusMessage = ({ error, success, loading }) => (
  <>
    {loading && <div style={{ padding: '10px 20px', fontSize: 13, color: '#888580' }}>Cargando…</div>}
    {error   && <div style={{ padding: '10px 20px', fontSize: 13, color: '#A32D2D', background: '#FEF2F2', borderBottom: '1px solid #FECACA' }}>{error}</div>}
    {success && <div style={{ padding: '10px 20px', fontSize: 13, color: '#0F6E56', background: '#E6F9F0', borderBottom: '1px solid #6EE7B7' }}>{success}</div>}
  </>
);

// ─── Modal genérico ───────────────────────────────────────────────────────────
function Modal({ open, title, onClose, onSave, children }) {
  if (!open) return null;
  return (
    <div style={S.modal} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={S.modalBox}>
        <div style={S.modalHeader}>
          <span style={S.modalTitle}>{title}</span>
          <button style={{ ...S.btn('default'), padding: '4px 10px' }} onClick={onClose}>✕</button>
        </div>
        {children}
        <div style={S.modalFooter}>
          <button style={S.btn('default')} onClick={onClose}>Cancelar</button>
          <button style={S.btn('primary')} onClick={onSave}>Guardar</button>
        </div>
      </div>
    </div>
  );
}

// ─── Página: Dashboard ────────────────────────────────────────────────────────
function PageDashboard({ stats }) {
  const { totalClientes, totalHabs, habDisponibles, reservasActivas,
          totalIngresos, pagoPromedio } = stats;
  return (
    <div>
      <div style={S.metrics}>
        <Metric label="Clientes registrados"  value={totalClientes} sub="en el sistema" />
        <Metric label="Reservas activas"       value={reservasActivas} color="#0F6E56" sub="en curso" />
        <Metric label="Habitaciones disponibles" value={habDisponibles} sub={`de ${totalHabs} totales`} color="#1E40AF" />
        <Metric label="Ingresos totales"       value={`$${Number(totalIngresos || 0).toLocaleString('es-MX', {minimumFractionDigits:2})}`} color="#854F0B" />
        <Metric label="Pago promedio"          value={`$${Number(pagoPromedio || 0).toLocaleString('es-MX', {minimumFractionDigits:2})}`} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={S.card}>
          <div style={S.cardHeader}><span style={S.cardTitle}>Ocupación de habitaciones</span></div>
          <div style={{ padding: 20 }}>
            {[['Disponibles','Disponible','#166534'],['Ocupadas','Ocupada','#854F0B'],['Mantenimiento','Mantenimiento','#A32D2D']].map(([label, key, color]) => (
              <div key={key} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                  <span>{label}</span>
                  <span style={{ fontWeight: 600, color }}>{stats['habs_' + key] || 0}</span>
                </div>
                <div style={{ background: '#F0EDE8', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                  <div style={{ background: color, height: '100%', width: `${totalHabs ? ((stats['habs_' + key] || 0) / totalHabs) * 100 : 0}%`, borderRadius: 4, transition: 'width 0.5s' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={S.card}>
          <div style={S.cardHeader}><span style={S.cardTitle}>Reservas por estado</span></div>
          <div style={{ padding: 20 }}>
            {[['Activas','Activa','#0F6E56'],['Finalizadas','Finalizada','#2D4EAA'],['Canceladas','Cancelada','#A32D2D']].map(([label, key, color]) => (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F0EDE8' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                  <span style={{ fontSize: 13 }}>{label}</span>
                </div>
                <span style={{ fontWeight: 700, fontSize: 18, color }}>{stats['res_' + key] || 0}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Página: Clientes ─────────────────────────────────────────────────────────
function PageClientes({ onRefresh }) {
  const [data, setData]         = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [search, setSearch]     = useState('');
  const [modal, setModal]       = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState({ nombre:'', email:'', telefono:'', tipo_cliente:'Normal' });

  const load = async () => {
    setLoading(true); setError('');
    try { const r = await api.get('/clientes'); setData(Array.isArray(r) ? r : r.data || []); }
    catch { setError('No se pudieron cargar los clientes.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openNew  = () => { setEditing(null); setForm({ nombre:'', email:'', telefono:'', tipo_cliente:'Normal' }); setModal(true); };
  const openEdit = (c) => { setEditing(c.id_cliente); setForm({ nombre: c.nombre, email: c.email, telefono: c.telefono, tipo_cliente: c.tipo_cliente }); setModal(true); };

  const save = async () => {
    setLoading(true); setError('');
    try {
      if (editing) await api.put(`/clientes/${editing}`, form);
      else          await api.post('/clientes', form);
      setSuccess(editing ? 'Cliente actualizado.' : 'Cliente creado.');
      setModal(false); load(); onRefresh();
    } catch { setError('No se pudo guardar.'); }
    finally { setLoading(false); }
  };

  const remove = async (id) => {
    if (!window.confirm('¿Eliminar este cliente?')) return;
    try { await api.delete(`/clientes/${id}`); setSuccess('Cliente eliminado.'); load(); onRefresh(); }
    catch { setError('No se pudo eliminar.'); }
  };

  const filtered = useMemo(() =>
    data.filter(c => [c.nombre, c.email, c.telefono].join(' ').toLowerCase().includes(search.toLowerCase())),
    [data, search]
  );

  return (
    <div>
      <StatusMessage error={error} success={success} loading={loading} />
      <div style={S.card}>
        <div style={S.cardHeader}>
          <span style={S.cardTitle}>Clientes ({filtered.length})</span>
          <button style={S.btn('primary')} onClick={openNew}>+ Nuevo cliente</button>
        </div>
        <div style={S.searchBar}>
          <input style={{ ...S.input, flex: 1 }} placeholder="Buscar por nombre, email o teléfono…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <table style={S.table}>
          <thead>
            <tr>{['ID','Nombre','Email','Teléfono','Tipo','Acciones'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id_cliente}>
                <td style={{ ...S.td, color:'#B0ADA8', fontSize:12 }}>#{c.id_cliente}</td>
                <td style={{ ...S.td, fontWeight:500 }}>{c.nombre}</td>
                <td style={S.td}>{c.email}</td>
                <td style={S.td}>{c.telefono}</td>
                <td style={S.td}><Tag value={c.tipo_cliente} /></td>
                <td style={S.td}>
                  <div style={{ display:'flex', gap:8 }}>
                    <button style={S.btn('sm')} onClick={() => openEdit(c)}>Editar</button>
                    <button style={S.btnDanger} onClick={() => remove(c.id_cliente)}>Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
            {!filtered.length && <tr><td colSpan={6} style={{ ...S.td, textAlign:'center', color:'#B0ADA8', padding:32 }}>Sin resultados</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal open={modal} title={editing ? 'Editar cliente' : 'Nuevo cliente'} onClose={() => setModal(false)} onSave={save}>
        <div style={S.formGrid}>
          {[['nombre','Nombre','text'],['email','Email','email'],['telefono','Teléfono','text']].map(([k,l,t]) => (
            <div key={k} style={S.formGroup}>
              <label style={S.formLabel}>{l}</label>
              <input style={S.input} type={t} value={form[k]} onChange={e => setForm(p => ({...p,[k]:e.target.value}))} />
            </div>
          ))}
          <div style={S.formGroup}>
            <label style={S.formLabel}>Tipo de cliente</label>
            <select style={S.select} value={form.tipo_cliente} onChange={e => setForm(p => ({...p, tipo_cliente:e.target.value}))}>
              {['Normal','Frecuente','VIP'].map(v => <option key={v}>{v}</option>)}
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Página: Habitaciones ─────────────────────────────────────────────────────
function PageHabitaciones({ onRefresh }) {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [filtro, setFiltro]   = useState('Todas');
  const [modal, setModal]     = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm]       = useState({ tipo:'Individual', precio:'', capacidad:'', estado:'Disponible' });

  const load = async () => {
    setLoading(true); setError('');
    try { const r = await api.get('/habitaciones'); setData(Array.isArray(r) ? r : r.data || []); }
    catch { setError('No se pudieron cargar las habitaciones.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openNew  = () => { setEditing(null); setForm({ tipo:'Individual', precio:'', capacidad:'', estado:'Disponible' }); setModal(true); };
  const openEdit = (h) => { setEditing(h.id_habitacion); setForm({ tipo:h.tipo, precio:h.precio, capacidad:h.capacidad, estado:h.estado }); setModal(true); };

  const save = async () => {
    setLoading(true); setError('');
    try {
      const payload = { ...form, precio: Number(form.precio), capacidad: Number(form.capacidad) };
      if (editing) await api.put(`/habitaciones/${editing}`, payload);
      else          await api.post('/habitaciones', payload);
      setSuccess(editing ? 'Habitación actualizada.' : 'Habitación creada.');
      setModal(false); load(); onRefresh();
    } catch { setError('No se pudo guardar.'); }
    finally { setLoading(false); }
  };

  const remove = async (id) => {
    if (!window.confirm('¿Eliminar esta habitación?')) return;
    try { await api.delete(`/habitaciones/${id}`); setSuccess('Habitación eliminada.'); load(); onRefresh(); }
    catch { setError('No se puede eliminar: tiene reservas asociadas.'); }
  };

  const tabs = ['Todas','Disponible','Ocupada','Mantenimiento'];
  const filtered = filtro === 'Todas' ? data : data.filter(h => h.estado === filtro);

  return (
    <div>
      <StatusMessage error={error} success={success} loading={loading} />
      <div style={S.card}>
        <div style={S.cardHeader}>
          <span style={S.cardTitle}>Habitaciones</span>
          <button style={S.btn('primary')} onClick={openNew}>+ Nueva habitación</button>
        </div>
        <div style={S.tabBar}>
          {tabs.map(t => <div key={t} style={S.tab(filtro===t)} onClick={() => setFiltro(t)}>{t}</div>)}
        </div>
        <table style={S.table}>
          <thead>
            <tr>{['ID','Tipo','Precio/noche','Capacidad','Estado','Acciones'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.map(h => (
              <tr key={h.id_habitacion}>
                <td style={{ ...S.td, color:'#B0ADA8', fontSize:12 }}>#{h.id_habitacion}</td>
                <td style={S.td}><Tag value={h.tipo} /></td>
                <td style={{ ...S.td, fontWeight:600 }}>${Number(h.precio).toLocaleString('es-MX', {minimumFractionDigits:2})}</td>
                <td style={S.td}>{h.capacidad} pers.</td>
                <td style={S.td}><Tag value={h.estado} /></td>
                <td style={S.td}>
                  <div style={{ display:'flex', gap:8 }}>
                    <button style={S.btn('sm')} onClick={() => openEdit(h)}>Editar</button>
                    <button style={S.btnDanger} onClick={() => remove(h.id_habitacion)}>Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
            {!filtered.length && <tr><td colSpan={6} style={{ ...S.td, textAlign:'center', color:'#B0ADA8', padding:32 }}>Sin resultados</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal open={modal} title={editing ? 'Editar habitación' : 'Nueva habitación'} onClose={() => setModal(false)} onSave={save}>
        <div style={S.formGrid}>
          <div style={S.formGroup}>
            <label style={S.formLabel}>Tipo</label>
            <select style={S.select} value={form.tipo} onChange={e => setForm(p => ({...p,tipo:e.target.value}))}>
              {['Individual','Doble','Suite'].map(v => <option key={v}>{v}</option>)}
            </select>
          </div>
          <div style={S.formGroup}>
            <label style={S.formLabel}>Precio por noche</label>
            <input style={S.input} type="number" value={form.precio} onChange={e => setForm(p => ({...p,precio:e.target.value}))} />
          </div>
          <div style={S.formGroup}>
            <label style={S.formLabel}>Capacidad (personas)</label>
            <input style={S.input} type="number" value={form.capacidad} onChange={e => setForm(p => ({...p,capacidad:e.target.value}))} />
          </div>
          <div style={S.formGroup}>
            <label style={S.formLabel}>Estado</label>
            <select style={S.select} value={form.estado} onChange={e => setForm(p => ({...p,estado:e.target.value}))}>
              {['Disponible','Ocupada','Mantenimiento'].map(v => <option key={v}>{v}</option>)}
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Página: Reservas ─────────────────────────────────────────────────────────
function PageReservas({ onRefresh }) {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [filtro, setFiltro]   = useState('Todas');
  const [modal, setModal]     = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm]       = useState({ id_cliente:'', fecha_inicio:'', fecha_fin:'', num_personas:'', estado:'Activa' });

  const load = async () => {
    setLoading(true); setError('');
    try { const r = await api.get('/reservas'); setData(Array.isArray(r) ? r : r.data || []); }
    catch { setError('No se pudieron cargar las reservas.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openNew  = () => { setEditing(null); setForm({ id_cliente:'', fecha_inicio:'', fecha_fin:'', num_personas:'', estado:'Activa' }); setModal(true); };
  const openEdit = (r) => { setEditing(r.id_reserva); setForm({ id_cliente:r.id_cliente, fecha_inicio:r.fecha_inicio?.slice(0,10), fecha_fin:r.fecha_fin?.slice(0,10), num_personas:r.num_personas, estado:r.estado }); setModal(true); };

  const save = async () => {
    setLoading(true); setError('');
    try {
      const payload = { ...form, id_cliente: Number(form.id_cliente), num_personas: Number(form.num_personas) };
      if (editing) await api.put(`/reservas/${editing}`, payload);
      else          await api.post('/reservas', payload);
      setSuccess(editing ? 'Reserva actualizada.' : 'Reserva creada.');
      setModal(false); load(); onRefresh();
    } catch { setError('No se pudo guardar.'); }
    finally { setLoading(false); }
  };

  const remove = async (id) => {
    if (!window.confirm('¿Eliminar esta reserva? Se eliminarán también los detalles y servicios asociados.')) return;
    try { await api.delete(`/reservas/${id}`); setSuccess('Reserva eliminada.'); load(); onRefresh(); }
    catch { setError('No se puede eliminar: tiene pagos registrados.'); }
  };

  const tabs = ['Todas','Activa','Finalizada','Cancelada'];
  const filtered = filtro === 'Todas' ? data : data.filter(r => r.estado === filtro);

  return (
    <div>
      <StatusMessage error={error} success={success} loading={loading} />
      <div style={S.card}>
        <div style={S.cardHeader}>
          <span style={S.cardTitle}>Reservas</span>
          <button style={S.btn('primary')} onClick={openNew}>+ Nueva reserva</button>
        </div>
        <div style={S.tabBar}>
          {tabs.map(t => <div key={t} style={S.tab(filtro===t)} onClick={() => setFiltro(t)}>{t}</div>)}
        </div>
        <table style={S.table}>
          <thead>
            <tr>{['ID','Cliente','Entrada','Salida','Personas','Estado','Acciones'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id_reserva}>
                <td style={{ ...S.td, color:'#B0ADA8', fontSize:12 }}>#{r.id_reserva}</td>
                <td style={{ ...S.td, fontWeight:500 }}>{r.nombre || `Cliente #${r.id_cliente}`}</td>
                <td style={S.td}>{r.fecha_inicio?.slice(0,10)}</td>
                <td style={S.td}>{r.fecha_fin?.slice(0,10)}</td>
                <td style={{ ...S.td, textAlign:'center' }}>{r.num_personas}</td>
                <td style={S.td}><Tag value={r.estado} /></td>
                <td style={S.td}>
                  <div style={{ display:'flex', gap:8 }}>
                    <button style={S.btn('sm')} onClick={() => openEdit(r)}>Editar</button>
                    <button style={S.btnDanger} onClick={() => remove(r.id_reserva)}>Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
            {!filtered.length && <tr><td colSpan={7} style={{ ...S.td, textAlign:'center', color:'#B0ADA8', padding:32 }}>Sin resultados</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal open={modal} title={editing ? 'Editar reserva' : 'Nueva reserva'} onClose={() => setModal(false)} onSave={save}>
        <div style={S.formGrid}>
          <div style={S.formGroup}><label style={S.formLabel}>ID Cliente</label><input style={S.input} type="number" value={form.id_cliente} onChange={e => setForm(p => ({...p,id_cliente:e.target.value}))} /></div>
          <div style={S.formGroup}><label style={S.formLabel}>Fecha entrada</label><input style={S.input} type="date" value={form.fecha_inicio} onChange={e => setForm(p => ({...p,fecha_inicio:e.target.value}))} /></div>
          <div style={S.formGroup}><label style={S.formLabel}>Fecha salida</label><input style={S.input} type="date" value={form.fecha_fin} onChange={e => setForm(p => ({...p,fecha_fin:e.target.value}))} /></div>
          <div style={S.formGroup}><label style={S.formLabel}>Núm. personas</label><input style={S.input} type="number" value={form.num_personas} onChange={e => setForm(p => ({...p,num_personas:e.target.value}))} /></div>
          <div style={S.formGroup}>
            <label style={S.formLabel}>Estado</label>
            <select style={S.select} value={form.estado} onChange={e => setForm(p => ({...p,estado:e.target.value}))}>
              {['Activa','Finalizada','Cancelada'].map(v => <option key={v}>{v}</option>)}
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Página: Pagos ────────────────────────────────────────────────────────────
function PagePagos({ onRefresh }) {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [modal, setModal]     = useState(false);
  const [form, setForm]       = useState({ id_reserva:'', monto:'', fecha_pago:'', metodo:'Efectivo' });

  const load = async () => {
    setLoading(true); setError('');
    try { const r = await api.get('/pagos'); setData(Array.isArray(r) ? r : r.data || []); }
    catch { setError('No se pudieron cargar los pagos.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    setLoading(true); setError('');
    try {
      await api.post('/pagos', { ...form, id_reserva: Number(form.id_reserva), monto: Number(form.monto) });
      setSuccess('Pago registrado.');
      setModal(false); load(); onRefresh();
    } catch { setError('No se pudo registrar el pago.'); }
    finally { setLoading(false); }
  };

  const total   = data.reduce((s,p) => s + Number(p.monto || 0), 0);
  const promedio = data.length ? total / data.length : 0;
  const maximo  = data.length ? Math.max(...data.map(p => Number(p.monto || 0))) : 0;

  return (
    <div>
      <StatusMessage error={error} success={success} loading={loading} />
      <div style={S.metrics}>
        <Metric label="Total ingresado"  value={`$${total.toLocaleString('es-MX', {minimumFractionDigits:2})}`} color="#0F6E56" />
        <Metric label="Pago promedio"    value={`$${promedio.toLocaleString('es-MX', {minimumFractionDigits:2})}`} />
        <Metric label="Pago máximo"      value={`$${maximo.toLocaleString('es-MX', {minimumFractionDigits:2})}`} />
        <Metric label="Pagos registrados" value={data.length} />
      </div>
      <div style={S.card}>
        <div style={S.cardHeader}>
          <span style={S.cardTitle}>Historial de pagos</span>
          <button style={S.btn('primary')} onClick={() => { setForm({ id_reserva:'', monto:'', fecha_pago:'', metodo:'Efectivo' }); setModal(true); }}>+ Registrar pago</button>
        </div>
        <table style={S.table}>
          <thead>
            <tr>{['ID','Reserva','Monto','Fecha','Método'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {data.map(p => (
              <tr key={p.id_pago}>
                <td style={{ ...S.td, color:'#B0ADA8', fontSize:12 }}>#{p.id_pago}</td>
                <td style={S.td}>Reserva #{p.id_reserva}</td>
                <td style={{ ...S.td, fontWeight:700, color:'#0F6E56' }}>${Number(p.monto).toLocaleString('es-MX', {minimumFractionDigits:2})}</td>
                <td style={S.td}>{p.fecha_pago?.slice(0,10)}</td>
                <td style={S.td}><Tag value={p.metodo} /></td>
              </tr>
            ))}
            {!data.length && <tr><td colSpan={5} style={{ ...S.td, textAlign:'center', color:'#B0ADA8', padding:32 }}>Sin pagos registrados</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal open={modal} title="Registrar pago" onClose={() => setModal(false)} onSave={save}>
        <div style={S.formGrid}>
          <div style={S.formGroup}><label style={S.formLabel}>ID Reserva</label><input style={S.input} type="number" value={form.id_reserva} onChange={e => setForm(p => ({...p,id_reserva:e.target.value}))} /></div>
          <div style={S.formGroup}><label style={S.formLabel}>Monto</label><input style={S.input} type="number" value={form.monto} onChange={e => setForm(p => ({...p,monto:e.target.value}))} /></div>
          <div style={S.formGroup}><label style={S.formLabel}>Fecha de pago</label><input style={S.input} type="date" value={form.fecha_pago} onChange={e => setForm(p => ({...p,fecha_pago:e.target.value}))} /></div>
          <div style={S.formGroup}>
            <label style={S.formLabel}>Método</label>
            <select style={S.select} value={form.metodo} onChange={e => setForm(p => ({...p,metodo:e.target.value}))}>
              {['Efectivo','Tarjeta','Transferencia'].map(v => <option key={v}>{v}</option>)}
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Página: Servicios ────────────────────────────────────────────────────────
function PageServicios({ onRefresh }) {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [modal, setModal]     = useState(false);
  const [form, setForm]       = useState({ nombre:'', precio:'', id_reserva:'' });

  const load = async () => {
    setLoading(true); setError('');
    try { const r = await api.get('/servicios'); setData(Array.isArray(r) ? r : r.data || []); }
    catch { setError('No se pudieron cargar los servicios.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    setLoading(true); setError('');
    try {
      await api.post('/servicios', { ...form, precio: Number(form.precio), id_reserva: Number(form.id_reserva) });
      setSuccess('Servicio agregado.'); setModal(false); load(); onRefresh();
    } catch { setError('No se pudo guardar.'); }
    finally { setLoading(false); }
  };

  const remove = async (id) => {
    if (!window.confirm('¿Eliminar este servicio?')) return;
    try { await api.delete(`/servicios/${id}`); setSuccess('Servicio eliminado.'); load(); onRefresh(); }
    catch { setError('No se pudo eliminar.'); }
  };

  return (
    <div>
      <StatusMessage error={error} success={success} loading={loading} />
      <div style={S.card}>
        <div style={S.cardHeader}>
          <span style={S.cardTitle}>Servicios adicionales</span>
          <button style={S.btn('primary')} onClick={() => { setForm({ nombre:'', precio:'', id_reserva:'' }); setModal(true); }}>+ Agregar servicio</button>
        </div>
        <table style={S.table}>
          <thead>
            <tr>{['ID','Nombre','Precio','Reserva','Acciones'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {data.map(s => (
              <tr key={s.id_servicio}>
                <td style={{ ...S.td, color:'#B0ADA8', fontSize:12 }}>#{s.id_servicio}</td>
                <td style={{ ...S.td, fontWeight:500 }}>{s.nombre}</td>
                <td style={{ ...S.td, fontWeight:600 }}>${Number(s.precio).toLocaleString('es-MX', {minimumFractionDigits:2})}</td>
                <td style={S.td}>Reserva #{s.id_reserva}</td>
                <td style={S.td}><button style={S.btnDanger} onClick={() => remove(s.id_servicio)}>Eliminar</button></td>
              </tr>
            ))}
            {!data.length && <tr><td colSpan={5} style={{ ...S.td, textAlign:'center', color:'#B0ADA8', padding:32 }}>Sin servicios registrados</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal open={modal} title="Agregar servicio" onClose={() => setModal(false)} onSave={save}>
        <div style={S.formGrid}>
          <div style={S.formGroup}>
            <label style={S.formLabel}>Nombre del servicio</label>
            <input style={S.input} type="text" placeholder="Spa, Tour, Desayuno…" value={form.nombre} onChange={e => setForm(p => ({...p,nombre:e.target.value}))} />
          </div>
          <div style={S.formGroup}>
            <label style={S.formLabel}>Precio</label>
            <input style={S.input} type="number" value={form.precio} onChange={e => setForm(p => ({...p,precio:e.target.value}))} />
          </div>
          <div style={S.formGroup}>
            <label style={S.formLabel}>ID de reserva</label>
            <input style={S.input} type="number" value={form.id_reserva} onChange={e => setForm(p => ({...p,id_reserva:e.target.value}))} />
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Página: Detalle Reservas ─────────────────────────────────────────────────
function PageDetalleReservas() {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [modal, setModal]     = useState(false);
  const [form, setForm]       = useState({ id_reserva:'', id_habitacion:'' });

  const load = async () => {
    setLoading(true); setError('');
    try { const r = await api.get('/detalle-reservas'); setData(Array.isArray(r) ? r : r.data || []); }
    catch { setError('No se pudieron cargar los detalles.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    setLoading(true); setError('');
    try {
      await api.post('/detalle-reservas', { id_reserva: Number(form.id_reserva), id_habitacion: Number(form.id_habitacion) });
      setSuccess('Detalle agregado.'); setModal(false); load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Error: posible traslape de fechas o sobreocupación.');
    }
    finally { setLoading(false); }
  };

  const remove = async (id) => {
    if (!window.confirm('¿Eliminar esta asignación?')) return;
    try { await api.delete(`/detalle-reservas/${id}`); setSuccess('Asignación eliminada.'); load(); }
    catch { setError('No se pudo eliminar.'); }
  };

  return (
    <div>
      <StatusMessage error={error} success={success} loading={loading} />
      <div style={S.card}>
        <div style={S.cardHeader}>
          <span style={S.cardTitle}>Asignación de habitaciones</span>
          <button style={S.btn('primary')} onClick={() => { setForm({ id_reserva:'', id_habitacion:'' }); setModal(true); }}>+ Asignar habitación</button>
        </div>
        <table style={S.table}>
          <thead>
            <tr>{['ID','Reserva','Habitación','Acciones'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {data.map(d => (
              <tr key={d.id_detalle}>
                <td style={{ ...S.td, color:'#B0ADA8', fontSize:12 }}>#{d.id_detalle}</td>
                <td style={S.td}>Reserva #{d.id_reserva}</td>
                <td style={S.td}>Habitación #{d.id_habitacion}</td>
                <td style={S.td}><button style={S.btnDanger} onClick={() => remove(d.id_detalle)}>Eliminar</button></td>
              </tr>
            ))}
            {!data.length && <tr><td colSpan={4} style={{ ...S.td, textAlign:'center', color:'#B0ADA8', padding:32 }}>Sin asignaciones</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal open={modal} title="Asignar habitación a reserva" onClose={() => setModal(false)} onSave={save}>
        <div style={S.formGrid}>
          <div style={S.formGroup}><label style={S.formLabel}>ID Reserva</label><input style={S.input} type="number" value={form.id_reserva} onChange={e => setForm(p => ({...p,id_reserva:e.target.value}))} /></div>
          <div style={S.formGroup}><label style={S.formLabel}>ID Habitación</label><input style={S.input} type="number" value={form.id_habitacion} onChange={e => setForm(p => ({...p,id_habitacion:e.target.value}))} /></div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Nav config ───────────────────────────────────────────────────────────────
const NAV = [
  { key: 'dashboard',      label: 'Dashboard',         icon: '▦' },
  { key: 'clientes',       label: 'Clientes',           icon: '◉' },
  { key: 'habitaciones',   label: 'Habitaciones',       icon: '⬜' },
  { key: 'reservas',       label: 'Reservas',           icon: '📋' },
  { key: 'pagos',          label: 'Pagos',              icon: '$' },
  { key: 'servicios',      label: 'Servicios',          icon: '✦' },
  { key: 'detalle',        label: 'Asignaciones',       icon: '⇌' },
];

const PAGE_TITLES = {
  dashboard: 'Resumen general', clientes: 'Clientes', habitaciones: 'Habitaciones',
  reservas: 'Reservas', pagos: 'Pagos', servicios: 'Servicios adicionales', detalle: 'Asignación de habitaciones',
};

// ─── Componente principal ─────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [page, setPage]     = useState('dashboard');
  const [stats, setStats]   = useState({
    totalClientes:0, totalHabs:0, habDisponibles:0,
    reservasActivas:0, totalIngresos:0, pagoPromedio:0,
    habs_Disponible:0, habs_Ocupada:0, habs_Mantenimiento:0,
    res_Activa:0, res_Finalizada:0, res_Cancelada:0,
  });

  const loadStats = async () => {
    try {
      const [clientes, habs, reservas, pagos] = await Promise.all([
        api.get('/clientes').catch(() => []),
        api.get('/habitaciones').catch(() => []),
        api.get('/reservas').catch(() => []),
        api.get('/pagos').catch(() => []),
      ]);
      const c = Array.isArray(clientes) ? clientes : clientes.data || [];
      const h = Array.isArray(habs)     ? habs     : habs.data     || [];
      const r = Array.isArray(reservas) ? reservas : reservas.data || [];
      const p = Array.isArray(pagos)    ? pagos    : pagos.data    || [];
      const totalIngresos = p.reduce((s, x) => s + Number(x.monto || 0), 0);
      setStats({
        totalClientes:   c.length,
        totalHabs:       h.length,
        habDisponibles:  h.filter(x => x.estado === 'Disponible').length,
        reservasActivas: r.filter(x => x.estado === 'Activa').length,
        totalIngresos,
        pagoPromedio:    p.length ? totalIngresos / p.length : 0,
        habs_Disponible:    h.filter(x => x.estado === 'Disponible').length,
        habs_Ocupada:       h.filter(x => x.estado === 'Ocupada').length,
        habs_Mantenimiento: h.filter(x => x.estado === 'Mantenimiento').length,
        res_Activa:      r.filter(x => x.estado === 'Activa').length,
        res_Finalizada:  r.filter(x => x.estado === 'Finalizada').length,
        res_Cancelada:   r.filter(x => x.estado === 'Cancelada').length,
      });
    } catch {}
  };

  useEffect(() => { loadStats(); }, []);

  return (
    <>
      {/* Google Font */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div style={S.shell}>
        {/* Sidebar */}
        <aside style={S.sidebar}>
          <div style={S.logo}>
            <div style={S.logoTitle}>Hotel Palacio</div>
            <div style={S.logoSub}>Panel de administración</div>
          </div>
          <nav style={{ flex:1, paddingTop:8 }}>
            {NAV.map(n => (
              <div key={n.key} style={S.navItem(page===n.key)} onClick={() => setPage(n.key)}>
                <span style={{ fontSize:14, width:18, textAlign:'center' }}>{n.icon}</span>
                {n.label}
              </div>
            ))}
          </nav>
          <div style={{ padding:'16px 20px', borderTop:'1px solid #2E2D28' }}>
            <div style={{ fontSize:11, color:'#888580' }}>Conectado como</div>
            <div style={{ fontSize:13, fontWeight:600, color:'#F5F3EE', marginTop:2 }}>Administrador</div>
          </div>
        </aside>

        {/* Main */}
        <div style={S.main}>
          <div style={S.topbar}>
            <h1 style={{ ...S.pageTitle, margin:0 }}>{PAGE_TITLES[page]}</h1>
            <div style={{ fontSize:12, color:'#B0ADA8' }}>
              {new Date().toLocaleDateString('es-MX', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
            </div>
          </div>
          <div style={S.content}>
            {page === 'dashboard'    && <PageDashboard stats={stats} />}
            {page === 'clientes'     && <PageClientes onRefresh={loadStats} />}
            {page === 'habitaciones' && <PageHabitaciones onRefresh={loadStats} />}
            {page === 'reservas'     && <PageReservas onRefresh={loadStats} />}
            {page === 'pagos'        && <PagePagos onRefresh={loadStats} />}
            {page === 'servicios'    && <PageServicios onRefresh={loadStats} />}
            {page === 'detalle'      && <PageDetalleReservas />}
          </div>
        </div>
      </div>
    </>
  );
}