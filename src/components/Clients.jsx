import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const STATUS = { scheduled: 'Agendado', done: 'Concluído', cancelled: 'Cancelado' };
const brl = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function Clients({ clients, appts, services, onAdd }) {
  const [sel, setSel] = useState(clients[0]?.id);
  const [f, setF] = useState({ name: '', phone: '', email: '' });
  const [err, setErr] = useState('');
  const add = (e) => {
    e.preventDefault();
    if (f.name.trim().length < 3) return setErr('Informe o nome completo.');
    if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) return setErr('E-mail inválido.');
    setErr(''); setSel(onAdd(f)); setF({ name: '', phone: '', email: '' });
  };
  const c = clients.find((x) => x.id === sel);
  const hist = appts.filter((a) => a.clientId === sel).sort((a, b) => b.s - a.s);
  const total = hist.filter((a) => a.status === 'done').reduce((t, a) => t + (services.find((s) => s.id === a.serviceId)?.price ?? 0), 0);

  return (
    <div className="clients">
      <aside>
        <form onSubmit={add} className="form">
          <h3>Novo cliente</h3>
          <input placeholder="Nome completo" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          <input placeholder="Telefone" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
          <input placeholder="E-mail" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
          {err && <small className="err">{err}</small>}
          <button className="primary">Adicionar cliente</button>
        </form>
        <ul>{clients.map((x) => <li key={x.id}><button className={x.id === sel ? 'on' : ''} onClick={() => setSel(x.id)}>{x.name}</button></li>)}</ul>
      </aside>
      <section>
        {c && <>
          <h2>{c.name}</h2>
          <p className="muted">{[c.phone, c.email].filter(Boolean).join(' · ') || 'Sem contato cadastrado'}</p>
          <p><b>{hist.filter((a) => a.status === 'done').length}</b> atendimentos concluídos — <b>{brl(total)}</b> faturados</p>
          <h3>Histórico de atendimentos</h3>
          {!hist.length && <p className="muted">Nenhum atendimento ainda. Crie um pela agenda.</p>}
          <ul className="hist">
            {hist.map((a) => (
              <li key={a.id}>
                <b>{format(a.s, "dd 'de' MMM yyyy, HH:mm", { locale: ptBR })}</b>
                <span>{services.find((s) => s.id === a.serviceId)?.name}</span>
                <em className={a.status}>{STATUS[a.status]}</em>
              </li>
            ))}
          </ul>
        </>}
      </section>
    </div>
  );
}
