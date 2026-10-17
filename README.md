# Stage Pacer

**v1.0.0** · Foundry VTT V13–V14 · © DM Bank

Discord: https://discord.gg/XWfgWKpxJp

---

Table-pacing signals: separate signal buttons for the DM and the players. Pressing one runs a thin ticker across the top of everyone's screen. Also includes a BRB lamp roster and a fade-to-black curtain for breaks and the end of a session.

## Signal buttons

| Side | Button | Strip | Ticker text |
|---|---|---|---|
| DM | Star | Red | DM · STAR OF STAGE — Hold your lines — please don't interrupt |
| DM | Forward | Yellow | NEXT SCENE — Wrap it up — the story moves on |
| DM | Mic | Blue | YOUR CUE — The stage is yours — speak up or answer |
| DM | Square | – | Opens the Intermission / Session End menu |
| Player | Star | Red | {name} IS STAR OF STAGE — Spotlight, please — let them finish |
| Player | Mic | Blue | {name} WANTS THE MIC — More to say — may I continue? |
| Player | Bulb | Yellow | {name} IS THINKING — Give them a moment |
| Player | Door | – | Turns your own lamp in the roster off / on (BRB). No ticker. |

- Signals toggle: press to raise, press again to clear. Each person can hold one signal at a time.
- Several people can signal at once; the strips stack (the DM's on top).
- The DM can click the signal icon after a player's name to clear it, press ✕ to clear all, and click the lamp before a name to switch it for that player.

## Curtain (the DM's square button)

Choose **Intermission** or **Session End**. Every screen fades to black, the title appears letter by letter, followed by one of six random lines, then everyone is moved to the scene chosen under **Return to** (pick "Stay on this scene" to stay). The DM can click the screen to raise the curtain early.

## Settings (Configure Settings → Stage Pacer)

- **Colour theme** — black & red / black, grey & white / white & purple / black & blue (set by the DM for everyone)
- **Name shown for players** — player name or assigned character name
- **Curtain hold time** — seconds the black screen stays (0 = until the DM clicks)
- **Auto-clear signals after** — seconds before a signal clears itself (0 = until pressed again)
- **Ticker offset from top** — move the ticker down if it covers something (your screen only)

## With Grim Core

With the Grim Core module active, Stage Pacer follows Grim Core's shared theme: the four built-in themes and Custom. The red / yellow / blue signal colours never change. While Grim Core is in charge, Stage Pacer's own Colour theme field is locked and shows an Open Grim Core button. To let Stage Pacer keep its own colours, untick it under Modules that follow in Grim Core. Stage Pacer works normally without Grim Core.

## Install

**With the manifest URL (recommended)**

1. In Foundry, go to **Setup → Add-on Modules → Install Module**.
2. Paste this into **Manifest URL** and press **Install**:
   ```
   https://github.com/NuttoSGXX/Grim-Stage-Pacer/releases/latest/download/module.json
   ```
3. Enable the module under Manage Modules in your world.

**By hand**

1. Download `module.zip` from the [latest release](https://github.com/NuttoSGXX/Grim-Stage-Pacer/releases/latest) and unzip it into a folder named `stage-pacer`.
2. Move the `stage-pacer` folder into Foundry's `Data/modules/` (find the location under Setup → Configuration → User Data Path).
3. Check that `Data/modules/stage-pacer/module.json` exists, then restart Foundry and enable the module.

Players install nothing; only the machine hosting the game needs the module. On The Forge, install it with the same manifest URL.

**Updating:** use **Update** on the module in Foundry's Add-on Modules tab. Your world's settings are kept.

## Terms of use

© 2026 DM Bank. All rights reserved.

- Do not resell, share or redistribute this module or its files.
- You may use it as a tool for paid D&D games (commissions) and for livestreams.

## Contact / support

Discord: https://discord.gg/XWfgWKpxJp
