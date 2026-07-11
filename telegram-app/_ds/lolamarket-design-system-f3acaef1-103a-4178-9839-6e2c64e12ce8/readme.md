# Lolamarket Design System

A modern **glassmorphism** UI system for **Lolamarket** — Central Asia's B2B textile marketplace. Frosted-glass surfaces, a soft color mesh, and layered depth convey trust, clarity, and a premium trade experience for buyers and mills trading ikat, adras, suzani, cotton, silk, wool and finished home textiles across Uzbekistan, Kazakhstan and Kyrgyzstan.

> **Provenance / sources.** This system was authored from the brand brief only — **no codebase, Figma file, or asset pack was provided**. Every token, component, asset (logo, icons, textile swatches) and screen here is original work created for Lolamarket. If you have an existing codebase, Figma library, brand book, or real product photography, share it and this system will be reconciled against the source of truth.

The name **Lola** means *tulip* — the flower of Central Asian spring festivals (Boysun, Navruz) and a recurring motif in regional textile and tile work. The tulip is the brand's mark; the palette is drawn from natural textile dyes (pomegranate, indigo, saffron, Samarkand turquoise).

---

## Brand at a glance
- **Primary — Lola (tulip/pomegranate):** warm coral-red `#E84B40`. One primary action per view.
- **Secondary — Samarkand teal:** turquoise `#119DAB`. Links, secondary actions, "on/active" states.
- **Accent — Saffron:** gold `#D98E0C`. Sparingly, for highlights and stars.
- **Neutrals — Ink:** indigo-tinted greys from `#FFFFFF` to `#171A30`.
- **Type:** Bricolage Grotesque (display) · Hanken Grotesk (UI/body) · Geist Mono (SKUs, prices, quantities).
- **Signature:** frosted glass surfaces (`backdrop-filter` blur + saturate) floating over a fixed radial **color mesh** background.

---

## CONTENT FUNDAMENTALS — how Lolamarket writes

**Voice:** confident, warm, and concrete — a trusted trading partner, not a hype machine. We respect that buyers and mills are professionals moving real money and real cloth.

- **Person:** Address the user as **you**; the platform is **we/Lolamarket**. ("**You** set the MOQ, **we** hold the escrow.")
- **Casing:** **Sentence case** everywhere — buttons, headings, menus, table headers are the exception and use UPPERCASE only as small tracked eyebrows/labels (e.g. `MARKETPLACE`, column headers). Never Title Case sentences.
- **Tone:** plain, specific, numbers-forward. Prefer "Replies within 24h" over "Lightning-fast responses". Prefer "MOQ 300 m · 28-day lead time" over adjectives.
- **Verbs:** action-first on controls — *Request quote, Message supplier, Add sample, Place order, Track shipment*. Not "Submit", "Click here".
- **Numbers & units:** always show units (m, m², g/m², days) and use the mono font with tabular figures. Currency is USD by default (`$4.80/m`), quantities grouped with thousands separators (`12,400 m`).
- **Trade vocabulary is welcome:** MOQ, lead time, incoterm (FOB/CIF/EXW), escrow, dye lot, GSM, swatch, sampling. The audience knows these terms; don't over-explain.
- **Regional warmth, used lightly:** an occasional greeting like *"Salom, Dilnoza"* on a dashboard is on-brand. Place names (Margilan, Bukhara, Osh, Almaty) ground the product in the region.
- **Emoji:** essentially none in the UI. A single 🌷 tulip is the *only* sanctioned emoji and only as a rare warm flourish (a greeting), never in body copy, buttons, or data. Don't use other emoji.
- **Errors/empty states:** factual and helpful — "120 m left — message the mill for a larger run" not "Oops!".

Examples:
- Eyebrow → H1: `MARKETPLACE` → "Textiles from Central Asia"
- Supporting line: "8 listings from 28 verified mills · escrow on every order"
- Toast: "Quote request sent — Margilan Silk Co. typically replies within 24h"
- Badge: "Verified", "Low stock", "Made to order", "In production"

---

## VISUAL FOUNDATIONS

**Overall feeling:** light, airy, premium. Content floats as frosted glass over a soft, colorful, slightly-blurred mesh — the blur has something to refract, which is what makes glass read as glass. Depth comes from layering and soft shadow, not heavy borders.

**Background:** the page is **never flat white**. It uses `--mesh-bg`: four radial color blobs (teal, saffron, coral, soft violet) over a pale indigo gradient, `background-attachment: fixed` so surfaces appear to slide over it. This is the single most important brand cue. Dark sections use a deep indigo gradient (`#1B1E3C → #0F1228`).

**Surfaces / cards:** frosted glass — translucent white fill (`rgba(255,255,255,.38–.72)`) + `backdrop-filter: blur(16–28px) saturate(150–160%)`, a hairline `rgba(255,255,255,.4–.65)` border, an **inset top highlight** (`inset 0 1px 0 rgba(255,255,255,.7)`) that reads as a glass lens edge, and a soft layered drop shadow. Three weights: soft / base / strong. Over imagery, use the dark glass variant. Corner radius is generous — cards `20px`, dialogs `28px`.

**Color use:** brand colors are *accents on neutral glass*, not large fills. Coral primary appears on one CTA per view; teal carries interactive/active meaning; saffron is reserved for ratings/highlights. Large coral/teal areas only as gradients (`--gradient-brand`, `--gradient-teal`) on heroes or the logo mark. Textile imagery is **vivid and warm** — the procedural ikat/adras/suzani swatches are saturated, celebrating the cloth.

**Type:** display set in Bricolage Grotesque, 700–800, tight tracking (`-0.02em`) for headlines; body in Hanken Grotesk 400–600 at 15px/1.55; all figures (prices, SKUs, quantities) in Geist Mono with `tabular-nums`. Eyebrows are 11px, 700, uppercase, `0.08em` tracking, in teal.

**Spacing:** 4px base unit; components breathe (card padding 16–24px). Layouts are centered, max-width ~1240px, generous gutters.

**Radii:** xs 6 · sm 10 · md 14 · lg 20 · xl 28 · pill 999. Inputs/buttons `md`, cards `lg`, dialogs `xl`, chips/badges/tabs pill.

**Borders:** hairlines only — `rgba(23,26,48,.10)` on solid surfaces, translucent white on glass. No heavy 2px borders, no colored left-accent borders.

**Shadows:** soft, cool-tinted (indigo `rgba(23,26,48,…)`), layered (a tight contact shadow + a wide ambient one). Scale xs→xl. Colored glows (`--glow-primary`, `--glow-teal`) appear only on hover of primary/teal controls. The composed `--glass-shadow` bundles ambient shadow + the inset highlight.

**Motion:** smooth and gentle. Standard ease `cubic-bezier(.22,.61,.36,1)`, a springy `cubic-bezier(.34,1.56,.64,1)` for toggles/knobs/dialog entrance. Durations 120/200/340ms. No long or looping decorative animation.

**Hover states:** cards lift `translateY(-3px)` + stronger shadow; glass buttons increase fill opacity; ghost buttons get a faint tinted wash; primary/teal buttons gain a colored glow. Never change hue on hover.

**Press states:** controls scale down slightly (`scale(.985)` buttons, `scale(.92)` icon buttons) and nudge down 1px — a tactile "press into glass" feel. No color change on press.

**Focus:** a 4px soft **teal** ring (`--focus-ring`, `rgba(17,157,171,.45)`) plus a teal border — visible and on-brand, never a default browser outline.

**Transparency & blur — when:** glass + blur on anything floating *above* content or the mesh — nav bars, cards, dialogs, toasts, tags, dropdowns, the dialog scrim. Solid (`variant="solid"`) surfaces for dense data (tables, stat tiles) where legibility matters most. Don't stack many heavy blurs in a tight area (performance + mud).

**Imagery vibe:** warm, saturated, celebratory of the cloth; procedural textile patterns stand in for photography here. Real photography should be warm-toned, well-lit, fabric-forward (close weave detail, bolts, looms), never cold or corporate-grey.

---

## ICONOGRAPHY

- **Approach:** a single **line-icon** style — 24×24 viewBox, **2px stroke**, round caps and joins, no fill. Clean and neutral so the colorful glass + textile imagery carry the personality. Icons inherit `currentColor`; tint with text/teal/primary tokens as needed.
- **Source:** icons are drawn inline as SVG `<path>` data in the UI kit (search, cart, message, heart, chevrons, plus, arrows, verified badge). They match **Lucide / Feather** geometry (2px, round, 24px) — so for any icon not yet hand-drawn, pull it from **Lucide** (`https://unpkg.com/lucide-static`) and it will sit consistently. *(Substitution flag: no project icon set existed; Lucide is the recommended match — swap to the brand's real set if one exists.)*
- **The verified-supplier mark** is a custom scalloped seal with an inner check — a small brand-specific glyph; keep it teal.
- **Emoji as icons:** no. The only emoji used anywhere is the rare 🌷 greeting flourish.
- **Unicode glyphs:** the star ★ is acceptable inline for ratings (alongside the saffron SVG star); otherwise use SVG.
- **Logo/mark:** the tulip mark in `assets/` — gradient coral bloom, teal stem + leaf, white petal separators. Provided as `lola-mark.svg` (mark only), `lola-logo.svg` (on light), `lola-logo-light.svg` (on dark/color).

---

## INDEX / manifest

**Root**
- `styles.css` — the single entry point consumers link (`@import` lines only).
- `readme.md` — this guide.
- `SKILL.md` — Agent-Skill manifest for download/Claude Code use.
- `_ds_bundle.js`, `_ds_manifest.json`, `_adherence.oxlintrc.json` — **generated**, do not edit.

**tokens/** (each `@import`ed by `styles.css`)
- `colors.css` — brand ramps (lola/teal/saffron), ink neutrals, semantic status, aliases.
- `typography.css` — families, scale, weights, leading, tracking.
- `spacing.css` — space scale, radii, control heights, layout.
- `effects.css` — **glass fills, blur, shadows, mesh background, gradients, motion**.
- `base.css` — light element resets + `.lola-glass`, `.lola-eyebrow`, `.lola-numeric` helpers.

**fonts/**
- `fonts.css` — Bricolage Grotesque, Hanken Grotesk, Geist Mono via Google Fonts CDN. *(See caveat — self-host for production.)*

**components/** (React primitives, `window.LolamarketDesignSystem_f3acae`)
- `forms/` — Button, IconButton, Input, Textarea, Select, Checkbox, Radio, Switch
- `feedback/` — Badge, Tag, Toast, Tooltip, Dialog, Progress
- `data/` — Card, Avatar, Stat, Tabs, Table

**ui_kits/**
- `marketplace/` — clickable B2B marketplace web app (Browse → Product → Quote → Dashboard). See its `README.md`.

**guidelines/** — foundation specimen cards (Colors, Type, Spacing, Brand) shown in the Design System tab.

**assets/** — `lola-mark.svg`, `lola-logo.svg`, `lola-logo-light.svg`.

---

## Caveats
- **Fonts** load from the **Google Fonts CDN** (closest matches chosen for a premium grotesque + editorial display + clean mono). They aren't self-hosted, so they don't register as bundled webfonts. For production, provide licensed font files and swap `fonts/fonts.css` to `@font-face` rules.
- **Icons** are inline SVGs in Lucide/Feather geometry; **Lucide** is the recommended CDN set for anything not yet drawn.
- **No source material** (code/Figma/photos) was provided — everything is an original interpretation of the brief and should be validated against any real Lolamarket assets you have.
