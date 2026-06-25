# Instruksjon til Codex

Sett opp dette Vite + React-prosjektet og gjør det klart for Vercel-deploy.

## Hva som allerede finnes i repoet
Alle filene under er allerede på plass – ikke endre dem med mindre du får beskjed:
- `src/App.jsx` – hele appen
- `src/main.jsx` – Vite entry point
- `index.html` – HTML-skall
- `package.json` – avhengigheter
- `vite.config.js` – Vite-konfigurasjon
- `AGENTS.md` – prosjektdokumentasjon (denne filen)

## Din oppgave
1. Kjør `npm install` for å installere avhengigheter
2. Verifiser at `npm run build` kjører uten feil
3. Opprett `.gitignore` med node_modules, dist, .env
4. Opprett `vercel.json` med rewrites så SPA-routing fungerer:
   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/" }]
   }
   ```
5. Bekreft at bygget i `dist/`-mappen ser riktig ut

## Ikke gjør
- Ikke del opp App.jsx i sub-komponenter ennå
- Ikke legg til routing-bibliotek
- Ikke endre design eller funksjonalitet
