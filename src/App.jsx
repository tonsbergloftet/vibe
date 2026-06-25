import { useState, useEffect, useRef, useCallback } from "react";

// ── Tokens ────────────────────────────────────────────────────────────────────
const T = {
  bg: "#0f0f0f",
  surface: "#161616",
  surfaceHigh: "#1e1e1e",
  border: "#2a2a2a",
  borderHigh: "#3a3a3a",
  accent: "#f5c842",
  accentDim: "#f5c84220",
  text: "#e8e4dc",
  muted: "#666",
  mutedHigh: "#888",
  green: "#4ade80",
  red: "#f87171",
  blue: "#60a5fa",
  mono: "'IBM Plex Mono', monospace",
  sans: "'Inter', system-ui, sans-serif",
};

// ── Modules config ────────────────────────────────────────────────────────────
const MODULES = [
  { id: "intro", label: "Intro", icon: "✦" },
  { id: "inspire", label: "Se det", icon: "👁" },
  { id: "when", label: "Når passer det?", icon: "⚖" },
  { id: "prompt", label: "Lag din prompt", icon: "⌨" },
  { id: "preview", label: "Test prototypen", icon: "▶" },
  { id: "reflect", label: "Refleksjon", icon: "◎" },
];

// ── Kommuneapper for inspirasjon ──────────────────────────────────────────────
const KOMMUNE_APPS = [
  {
    title: "Møtebingo",
    dept: "HR & intern kommunikasjon",
    desc: "Huk av klisjeer du hører i møtet. Tre på rad = bingo.",
    tags: ["moro", "møter"],
    color: T.accent,
    icon: "🎯",
    prompt: "Lag møtebingo med kommuneklisjeer som synergi, forankring og veikart",
  },
  {
    title: "Tilbakemeldingsskjema",
    dept: "Innbyggertjenester",
    desc: "Enkel stjerneskala + fritekst. Ingen innlogging, ingen friksjon.",
    tags: ["innbygger", "skjema"],
    color: T.green,
    icon: "⭐",
    prompt: "Lag et enkelt tilbakemeldingsskjema med stjerneskala og fritekstfelt",
  },
  {
    title: "Prioriteringstavle",
    dept: "Prosjektledelse",
    desc: "Dra og slipp ideer inn i en enkel impact/effort-matrise.",
    tags: ["verktøy", "prioritering"],
    color: T.blue,
    icon: "📊",
    prompt: "Lag en impact/effort-matrise der man kan legge til og flytte ideer",
  },
  {
    title: "Sjekkliste for nyansatte",
    dept: "Onboarding",
    desc: "Interaktiv dag 1–30 sjekkliste med progresjonsbar.",
    tags: ["HR", "onboarding"],
    color: "#c084fc",
    icon: "✅",
    prompt: "Lag en interaktiv onboarding-sjekkliste for nyansatte med dag 1, uke 1 og måned 1",
  },
  {
    title: "Anonym humørmåler",
    dept: "Teamledelse",
    desc: "Snap-avstemning om energinivå – ingen data lagres.",
    tags: ["møter", "team"],
    color: "#fb923c",
    icon: "🌡",
    prompt: "Lag en anonym humørmåler der teamet kan stemme på energinivå",
  },
  {
    title: "Fraværsregistrering",
    dept: "Drift & renholdstjenester",
    desc: "Enkel daglig registrering med oversikt per uke.",
    tags: ["drift", "registrering"],
    color: T.red,
    icon: "📋",
    prompt: "Lag en enkel fraværsregistrering med ukeoversikt",
  },
];

// ── When-it-fits matrix ───────────────────────────────────────────────────────
const WHEN_ITEMS = [
  { fits: true, label: "Rask prototype for å teste en idé", icon: "🚀" },
  { fits: true, label: "Interaktivt verktøy til en workshop", icon: "🛠" },
  { fits: true, label: "Intern hjelpeside eller sjekkliste", icon: "📋" },
  { fits: true, label: "Demo for å overbevise beslutningstakere", icon: "💡" },
  { fits: false, label: "System som lagrer sensitive persondata", icon: "🔒" },
  { fits: false, label: "Integrasjon mot fagsystemer og API-er", icon: "🔗" },
  { fits: false, label: "Løsning som skal driftes og oppdateres", icon: "⚙" },
  { fits: false, label: "Universell utforming er lovpålagt", icon: "♿" },
];

const RETRY_OPTIONS = [
  {
    id: "boring",
    label: "Appen var kjedelig",
    icon: "😐",
    tip: "Prøv å beskrive en konkret situasjon eller handling i stedet for et verktøy. I stedet for «sjekkliste for renholdere» kan du skrive «en sjekkliste en renholder krysser av punkt for punkt på vakt, med en liten feiring når alt er ferdig».",
    promptHint: "– legg til hva brukeren gjør og hvordan det skal føles å fullføre",
  },
  {
    id: "wrong",
    label: "Appen misforstod ideen",
    icon: "🎯",
    tip: "Vær mer konkret om hvem som bruker appen og i hvilken situasjon. Legg til ett eksempel på hva som skal skje. F.eks.: «en leder registrerer fravær for sitt team – én knapp per person, én dag av gangen».",
    promptHint: "– beskriv hvem som bruker den og ett konkret eksempel på en handling",
  },
  {
    id: "complex",
    label: "For komplisert / rotete",
    icon: "🌀",
    tip: "Begrens ideen til én ting. Hva er den aller viktigste handlingen i appen? Skriv bare den. Alt annet kan legges til senere.",
    promptHint: "– skriv kun kjernehandlingen, én ting",
  },
  {
    id: "static",
    label: "Ingenting skjedde når jeg trykket",
    icon: "🪨",
    tip: "Beskriv eksplisitt hva du forventer skal skje. F.eks.: «når man trykker Registrer skal oppføringen dukke opp i en liste under, og knappen skal bekrefte med en grønn hake».",
    promptHint: "– beskriv hva som skal skje visuelt når brukeren gjør noe",
  },
];
// ── Prompt rammer ─────────────────────────────────────────────────────────────
const PROMPT_FRAMEWORKS = [
  { id: "tool", label: "Internt verktøy" },
  { id: "form", label: "Skjema / registrering" },
  { id: "game", label: "Lærings- / møteverktøy" },
  { id: "dash", label: "Oversikt / dashboard" },
  { id: "checklist", label: "Sjekkliste / guide" },
];

function generatePrompt(appIdea, framework, variant = "standard") {
  const retryNote = variant === "retry"
    ? "\n\nVIKTIG: En tidligere versjon var for statisk eller kjedelig. Tenk mer kreativt rundt interaksjonen denne gangen."
    : "";
  return `Bygg følgende som en fungerende HTML-prototype: "${appIdea}"${retryNote}

STEG 1 – VURDER APPTYPE FØRST:
Avgjør hvilken av disse to strategiene som passer best:

A) EKTE LOGIKK – appen fungerer fullt ut med HTML/JS alene.
   Eksempler: sjekklister, skjema, timere, avstemninger, spill, kalkulatorer.
   → Bygg vanlig interaktiv funksjonalitet.

B) SIMULERING – appen ville egentlig trenge AI, server eller ekstern data.
   Eksempler: tekstanalyse, klarspråkvask, oversettelse, chatbot, oppsummering.
   → VIKTIG: Brukeren skal IKKE kunne skrive inn egen tekst.
      Lag i stedet 3–4 hardkodede eksempelkort som brukeren velger mellom.
      Hvert kort viser en "før"-tekst og en ferdig "etter"-tekst.
      Bruk setTimeout(800–1200ms) og en loading-animasjon for å simulere behandling.
      Legg til <!-- SIMULERING --> som første linje i HTML-koden.

TEKNISKE KRAV – følg nøyaktig:
- Én enkelt HTML-fil, alt inline (CSS i <style>, JS i <script>)
- Ingen fetch, ingen eksterne biblioteker, ingen import
- Fungerer uten internett og uten server
- Responsiv på 375px skjermbredde
- Hold koden under 3000 tegn

VISUELT BASELINE:
- Bakgrunn #0f0f0f, tekst #e8e4dc, aksentfarge #f5c842
- border-radius 10–12px, romslig padding, font: system-ui
- Knapper med synlig hover og active state

INTERAKTIVITET:
- Minst én tydelig tilstandsendring når brukeren gjør noe
- Unngå statiske lister – selv en guide bør ha klikk, toggle eller animasjon
- Brukeren skal oppleve minst ett øyeblikk der noe skjer som føles overraskende bra

GENERELL KVALITET:
- Tom tilstand: tydelig oppfordring til handling
- Feilmeldinger inline, ikke alert()
- All data kun i minnet

Svar med kun HTML-koden, ingen forklaring.`;
}





// ── Utility: copy to clipboard (3-method fallback) ───────────────────────────
function copyToClipboard(text) {
  // Method 1: modern async clipboard API
  if (navigator?.clipboard?.writeText) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => {
      // Method 2: execCommand fallback
      return copyViaExecCommand(text);
    });
  }
  // Method 3: execCommand directly
  return Promise.resolve(copyViaExecCommand(text));
}

function copyViaExecCommand(text) {
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

// ── Utility: compress + encode for URL sharing ────────────────────────────────
async function compressToUrl(code) {
  try {
    const stream = new CompressionStream("deflate-raw");
    const writer = stream.writable.getWriter();
    const encoder = new TextEncoder();
    writer.write(encoder.encode(code));
    writer.close();
    const compressed = await new Response(stream.readable).arrayBuffer();
    const bytes = new Uint8Array(compressed);
    let binary = "";
    bytes.forEach(b => binary += String.fromCharCode(b));
    const b64 = btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
    const url = `${window.location.origin}${window.location.pathname}#preview=${b64}`;
    return { url, size: url.length };
  } catch {
    return null;
  }
}

// ── Shared components ─────────────────────────────────────────────────────────
function Tag({ children, color = T.accent }) {
  return (
    <span style={{
      fontFamily: T.mono, fontSize: 10, color,
      background: color + "18", border: `1px solid ${color}30`,
      padding: "2px 8px", borderRadius: 99, letterSpacing: "0.06em",
    }}>{children}</span>
  );
}

function ModuleHeader({ icon, label, title, subtitle }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span style={{ fontFamily: T.mono, fontSize: 11, color: T.accent, letterSpacing: "0.12em", textTransform: "uppercase" }}>{label}</span>
      </div>
      <h2 style={{ fontFamily: T.sans, fontSize: "clamp(22px,4vw,34px)", fontWeight: 800, color: T.text, margin: "0 0 12px", lineHeight: 1.15, letterSpacing: "-0.02em" }}>{title}</h2>
      {subtitle && <p style={{ fontFamily: T.sans, fontSize: 15, color: T.muted, margin: 0, lineHeight: 1.65, maxWidth: 560 }}>{subtitle}</p>}
    </div>
  );
}

function NavButton({ onClick, children, variant = "primary", disabled }) {
  const styles = {
    primary: { bg: T.accent, color: "#1a1000" },
    secondary: { bg: T.surfaceHigh, color: T.mutedHigh },
    ghost: { bg: "transparent", color: T.muted },
  };
  const s = styles[variant];
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: s.bg, color: s.color,
      border: `1px solid ${variant === "primary" ? T.accent : T.border}`,
      padding: "10px 22px", borderRadius: 8,
      fontFamily: T.sans, fontSize: 14, fontWeight: 600,
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.4 : 1,
      transition: "all 0.15s",
    }}>{children}</button>
  );
}

// ── MODULE: Intro ─────────────────────────────────────────────────────────────
function ModuleIntro({ onNext }) {
  const [revealed, setRevealed] = useState(false);
  useEffect(() => { setTimeout(() => setRevealed(true), 400); }, []);
  return (
    <div style={{ maxWidth: 600 }}>
      <div style={{ marginBottom: 48 }}>
        <p style={{ fontFamily: T.mono, fontSize: 11, color: T.accent, letterSpacing: "0.14em", textTransform: "uppercase", margin: "0 0 16px" }}>Velkommen</p>
        <h1 style={{
          fontSize: "clamp(30px,6vw,52px)", fontWeight: 800, lineHeight: 1.08,
          letterSpacing: "-0.025em", margin: "0 0 20px",
          opacity: revealed ? 1 : 0, transform: revealed ? "none" : "translateY(12px)",
          transition: "all 0.6s ease-out",
        }}>
          Du trenger ikke lære<br />
          <span style={{ color: T.accent }}>å kode.</span><br />
          Du trenger å lære<br />
          <span style={{ color: T.mutedHigh }}>å spørre.</span>
        </h1>
        <p style={{
          fontSize: 16, color: T.muted, lineHeight: 1.7, margin: "0 0 32px",
          opacity: revealed ? 1 : 0, transition: "all 0.6s ease-out 0.2s",
        }}>
          Vibekoding er en metode der du beskriver hva du vil ha – og AI bygger det.
          Denne guiden tar deg fra idé til fungerende prototype, steg for steg.
        </p>
      </div>

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 40,
        opacity: revealed ? 1 : 0, transition: "all 0.6s ease-out 0.35s",
      }}>
        {[
          { icon: "👁", label: "Se", desc: "Ekte ting kommuneansatte har laget" },
          { icon: "⌨", label: "Skriv", desc: "Generer en prompt tilpasset din idé" },
          { icon: "▶", label: "Test", desc: "Se prototypen leve i nettleseren" },
        ].map(s => (
          <div key={s.label} style={{
            background: T.surface, border: `1px solid ${T.border}`,
            borderRadius: 10, padding: "16px 14px",
          }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontFamily: T.sans, fontWeight: 700, fontSize: 14, color: T.text, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontFamily: T.sans, fontSize: 12, color: T.muted, lineHeight: 1.5 }}>{s.desc}</div>
          </div>
        ))}
      </div>

      <div style={{ opacity: revealed ? 1 : 0, transition: "all 0.6s ease-out 0.5s" }}>
        <NavButton onClick={onNext}>Start →</NavButton>
        <p style={{ fontFamily: T.mono, fontSize: 11, color: T.muted, marginTop: 12 }}>
          ~15 minutter · ingen forkunnskaper nødvendig
        </p>
      </div>
    </div>
  );
}

// ── MODULE: Inspire ───────────────────────────────────────────────────────────
function ModuleInspire({ onNext, onUsePrompt }) {
  const [active, setActive] = useState(null);
  return (
    <div style={{ maxWidth: 680 }}>
      <ModuleHeader
        icon="👁" label="Modul 1"
        title="Dette er laget av kommuneansatte"
        subtitle="Ingen av dem kunne kode. Alle hadde en idé og en god prompt."
      />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 36 }}>
        {KOMMUNE_APPS.map((app, i) => (
          <div key={i} onClick={() => setActive(active === i ? null : i)} style={{
            background: active === i ? T.surfaceHigh : T.surface,
            border: `1px solid ${active === i ? app.color + "60" : T.border}`,
            borderRadius: 12, padding: "16px", cursor: "pointer",
            transition: "all 0.18s",
          }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>{app.icon}</div>
            <div style={{ fontFamily: T.sans, fontWeight: 700, fontSize: 14, color: T.text, marginBottom: 4 }}>{app.title}</div>
            <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, marginBottom: 8 }}>{app.dept}</div>
            <p style={{ fontFamily: T.sans, fontSize: 12, color: T.muted, margin: 0, lineHeight: 1.5 }}>{app.desc}</p>
            {active === i && (
              <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${T.border}` }}>
                <div style={{ fontFamily: T.mono, fontSize: 11, color: T.muted, marginBottom: 8 }}>Prompt som ble brukt:</div>
                <div style={{
                  background: "#0a0a0a", border: `1px solid ${T.border}`,
                  borderRadius: 6, padding: "10px 12px",
                  fontFamily: T.mono, fontSize: 11, color: T.accent, lineHeight: 1.6,
                  marginBottom: 10,
                }}>{app.prompt}</div>
                <button onClick={(e) => { e.stopPropagation(); onUsePrompt(app.prompt); onNext(); }} style={{
                  background: app.color + "20", border: `1px solid ${app.color}50`,
                  color: app.color, borderRadius: 6, padding: "6px 14px",
                  fontFamily: T.sans, fontSize: 12, fontWeight: 600, cursor: "pointer",
                }}>Bruk denne ideen →</button>
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <NavButton onClick={onNext}>Jeg er inspirert →</NavButton>
        <span style={{ fontFamily: T.mono, fontSize: 11, color: T.muted }}>Klikk et kort for å se prompten</span>
      </div>
    </div>
  );
}

// ── MODULE: When ──────────────────────────────────────────────────────────────
function ModuleWhen({ onNext }) {
  const [revealed, setRevealed] = useState({});
  const toggle = (i) => setRevealed(r => ({ ...r, [i]: true }));
  const allRevealed = Object.keys(revealed).length >= 4;
  return (
    <div style={{ maxWidth: 600 }}>
      <ModuleHeader
        icon="⚖" label="Modul 2"
        title="Når er vibekoding riktig valg?"
        subtitle="Klikk på hvert punkt – er det grønt eller rødt?"
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 32 }}>
        {WHEN_ITEMS.map((item, i) => {
          const show = revealed[i];
          return (
            <div key={i} onClick={() => toggle(i)} style={{
              background: show ? (item.fits ? T.green + "12" : T.red + "12") : T.surface,
              border: `1px solid ${show ? (item.fits ? T.green + "50" : T.red + "50") : T.border}`,
              borderRadius: 10, padding: "14px 16px",
              cursor: show ? "default" : "pointer",
              display: "flex", alignItems: "center", gap: 14,
              transition: "all 0.22s",
            }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</span>
              <span style={{ fontFamily: T.sans, fontSize: 14, color: show ? T.text : T.muted, flex: 1 }}>{item.label}</span>
              {show && (
                <span style={{
                  fontFamily: T.mono, fontSize: 18, color: item.fits ? T.green : T.red,
                  fontWeight: 700,
                }}>{item.fits ? "✓" : "✕"}</span>
              )}
              {!show && (
                <span style={{ fontFamily: T.mono, fontSize: 11, color: T.muted }}>klikk</span>
              )}
            </div>
          );
        })}
      </div>
      {allRevealed && (
        <div style={{ background: T.accentDim, border: `1px solid ${T.accent}30`, borderRadius: 10, padding: "16px 18px", marginBottom: 28, animation: "fadeUp 0.3s ease-out" }}>
          <p style={{ fontFamily: T.sans, fontSize: 14, color: T.text, margin: 0, lineHeight: 1.6 }}>
            <strong style={{ color: T.accent }}>Tommelfingerregel:</strong> Vibekoding er ypperlig for å <em>utforske og demonstrere</em>. Ikke for å drifte og forvalte. Bruk det til å komme raskt fra idé til noe konkret – og vurder deretter om det bør bygges skikkelig.
          </p>
        </div>
      )}
      <NavButton onClick={onNext} disabled={!allRevealed}>
        {allRevealed ? "Jeg forstår grensene →" : `Avdekk ${8 - Object.keys(revealed).length} til…`}
      </NavButton>
    </div>
  );
}

// ── MODULE: Prompt builder ────────────────────────────────────────────────────
function ModulePrompt({ onNext, onPromptReady, prefillIdea, variant = 'standard', retryFeedback = null }) {
  const [idea, setIdea] = useState(prefillIdea || "");
  const [framework, setFramework] = useState("tool");
  const [copied, setCopied] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptSent, setPromptSent] = useState(false);

  const prompt = idea.trim() ? generatePrompt(idea, framework, variant) : null;

  const copy = () => {
    if (!prompt) return;
    copyToClipboard(prompt);
    setCopied(true);
    setPromptSent(true);
    onPromptReady(idea, prompt);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ maxWidth: 620 }}>
      <ModuleHeader
        icon="⌨" label="Modul 3"
        title="Lag din prompt"
        subtitle="Beskriv hva du vil lage – vi bygger en ferdig prompt du kan lime rett inn i Copilot."
      />

      {retryFeedback && (() => {
        const opt = RETRY_OPTIONS.find(o => o.id === retryFeedback);
        return opt ? (
          <div style={{ background: T.accentDim, border: `1px solid ${T.accent}30`, borderRadius: 10, padding: "14px 16px", marginBottom: 20, animation: "fadeUp 0.25s ease-out" }}>
            <p style={{ fontFamily: T.mono, fontSize: 11, color: T.accent, letterSpacing: "0.08em", margin: "0 0 6px" }}>TIPS FRA FORRIGE FORSØK</p>
            <p style={{ fontFamily: T.sans, fontSize: 13, color: T.text, margin: "0 0 4px", lineHeight: 1.6 }}>{opt.tip}</p>
            <p style={{ fontFamily: T.mono, fontSize: 11, color: T.muted, margin: 0 }}>{opt.promptHint}</p>
          </div>
        ) : null;
      })()}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontFamily: T.mono, fontSize: 11, color: T.muted, letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>HVA VIL DU LAGE?</label>
        <input
          value={idea}
          onChange={e => { setIdea(e.target.value); setShowPrompt(false); }}
          placeholder="f.eks. «sjekkliste for sommervikaropplæring»"
          style={{
            width: "100%", boxSizing: "border-box",
            background: T.surface, border: `1px solid ${idea ? T.borderHigh : T.border}`,
            borderRadius: 10, padding: "13px 16px",
            fontFamily: T.sans, fontSize: 15, color: T.text,
            outline: "none", transition: "border-color 0.15s",
          }}
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={{ fontFamily: T.mono, fontSize: 11, color: T.muted, letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>APPTYPE</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {PROMPT_FRAMEWORKS.map(f => (
            <button key={f.id} onClick={() => setFramework(f.id)} style={{
              background: framework === f.id ? T.accentDim : T.surface,
              border: `1px solid ${framework === f.id ? T.accent : T.border}`,
              borderRadius: 8, padding: "8px 14px",
              fontFamily: T.sans, fontSize: 13, color: framework === f.id ? T.accent : T.muted,
              cursor: "pointer", transition: "all 0.15s",
            }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {idea.trim() && (
        <div style={{ animation: "fadeUp 0.25s ease-out" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <label style={{ fontFamily: T.mono, fontSize: 11, color: T.muted, letterSpacing: "0.08em" }}>DIN PROMPT</label>
            <button onClick={() => setShowPrompt(s => !s)} style={{
              background: "none", border: "none", cursor: "pointer",
              fontFamily: T.mono, fontSize: 11, color: T.muted,
            }}>{showPrompt ? "skjul ▲" : "vis fullt ▼"}</button>
          </div>

          <div style={{
            background: "#0a0a0a", border: `1px solid ${T.border}`,
            borderRadius: 10, overflow: "hidden", marginBottom: 16,
          }}>
            <div style={{
              fontFamily: T.mono, fontSize: 12, color: T.green, lineHeight: 1.7,
              padding: "16px", maxHeight: showPrompt ? "none" : 80,
              overflow: "hidden", position: "relative",
            }}>
              {showPrompt ? prompt : prompt?.split("\n").slice(0, 3).join("\n") + "\n…"}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <button onClick={copy} style={{
              background: copied ? T.green + "20" : T.accent,
              color: copied ? T.green : "#1a1000",
              border: `1px solid ${copied ? T.green : T.accent}`,
              padding: "11px 24px", borderRadius: 8,
              fontFamily: T.sans, fontSize: 14, fontWeight: 600,
              cursor: "pointer", transition: "all 0.2s",
            }}>
              {copied ? "✓ Kopiert!" : "Kopier prompt"}
            </button>
            <span style={{ fontFamily: T.sans, fontSize: 13, color: T.muted }}>
              → Lim inn i <strong style={{ color: T.text }}>Microsoft Copilot</strong>
            </span>
          </div>


          {promptSent && (
            <div style={{ marginTop: 20, padding: "16px 18px", background: T.green + "10", border: `1px solid ${T.green}30`, borderRadius: 10, animation: "fadeUp 0.25s ease-out" }}>
              <p style={{ fontFamily: T.sans, fontSize: 14, color: T.text, margin: "0 0 6px", lineHeight: 1.6 }}>
                <strong style={{ color: T.green }}>Neste steg</strong>
              </p>
              <ol style={{ fontFamily: T.sans, fontSize: 14, color: T.muted, margin: "0 0 16px", paddingLeft: 20, lineHeight: 1.8 }}>
                <li>Åpne <strong style={{ color: T.text }}>Microsoft Copilot</strong> i et nytt vindu</li>
                <li>Lim inn prompten og trykk send</li>
                <li>Kopier all HTML-koden du får tilbake</li>
                <li>Kom tilbake hit og test den</li>
              </ol>
              <NavButton onClick={onNext}>Jeg har koden min →</NavButton>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


// ── RETRY reasons + tips ─────────────────────────────────────────────────────

function RetryMenu({ onRetry }) {
  const [selected, setSelected] = useState(null);
  const opt = RETRY_OPTIONS.find(o => o.id === selected);
  return (
    <div style={{ marginTop: 14, background: T.surfaceHigh, border: `1px solid ${T.border}`, borderRadius: 12, padding: "18px", animation: "fadeUp 0.2s ease-out" }}>
      <p style={{ fontFamily: T.mono, fontSize: 11, color: T.accent, letterSpacing: "0.1em", margin: "0 0 12px" }}>HVA GIKK GALT?</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: opt ? 16 : 0 }}>
        {RETRY_OPTIONS.map(o => (
          <button key={o.id} onClick={() => setSelected(o.id)} style={{
            background: selected === o.id ? T.accentDim : "#111",
            border: `1px solid ${selected === o.id ? T.accent : T.border}`,
            borderRadius: 8, padding: "10px 14px",
            display: "flex", alignItems: "center", gap: 12,
            fontFamily: T.sans, fontSize: 14,
            color: selected === o.id ? T.accent : T.muted,
            cursor: "pointer", textAlign: "left", transition: "all 0.15s",
          }}>
            <span style={{ fontSize: 18 }}>{o.icon}</span>
            {o.label}
          </button>
        ))}
      </div>
      {opt && (
        <div style={{ animation: "fadeUp 0.2s ease-out" }}>
          <div style={{ background: "#0a0a0a", border: `1px solid ${T.border}`, borderRadius: 8, padding: "14px 16px", marginBottom: 14 }}>
            <p style={{ fontFamily: T.sans, fontSize: 13, color: T.text, margin: "0 0 8px", lineHeight: 1.65 }}>
              <strong style={{ color: T.accent }}>Tips:</strong> {opt.tip}
            </p>
            <p style={{ fontFamily: T.mono, fontSize: 11, color: T.muted, margin: 0 }}>
              Når du er tilbake i prompt-feltet: {opt.promptHint}
            </p>
          </div>
          <NavButton onClick={() => onRetry(opt.id)}>Gå tilbake og forbedre prompten →</NavButton>
        </div>
      )}
    </div>
  );
}

// ── MODULE: Preview ───────────────────────────────────────────────────────────
function ModulePreview({ onNext, onRetry, appIdea }) {
  const [code, setCode] = useState("");
  const [showRetryMenu, setShowRetryMenu] = useState(false);
  const [active, setActive] = useState(false);
  const [copied, setCopied] = useState(false);
  const iframeRef = useRef(null);

  const run = () => {
    if (!code.trim()) return;
    setActive(true);
    setShareUrl(null);
    setShareStatus(null);
  };

  return (
    <div style={{ maxWidth: 680 }}>
      <ModuleHeader
        icon="▶" label="Modul 4"
        title="Se prototypen din leve"
        subtitle={appIdea ? `Lim inn koden Copilot laget for «${appIdea}»` : "Lim inn HTML-koden du fikk fra Copilot."}
      />

      <div style={{ marginBottom: 16 }}>
        <label style={{ fontFamily: T.mono, fontSize: 11, color: T.muted, letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>LIM INN HTML-KODEN HER</label>
        <textarea
          value={code}
          onChange={e => { const val = e.target.value.slice(0, 5000); setCode(val); setActive(false); setShareUrl(null); setShareStatus(null); }}
          placeholder={"<!DOCTYPE html>\n<html>…\n</html>"}
          style={{
            width: "100%", boxSizing: "border-box",
            background: "#0a0a0a", border: `1px solid ${code ? T.borderHigh : T.border}`,
            borderRadius: 10, padding: "14px 16px",
            fontFamily: T.mono, fontSize: 12, color: T.green,
            outline: "none", resize: "vertical", minHeight: 120,
            lineHeight: 1.6,
          }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          <span style={{ fontFamily: T.mono, fontSize: 10, color: code.length > 4000 ? T.red : T.muted }}>
            {code.length > 0 && `${code.length} / 5000 tegn`}
          </span>
          {code.length > 3500 && (
            <span style={{ fontFamily: T.mono, fontSize: 10, color: T.red }}>⚠ lang kode – deling via URL kan feile</span>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        <button onClick={run} disabled={!code.trim()} style={{
          background: code.trim() ? T.accent : T.surface,
          color: code.trim() ? "#1a1000" : T.muted,
          border: `1px solid ${code.trim() ? T.accent : T.border}`,
          padding: "10px 22px", borderRadius: 8,
          fontFamily: T.sans, fontSize: 14, fontWeight: 600,
          cursor: code.trim() ? "pointer" : "not-allowed",
          transition: "all 0.15s",
        }}>▶ Kjør prototype</button>
        {active && (
          <button onClick={() => {
            const presentiWindow = window.open(
              'https://presenti-six.vercel.app/editor',
              '_blank'
            );
            const handler = (e) => {
              if (e.data?.type === 'PRESENTI_READY') {
                presentiWindow.postMessage(
                  { type: 'PRESENTI_HTML', html: code },
                  '*'
                );
                window.removeEventListener('message', handler);
              }
            };
            window.addEventListener('message', handler);
            setTimeout(() => window.removeEventListener('message', handler), 5000);
          }} style={{
            background: T.surface, border: `1px solid ${T.border}`,
            color: T.mutedHigh, padding: "10px 22px", borderRadius: 8,
            fontFamily: T.sans, fontSize: 14, cursor: "pointer",
          }}>
            Publiser med Presenti
          </button>
        )}
      </div>

      {active && (
        <div style={{ animation: "fadeUp 0.3s ease-out" }}>
          <div style={{
            border: `1px solid ${T.accent}40`, borderRadius: 12,
            overflow: "hidden", marginBottom: 24,
          }}>
            <div style={{
              background: "#0a0a0a", padding: "8px 14px",
              display: "flex", alignItems: "center", gap: 8,
              borderBottom: `1px solid ${T.border}`,
            }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: T.red }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: T.accent }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: T.green }} />
              <span style={{ fontFamily: T.mono, fontSize: 11, color: T.muted, marginLeft: 6 }}>
                {appIdea || "prototype"}
              </span>
            </div>
            <iframe
              ref={iframeRef}
              srcDoc={code}
              sandbox="allow-scripts"
              style={{ width: "100%", height: 420, border: "none", background: "#fff", display: "block" }}
              title="Prototype preview"
            />
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <NavButton onClick={onNext}>Jeg er fornøyd →</NavButton>
            <button onClick={() => setShowRetryMenu(s => !s)} style={{
              background: "none",
              border: `1px solid ${T.border}`,
              color: T.muted,
              padding: "10px 20px", borderRadius: 8,
              fontFamily: T.sans, fontSize: 14, cursor: "pointer",
              transition: "all 0.15s",
            }}>↺ Ikke fornøyd</button>
          </div>
          {showRetryMenu && (
            <RetryMenu onRetry={onRetry} />
          )}
        </div>
      )}
    </div>
  );
}

// ── MODULE: Reflect ───────────────────────────────────────────────────────────
function ModuleReflect({ onRestart, appIdea }) {
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState(false);

  const QUESTIONS = [
    { id: "felt", prompt: "Hva overrasket deg mest med prosessen?", placeholder: "f.eks. «Hvor raskt det gikk» eller «At prompten måtte være så spesifikk»" },
    { id: "use", prompt: "Hvor kan du bruke dette på jobb?", placeholder: "f.eks. «I workshops» eller «For å visualisere en idé for ledelsen»" },
    { id: "limit", prompt: "Hva er den viktigste begrensningen å huske?", placeholder: "f.eks. «Ikke for systemer med persondata» eller «Krever oppfølging fra utvikler»" },
  ];

  const allAnswered = QUESTIONS.every(q => answers[q.id]?.trim().length > 2);

  return (
    <div style={{ maxWidth: 580 }}>
      {!done ? (
        <>
          <ModuleHeader
            icon="◎" label="Modul 5"
            title="Hva tar du med deg?"
            subtitle="Tre kjappe spørsmål – ingen fasit, bare din refleksjon."
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 28 }}>
            {QUESTIONS.map((q, i) => (
              <div key={q.id}>
                <label style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 600, color: T.text, display: "block", marginBottom: 8 }}>
                  {i + 1}. {q.prompt}
                </label>
                <textarea
                  value={answers[q.id] || ""}
                  onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
                  placeholder={q.placeholder}
                  rows={2}
                  style={{
                    width: "100%", boxSizing: "border-box",
                    background: T.surface, border: `1px solid ${answers[q.id]?.trim() ? T.borderHigh : T.border}`,
                    borderRadius: 8, padding: "10px 14px",
                    fontFamily: T.sans, fontSize: 14, color: T.text,
                    outline: "none", resize: "none", lineHeight: 1.5,
                  }}
                />
              </div>
            ))}
          </div>
          <NavButton onClick={() => setDone(true)} disabled={!allAnswered}>
            Fullfør →
          </NavButton>
          {!allAnswered && (
            <p style={{ fontFamily: T.mono, fontSize: 11, color: T.muted, marginTop: 8 }}>Svar på alle tre spørsmålene</p>
          )}
        </>
      ) : (
        <div style={{ animation: "fadeUp 0.5s ease-out", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 24 }}>✦</div>
          <h2 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 800, margin: "0 0 16px", lineHeight: 1.15, letterSpacing: "-0.02em" }}>
            {appIdea ? `«${appIdea}» er ditt første viberkodingsprosjekt.` : "Du har fullført."}
          </h2>
          <p style={{ fontSize: 15, color: T.muted, lineHeight: 1.7, margin: "0 0 36px", maxWidth: 440, marginLeft: "auto", marginRight: "auto" }}>
            Du har nå gått fra idé til fungerende prototype – uten å skrive en eneste linje kode.
            Det er ikke magi. Det er et nytt verktøy i verktøykassen din.
          </p>

          <div style={{
            background: T.surface, border: `1px solid ${T.border}`,
            borderRadius: 12, padding: "20px 24px", marginBottom: 32,
            textAlign: "left", maxWidth: 440, marginLeft: "auto", marginRight: "auto",
          }}>
            <div style={{ fontFamily: T.mono, fontSize: 11, color: T.accent, letterSpacing: "0.1em", marginBottom: 14 }}>DU NOTERTE</div>
            {QUESTIONS.map(q => (
              <div key={q.id} style={{ marginBottom: 12 }}>
                <div style={{ fontFamily: T.sans, fontSize: 12, color: T.muted, marginBottom: 4 }}>{q.prompt}</div>
                <div style={{ fontFamily: T.sans, fontSize: 14, color: T.text, lineHeight: 1.5 }}>{answers[q.id]}</div>
              </div>
            ))}
          </div>

          <NavButton onClick={onRestart} variant="secondary">↺ Start på nytt</NavButton>
        </div>
      )}
    </div>
  );
}


// ── Playground prompt categories ─────────────────────────────────────────────
const PLAYGROUND_CATEGORIES = [
  {
    id: "prototype",
    icon: "🛠",
    label: "Lag en prototype",
    desc: "Beskriv en app eller et verktøy – få en HTML-prototype klar til test.",
    placeholder: "f.eks. «en enkel fraværsregistrering for vaktlag»",
    buildPrompt: (idea) => `Bygg følgende som en fungerende HTML-prototype: "${idea}"

STEG 1 – VURDER APPTYPE FØRST:
A) EKTE LOGIKK – appen fungerer med HTML/JS alene (sjekklister, skjema, timere, spill).
B) SIMULERING – appen ville trenge AI/server (tekstanalyse, chatbot, oversettelse).
   → Bruk da 3–4 hardkodede eksempelkort. IKKE fritekstinput. setTimeout 800–1200ms.

TEKNISKE KRAV: Én HTML-fil, alt inline, ingen fetch/import, fungerer offline, maks 3000 tegn, responsiv 375px.
STIL: Bakgrunn #0f0f0f, tekst #e8e4dc, aksent #f5c842, border-radius 12px, system-ui.
INTERAKTIVITET: Minst én tydelig tilstandsendring. Noe overraskende bra skal skje.
Svar med kun HTML-koden.`,
  },
  {
    id: "klarspaak",
    icon: "✍️",
    label: "Klarspråkvask",
    desc: "Lim inn tekst – få den omskrevet til klart og forståelig språk.",
    placeholder: "Beskriv teksttypen, f.eks. «et vedtaksbrev til innbyggere»",
    buildPrompt: (ctx) => `Du er en klarspråkekspert for norsk offentlig sektor.

Kontekst: ${ctx}

Din oppgave: Skriv om teksten brukeren gir deg til klarspråk. Følg disse prinsippene:
- Bruk aktiv setningsoppbygging («vi sender» ikke «det sendes»)
- Korte setninger, maks 20 ord
- Unngå fagsjargong – bruk hverdagsord
- Bevar alt innhold og alle fakta
- Bruk «du» til mottakeren

Svar med: 1) Den omskrevne teksten, 2) En kort liste over de viktigste endringene du gjorde.`,
  },
  {
    id: "struktur",
    icon: "📐",
    label: "Strukturer et dokument",
    desc: "Beskriv hva du skal skrive – få en ferdig disposisjon.",
    placeholder: "f.eks. «en saksutredning om innføring av ny parkeringspolitikk»",
    buildPrompt: (idea) => `Du er en erfaren saksbehandler i norsk kommunal forvaltning.

Lag en klar og logisk disposisjon for følgende dokument: "${idea}"

Inkluder:
- Anbefalte overskrifter med kort beskrivelse av innholdet i hvert avsnitt
- Forslag til lengde per seksjon
- Tips om hva som bør stå først for å fange leserens oppmerksomhet
- Eventuelle vedlegg eller kilder som bør inkluderes

Hold det praktisk og direkte – dette er et arbeidsverktøy, ikke en mal.`,
  },
  {
    id: "meeting",
    icon: "🗓",
    label: "Forbered et møte",
    desc: "Beskriv møtet – få agenda, roller og forslag til fasilitering.",
    placeholder: "f.eks. «et oppstartsmøte med ny arbeidsgruppe på tvers av avdelinger»",
    buildPrompt: (idea) => `Du er en erfaren fasilitator i offentlig sektor.

Forbered følgende møte: "${idea}"

Lag:
1. En konkret agenda med tidsanslag per punkt
2. Forslag til roller (møteleder, referent, tidtaker)
3. Ett åpningsspørsmål som setter god stemning
4. Ett avslutningsspørsmål som sikrer felles forståelse av neste steg
5. Tre vanlige fallgruver for denne møtetypen – og hvordan unngå dem

Vær konkret og direkte. Unngå generiske råd.`,
  },
  {
    id: "feedback",
    icon: "🔍",
    label: "Analyser tilbakemeldinger",
    desc: "Lim inn svar fra en undersøkelse – få et strukturert sammendrag.",
    placeholder: "Beskriv undersøkelsens tema, f.eks. «medarbeiderundersøkelse om samhandling»",
    buildPrompt: (ctx) => `Du er en analytiker som hjelper kommunal sektor forstå tilbakemeldinger.

Kontekst: ${ctx}

Når brukeren gir deg tilbakemeldingstekster, skal du:
1. Identifisere de 3–5 viktigste temaene på tvers av svarene
2. Vise representativt sitater for hvert tema
3. Vurdere om tonen er overveiende positiv, nøytral eller kritisk
4. Foreslå ett konkret tiltak basert på funnene

Presenter resultatet oversiktlig med overskrifter. Hold deg til det som faktisk står i teksten.`,
  },
];

// ── Landing page ──────────────────────────────────────────────────────────────
function Landing({ onLearn, onPlay }) {
  const [hovered, setHovered] = useState(null);
  return (
    <div style={{
      minHeight: "100vh", background: T.bg, color: T.text,
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "40px 24px", fontFamily: T.sans,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;700&family=Inter:wght@400;600;700;800&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
        * { box-sizing: border-box; }
      `}</style>

      <div style={{ maxWidth: 560, width: "100%", textAlign: "center", animation: "fadeUp 0.5s ease-out" }}>
        <div style={{ fontFamily: T.mono, fontSize: 11, color: T.accent, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 20 }}>
          Tønsbergløftet · KI-verktøy
        </div>

        <h1 style={{ fontSize: "clamp(32px,7vw,56px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.025em", margin: "0 0 20px" }}>
          Vibekoding<br />
          <span style={{ color: T.accent }}>for alle.</span>
        </h1>

        <p style={{ fontSize: 16, color: T.muted, lineHeight: 1.7, margin: "0 0 52px", maxWidth: 420, marginLeft: "auto", marginRight: "auto" }}>
          Beskriv hva du vil ha – AI bygger det.
          Enten du er nybegynner eller klar til å leke deg.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 32 }}>
          {/* Learn path */}
          <button
            onClick={onLearn}
            onMouseEnter={() => setHovered("learn")}
            onMouseLeave={() => setHovered(null)}
            style={{
              background: hovered === "learn" ? "#1e1e1e" : T.surface,
              border: `1px solid ${hovered === "learn" ? T.accent + "60" : T.border}`,
              borderRadius: 16, padding: "28px 20px",
              cursor: "pointer", textAlign: "left",
              transition: "all 0.2s", color: T.text,
            }}>
            <div style={{ fontSize: 32, marginBottom: 14 }}>🗺</div>
            <div style={{ fontFamily: T.sans, fontWeight: 700, fontSize: 16, marginBottom: 8, color: T.text }}>
              Lær vibekoding
            </div>
            <div style={{ fontFamily: T.sans, fontSize: 13, color: T.muted, lineHeight: 1.55 }}>
              Jeg aner ikke hva dette er – ta meg gjennom det steg for steg.
            </div>
            <div style={{ marginTop: 16, fontFamily: T.mono, fontSize: 11, color: T.muted }}>
              ~15 min · 6 steg
            </div>
          </button>

          {/* Playground path */}
          <button
            onClick={onPlay}
            onMouseEnter={() => setHovered("play")}
            onMouseLeave={() => setHovered(null)}
            style={{
              background: hovered === "play" ? T.accentDim : T.surface,
              border: `1px solid ${hovered === "play" ? T.accent : T.border}`,
              borderRadius: 16, padding: "28px 20px",
              cursor: "pointer", textAlign: "left",
              transition: "all 0.2s", color: T.text,
            }}>
            <div style={{ fontSize: 32, marginBottom: 14 }}>⚡</div>
            <div style={{ fontFamily: T.sans, fontWeight: 700, fontSize: 16, marginBottom: 8, color: T.text }}>
              KI-lekeplassen
            </div>
            <div style={{ fontFamily: T.sans, fontSize: 13, color: T.muted, lineHeight: 1.55 }}>
              Ta meg rett dit – jeg vil bare ha hjelp med et prompt nå.
            </div>
            <div style={{ marginTop: 16, fontFamily: T.mono, fontSize: 11, color: T.accent }}>
              Velg oppgave · kopier prompt
            </div>
          </button>
        </div>

        <p style={{ fontFamily: T.mono, fontSize: 11, color: T.muted }}>
          Du kan alltid bytte mellom de to
        </p>
      </div>
    </div>
  );
}

// ── Playground ────────────────────────────────────────────────────────────────
function Playground({ onLearn }) {
  const [selected, setSelected] = useState(null);
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [isMobile] = useState(() => window.innerWidth < 640);

  const cat = PLAYGROUND_CATEGORIES.find(c => c.id === selected);
  const prompt = cat && input.trim() ? cat.buildPrompt(input.trim()) : null;

  const copy = () => {
    if (!prompt) return;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(prompt).catch(() => copyViaExecCommand(prompt));
    } else {
      copyViaExecCommand(prompt);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: T.sans }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;700&family=Inter:wght@400;600;700;800&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 99px; }
        textarea, input { font-family: inherit; }
      `}</style>

      {/* Top bar */}
      <div style={{
        background: T.surface, borderBottom: `1px solid ${T.border}`,
        padding: "14px 24px", display: "flex", alignItems: "center",
        justifyContent: "space-between", gap: 16,
      }}>
        <div>
          <span style={{ fontFamily: T.mono, fontSize: 10, color: T.accent, letterSpacing: "0.12em", textTransform: "uppercase" }}>KI-lekeplassen</span>
          <span style={{ fontFamily: T.sans, fontSize: 12, color: T.muted, marginLeft: 12 }}>Velg oppgave → skriv kontekst → kopier prompt til Copilot</span>
        </div>
        <button onClick={onLearn} style={{
          background: "none", border: `1px solid ${T.border}`,
          color: T.muted, borderRadius: 8, padding: "6px 14px",
          fontFamily: T.sans, fontSize: 12, cursor: "pointer",
          whiteSpace: "nowrap",
        }}>← Lær vibekoding</button>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: isMobile ? "24px 16px" : "40px 24px" }}>

        {/* Category picker */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontFamily: T.mono, fontSize: 11, color: T.muted, letterSpacing: "0.08em", marginBottom: 12 }}>HVA VIL DU GJØRE?</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {PLAYGROUND_CATEGORIES.map(c => (
              <button key={c.id} onClick={() => { setSelected(c.id); setInput(""); setCopied(false); }} style={{
                background: selected === c.id ? T.accentDim : T.surface,
                border: `1px solid ${selected === c.id ? T.accent : T.border}`,
                borderRadius: 10, padding: "10px 16px",
                cursor: "pointer", transition: "all 0.15s",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <span style={{ fontSize: 18 }}>{c.icon}</span>
                <span style={{ fontFamily: T.sans, fontSize: 13, fontWeight: selected === c.id ? 700 : 400, color: selected === c.id ? T.accent : T.muted }}>{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        {cat && (
          <div style={{ animation: "fadeUp 0.25s ease-out" }}>
            {/* Description */}
            <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: "14px 16px", marginBottom: 20 }}>
              <p style={{ fontFamily: T.sans, fontSize: 14, color: T.muted, margin: 0, lineHeight: 1.6 }}>{cat.desc}</p>
            </div>

            {/* Input */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontFamily: T.mono, fontSize: 11, color: T.muted, letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>DIN KONTEKST</label>
              <textarea
                value={input}
                onChange={e => { setInput(e.target.value); setCopied(false); }}
                placeholder={cat.placeholder}
                rows={3}
                style={{
                  width: "100%", background: T.surface,
                  border: `1px solid ${input.trim() ? T.borderHigh : T.border}`,
                  borderRadius: 10, padding: "12px 14px",
                  fontSize: 15, color: T.text, outline: "none",
                  resize: "vertical", lineHeight: 1.55,
                }}
              />
            </div>

            {/* Prompt preview + copy */}
            {prompt && (
              <div style={{ animation: "fadeUp 0.2s ease-out" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <label style={{ fontFamily: T.mono, fontSize: 11, color: T.muted, letterSpacing: "0.08em" }}>FERDIG PROMPT</label>
                  <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted }}>{prompt.length} tegn</span>
                </div>
                <div style={{
                  background: "#0a0a0a", border: `1px solid ${T.border}`,
                  borderRadius: 10, padding: "14px 16px", marginBottom: 14,
                  fontFamily: T.mono, fontSize: 12, color: T.green,
                  lineHeight: 1.7, maxHeight: 180, overflowY: "auto",
                  whiteSpace: "pre-wrap",
                }}>{prompt}</div>
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <button onClick={copy} style={{
                    background: copied ? T.green + "20" : T.accent,
                    color: copied ? T.green : "#1a1000",
                    border: `1px solid ${copied ? T.green : T.accent}`,
                    padding: "11px 24px", borderRadius: 8,
                    fontFamily: T.sans, fontSize: 14, fontWeight: 600,
                    cursor: "pointer", transition: "all 0.2s",
                  }}>{copied ? "✓ Kopiert!" : "Kopier prompt"}</button>
                  <span style={{ fontFamily: T.sans, fontSize: 13, color: T.muted }}>
                    → Lim inn i <strong style={{ color: T.text }}>Microsoft Copilot</strong>
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {!cat && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: T.muted }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⚡</div>
            <p style={{ fontFamily: T.sans, fontSize: 15, lineHeight: 1.65, margin: 0 }}>
              Velg en oppgave over for å komme i gang.<br />
              Vi lager et ferdig prompt du kan lime rett inn i Copilot.
            </p>
          </div>
        )}

        {/* Nudge to learn */}
        <div style={{ marginTop: 48, padding: "18px 20px", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 4 }}>Ny på vibekoding?</div>
            <div style={{ fontFamily: T.sans, fontSize: 13, color: T.muted }}>Lær å lage egne apper og prototyper – steg for steg.</div>
          </div>
          <button onClick={onLearn} style={{
            background: T.accent, color: "#1a1000",
            border: "none", borderRadius: 8, padding: "10px 20px",
            fontFamily: T.sans, fontSize: 13, fontWeight: 700, cursor: "pointer",
            whiteSpace: "nowrap",
          }}>Start læringstien →</button>
        </div>
      </div>
    </div>
  );
}

// ── Root app ──────────────────────────────────────────────────────────────────
export default function VibekodingApp() {
  const [mode, setMode] = useState("landing"); // "landing" | "learn" | "play"
  const [moduleIndex, setModuleIndex] = useState(0);
  const [appIdea, setAppIdea] = useState("");
  const [prefillIdea, setPrefillIdea] = useState("");
  const [retryMode, setRetryMode] = useState(false);
  const [retryFeedback, setRetryFeedback] = useState(null);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
  const contentRef = useRef(null);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const goTo = (i) => {
    setModuleIndex(i);
    setTimeout(() => contentRef.current?.scrollTo({ top: 0, behavior: "smooth" }), 50);
  };
  const next = () => goTo(Math.min(moduleIndex + 1, MODULES.length - 1));

  const handleUsePrompt = (ideaFromCard) => setPrefillIdea(ideaFromCard);
  const handlePromptReady = (idea) => setAppIdea(idea);
  const restart = () => {
    setModuleIndex(0);
    setAppIdea("");
    setPrefillIdea("");
    setRetryMode(false);
    setRetryFeedback(null);
  };

  if (mode === "landing") return <Landing onLearn={() => setMode("learn")} onPlay={() => setMode("play")} />;
  if (mode === "play") return <Playground onLearn={() => setMode("learn")} />;

  const modules_content = (
    <div key={moduleIndex} style={{ animation: "fadeUp 0.35s ease-out" }}>
      {moduleIndex === 0 && <ModuleIntro onNext={next} />}
      {moduleIndex === 1 && <ModuleInspire onNext={next} onUsePrompt={handleUsePrompt} />}
      {moduleIndex === 2 && <ModuleWhen onNext={next} />}
      {moduleIndex === 3 && (
        <ModulePrompt
          onNext={next}
          onPromptReady={handlePromptReady}
          prefillIdea={retryMode ? appIdea : prefillIdea}
          variant={retryMode ? 'retry' : 'standard'}
          retryFeedback={retryFeedback}
        />
      )}
      {moduleIndex === 4 && <ModulePreview onNext={next} onRetry={(fb) => { setRetryMode(true); setRetryFeedback(fb); goTo(3); }} appIdea={appIdea} />}
      {moduleIndex === 5 && <ModuleReflect onRestart={restart} appIdea={appIdea} />}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: T.bg, color: T.text, fontFamily: T.sans, overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;700&family=Inter:wght@400;600;700;800&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 99px; }
        textarea, input { font-family: inherit; }
      `}</style>

      {isMobile ? (
        <>
          {/* Mobile: progress bar top + content + bottom tabbar */}
          <div style={{ height: 3, background: T.border, flexShrink: 0 }}>
            <div style={{ height: 3, background: T.accent, width: `${(moduleIndex / (MODULES.length - 1)) * 100}%`, transition: "width 0.4s ease" }} />
          </div>

          <div ref={contentRef} style={{ flex: 1, overflowY: "auto", padding: "28px 20px 100px" }}>
            {modules_content}
          </div>

          {/* Bottom tab bar */}
          <div style={{
            position: "fixed", bottom: 0, left: 0, right: 0,
            background: T.surface, borderTop: `1px solid ${T.border}`,
            display: "flex", zIndex: 100,
          }}>
            {MODULES.map((m, i) => {
              const active = i === moduleIndex;
              const past = i < moduleIndex;
              return (
                <button key={m.id} onClick={() => goTo(i)} style={{
                  flex: 1, padding: "10px 4px 12px",
                  background: active ? T.accentDim : "none",
                  border: "none", borderTop: `2px solid ${active ? T.accent : "transparent"}`,
                  cursor: "pointer", display: "flex", flexDirection: "column",
                  alignItems: "center", gap: 3, transition: "all 0.15s",
                }}>
                  <span style={{ fontSize: 16 }}>{past && !active ? "✓" : m.icon}</span>
                  <span style={{
                    fontFamily: T.sans, fontSize: 9, fontWeight: active ? 700 : 400,
                    color: active ? T.accent : past ? T.mutedHigh : T.muted,
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    maxWidth: 52,
                  }}>{m.label}</span>
                </button>
              );
            })}
          </div>
        </>
      ) : (
        /* Desktop: sidebar + content */
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <div style={{
            width: 220, flexShrink: 0,
            background: T.surface, borderRight: `1px solid ${T.border}`,
            display: "flex", flexDirection: "column",
            padding: "28px 0", overflowY: "auto",
          }}>
            <div style={{ padding: "0 20px 24px", borderBottom: `1px solid ${T.border}` }}>
              <div style={{ fontFamily: T.mono, fontSize: 10, color: T.accent, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Vibekoding</div>
              <div style={{ fontFamily: T.sans, fontSize: 12, color: T.muted }}>for kommuneinnovatører</div>
              <button onClick={() => setMode("landing")} style={{ marginTop: 10, background: "none", border: `1px solid ${T.border}`, color: T.muted, borderRadius: 6, padding: "4px 10px", fontFamily: T.sans, fontSize: 11, cursor: "pointer" }}>← Forside</button>
            </div>
            <nav style={{ padding: "16px 0", flex: 1 }}>
              {MODULES.map((m, i) => {
                const active = i === moduleIndex;
                const past = i < moduleIndex;
                return (
                  <button key={m.id} onClick={() => goTo(i)} style={{
                    width: "100%", textAlign: "left",
                    background: active ? T.accentDim : "none", border: "none",
                    borderLeft: `2px solid ${active ? T.accent : past ? T.green + "50" : "transparent"}`,
                    padding: "10px 20px", cursor: "pointer",
                    transition: "all 0.15s", display: "flex", alignItems: "center", gap: 10,
                  }}>
                    <span style={{ fontSize: 14 }}>{past && !active ? "✓" : m.icon}</span>
                    <span style={{
                      fontFamily: T.sans, fontSize: 13,
                      fontWeight: active ? 700 : 400,
                      color: active ? T.accent : past ? T.mutedHigh : T.muted,
                    }}>{m.label}</span>
                  </button>
                );
              })}
            </nav>
            {moduleIndex > 0 && (
              <div style={{ padding: "16px 20px", borderTop: `1px solid ${T.border}` }}>
                <div style={{ height: 3, background: T.border, borderRadius: 99, marginBottom: 6 }}>
                  <div style={{ height: 3, background: T.accent, borderRadius: 99, width: `${(moduleIndex / (MODULES.length - 1)) * 100}%`, transition: "width 0.4s ease" }} />
                </div>
                <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted }}>{moduleIndex} / {MODULES.length - 1} fullført</span>
              </div>
            )}
          </div>
          <div ref={contentRef} style={{ flex: 1, overflowY: "auto", padding: "52px 40px" }}>
            {modules_content}
          </div>
        </div>
      )}
    </div>
  );
}
