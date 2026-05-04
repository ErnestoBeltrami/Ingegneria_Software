# Operator UI Kit

Pixel-faithful recreation of the IoSonoTrento operator (municipal employee) interface, built on the design tokens in `../../colors_and_type.css`.

## Files

| File | What it is |
|---|---|
| `index.html` | Click-thru demo. Boots into the **Dashboard** with a "Demo · vai a Profilo operatore →" link in the bottom-left and a primary "Crea una nuova votazione" CTA that jumps to the create-vote screen. |
| `styles.css` | All component CSS, namespaced where it matters (`.po-` for Profilo Operatore per the spec). |
| `Icons.jsx` | Lucide-style inline SVG icon set used across the kit. |
| `TopBar.jsx` | Sticky top bar with logo, bell, user pill. |
| `ProfiloOperatorePage.jsx` | The spec page — sidebar identity card + info card + change-password card. |
| `DashboardOperatorePage.jsx` | Dashboard greeting, 3 nav cards, 2 action buttons, search, filter pills, activity grid. |
| `CreaVotazionePage.jsx` | Create-vote: title, description, dynamic options, date range, multi-answer toggle. |

## What's NOT in this kit

The upstream codebase has many more operator screens (`GestioneSondaggiPage`, `RiepilogoVotazionePage`, `ModificaVotazionePage`, etc.). They reuse exactly the components in this kit (badge, card, filter pill, primary/secondary button, glass field). Adding more screens is mostly composition — no new tokens needed.

The **public-facing surface** (`LandingPage`, `LoginPage`) is intentionally not included here. It uses Inter alongside Playfair, the Buonconsiglio hero photo, green CTAs (citizen flow). Those should live in a separate `ui_kits/public/` if/when needed.
