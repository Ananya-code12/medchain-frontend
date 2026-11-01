# MedChain web (apps/web)
Vite + React + TypeScript + Tailwind. Mock data by default.

    npm install
    npm run dev        # http://localhost:5173 (also on your LAN, for phone testing)
    npm run build      # type-check + production build

Switch to the real API: set VITE_USE_MOCK=false in .env.
When contracts/openapi.yaml exists: npm run gen:api
