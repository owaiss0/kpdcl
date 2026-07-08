# KPDCL Consumer Portal

A modern consumer portal for **Kashmir Power Distribution Corporation Limited (KPDCL)** — built with Next.js, shadcn/ui, and TypeScript.

> **MIT Licensed** — Free for KPDCL to use, modify, and distribute.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | [Next.js](https://nextjs.org) 16 (App Router) |
| UI Library | [shadcn/ui](https://ui.shadcn.com) + [Base UI](https://base-ui.com) |
| Styling | [Tailwind CSS](https://tailwindcss.com) v4 |
| Icons | [Lucide React](https://lucide.dev) |
| Charts | [Recharts](https://recharts.org) |
| Language | [TypeScript](https://www.typescriptlang.org) 6 |
| Font | Inter via next/font |
| Export | CSV, XML-based Excel, PDF (browser print) |

---

## Architecture

```
kpdcl-ui/
├── app/                        # Next.js App Router pages
│   ├── page.tsx                # Landing / redirect
│   ├── layout.tsx              # Root layout (Inter font, globals)
│   ├── not-found.tsx           # 404 page
│   ├── login/                  # Login / Sign Up / Forgot Password
│   ├── dashboard/              # Account portal + per-connection dashboard
│   ├── usage/                  # Consumption charts + table
│   ├── net-meter/              # Solar net metering charts + table
│   ├── billing/                # Billing ledger + combined chart
│   ├── services/               # Service request forms (name change, solar, etc.)
│   ├── documents/              # No dues cert, bill print
│   └── profile/                # Consumer profile with edit contact modal
├── components/
│   ├── ui/                     # shadcn/ui primitives (button, card, table, etc.)
│   └── layout/                 # Sidebar layout (desktop + mobile)
├── lib/
│   ├── utils.ts                # Tailwind merge utility
│   └── export.ts               # CSV / Excel / PDF export functions
├── data/
│   ├── types.ts                # Shared TypeScript interfaces
│   └── demo.ts                 # Mock data + async fetcher functions
└── docs/                       # Documentation site (HTML)
    ├── index.html              # Home
    ├── features.html           # Full features list
    ├── architecture.html       # Directory structure, data layer, design system
    └── style.css               # Shared docs styles
```

### Data Layer Pattern

All data flows through async functions in `data/demo.ts`:

```
Page Components → data/demo.ts (async fetchers) → Mock data arrays
```

Each function has `// DEMO` and `// REAL` comments. To go live with real APIs, replace the function body — zero changes needed in components.

---

## Pages & Routes

| Route | Page | Auth Required |
|---|---|---|
| `/` | Landing → redirects to `/login` | No |
| `/login` | Login / Sign Up / Forgot Password | No |
| `/dashboard` | Account portal + connection dashboards | Yes |
| `/usage` | Power consumption charts + table | Yes |
| `/net-meter` | Solar net metering charts + table | Yes |
| `/billing` | Billing ledger + combined chart | Yes |
| `/services` | Service request forms (name change, solar, etc.) | Yes |
| `/documents` | No dues certificate, bill print | Yes |
| `/profile` | Consumer profile with contact editing | Yes |

---

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Lint
npm run lint
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## Features

- **Multi-connection portal** — Link multiple consumer accounts under one login
- **Per-connection dashboard** — Consumer details, pending dues, recent payments, charts
- **Usage analysis** — Hourly/daily/weekly/monthly/yearly views with date range picker
- **Solar net metering** — Import vs export tracking with exportable reports
- **Billing ledger** — Transaction history with combined chart
- **Service requests** — Name change, ownership change, category change, load change, solar agreement, ticket tracking
- **Profile management** — View/edit contact info with OTP verification demo
- **Export reports** — CSV, Excel, PDF download for all data tables
- **Responsive design** — Desktop sidebar layout, mobile bottom sheet navigation
- **404 page** — Custom not-found page with navigation to dashboard/login

---

## Demo Credentials

- **Login:** Any input works (pre-filled with `KPDCL-2024-001`)
- **OTP verification:** Use `123456` to simulate success

---

## Documentation

Full documentation is available in the [`docs/`](./docs/) folder as a static HTML site:

- [Architecture](./docs/architecture.html)
- [Features](./docs/features.html)
- [Implementation Plan](./docs/implementation_plan.html)

---

## License

MIT &copy; 2026 Owais. See [LICENSE](./LICENSE).

---

Built with Next.js, shadcn/ui, and Tailwind CSS.
