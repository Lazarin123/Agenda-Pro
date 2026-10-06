import { useEffect, useMemo, useState } from 'react';
import { addDays, addMonths, addWeeks, addMinutes, endOfWeek, format, parse, startOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Calendar from './components/Calendar.jsx';
import ApptForm from './components/ApptForm.jsx';
import Clients from './components/Clients.jsx';
import { fromZ, toZ, TIMEZONES } from './lib/tz.js';
import { atTime, minutesOf } from './lib/schedule.js';
import { DEFAULT_CFG, newId, seed } from './lib/seed.js';

function useLS(key, init) {
  const [v, set] = useState(() => { try { return JSON.parse(localStorage.getItem(key)) ?? init(); } catch { return init(); } });
  useEffect(() => localStorage.setItem(key, JSON.stringify(v)), [key, v]);
  return [v, set];
}

export default function App() {
  const [data, setData] = useLS('agenda-pro:data', seed);
  const [cfg, setCfg] = useLS('agenda-pro:cfg', () => DEFAULT_CFG);
  const [tab, setTab] = useState('agenda');
  const [view, setView] = useState('week');
  const [cursor, setCursor] = useState(new Date());
  const [modal, setModal] = useState(null);

  // Tudo é exibido no fuso escolhido; no armazenamento fica em UTC
  const appts = useMemo(() => data.appts.map((a) => ({ ...a, s: toZ(new Date(a.start), cfg.tz), e: toZ(new Date(a.end), cfg.tz) })), [data.appts, cfg.tz]);

  const move = (dir) => setCursor((c) => (view === 'day' ? addDays(c, dir) : view === 'week' ? addWeeks(c, dir) : addMonths(c, dir)));
  const title = view === 'month' ? format(cursor, 'MMMM yyyy', { locale: ptBR })
    : view === 'week' ? `${format(startOfWeek(cursor), "d MMM", { locale: ptBR })} – ${format(endOfWeek(cursor), "d MMM yyyy", { locale: ptBR })}`
    : format(cursor, "EEEE, d 'de' MMMM", { locale: ptBR });

  const openNew = (day, min) => setModal({ id: null, clientId: '', serviceId: '', duration: 30, date: format(day, 'yyyy-MM-dd'), time: min ?? null, notes: '', status: 'scheduled' });
  const openEdit = (a) => setModal({ ...a, duration: (a.e - a.s) / 60000, date: format(a.s, 'yyyy-MM-dd'), time: minutesOf(a.s) });

  const save = (f) => {
    const s = atTime(parse(f.date, 'yyyy-MM-dd', new Date()), f.time);
    const rec = { id: f.id ?? newId(), clientId: f.clientId, serviceId: f.serviceId, notes: f.notes, status: f.status ?? 'scheduled',
      start: fromZ(s, cfg.tz).toISOString(), end: fromZ(addMinutes(s, f.duration), cfg.tz).toISOString() };
    setData((d) => ({ ...d, appts: f.id ? d.appts.map((a) => (a.id === f.id ? rec : a)) : [...d.appts, rec] }));
    setModal(null);
  };
  const setStatus = (id, status) => { setData((d) => ({ ...d, appts: d.appts.map((a) => (a.id === id ? { ...a, status } : a)) })); setModal(null); };
  const addClient = (c) => { const n = { ...c, id: newId() }; setData((d) => ({ ...d, clients: [...d.clients, n] })); return n.id; };

  return (
    <div className="app">
      <header>
        <h1>Agenda Pro</h1>
        <nav>
          <button className={tab === 'agenda' ? 'on' : ''} onClick={() => setTab('agenda')}>Agenda</button>
          <button className={tab === 'clientes' ? 'on' : ''} onClick={() => setTab('clientes')}>Clientes</button>
        </nav>
        <label className="tz">Fuso horário
          <select value={cfg.tz} onChange={(e) => setCfg({ ...cfg, tz: e.target.value })}>{TIMEZONES.map((z) => <option key={z}>{z}</option>)}</select>
        </label>
      </header>

      {tab === 'agenda' ? (
        <main>
          <div className="bar">
            <div className="seg">{['day', 'week', 'month'].map((v) => <button key={v} className={view === v ? 'on' : ''} onClick={() => setView(v)}>{{ day: 'Dia', week: 'Semana', month: 'Mês' }[v]}</button>)}</div>
            <button className="ghost" onClick={() => move(-1)} aria-label="Anterior">‹</button>
            <button className="ghost" onClick={() => setCursor(new Date())}>Hoje</button>
            <button className="ghost" onClick={() => move(1)} aria-label="Próximo">›</button>
            <h2>{title}</h2><span className="grow" />
            <button className="primary" onClick={() => openNew(cursor)}>Novo agendamento</button>
          </div>
          <Calendar view={view} cursor={cursor} appts={appts} cfg={cfg} clients={data.clients} services={data.services}
            onSlot={openNew} onEvent={openEdit} onPickDay={(d) => { setCursor(d); setView('day'); }} />
        </main>
      ) : <main><Clients clients={data.clients} services={data.services} appts={appts} onAdd={addClient} /></main>}

      {modal && (
        <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && setModal(null)}>
          <div className="modal"><ApptForm key={modal.id ?? 'new'} init={modal} clients={data.clients} services={data.services} appts={appts} cfg={cfg} onSave={save} onStatus={setStatus} onClose={() => setModal(null)} /></div>
        </div>
      )}
    </div>
  );
}
