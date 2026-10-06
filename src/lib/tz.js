// Fusos horários sem dependências extras: agendamentos ficam salvos em UTC (ISO)
// e são convertidos para o "relógio de parede" do fuso escolhido na hora de exibir.
const cache = {};
const fmt = (tz) => (cache[tz] ??= new Intl.DateTimeFormat('en-US', {
  timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric',
  day: 'numeric', hour: 'numeric', minute: 'numeric',
}));
const parts = (d, tz) => Object.fromEntries(fmt(tz).formatToParts(d).map((p) => [p.type, +p.value]));

// Date absoluta -> Date cujos campos locais = hora no fuso `tz`
export const toZ = (d, tz) => { const p = parts(d, tz); return new Date(p.year, p.month - 1, p.day, p.hour, p.minute); };

// Inverso: Date com campos locais = hora no fuso `tz` -> Date absoluta (UTC)
export const fromZ = (l, tz) => {
  const a = Date.UTC(l.getFullYear(), l.getMonth(), l.getDate(), l.getHours(), l.getMinutes());
  const p = parts(new Date(a), tz);
  return new Date(a - (Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute) - a));
};

export const TIMEZONES = ['America/Sao_Paulo', 'America/Manaus', 'America/New_York', 'Europe/Lisbon', 'UTC'];
