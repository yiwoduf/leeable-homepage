# Setup — Simon chat backend (OpenAI + Upstash on Vercel)

The site itself is a static Vite SPA — it deploys with zero configuration.
Only the **Simon chat assistant** (`api/chat.ts`, a Vercel Function) needs the
three environment variables below. Until they are set, the endpoint returns
`503 { "error": "unconfigured" }` and the widget shows a graceful
"Simon is offline" notice — nothing else on the site is affected.

| Variable | Used for | Where to get it |
|---|---|---|
| `OPENAI_API_KEY` | GPT-5 mini calls | platform.openai.com |
| `UPSTASH_REDIS_REST_URL` | Per-IP rate limiting | console.upstash.com |
| `UPSTASH_REDIS_REST_TOKEN` | Per-IP rate limiting | console.upstash.com |

---

## 1. Collect the values

### OpenAI
1. Go to <https://platform.openai.com> → **Settings → API keys** (or
   <https://platform.openai.com/api-keys>).
2. **Create new secret key** → name it `leeable-simon` → scope: the default
   project is fine. Copy the `sk-…` value now (it is shown once).
3. Recommended: **Settings → Limits** → set a **monthly budget** (e.g. $5) and
   an email alert threshold. This is your hard backstop against runaway cost.

### Upstash
1. Go to <https://console.upstash.com> → **Redis → Create database**.
   - Name: `leeable-ratelimit`, type: **Regional**, region: **us-east-1**
     (closest to Vercel's default `iad1` function region), TLS on. Free tier.
2. Open the database → **REST API** section → copy:
   - `UPSTASH_REDIS_REST_URL` (looks like `https://xxx.upstash.io`)
   - `UPSTASH_REDIS_REST_TOKEN`

## 2. Wire them into Vercel

1. <https://vercel.com> → your project (**leeable-homepage**) →
   **Settings → Environment Variables**.
2. Add each of the three variables, exactly these names:
   - `OPENAI_API_KEY` → the `sk-…` key
   - `UPSTASH_REDIS_REST_URL` → the REST URL
   - `UPSTASH_REDIS_REST_TOKEN` → the REST token
3. Environments: check **Production** and **Preview**. (Leave Development
   unchecked — locally you'll use `.env`, see §4.) Keep the type as
   **Sensitive/Encrypted** (default).
4. Env vars are baked in at deploy time → trigger a redeploy:
   **Deployments → ⋯ on the latest → Redeploy** (or just push a commit).

No other Vercel settings are needed: the `api/` directory is auto-detected as
Functions, the function exports `maxDuration = 30`, and no `vercel.json` is
required.

## 3. Verify after deploy

**Browser (the real test):** open <https://leeable.dev>, click the chat bubble
(bottom-right), ask "What does Peter do?" — you should see a streamed reply
within a couple of seconds.

**curl (endpoint-level):** the endpoint rejects requests without a browser
`Origin` header, so include one:

```bash
curl -N -X POST https://leeable.dev/api/chat \
  -H "Content-Type: application/json" \
  -H "Origin: https://leeable.dev" \
  -d '{"messages":[{"role":"user","content":"What does Peter do?"}],"lang":"en"}'
```

Expected outcomes:
- Streamed plain text → everything works.
- `{"error":"unconfigured"}` (503) → env vars missing or not redeployed.
- `{"error":"forbidden_origin"}` (403) → you forgot the `Origin` header.
- `{"error":"rate_limited","reset":…}` (429) → rate limiter works (6/min,
  40/day per IP) — wait and retry.
- `{"error":"upstream_error"}` (502) → check the OpenAI key / OpenAI status;
  see Vercel function logs (**Deployments → deployment → Functions →
  `api/chat`**) for the upstream status code.

## 4. Local testing

- `npm run dev` — full site works; the chat widget shows the "offline" notice
  (Vite doesn't serve `api/`). Fine for UI work.
- Full end-to-end locally: copy `.env.template` → `.env`, fill the three
  values, then run `npx vercel dev` (first run links the project). This serves
  the SPA **and** `api/chat.ts` with streaming at `http://localhost:3000`.
- `npm run typecheck` / `npm run build` cover both the app and `api/`.

## 5. Key rotation

1. Create the new key first (OpenAI dashboard / Upstash → REST token → rotate).
2. Update the value in Vercel **Settings → Environment Variables** (Edit).
3. **Redeploy** (env changes don't apply to running deployments).
4. Verify with §3, then revoke the old key at the provider.

Rotate immediately if a key ever appears in a commit, log, or screenshot —
this repo is public.

## 6. Monitoring usage & cost

- **OpenAI:** <https://platform.openai.com/usage> — daily token/cost breakdown.
  The budget limit from §1 caps worst-case spend. gpt-5-mini pricing is
  $0.25 / 1M input + $2.00 / 1M output tokens; a typical Simon exchange is
  well under $0.001.
- **Upstash:** console.upstash.com → your DB → metrics (free tier: 500K
  commands/month; each chat request costs a handful of commands).
- **Vercel:** project → **Logs / Observability** — function invocations,
  durations, and error rates for `api/chat`.

## 7. Built-in abuse protections (for reference)

- Per-IP rate limits: **6 requests/min** and **40/day** (Upstash sliding
  window; tune in `api/_lib/ratelimit.ts`).
- Origin allowlist: `leeable.dev`, `www.leeable.dev`, `*.vercel.app`,
  localhost (tune in `api/chat.ts`).
- Input caps: ≤ 500 chars per message client-side (2,000 server-side),
  ≤ 32 messages per request, 32 KB body, history truncated to the last 12
  messages; output capped at 1,200 completion tokens; 30 s max duration.
- Client session: 20 user messages per browser session (sessionStorage).
- Prompt-injection hardening lives in `api/_lib/simon.ts`; client roles are
  whitelisted to `user`/`assistant` and the system prompt never leaves the
  server.
