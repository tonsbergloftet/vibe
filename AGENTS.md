# Vibekoding – KI-lekeplassen
Interaktiv e-læringsapp og prompt-verktøy for kommuneansatte i Tønsberg kommune.
Bygget av Tønsbergløftet (innovasjonsenhet i Tønsberg kommune).

## Prosjektstruktur
```
vibekoding-app/
├── src/
│   ├── App.jsx        ← hele appen (én fil, ingen sub-komponenter ennå)
│   └── main.jsx       ← Vite entry point
├── public/
│   └── favicon.ico
├── index.html
├── vite.config.js
├── package.json
└── AGENTS.md
```

## Tech stack
- Vite + React (JSX)
- Ingen CSS-rammeverk – all styling er inline React styles
- Ingen routing – single-page app med intern mode-state
- Ingen backend – alt skjer i nettleseren
- Deploy: Vercel (kobles til GitHub-repo, auto-deploy på push til main)

## App-arkitektur
Appen har tre moduser styrt av `mode`-state i root-komponenten `VibekodingApp`:

| Mode | Komponent | Beskrivelse |
|------|-----------|-------------|
| `"landing"` | `Landing` | Forside – velg mellom læringssti og lekeplass |
| `"learn"` | (inline i VibekodingApp) | 6-stegs læringssti om vibekoding |
| `"play"` | `Playground` | Prompt-verktøy med 5 kategorier |

### Læringstien (mode: "learn")
6 moduler navigert via sidebar (desktop) eller bottom tabbar (mobil):
0. Intro
1. Se det – galleri med kommuneapper
2. Når passer det? – interaktiv avdekking
3. Lag din prompt – prompt-generator med Copilot-eksport
4. Test prototypen – iframe-preview + Presenti-publisering
5. Refleksjon

### Lekeplassen (mode: "play")
Kategorier brukeren velger mellom:
- 🛠 Lag en prototype
- ✍️ Klarspråkvask
- 📐 Strukturer et dokument
- 🗓 Forbered et møte
- 🔍 Analyser tilbakemeldinger

Hver kategori har `buildPrompt(input)`-funksjon som genererer et ferdig prompt
brukeren kopierer inn i Microsoft Copilot Chat.

## Design tokens (T-objektet)
```js
bg: "#0f0f0f"        // Sidebakgrunn
surface: "#161616"   // Kort/panel-bakgrunn
border: "#2a2a2a"    // Standard border
accent: "#f5c842"    // Gul – primær aksentfarge
text: "#e8e4dc"      // Primær tekst
muted: "#666"        // Sekundær tekst
green: "#4ade80"     // Suksess
red: "#f87171"       // Feil/advarsel
mono: IBM Plex Mono
sans: Inter
```

## Viktige integrasjoner
### Presenti (postMessage)
ModulePreview har «Publiser med Presenti»-knapp som:
1. Åpner `https://presenti-six.vercel.app/editor` i nytt vindu
2. Lytter på `PRESENTI_READY`-melding fra Presenti
3. Sender `PRESENTI_HTML` med HTML-koden via postMessage

### Microsoft Copilot
Appen genererer prompts som brukeren kopierer og limer inn i
Microsoft Copilot Chat (ikke API-integrasjon – manuell flyt).

## Kodestil
- All styling inline som React style-objekter
- Animasjoner via CSS keyframes injisert i `<style>`-tag
- Responsivt: `isMobile = window.innerWidth < 640`
  - Mobil: full bredde + fixed bottom tabbar
  - Desktop: 220px sidebar + scrollbart innholdsområde
- Ingen `localStorage` – all state i minnet
- Clipboard: tre-lags fallback (navigator.clipboard → execCommand → vis tekst)

## Utvidelsesplan (kommende)
- Flere lekeplass-kategorier (saksutredning, møtereferat, one-pager, spørreundersøkelse)
- Organisasjonsspesifikke prompts med Tønsberg-kontekst og LLP-metodikk
- Persistering av egne prompts (Neon + auth)
- Deling av prototyper via kort slug-URL

## Kjøre lokalt
```bash
npm install
npm run dev
```

## Deploy
Koblet til Vercel via GitHub-integrasjon.
Push til `main` → automatisk deploy.
Preview-URL genereres for alle andre brancher.

## Kontakt / eier
Marius Haugen, Tønsbergløftet
