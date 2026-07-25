# Handoff: HEREV Yacht Showroom — Design System

## Overview
HEREV is a curated, high-trust lead-generation showroom for five premium motor-yacht marques (De Antonio, Galeon, Parker, Sax Dor, Chris-Craft). It converts three visitor mindsets — Dreamers (lifestyle), Comparers (specs) and Ready buyers (fast path to a human advisor). This package is the **design system** extracted from the working prototypes: the visual language, tokens and core components a developer needs to build the product in a real codebase.

## About the Design Files
The files in this bundle are **design references created in HTML** — prototypes and a reference sheet showing the intended look and behaviour, **not production code to copy directly**. The task is to **recreate these designs in the target codebase's existing environment** (React, Vue, Svelte, native, etc.) using its established patterns and libraries. If no environment exists yet, choose the most appropriate framework and implement there. The token files (`tokens.css`, `tokens.json`, `tailwind.config.js`) *are* meant to be committed and consumed directly.

## Fidelity
**High-fidelity (hifi).** Final colours, typography, spacing, radius and interactions are all decided. Recreate the UI pixel-for-pixel using the codebase's libraries, wiring the exact token values below.

## The Aesthetic
Architectural editorial meets precision instrument. Deep sea ink, brass and gilt, one teal, sharp corners. Three typefaces with distinct jobs: **Fraunces** (display), **Inter** (body/UI), **IBM Plex Mono** (labels, specs — the "instrument" voice). The signature device is the **waterline / length scale**: length overall (LOA) is the one spec comparable across all five marques, so it recurs as a brass rule under the wordmark, along the hero, and on every fleet card as a position in the 8–16 m band.

## Design Tokens
Canonical values live in `tokens.css` (CSS custom properties, `--herev-*`), mirrored in `tokens.json` and `tailwind.config.js`.

### Colour
| Token | Hex / value | Role |
|---|---|---|
| `--herev-ink` | #0F252E | Sea Ink — primary dark: headers, footers, lead modules |
| `--herev-paper` | #ECEFEE | Chart Paper — primary light surface |
| `--herev-white` | #FFFFFF | card surface |
| `--herev-teal` | #2C6E77 | Water Teal — links, secondary accent, configurator CTA |
| `--herev-brass` | #94702F | Brass — labels, waterline motif, accents on light |
| `--herev-gilt` | #C9A45E | Gilt — primary CTA, accents on ink |
| `--herev-mist` | #C6CDCC | canvas / page backdrop |
| `--herev-line` | rgba(15,37,46,.14) | hairline divider on light |
| `--herev-line-strong` | rgba(15,37,46,.28) | input border, emphatic rule |
| `--herev-line-on-ink` | rgba(236,239,238,.14) | divider on ink |

Body/muted text: `--herev-ink-70` (rgba(15,37,46,.70)) on paper, `--herev-paper-72` (rgba(236,239,238,.72)) on ink.

### Typography
- **Fraunces** (`--herev-font-display`) — headings + wordmark. Weights 340 (wordmark/hero), 360, 400 (heads), 450 (card titles). Large heads track `-0.01em`.
- **Inter** (`--herev-font-body`) — body & UI. Weights 400 / 500 / 600.
- **IBM Plex Mono** (`--herev-font-mono`) — labels, specs, captions. Tracking .16em–.34em, often uppercase.

Scale (px): hero 64 · h1 52 · h2 36 · h3 24 · title 20 · lg 17 · body 15 · sm 14 · label 11 · micro 10.
Line-heights: heads 1.0–1.12, body 1.6–1.7.

### Space (4px base, px)
4 · 8 · 12 · 16 · 20 · 26 · 34 · **44 (page gutter)** · 56 · **70 (section rhythm)** · 90

### Radius — the house is sharp
`--herev-radius-none: 0` for structural surfaces (cards, panels, image blocks — most of the UI squares off). `--herev-radius-soft: 6px` for **all interactive controls — buttons and boxed inputs/textarea alike** — so forms read as one cohesive unit. `--herev-radius-cta: 2px` remains for any legacy CTA; pills are rare.

### Elevation
- `--herev-shadow-card`: 0 24px 60px -30px rgba(15,37,46,.50)
- `--herev-shadow-panel`: 0 30px 70px -34px rgba(15,37,46,.55)

### Motion
- Ease `--herev-ease`: cubic-bezier(.2,.6,.2,1)
- Image hover scale: 0.8s (`transform:scale(1.05)`)
- Hero ken-burns: 9s ease-out (scale 1.08 → 1)

## Core Components
Values are exact (hifi). Interactive controls use `--herev-radius-soft` (6px); structural surfaces are square.

### Buttons — padding 15px 26px · Inter 600 · 14px · `--herev-radius-soft` (6px) · gap 12px to an IBM Plex Mono arrow
- **Primary / Gilt** (loudest CTA): bg `--herev-gilt`, text `--herev-ink`. Used on both surfaces for the single strongest action ("Speak with an advisor").
- **Ink solid**: bg `--herev-ink`, text #fff. Primary on light surfaces ("Request information").
- **White solid**: bg #fff, text `--herev-ink`. Primary on the hero/ink.
- **Teal**: bg `--herev-teal`, text #fff. Signals configuration ("Open the configurator").
- **Outline / Save**: bg `--herev-paper`, 1px `--herev-line-strong`, text ink, IBM Plex Mono 600 13px; encloses a bookmark icon. Filled state uses brass fill.
- **Ghost on ink**: bg rgba(255,255,255,.1), 1px rgba(255,255,255,.4), text #fff.
- **Text link**: IBM Plex Mono 600 13px, `--herev-teal` (or `--herev-gilt` on ink), trailing →.
- **Underlined link**: IBM Plex Mono 600 13px, 1px `--herev-line-strong` bottom border, 4px pad.

### Form controls — two registers
- **Underline (on ink)**: transparent bg, no border except `border-bottom:1px rgba(236,239,238,.3)`, text #fff, padding 12px 2px, 15px. Used in hero/inline lead modules.
- **Boxed (on light)**: bg #fff, 1px rgba(15,37,46,.16), `--herev-radius-soft` (6px), padding 13px 14px, 14px. Used in the model sidebar and mobile. A fixed-value field (e.g. "Model: Galeon 500 FLY") renders as a static boxed row in IBM Plex Mono.
- `outline:none`; no focus ring in prototype — add an accessible focus style (e.g. brass outline) in production.

### Fleet card (width ~300, radius 0, `--herev-shadow-card` when raised)
- Image block aspect-ratio 4/3.2, bg ink; brand tag top-left (IBM Plex Mono 700 9.5px, .2em, white, text-shadow); save button top-right 34×34 on rgba(15,37,46,.42) + blur.
- Body padding 18px: Fraunces 450 20px title; IBM Plex Mono 10.5px .12em teal use-case; **length bar** (44px IBM Plex Mono LOA label + 3px track rgba(15,37,46,.12) with a brass fill sized `(loa-8)/(16-8)`); footer row (top 1px `--herev-line`) with IBM Plex Mono 12px price + teal "Enquire →".

### Spec row
Flex space-between, padding 15px 0, bottom 1px `--herev-line` (list top 1px `--herev-line-strong`). Key: IBM Plex Mono 12px .12em `--herev-ink-55`. Value: IBM Plex Mono 700 15px, right-aligned.

### Labels & tags
- **Eyebrow**: IBM Plex Mono 700 11px, .30em, `--herev-brass` (or `--herev-gilt` on ink), uppercase.
- **Index chip**: bg ink, paper text, IBM Plex Mono 700 11px .16em, padding 6px 9px.
- **Breadcrumb**: IBM Plex Mono 10.5px .14em `--herev-ink-55`, current segment full ink.
- **Marque set**: Fraunces 380 .16em caps.

### Waterline / length-scale motif
- **Card variant**: 3px track + brass fill (above).
- **Panel variant**: label row (IBM Plex Mono 10px .2em + LOA readout), 2px `--herev-line-strong` full track, brass fill to the model %, 11px brass dot at the head, 8 M / 16 M end labels.
- **Ruler variant** (on ink, hero): SVG baseline + alternating tall/short ticks at 8 equal steps, rgba(255,255,255,.5).

## Screens (see the working prototype, `Herev.dc.html`)
1. **Homepage — desktop**: transparent-over-hero header, 660px hero with dual gradient + ken-burns + waterline ruler, featured-fleet strip (5 cards), ink trust band (marques + awards), 3-step advisory grid, split inline lead module (image + form on ink), network teaser with stat trio, ink footer.
2. **Homepage — mobile (400×820)**: sticky ink header, 440px hero, stacked fleet list, ink lead module, **sticky bottom CTA bar** (Enquire + Call).
3. **Model detail — desktop**: ink slim header, breadcrumb + title row with Save + Request CTAs, main column (16:9 gallery + thumb strip + categorised detail tabs + spec table + length-scale panel + configurator CTA), **sticky sidebar lead form** (boxed).

## Interactions & Behaviour
- **Language switcher** EN·IT·ES·PL·DE — swaps all bound copy live; active code highlighted. Full copy table (`L`) is in `Herev.dc.html`.
- **Save to favourites** — per-model toggle; brass filled bookmark when saved, outline when not (card, mobile row, detail header all share state).
- **Lead forms** (homepage inline, model sidebar, mobile) — on submit, `preventDefault` then swap to a thank-you panel ("message received", brass-bordered).
- **Gallery** — thumbnail click sets active hero image + caption; brass 2px border marks the active thumb.
- **Detail tabs** (Helm / Cockpit / Saloon / Deck plan) — swap categorised image + copy; active tab gets ink text + 2px brass underline.
- Image hover scale 1.05 over 0.8s; hero ken-burns on load.

## State Management
- `lang` (string) — current language, drives copy table lookup.
- `saved` (map id→bool) — favourite toggles, shared across surfaces.
- `gallery` (int) — active gallery index.
- `tab` (string) — active detail-shot category.
- `sent` (map key→bool) — which lead forms have been submitted (`lead`, `model`, `mobile`).

## Assets
Real yacht photography in `assets/` (referenced by the prototype): De Antonio, Galeon (430/450 running, cockpit, saloon), Parker (helm, Sorrento dusk), Sax Dor (460 aerial sunset), Cannes marina, deck-plan top-down. **These are placeholders/reference for layout** — replace with licensed marque photography in production. Fonts load from Google Fonts (Fraunces, Inter, IBM Plex Mono); use @fontsource or self-hosting in production.

## Files
- `design-system/tokens.css` — CSS custom properties (`--herev-*`). Consume directly.
- `design-system/tokens.json` — same tokens as structured data (Style-Dictionary friendly).
- `design-system/tailwind.config.js` — Tailwind preset (colours, fonts, sizes, spacing, shadow, radius).
- `Herev Design System.dc.html` — the visual reference sheet (foundations + components).
- `Herev.dc.html` — the full working prototypes (homepage desktop + mobile, model detail).

## Accessibility notes for production
- Add visible focus rings (missing in prototype) — brass outline recommended.
- Verify contrast: brass (#94702F) on paper passes for large/bold text; gilt (#C9A45E) needs ink text, not white.
- Ensure the mobile sticky CTA doesn't overlap final content (prototype reserves 92px).
