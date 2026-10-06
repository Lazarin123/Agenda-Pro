import { useEffect, useMemo, useState } from 'react';
import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getSlots, isWorkday, minutesOf } from '../lib/schedule.js';
import { toZ } from '../lib/tz.js';

const DURATIONS = Array.from({ length: 16 }, (_, i) => (i + 1) * 15);
const label = (m) => (m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? String(m % 60).padStart(2, '0') : ''}` : `${m} min`);

export default function ApptForm({ init, clients, services, appts, cfg, onSave, onStatus, onClose }) {
  const [f, setF] = useState(init);
  const [err, setErr] = useState({});
  const set = (patch) => setF((p) => ({ ...p, ...patch }));
  const editing = !!f.id;
  const day = f.date ? parse(f.date, 'yyyy-MM-dd', new Date()) : null;

  // Regra dependente: duração + data => horários livres
  const slots = useMemo(
    () => getSlots(day, f.duration, appts, cfg, { ignoreId: f.id, now: editing ? null : toZ(new Date(), cfg.tz) }),
    [f.date, f.duration, appts, cfg, f.id], // eslint-disable-line
  );
  // Se o horário escolhido deixou de existir (mudou serviço/duração/data), limpa
  useEffect(() => {
    if (f.time != null && !slots.some((s) => minutesOf(s) === f.time)) set({ time: null });
  }, [slots]); // eslint-disable-line

  const pickService = (serviceId) => {
    const svc = services.find((s) => s.id === serviceId);
    set({ serviceId, duration: svc ? svc.duration : f.duration });
  };
  const submit = (e) => {
    e.preventDefault();
    const er = {};
    if (!f.clientId) er.clientId = 'Escolha um cliente.';
    if (!f.serviceId) er.serviceId = 'Escolha um serviço.';
    if (!f.date) er.date = 'Escolha uma data.';
    else if (!isWorkday(day, cfg)) er.date = 'Não há expediente neste dia.';
    if (f.time == null) er.time = 'Escolha um horário livre.';
    setErr(er);
    if (!Object.keys(er).length) onSave(f);
  };
  const Err = ({ k }) => (err[k] ? <small className="err">{err[k]}</small> : null);

  return (
    <form className="form" onSubmit={submit}>
      <h2>{editing ? 'Editar agendamento' : 'Novo agendamento'}</h2>
      <label>Cliente
        <select value={f.clientId} onChange={(e) => set({ clientId: e.target.value })}>
          <option value="">Selecione…</option>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select><Err k="clientId" />
      </label>
      <div className="row">
        <label>Serviço
          <select value={f.serviceId} onChange={(e) => pickService(e.target.value)}>
            <option value="">Selecione…</option>
            {services.map((s) => <option key={s.id} value={s.id}>{s.name} ({label(s.duration)})</option>)}
          </select><Err k="serviceId" />
        </label>
        <label>Duração
          <select value={f.duration} onChange={(e) => set({ duration: +e.target.value })}>
            {DURATIONS.map((d) => <option key={d} value={d}>{label(d)}</option>)}
          </select>
        </label>
      </div>
      <label>Data
        <input type="date" value={f.date} onChange={(e) => set({ date: e.target.value })} /><Err k="date" />
      </label>
      <div>
        <span className="lbl">Horários livres para {label(f.duration)}</span>
        <div className="slots">
          {slots.map((s) => {
            const m = minutesOf(s);
            return <button type="button" key={m} className={f.time === m ? 'slot on' : 'slot'} onClick={() => set({ time: m })}>{format(s, 'HH:mm')}</button>;
          })}
          {day && !slots.length && <p className="muted">{isWorkday(day, cfg) ? `Nenhum horário livre em ${format(day, "d 'de' MMMM", { locale: ptBR })} para ${label(f.duration)}. Tente outro dia ou uma duração menor.` : 'Sem expediente neste dia.'}</p>}
          {!day && <p className="muted">Escolha a data para ver os horários.</p>}
        </div>
        <Err k="time" />
      </div>
      <label>Observações
        <textarea rows="2" value={f.notes} onChange={(e) => set({ notes: e.target.value })} />
      </label>
      <div className="actions">
        {editing && f.status === 'scheduled' && <>
          <button type="button" className="ghost" onClick={() => onStatus(f.id, 'done')}>Marcar como concluído</button>
          <button type="button" className="danger" onClick={() => onStatus(f.id, 'cancelled')}>Cancelar</button>
        </>}
        <span className="grow" />
        <button type="button" className="ghost" onClick={onClose}>Fechar</button>
        <button type="submit" className="primary">Salvar agendamento</button>
      </div>
    </form>
  );
}
