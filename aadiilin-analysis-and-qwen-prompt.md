# Aadiilin Trivia Blitz — Full Code Analysis & Redesign Prompt
*Analysed by Claude · Ready for Qwen 3.6*

---

## 1. COMPLETE CODE AUDIT

### 1.1 Architecture Overview
The project is a **real-time multiplayer trivia game** built as a monorepo:
- `artifacts/api-server/` — Node.js + TypeScript WebSocket server (Express + ws), OpenAI question generation
- `artifacts/trivia/` — React 18 + Vite + TypeScript frontend (Framer Motion, shadcn/ui, Tailwind CSS v4)
- `lib/` — Shared libraries: api-client-react, api-zod, db (Drizzle + schema)

### 1.2 Bugs & Issues Found

#### Critical Bugs
| # | Location | Issue | Fix |
|---|----------|-------|-----|
| 1 | `final.tsx:68` | Template literal string `"{isMe ? 'text-secondary' : ''}"` is a raw string, not a JSX expression — the class never applies | Change to `` className={`flex-grow font-bold truncate ${isMe ? 'text-secondary' : ''}`} `` |
| 2 | `ws-context.tsx:39` | `hasTicked` state in `question.tsx` is declared inside `useEffect` deps but is also updated inside the timer, causing potential infinite re-renders | Move `hasTicked` into a `useRef` instead of `useState` |
| 3 | `room.tsx` | Redirect logic `if (!state.role && state.connected && state.phase === "idle")` fires before WS reconnect completes, causing premature redirect on refresh | Add a 300ms delay with `useRef` flag before redirecting |
| 4 | `ws-context.tsx` | WS URL construction: `import.meta.env.BASE_URL` may end with `/`, and `.replace(/\/$/, "")` is applied before appending `/ws`, which is correct — but if `BASE_URL` is just `/`, the URL becomes `wss://host/ws` (correct). However, **no reconnect logic exists** — if WS drops mid-game, the user is stuck on CONNECTING screen forever | Add exponential backoff reconnect with a `reconnectAttempts` counter |
| 5 | `game.ts` | No room cleanup for abandoned rooms. `rooms` Map grows indefinitely in memory — rooms created but never started are never deleted | Add a `setInterval` cleanup that removes rooms older than 30 minutes |
| 6 | `questions.ts` | OpenAI API key is accessed via `process.env.OPENAI_API_KEY` with no guard — if the key is missing the server throws unhandled | Add a startup check and graceful error response |

#### Logic Issues
| # | Location | Issue |
|---|----------|-------|
| 7 | `lobby.tsx` | `canStart = state.players.length > 0` — host is always a player too, so this always allows start with just 1 person (host alone). Intentional? Should be `> 1` for multiplayer |
| 8 | `question.tsx` | `progress` calculation: `(timeLeft / q.seconds) * 100` — `timeLeft` is fractional (computed every 50ms), but the bar width jitters slightly due to floating point. Clamp to `Math.max(0, Math.min(100, ...))` |
| 9 | `reveal.tsx` | `isLastQuestion = q.index === q.total - 1` — indices are 0-based, but `q.total` is the total count. This is correct, but verify `game.ts` sends `index` as 0-based (it does: `currentIndex` starts at 0) |
| 10 | `ws-context.tsx` | `answerAck` stores the index of submitted answer in state but is reset on QUESTION action — it's not persisted in sessionStorage. On browser refresh during a question, the user can answer twice | Store `answerAck` in sessionStorage alongside code/playerId |

#### TypeScript Issues
| # | Location | Issue |
|---|----------|-------|
| 11 | `ws-context.tsx:28` | `Action` type uses `payload: any` on LOBBY, QUESTION, REVEAL, FINAL actions — defeats type safety | Create typed payload interfaces |
| 12 | `avatars.tsx` | `getAvatar(id)` has no fallback for unknown ids — if `avatarId` doesn't exist in the array it returns `undefined`, causing runtime crash | Add `?? AVATARS[0]` fallback |
| 13 | Multiple files | `import React from "react"` is unnecessary in React 18 (JSX transform) — minor cleanliness issue | Remove unnecessary React imports |

#### UX Issues
| # | Location | Issue |
|---|----------|-------|
| 14 | `landing.tsx` | No error state when room code is wrong/expired. User is silently redirected to `/join/XXXX` which may just hang | Add toast/error if WS returns error after joining |
| 15 | `join.tsx` | Avatar grid shows all avatars at once with no indication of how many there are. On small screens, 4-column grid with 8+ avatars is cramped | Make avatar grid scrollable or use a swipeable carousel |
| 16 | `host-setup.tsx` | Slider range for "Seconds per question" is 10–30 step 5. With only 5 values (10,15,20,25,30), a dropdown/segmented control would be cleaner than a slider | Use button group or tabs for time selection |
| 17 | `question.tsx` | `isHost` check exists but host sees the same answer buttons as players — host shouldn't be answering | Show a host-only "moderator view" instead of the answer buttons |
| 18 | All pages | No loading skeleton — when WebSocket is connecting, users see raw "CONNECTING..." text | Styled animated loader |
| 19 | `generating.tsx` | Tick sound plays every 500ms via `setInterval` — this leaks audio context if component unmounts mid-interval (cleanup exists but sfx.playTick may queue | Ensure sfx is a singleton with proper stop method |
| 20 | `final.tsx` | Winner's avatar bounces with `animate-bounce` CSS class — this creates layout jank on some devices | Use Framer Motion `animate={{ y: [0, -20, 0] }}` with `repeat: Infinity` instead |

---

## 2. UI/UX IMPROVEMENT RECOMMENDATIONS

### Color System
- **Problem:** Dark mode and light mode use *identical* CSS variable values — the dark theme is a copy-paste of light. Dark mode is effectively broken.
- **Fix:** Implement proper dark theme with dark backgrounds (`270 20% 8%`) and adjusted foreground colors.

### Typography
- **Problem:** `Droid Sans` is used for both display and body font — it's a bland, generic Android system font with poor web rendering at large sizes.
- **Recommendation:** Replace with a bold display font like **"Bungee"** or **"Black Han Sans"** for headings, and **"JetBrains Mono"** or **"IBM Plex Mono"** for the monospace elements that give the game its arcade feel.

### Visual Hierarchy
- The landing page `TRIVIA BLITZ` heading uses `text-transparent bg-clip-text` gradient — great idea, but the gradient colors (`from-primary via-secondary to-accent`) don't have enough contrast between stops on the light background.
- Answer buttons in `question.tsx` use hardcoded HSL values instead of the design system tokens — creates maintenance debt.

### Animation Gaps
- Lobby player-join animations exist ✅
- Question appear animation exists ✅
- **Missing:** No page transition animations between routes
- **Missing:** No confetti/particle burst on the final screen
- **Missing:** Reveal screen choices should animate in sequentially, not all at once
- **Missing:** Score counter should animate (count-up) not just appear

### Accessibility
- No `aria-label` on icon-only buttons (Copy Link button)
- Answer buttons lack keyboard navigation (`tabIndex` ordering)
- Color-only feedback (correct = pink border, wrong = destructive) — should add icons for colorblind users (checkmark ✓ / X) — this exists in reveal but not in question

### Mobile UX
- Question text at `text-3xl md:text-5xl lg:text-6xl` — the `lg` class never triggers on mobile game play. Long question text overflows on small screens.
- Fixed footer buttons in `reveal.tsx` and the host control float correctly, but there's a `h-24` spacer that's hardcoded — should use `pb-safe` for devices with home indicators.

---

## 3. SKEUOMORPHISM + ANIMATED BG DESIGN DIRECTION

The game calls for an **arcade machine / retro cabinet** skeuomorphic aesthetic:
- Glossy plastic buttons with inset shadows and shine gradients
- Bevel/emboss on cards (outer highlight on top-left, shadow on bottom-right)
- Scanline overlay texture on backgrounds
- Animated particle/star field or flowing neon grid background
- CRT monitor vignette effect on the outer edges
- LCD-style number display for timer and scores
- Physical dial/knob controls for the host setup sliders

---

## 4. QWEN 3.6 IMPLEMENTATION PROMPT

```
You are a senior frontend engineer specializing in React, TypeScript, Tailwind CSS v4, and Framer Motion. You will redesign and fix a real-time multiplayer trivia game called "Trivia Blitz" built with:
- React 18 + Vite + TypeScript
- Tailwind CSS v4 (with @theme inline blocks, NOT tailwind.config.js)
- Framer Motion for animations
- shadcn/ui components
- wouter for routing
- WebSocket state managed via React Context + useReducer

The project has the following file structure:
artifacts/trivia/src/
  index.css
  main.tsx
  pages/
    landing.tsx
    join.tsx
    host-setup.tsx
    room.tsx
    not-found.tsx
  components/room/
    lobby.tsx
    generating.tsx
    question.tsx
    reveal.tsx
    final.tsx
  lib/
    ws-context.tsx
    avatars.tsx
    sfx.ts

---

## TASK: Apply all of the following changes in one complete pass

### STEP 1 — Fix all bugs

1. In `final.tsx` line ~68, fix the broken className: change the raw string `"{isMe ? 'text-secondary' : ''}"` to a proper template literal expression `${isMe ? 'text-secondary' : ''}`.

2. In `question.tsx`, replace the `hasTicked` useState with a useRef to prevent re-render loops:
```tsx
const hasTickedRef = useRef(new Set<number>());
// Replace all setHasTicked calls with hasTickedRef.current.add(...)
// Replace all hasTicked.has() calls with hasTickedRef.current.has(...)
// Remove hasTicked from useEffect dependencies
```

3. In `room.tsx`, add a delay before the redirect to prevent premature navigation on reconnect:
```tsx
const redirectTimerRef = useRef<NodeJS.Timeout | null>(null);
useEffect(() => {
  if (!state.role && state.connected && state.phase === "idle") {
    redirectTimerRef.current = setTimeout(() => {
      setLocation(`/join/${roomCode}`);
    }, 500);
  }
  return () => { if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current); };
}, [state.role, state.connected, state.phase, roomCode, setLocation]);
```

4. In `ws-context.tsx`, add WebSocket reconnect logic. After `ws.onclose`, schedule a reconnect with exponential backoff (max 5 attempts, starting at 1s):
```tsx
let reconnectAttempts = 0;
const MAX_RECONNECTS = 5;
const connect = () => { /* existing WS setup code */ };
ws.onclose = () => {
  dispatch({ type: "DISCONNECT" });
  if (reconnectAttempts < MAX_RECONNECTS) {
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 15000);
    reconnectAttempts++;
    setTimeout(connect, delay);
  }
};
```

5. In `avatars.tsx`, add a fallback in `getAvatar`: return `AVATARS[0]` if the id is not found.

6. In `question.tsx`, add bounds clamping for the progress bar:
```tsx
const progress = Math.max(0, Math.min(100, (timeLeft / q.seconds) * 100));
```

---

### STEP 2 — Redesign index.css with Skeuomorphic Arcade theme

Replace the entire contents of `index.css` with the following design:

**Design Direction:** Dark arcade machine aesthetic. Deep dark navy/charcoal backgrounds. Neon pink and cyan accent glows. Buttons must look physically pressable with:
- Glossy plastic top highlight (inset gradient from light to transparent)
- Hard shadow bottom (simulates physical depth)
- Subtle bevel on cards

**Font Stack:**
- Import from Google Fonts: `Bungee` (display/headings), `JetBrains Mono` (mono/UI labels), `Nunito` (body/readable text)
- Assign: `--font-display: 'Bungee'`, `--font-mono: 'JetBrains Mono'`, `--font-sans: 'Nunito'`

**Color Tokens (dark arcade theme):**
```
--background: 230 25% 7%        /* very dark navy */
--foreground: 210 20% 92%       /* off-white */
--card: 230 20% 11%             /* slightly lighter than bg */
--card-foreground: 210 20% 92%
--border: 230 15% 18%
--primary: 330 90% 60%          /* hot pink neon */
--primary-foreground: 0 0% 100%
--secondary: 185 90% 45%        /* cyan neon */
--secondary-foreground: 230 25% 7%
--accent: 50 95% 55%            /* yellow neon */
--accent-foreground: 230 25% 7%
--muted: 230 15% 16%
--muted-foreground: 230 10% 50%
--destructive: 0 85% 58%
```

**Skeuomorphic CSS classes to add:**
```css
/* Arcade button - plastic glossy */
.arcade-btn {
  position: relative;
  border-radius: 1rem;
  border-bottom: 6px solid; /* color varies per button */
  overflow: hidden;
  transition: transform 80ms ease, border-bottom-width 80ms ease;
}
.arcade-btn::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 45%;
  background: linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 100%);
  border-radius: 1rem 1rem 60% 60% / 1rem 1rem 40% 40%;
  pointer-events: none;
  z-index: 1;
}
.arcade-btn:active {
  transform: translateY(4px);
  border-bottom-width: 2px;
}

/* Skeuomorphic card */
.skeu-card {
  background: linear-gradient(145deg, hsl(230 20% 14%), hsl(230 20% 9%));
  border: 1px solid hsl(230 15% 20%);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.07),
    0 4px 20px rgba(0,0,0,0.5),
    0 1px 3px rgba(0,0,0,0.3);
  border-radius: 1.25rem;
}

/* LCD number display */
.lcd-display {
  font-family: 'JetBrains Mono', monospace;
  background: hsl(130 30% 5%);
  color: hsl(130 80% 55%);
  border: 2px solid hsl(130 20% 15%);
  box-shadow: inset 0 2px 8px rgba(0,0,0,0.8), 0 0 12px rgba(0,255,100,0.15);
  border-radius: 0.5rem;
  text-shadow: 0 0 8px currentColor;
  padding: 0.25rem 0.75rem;
}

/* Neon glow text */
.neon-text-pink {
  text-shadow: 0 0 10px rgba(255,60,150,0.8), 0 0 30px rgba(255,60,150,0.4), 0 0 60px rgba(255,60,150,0.2);
}
.neon-text-cyan {
  text-shadow: 0 0 10px rgba(0,220,220,0.8), 0 0 30px rgba(0,220,220,0.4), 0 0 60px rgba(0,220,220,0.2);
}
.neon-text-yellow {
  text-shadow: 0 0 10px rgba(255,220,0,0.8), 0 0 30px rgba(255,220,0,0.4);
}

/* CRT scanlines overlay */
.crt-overlay::after {
  content: '';
  position: fixed;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    rgba(0,0,0,0.03) 0px,
    rgba(0,0,0,0.03) 1px,
    transparent 1px,
    transparent 2px
  );
  pointer-events: none;
  z-index: 9999;
}

/* CRT vignette */
.crt-overlay::before {
  content: '';
  position: fixed;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.6) 100%);
  pointer-events: none;
  z-index: 9998;
}
```

**Animated Background (add to body):**
```css
body {
  background-color: hsl(var(--background));
  background-image:
    radial-gradient(ellipse at 20% 50%, rgba(255,60,150,0.06) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(0,220,220,0.06) 0%, transparent 50%),
    radial-gradient(ellipse at 60% 80%, rgba(100,60,255,0.05) 0%, transparent 40%);
  background-attachment: fixed;
}
```

**Add an animated grid background class:**
```css
.animated-grid {
  position: fixed;
  inset: 0;
  z-index: 0;
  background-image:
    linear-gradient(rgba(0,220,220,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,220,220,0.04) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: grid-drift 20s linear infinite;
  pointer-events: none;
}
@keyframes grid-drift {
  from { background-position: 0 0; }
  to { background-position: 50px 50px; }
}
```

**Neo shadow classes (update existing):**
```css
.neo-shadow { box-shadow: 0 6px 0 rgba(0,0,0,0.5), 0 8px 20px rgba(0,0,0,0.3); }
.neo-shadow-hover:hover { transform: translateY(-3px); box-shadow: 0 9px 0 rgba(0,0,0,0.5), 0 12px 25px rgba(0,0,0,0.4); }
.neo-shadow-active:active { transform: translateY(4px); box-shadow: 0 2px 0 rgba(0,0,0,0.5); }
```

---

### STEP 3 — Redesign landing.tsx

Replace the component with this enhanced version:
- Add the `animated-grid` div as absolute positioned background
- Add a `crt-overlay` class to the outer div
- The `TRIVIA BLITZ` heading: use `font-display` class (Bungee), add `neon-text-pink` class
- Add a subtitle: `"AI-Powered · Real-Time · Multiplayer"` in small mono text with letter-spacing
- The HOST A GAME button: add `arcade-btn` class with a pink bottom border and glossy shine
- The JOIN GAME button: add `arcade-btn` class with cyan bottom border
- Add animated floating particles (5-6 small circles with Framer Motion):
```tsx
{[...Array(6)].map((_, i) => (
  <motion.div
    key={i}
    className="absolute w-2 h-2 rounded-full opacity-40"
    style={{
      background: i % 2 === 0 ? 'hsl(330,90%,60%)' : 'hsl(185,90%,45%)',
      left: `${10 + i * 15}%`,
      top: `${20 + (i % 3) * 25}%`,
    }}
    animate={{ y: [-20, 20, -20], opacity: [0.2, 0.6, 0.2] }}
    transition={{ duration: 3 + i * 0.7, repeat: Infinity, ease: "easeInOut" }}
  />
))}
```
- The room code input: add `lcd-display` styling class, make the border glow cyan on focus

---

### STEP 4 — Redesign question.tsx

- Timer bar at top: change from a simple color bar to a segmented bar with 10 equal segments that go dark as time expires (use CSS clip-path or flex)
- Answer buttons: apply `arcade-btn` class + the existing COLORS array but extend them with proper border-bottom colors:
```tsx
const ARCADE_COLORS = [
  { bg: 'hsl(330,90%,58%)', border: 'hsl(330,90%,38%)', text: 'white', glow: 'rgba(255,60,150,0.4)' },
  { bg: 'hsl(185,90%,42%)', border: 'hsl(185,90%,25%)', text: 'hsl(230,25%,7%)', glow: 'rgba(0,220,220,0.4)' },
  { bg: 'hsl(48,95%,52%)', border: 'hsl(48,95%,32%)', text: 'hsl(230,25%,7%)', glow: 'rgba(255,210,0,0.4)' },
  { bg: 'hsl(270,80%,62%)', border: 'hsl(270,80%,42%)', text: 'white', glow: 'rgba(150,60,255,0.4)' },
]
// Apply inline style for bg, borderBottom, boxShadow using the glow value
```
- Add answer letter labels (A, B, C, D) as absolute positioned top-left badges on each button
- The timer countdown number: display it as a large `lcd-display` number in the center above the question
- Add `skeu-card` class to the question text container
- Answer locked in state: show a pulsing ring animation around the selected answer

---

### STEP 5 — Redesign generating.tsx

Replace the simple star SVG with a more elaborate loading animation:
```tsx
// Three concentric rotating rings
<div className="relative w-40 h-40">
  {[0, 1, 2].map((i) => (
    <motion.div
      key={i}
      className="absolute inset-0 rounded-full border-2"
      style={{
        borderColor: i === 0 ? 'hsl(330,90%,60%)' : i === 1 ? 'hsl(185,90%,45%)' : 'hsl(48,95%,55%)',
        scale: 1 - i * 0.2,
        opacity: 0.8 - i * 0.2,
        boxShadow: `0 0 20px ${i === 0 ? 'rgba(255,60,150,0.5)' : i === 1 ? 'rgba(0,220,220,0.5)' : 'rgba(255,210,0,0.5)'}`,
      }}
      animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
      transition={{ duration: 3 - i * 0.5, repeat: Infinity, ease: "linear" }}
    />
  ))}
  <div className="absolute inset-0 flex items-center justify-center text-4xl">✨</div>
</div>
```
- Add animated dots to "Cooking up questions" text using Framer Motion staggered children
- Background: add the animated-grid class

---

### STEP 6 — Redesign lobby.tsx

- Room code display: wrap it in a `skeu-card` with a `lcd-display` styled room code (green LCD style: `hsl(130,80%,55%)` color, dark green background, inner glow shadow)
- Player cards: apply `skeu-card` class, add a subtle inner glow matching the player's avatar color
- START GAME button: large `arcade-btn` with yellow/accent coloring, add a pulsing glow animation when enabled:
```tsx
<motion.div animate={canStart ? { boxShadow: ['0 0 20px rgba(255,210,0,0.3)', '0 0 40px rgba(255,210,0,0.6)', '0 0 20px rgba(255,210,0,0.3)'] } : {}} transition={{ duration: 2, repeat: Infinity }}>
  <Button ... />
</motion.div>
```
- Waiting for players: animate with a typewriter effect or bouncing dots

---

### STEP 7 — Redesign final.tsx

- Fix the broken className bug (item 1 above)
- Replace `animate-bounce` on winner avatar with Framer Motion
- Add a confetti burst effect using CSS @keyframes falling particles:
```css
@keyframes confetti-fall {
  0% { transform: translateY(-100px) rotate(0deg); opacity: 1; }
  100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
}
.confetti-piece {
  position: fixed;
  width: 10px;
  height: 10px;
  animation: confetti-fall linear forwards;
}
```
- Generate 30 confetti pieces in `useEffect` on mount, each with random: left position (0-100%), animation duration (2-4s), animation delay (0-1s), background color from the neon palette
- Winner name: apply `neon-text-yellow` class for the gold champion treatment
- Score display: animate the score counting up from 0 to winner.score using a `useEffect` + `requestAnimationFrame` counter

---

### STEP 8 — Redesign host-setup.tsx and join.tsx

For **host-setup.tsx**:
- Replace the Seconds slider with a button-group row showing [10s] [15s] [20s] [25s] [30s] buttons with `arcade-btn` styling — selected one is highlighted
- Keep Rounds slider but style the track with a cyan gradient fill
- Topic input: add a neon border glow on focus
- Apply `skeu-card` to the main Card

For **join.tsx**:
- Name input: `lcd-display` styled border and glow
- Avatar grid: add a glow ring around selected avatar using `box-shadow: 0 0 20px <avatar-color>`; animate entry of the grid with staggered Framer Motion children
- Apply `skeu-card` to the main Card

---

### STEP 9 — Add animated background component

Create a new file `src/components/AnimatedBackground.tsx`:
```tsx
import { motion } from "framer-motion";

export function AnimatedBackground() {
  return (
    <>
      {/* Drifting grid */}
      <div className="animated-grid" aria-hidden="true" />
      
      {/* Floating orbs */}
      {[
        { x: '10%', y: '20%', color: 'rgba(255,60,150,0.08)', size: 400, dur: 18 },
        { x: '80%', y: '60%', color: 'rgba(0,220,220,0.07)', size: 350, dur: 22 },
        { x: '50%', y: '80%', color: 'rgba(100,60,255,0.06)', size: 300, dur: 15 },
      ].map((orb, i) => (
        <motion.div
          key={i}
          className="fixed rounded-full pointer-events-none"
          style={{
            left: orb.x,
            top: orb.y,
            width: orb.size,
            height: orb.size,
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            x: [-30, 30, -30],
            y: [-20, 20, -20],
          }}
          transition={{ duration: orb.dur, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </>
  );
}
```

Import and use `<AnimatedBackground />` at the top of each page component (inside the outermost div, as the first child, with `pointer-events-none` and `z-index: 0`).

---

### STEP 10 — Page transitions

In `main.tsx` (or wherever routes are rendered), wrap page content with:
```tsx
import { AnimatePresence, motion } from "framer-motion";

// Wrap route output:
<AnimatePresence mode="wait">
  <motion.div
    key={currentLocation}
    initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
    exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
  >
    {/* route content */}
  </motion.div>
</AnimatePresence>
```

---

### OUTPUT REQUIREMENTS

- Produce the COMPLETE rewritten file for each of the following. Do not produce diffs — output full files:
  1. `src/index.css` (complete Tailwind v4 theme + all new CSS)
  2. `src/pages/landing.tsx`
  3. `src/pages/join.tsx`
  4. `src/pages/host-setup.tsx`
  5. `src/components/room/lobby.tsx`
  6. `src/components/room/generating.tsx`
  7. `src/components/room/question.tsx`
  8. `src/components/room/reveal.tsx`
  9. `src/components/room/final.tsx`
  10. `src/components/AnimatedBackground.tsx` (new file)
  11. `src/lib/ws-context.tsx` (with reconnect fix + typed payloads)
  12. `src/lib/avatars.tsx` (with getAvatar fallback fix)
  13. `src/pages/room.tsx` (with delayed redirect fix)

- Preserve all existing TypeScript interfaces and WebSocket message handling.
- Do not change the WebSocket protocol, message types, or server-side code.
- Use only Tailwind CSS v4 utility classes and the custom classes defined in index.css — no inline style objects except where Framer Motion requires dynamic values.
- All Framer Motion animations must use the `framer-motion` package (already installed).
- Use `lucide-react` for icons (already installed).
- No new npm dependencies unless absolutely necessary — if you must add one, explain why.
```

---

## 5. QUICK BUG-FIX CHECKLIST (for manual review)

- [ ] `final.tsx:68` — template literal fix
- [ ] `question.tsx` — hasTicked → useRef
- [ ] `room.tsx` — delayed redirect
- [ ] `ws-context.tsx` — reconnect logic
- [ ] `avatars.tsx` — getAvatar fallback
- [ ] `question.tsx` — progress clamp
- [ ] Dark mode CSS variables — complete the dark theme
- [ ] Room memory leak in `game.ts` — add cleanup interval
- [ ] OpenAI key guard in `questions.ts`
