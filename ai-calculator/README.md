# CalcMind

CalcMind is a responsive calculator and planning portal built with React and Vite. The frontend and the optional API are separate: React UI and domain calculations live in `src/`, while Node's built-in HTTP server in `server/` handles assistant and currency requests. The app does not require an account or store user data on a remote server.

## Features

- Scientific calculator, interest planner, weighted CGPA, and length/weight/temperature conversion.
- Currency converter with dynamically loaded currency names, a dated reference rate, a refresh action, input validation, same-currency handling, and an EUR cross-rate fallback. Rates come from Frankfurter and are not a bank quote.
- Fitness planner for gradual weight gain or weight loss. It estimates maintenance calories with Mifflin–St Jeor, a modest 300 kcal gain / 400 kcal loss adjustment, and a protein starting point. Estimates are informational, not medical advice.
- Calendar for upcoming sessions and reminders. Events are saved in browser local storage.
- Dedicated multilingual CalcMind Help portal at `/help`. The built-in guide works without a provider key for common app questions in English, Spanish, French, Hindi, Tamil, Chinese, and Arabic. Setting an AI provider key enables broader AI conversations.
- Three responsive layouts (Standard, Compact, Focus), accessible form labels, saved calculations, and mobile layouts.

## Local setup

Requirements: Node.js 20.19+ or 22.12+ and npm.

1. Open **one terminal** in the project folder. In VS Code, choose **Terminal → New Terminal**, then run:

   ```powershell
   cd "D:\AI calculator\ai-calculator"
   npm install
   ```

   You only need `npm install` the first time, or after dependencies change.

2. Start the frontend and API together with this one command:

   ```powershell
   npm run dev
   ```

3. Wait until the terminal reports that the API is ready and Vite has started. Open **http://127.0.0.1:5173** in your browser. Leave the terminal running while you use the app. Press **Ctrl+C** in that terminal to stop both servers.

The `npm run dev` launcher starts the API first, waits until its health check passes, and only then starts the web app. This prevents currency lookups from racing ahead before the API is ready. For advanced use, `npm run dev:api` and `npm run dev:web` can be started separately in two terminals, but using `npm run dev` is recommended.

### If Currency shows “Failed to fetch”

1. Confirm the terminal is in `D:\AI calculator\ai-calculator` (the folder containing `package.json`).
2. Stop old development servers with **Ctrl+C**, then run `npm run dev` in one terminal.
3. Wait for both “API ready” and the Vite local URL before reloading **http://127.0.0.1:5173**.
4. The machine must have internet access for live reference rates. CalcMind tries Frankfurter first, then ExchangeRate-API. If both rate services are down, it can show an explicitly labelled last-known rate from the current API session; never treat an old rate as a guaranteed bank quote.
5. If the terminal reports that port 3001 is already in use, stop the old API terminal and retry. The app needs that local API port for currency rates and the assistant.

## Currency conversion workflow

1. Open **Currency** and enter a non-negative amount.
2. Choose the source and destination currencies by their code and full name.
3. Read the converted total, rate, and provider date in the result card. The result updates when the amount or either currency changes.
4. Use the swap control to reverse the pair, or **Refresh reference rate** to request an updated quote.
5. If the provider/API is unreachable or does not offer the selected pair, the status explains the problem; retry when online. The converter does not substitute a guessed or stale rate.

The backend queries Frankfurter, falls back to ExchangeRate-API if needed, and caches successful rates briefly. Any last-known fallback is labelled with its date and provider status. Rates are reference values—not guaranteed transaction or bank rates.

### Optional AI replies

The built-in multilingual helper requires no credentials. For general AI responses, configure the key only in the API server's environment, then restart it. Never put an AI key in React code or a `VITE_` variable.

PowerShell example:

```powershell
$env:OPENAI_API_KEY = "your-provider-key"
$env:OPENAI_MODEL = "gpt-4o-mini"
npm run dev:api
```

The API uses the OpenAI-compatible Chat Completions endpoint. To use another compatible provider, set `OPENAI_API_URL` and `OPENAI_MODEL`. Provider availability, quotas, and costs apply.

## Build and checks

```powershell
npm run build
npm run lint
npm test
npm run preview
```

## Deployment

The Vite frontend builds to `dist/`. The API must be deployed separately for live translation and optional AI:

- **Vercel:** deploy the frontend as a Vite project and add `/api` serverless functions (or point `VITE_API_BASE` to a separately hosted API). Set secrets in Vercel's server-side environment settings and configure a rewrite for `/help`.
- **Netlify:** deploy `dist/` and add Netlify Functions / redirects for `/api/*` and an SPA fallback to `index.html`, or use a separate API host.
- **GitHub Pages:** suitable for the static frontend only. Set `VITE_API_BASE` at build time to the HTTPS URL of a separately hosted API; GitHub Pages cannot host the Node server.
- **Railway, Render, or Fly.io:** host `server/index.js` as a Node service, set `API_HOST=0.0.0.0` and `API_PORT` as required by the host, configure `ALLOWED_ORIGIN` to the exact deployed frontend origin, and store AI keys as server secrets. Set the frontend's `VITE_API_BASE` to that API's HTTPS origin at build time.

Build the frontend with `VITE_API_BASE=https://your-api.example` when the API is not same-origin. The API's `ALLOWED_ORIGIN` setting must match the frontend origin exactly for cross-origin browser requests. Use HTTPS in production, configure provider rate limits, and never commit secrets.

## Structure and extension

```text
src/
  domain/fitness.js       Pure fitness-plan calculation
  services/               Currency and assistant API clients
  pages/HelpPortal.jsx    Separate AI and support portal at /help
  App.jsx                 Tool selection, page composition, local browser state
  App.css                 Responsive visual system and layout variants
server/
  index.js                Currency and AI API routes with provider fallback
scripts/
  dev.js                  Starts API, waits for health check, then starts Vite
tests/
  currency.test.js        Currency amount conversion tests
  assistant.test.js       Tamil detection and reply tests
```

Add new pure calculations under `src/domain/`, API integrations under `src/services/`, and UI as small React components when a tool grows. For production use with multiple users or devices, move calendar/bookmark data from local storage to an authenticated database-backed API; add privacy controls, automated tests, API rate limiting, and monitoring before exposing the API publicly.
