import { addMinutes, areIntervalsOverlapping, getDay, isBefore, startOfDay } from 'date-fns';

export const minutesOf = (d) => d.getHours() * 60 + d.getMinutes();
export const atTime = (day, min) => addMinutes(startOfDay(day), min);
export const overlaps = (a, b) => areIntervalsOverlapping({ start: a.s, end: a.e }, { start: b.s, end: b.e });
export const isWorkday = (day, cfg) => cfg.days.includes(getDay(day));

/**
 * Horários de início livres para um dia, dada a DURAÇÃO do serviço.
 * Regras: dentro do expediente, fora do almoço, sem conflito (com intervalo
 * entre atendimentos) e, em novos agendamentos, não pode estar no passado.
 */
export function getSlots(day, duration, appts, cfg, { ignoreId, now } = {}) {
  if (!day || !duration || !isWorkday(day, cfg)) return [];
  const out = [];
  for (let m = cfg.open; m + duration <= cfg.close; m += cfg.step) {
    const iv = { s: atTime(day, m), e: atTime(day, m + duration) };
    if (now && isBefore(iv.s, now)) continue;
    if (cfg.lunch && overlaps(iv, { s: atTime(day, cfg.lunch[0]), e: atTime(day, cfg.lunch[1]) })) continue;
    const busy = appts.some((a) => a.id !== ignoreId && a.status !== 'cancelled' &&
      overlaps(iv, { s: addMinutes(a.s, -cfg.buffer), e: addMinutes(a.e, cfg.buffer) }));
    if (!busy) out.push(iv.s);
  }
  return out;
}
