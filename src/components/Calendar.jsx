import { addDays, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, isToday, startOfMonth, startOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { isWorkday, minutesOf } from '../lib/schedule.js';

const PX = 0.9; // pixels por minuto

export default function Calendar({ view, cursor, appts, cfg, clients, services, onSlot, onEvent, onPickDay }) {
  const live = appts.filter((a) => a.status !== 'cancelled');
  const cname = (id) => clients.find((c) => c.id === id)?.name ?? '—';
  const svc = (id) => services.find((s) => s.id === id);

  if (view === 'month') {
    const days = eachDayOfInterval({ start: startOfWeek(startOfMonth(cursor)), end: endOfWeek(endOfMonth(cursor)) });
    return (
      <div className="month">
        {days.slice(0, 7).map((d) => <div key={+d} className="mh">{format(d, 'EEE', { locale: ptBR })}</div>)}
        {days.map((d) => {
          const list = live.filter((a) => isSameDay(a.s, d)).sort((a, b) => a.s - b.s);
          return (
            <button key={+d} className={`mc ${isSameMonth(d, cursor) ? '' : 'out'} ${isToday(d) ? 'today' : ''} ${isWorkday(d, cfg) ? '' : 'off'}`} onClick={() => onPickDay(d)}>
              <b>{format(d, 'd')}</b>
              {list.slice(0, 3).map((a) => <span key={a.id} className="chip" style={{ background: svc(a.serviceId)?.color }}>{format(a.s, 'HH:mm')} {cname(a.clientId).split(' ')[0]}</span>)}
              {list.length > 3 && <em>+{list.length - 3} mais</em>}
            </button>
          );
        })}
      </div>
    );
  }

  const days = view === 'day' ? [cursor] : eachDayOfInterval({ start: startOfWeek(cursor), end: addDays(startOfWeek(cursor), 6) });
  const hours = Array.from({ length: Math.ceil((cfg.close - cfg.open) / 60) }, (_, i) => cfg.open + i * 60);
  const H = (cfg.close - cfg.open) * PX;
  const click = (e, d) => {
    const y = e.clientY - e.currentTarget.getBoundingClientRect().top;
    onSlot(d, cfg.open + Math.floor(y / PX / cfg.step) * cfg.step);
  };

  return (
    <div className="grid" style={{ '--cols': days.length }}>
      <div className="gh"><span />{days.map((d) => <div key={+d} className={isToday(d) ? 'today' : ''}>{format(d, 'EEE d', { locale: ptBR })}</div>)}</div>
      <div className="gb" style={{ height: H }}>
        <div className="hours">{hours.map((m) => <span key={m} style={{ top: (m - cfg.open) * PX }}>{String(m / 60).padStart(2, '0')}:00</span>)}</div>
        {days.map((d) => (
          <div key={+d} className={`col ${isWorkday(d, cfg) ? '' : 'off'}`} onClick={(e) => isWorkday(d, cfg) && click(e, d)}>
            {hours.map((m) => <i key={m} className="hl" style={{ top: (m - cfg.open) * PX }} />)}
            {cfg.lunch && <div className="lunch" style={{ top: (cfg.lunch[0] - cfg.open) * PX, height: (cfg.lunch[1] - cfg.lunch[0]) * PX }}>Almoço</div>}
            {live.filter((a) => isSameDay(a.s, d)).map((a) => (
              <button key={a.id} className={`ev ${a.status}`} style={{ top: (minutesOf(a.s) - cfg.open) * PX, height: (minutesOf(a.e) - minutesOf(a.s)) * PX - 2, background: svc(a.serviceId)?.color }}
                onClick={(e) => { e.stopPropagation(); onEvent(a); }}>
                <b>{cname(a.clientId)}</b><span>{format(a.s, 'HH:mm')}–{format(a.e, 'HH:mm')} · {svc(a.serviceId)?.name}</span>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
