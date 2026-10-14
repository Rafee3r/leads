'use client';
import { useEffect, useMemo, useState } from 'react';
import { supabaseBrowser, ETAPAS, horasSinEstado, soloDigitos } from '../lib/supabase';

export default function Home() {
  const sb = supabaseBrowser();
  const [leads, setLeads] = useState([]);
  const [sel, setSel] = useState(null);
  const [filtro, setFiltro] = useState('Todos');
  const [cargando, setCargando] = useState(true);

  async function cargar() {
    const { data: ses } = await sb.auth.getSession();
    if (!ses.session) { window.location.href = '/login'; return; }
    const { data, error } = await sb.from('leads').select('*').order('estado_actualizado_at', { ascending: true });
    if (!error) setLeads(data || []);
    setCargando(false);
  }

  useEffect(() => {
    cargar();
    const t = setInterval(cargar, 60000);
    return () => clearInterval(t);
    // eslint-disable-next-line
  }, []);

  async function actualizar(id, cambios) {
    const { data, error } = await sb.from('leads').update(cambios).eq('id', id).select().single();
    if (!error && data) {
      setLeads((ls) => ls.map((l) => (l.id === id ? data : l)));
    }
  }

  const visibles = useMemo(() => {
    const base = filtro === 'Todos' ? leads : leads.filter((l) => l.etapa === filtro);
    // Primero los que llevan mas horas sin estado (solo los abiertos)
    return [...base].sort((a, b) => horasSinEstado(b) - horasSinEstado(a));
  }, [leads, filtro]);

  const lead = leads.find((l) => l.id === sel);

  async function salir() {
    await sb.auth.signOut();
    window.location.href = '/login';
  }

  return (
    <div className="wrap">
      <div className="top">
        <h1>Leads ({visibles.length})</h1>
        <button className="btn" onClick={salir}>Salir</button>
      </div>

      <div className="filters">
        {['Todos', ...ETAPAS].map((e) => (
          <span key={e} className={'chip' + (filtro === e ? ' on' : '')} onClick={() => setFiltro(e)}>{e}</span>
        ))}
      </div>

      <div className="layout">
        <div className="list">
          {cargando && <small>Cargando…</small>}
          {!cargando && visibles.length === 0 && <small>No hay leads en esta vista.</small>}
          {visibles.map((l) => {
            const h = horasSinEstado(l);
            const abierto = l.etapa === 'Registrado' || l.etapa === 'Volver a llamar';
            return (
              <div key={l.id} className={'row' + (sel === l.id ? ' sel' : '')} onClick={() => setSel(l.id)}>
                <div>
                  <b>{l.nombre || 'Sin nombre'}</b>
                  <small>{l.etapa} · {l.isapre_actual || 'isapre —'}</small>
                </div>
                <span className={'badge' + (abierto && h >= 24 ? ' warn' : '')}>{abierto ? `${h} h` : l.etapa}</span>
              </div>
            );
          })}
        </div>

        {lead && <Tarjeta lead={lead} onChange={(c) => actualizar(lead.id, c)} />}
      </div>
    </div>
  );
}

function Tarjeta({ lead, onChange }) {
  const h = horasSinEstado(lead);
  const tel = soloDigitos(lead.telefono);
  const nuevo = lead.etapa === 'Registrado';
  return (
    <div className="card">
      <h2>{lead.nombre || 'Sin nombre'}</h2>
      <div className="sub">{nuevo ? 'Sin contacto' : lead.etapa}</div>

      <label>Etapa</label>
      <select value={lead.etapa} onChange={(e) => onChange({ etapa: e.target.value })}>
        {ETAPAS.map((e) => <option key={e}>{e}</option>)}
      </select>

      {nuevo && h >= 1 && (
        <div className="alert">⏱ <b>{h} h sin estado.</b> Marca el contacto o el resultado.</div>
      )}

      <div className="grid3">
        <div><span>Edad</span><b>{lead.edad || '—'}</b></div>
        <div><span>Renta</span><b>{lead.renta || '—'}</b></div>
        <div><span>Cargas</span><b>{lead.cargas || '—'}</b></div>
        <div><span>Isapre</span><b>{lead.isapre_actual || '—'}</b></div>
        <div><span>Comuna</span><b>{lead.comuna || '—'}</b></div>
        <div><span>Entregado</span><b>{lead.fecha_lead ? new Date(lead.fecha_lead).toLocaleString('es-CL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'}</b></div>
      </div>

      {lead.horario_llamada && <div className="when">Quiere que lo llamen: {lead.horario_llamada}</div>}

      <div className="btns">
        <a className="btn gold" href={`tel:+${tel}`}>📞 Llamar</a>
        <a className="btn" href={`https://wa.me/${tel}`} target="_blank" rel="noreferrer">WhatsApp</a>
        <button className="btn" onClick={() => onChange({ etapa: 'Contactado' })}>Marcar contactado</button>
      </div>

      <label>Notas</label>
      <textarea rows={3} defaultValue={lead.notas || ''} onBlur={(e) => e.target.value !== (lead.notas || '') && onChange({ notas: e.target.value })} />

      <small style={{ color: 'var(--muted)' }}>{lead.email || ''}</small>
    </div>
  );
}
