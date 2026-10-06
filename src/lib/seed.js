import { addMinutes, setHours, setMinutes, startOfDay, addDays } from 'date-fns';

export const DEFAULT_CFG = {
  tz: 'America/Sao_Paulo',
  open: 9 * 60, close: 18 * 60, step: 15, buffer: 10,
  lunch: [12 * 60, 13 * 60], days: [1, 2, 3, 4, 5],
};
export const newId = () => crypto.randomUUID();

export function seed() {
  const services = [
    { id: 's1', name: 'Consulta', duration: 45, price: 180, color: '#0F766E' },
    { id: 's2', name: 'Retorno', duration: 30, price: 90, color: '#C2410C' },
    { id: 's3', name: 'Sessão longa', duration: 90, price: 320, color: '#4338CA' },
    { id: 's4', name: 'Avaliação rápida', duration: 15, price: 60, color: '#A16207' },
  ];
  const clients = [
    { id: 'c1', name: 'Marina Duarte', phone: '(11) 98888-1111', email: 'marina@email.com' },
    { id: 'c2', name: 'Paulo Nogueira', phone: '(11) 97777-2222', email: 'paulo@email.com' },
    { id: 'c3', name: 'Letícia Prado', phone: '(11) 96666-3333', email: 'leticia@email.com' },
  ];
  const mk = (cid, sid, off, h, m, status = 'scheduled') => {
    const svc = services.find((s) => s.id === sid);
    const s = setMinutes(setHours(startOfDay(addDays(new Date(), off)), h), m);
    return { id: newId(), clientId: cid, serviceId: sid, start: s.toISOString(), end: addMinutes(s, svc.duration).toISOString(), status, notes: '' };
  };
  const appts = [
    mk('c1', 's1', -14, 10, 0, 'done'), mk('c1', 's2', -7, 14, 0, 'done'), mk('c2', 's3', -3, 15, 0, 'done'),
    mk('c1', 's1', 0, 10, 0), mk('c2', 's2', 0, 14, 30), mk('c3', 's3', 1, 9, 30), mk('c3', 's4', 2, 16, 0),
  ];
  return { services, clients, appts };
}
