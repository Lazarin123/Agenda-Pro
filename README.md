# Agenda Pro

Plataforma de agendamento e gestão de serviços para prestadores gerenciarem agenda, horários disponíveis, clientes e histórico de atendimentos.

> Projeto de portfólio front-end focado em **manipulação de datas**, **calendário customizado** e **formulários dinâmicos**.

<!-- Adicione aqui um print ou GIF do app: ![Agenda Pro](docs/screenshot.png) -->

## Funcionalidades

- **Agenda** com visões de **dia**, **semana** e **mês**
- **Criação rápida**: clique em um espaço vazio da grade para agendar
- **Edição de atendimentos**: alterar, marcar como concluído ou cancelar
- **Horários livres calculados automaticamente** conforme a duração do serviço
- **Bloqueio de conflitos**, horário de almoço, dias sem expediente e intervalo entre atendimentos
- **Fuso horário** selecionável: os dados ficam em UTC e são exibidos no fuso escolhido
- **Clientes**: cadastro com validação, histórico de atendimentos e total faturado
- **Persistência local** via `localStorage` (sem backend)

## Destaques técnicos

### Manipulação avançada de datas

`src/lib/tz.js` e `src/lib/schedule.js`

- Agendamentos armazenados em **UTC (ISO 8601)** e convertidos para o fuso do prestador apenas na exibição, usando `Intl.DateTimeFormat`.
- Cálculo de slots com `date-fns` (`addMinutes`, `areIntervalsOverlapping`, etc.), respeitando expediente, almoço e buffer entre atendimentos.

### Calendário customizado

`src/components/Calendar.jsx`

- Sem biblioteca de calendário: grade de dia/semana com eventos posicionados proporcionalmente ao minuto, e visão mensal com resumo por dia.
- Dias sem expediente e horário de almoço sinalizados visualmente.

### Formulários dinâmicos

`src/components/ApptForm.jsx`

- Regras de dependência: **serviço → duração → horários livres**.
- Se o horário escolhido deixa de ser válido após mudar serviço, duração ou data, a seleção é limpa automaticamente.
- Validações com mensagens específicas e estados vazios orientativos.

## Stack

React 18 · Vite 5 · date-fns 3 · CSS puro

## Como rodar

Pré-requisito: [Node.js](https://nodejs.org) 18 ou superior.

```bash
git clone <url-do-repositorio>
cd agenda-pro
npm install
npm run dev
```

Abra o endereço exibido no terminal (normalmente http://localhost:5173).

| Comando           | Descrição                    |
| ----------------- | ---------------------------- |
| `npm run dev`     | Servidor de desenvolvimento  |
| `npm run build`   | Build de produção em `dist/` |
| `npm run preview` | Pré-visualiza o build        |

Para restaurar os dados de exemplo, limpe o `localStorage` do navegador.

## Estrutura

```
src/
├── App.jsx                 # Estado global, navegação e modal
├── styles.css
├── components/
│   ├── Calendar.jsx        # Visões dia, semana e mês
│   ├── ApptForm.jsx        # Formulário dinâmico de agendamento
│   └── Clients.jsx         # Clientes e histórico
└── lib/
    ├── tz.js               # Conversão de fusos horários
    ├── schedule.js         # Slots livres e detecção de conflitos
    └── seed.js             # Configuração padrão e dados de exemplo
```

## Configuração

Em `src/lib/seed.js`, o objeto `DEFAULT_CFG` define:

| Campo            | Padrão              | Descrição                            |
| ---------------- | ------------------- | ------------------------------------ |
| `open` / `close` | `540` / `1080`      | Expediente em minutos (09:00–18:00)  |
| `lunch`          | `[720, 780]`        | Almoço (12:00–13:00)                 |
| `step`           | `15`                | Intervalo entre horários, em minutos |
| `buffer`         | `10`                | Folga entre atendimentos, em minutos |
| `days`           | `[1,2,3,4,5]`       | Dias úteis (0 = domingo)             |
| `tz`             | `America/Sao_Paulo` | Fuso inicial                         |

## Licença

MIT
