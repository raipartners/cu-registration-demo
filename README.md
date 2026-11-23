# CU Credit Union – Registration Demo

Clickable HTML prototype of the post-application registration flow (16 screens), built from the Figma section
**"Registration – CU Credit Union (post-application)"** in *Groundwork Card – Demo WIP*.

Real typing, real tab order, and real button gating — no build step, no dependencies.

## Run it

- **Locally:** open `index.html` in a browser, or run `python3 -m http.server` in this folder and visit http://localhost:8000.
- **GitHub Pages:** *Settings → Pages → Build and deployment → Deploy from a branch → `main` / `/ (root)`*. The demo is then live at `https://<owner>.github.io/<repo>/`.
- **Single file:** `python3 tools/build_standalone.py` writes `dist/cu-registration-demo.html` with CSS, JS and images inlined. Use it for email attachments or offline demos.

## Flow

| # | Screen | How to advance |
|---|---|---|
| 01 | Start Registration | Fill every field + both agreements + "I'm not a robot" → **Next** (stays disabled until valid; inline errors for email, password match, birthday, phone) |
| 02 | Email Verification (modal) | **Resend email** or the close **X** (Enter works; Resend is focused) |
| 03 | Email on the member's phone | **Verify my email** |
| 04–05 | Welcome / Two steps | Button or Enter |
| 06 | Verify mobile | **Send a passcode** ("Change the mobile phone number" returns to 01 with the phone field focused) |
| 07 | One-time passcode | Type or paste 8 digits (auto-advances between boxes, Backspace goes back) → **Verify** |
| 08 | SSN | Type 9 digits (auto-formats `###-##-####`, eye toggles visibility) → **Next** |
| 09–11 | Address / Confirm info / Profile complete | Button or Enter. Screen 10 shows what was typed on 01 and 08 |
| 12 | Payment method | Arrow keys or click to choose. *Link an account* → 13; *bill pay* / *mail a check* skip to 16 |
| 13 | Plaid explainer | **Next** (back arrow → 12) |
| 14 | Plaid placeholder | Auto-advances after 2.5s, or click / Enter |
| 15 | Account linked | **Next** ("Link another account" → 12) |
| 16 | Payments set up | **View my account** ends the demo and resets to 01 |

The progress bar runs 1–9 across screens 06–15. Names, email, phone, birthday and SSN (last 4) typed on screens 01 and 08 appear on screens 02, 04, 06, 07, 10, 11 and 16.

### Presenter shortcut

`Shift + Alt + D` fills the current form (01, 07 or 08) with demo data, so you can skip typing during a live walkthrough.

Deep links: `#step-01` … `#step-16` jump straight to a screen.

## Structure

```
index.html            all 16 screens (one <section> each)
css/styles.css        tokens + components (mirrors the Figma variables)
js/app.js             hash router, masks, validation, OTP, gating
assets/               logo + icons exported from Figma at 2–4x
tools/build_standalone.py   bundles everything into dist/ as one file
```

## Known demo simplifications

- Screen 03 is a rendered image of the Figma phone mockup, with a live button over it.
- Screen 06 says "6-digit passcode" but screen 07 has 8 boxes, matching the Figma file. Change `OTP_LEN` in `js/app.js` if this should be 6.
- Links that would leave the flow (terms, privacy, edit address, account portal) show a short "not part of this demo" note instead.
- No data leaves the browser; nothing is stored.
- A small "Prototype · don’t enter real personal information" badge sits bottom-right because the flow asks for an SSN and a password on a public URL. Remove `.demo-badge` from `index.html` for internal-only use.
