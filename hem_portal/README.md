# HEM Associates - Web Portal

See the [platform README](../README.md) for the full architecture. For the redesigned portal:

```bash
npm ci
npm test
npm run dev
```

Open http://localhost:3000. Production uses `npm run build` followed by `npm start`.

The portal is an online application. A future Windows shell should load the hosted portal over HTTPS; keep Supabase service-role, Groq, and Google server keys on the server and out of any installer. The redesign and API contract are documented in [`docs/PORTAL_REDESIGN.md`](../docs/PORTAL_REDESIGN.md).
