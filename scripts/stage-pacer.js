/* Stage Pacer — table-pacing signals for Foundry VTT (V13 / V14)
 * State lives in User flags (synced by Foundry itself); only the curtain uses the module socket.
 */
const MOD = "stage-pacer";
const SOCKET = `module.${MOD}`;

/* ------------------------------------------------------------------ */
/*  Config: icons, signals, flavour lines                              */
/* ------------------------------------------------------------------ */

const svg = (inner) =>
  `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;

const ICONS = {
  star: svg(`<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>`),
  next: svg(`<polygon points="13 19 22 12 13 5 13 19"/><polygon points="2 19 11 12 2 5 2 19"/>`),
  mic: svg(`<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>`),
  stop: svg(`<rect x="5" y="5" width="14" height="14" rx="1.5"/>`),
  think: svg(`<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>`),
  door: svg(`<path d="M13 4h3a2 2 0 0 1 2 2v14"/><path d="M2 20h3"/><path d="M13 20h9"/><path d="M10 12v.01"/><path d="M13 4.562v16.157a1 1 0 0 1-1.242.97L5 20V5.562a2 2 0 0 1 1.515-1.94l4-1A2 2 0 0 1 13 4.561Z"/>`),
  fold: svg(`<polyline points="6 9 12 15 18 9"/>`),
  clear: svg(`<line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/>`)
};

/** Ticker signals. `head` is the bold part, `tail` the quieter running part. Edit freely. */
const SIGNALS = {
  gm: {
    star: { color: "red", tip: "Star of Stage — ask the table to hold", head: () => "DM · Star of Stage", tail: "Hold your lines — please don't interrupt" },
    next: { color: "yellow", tip: "Next Scene — time to wrap up", head: () => "Next Scene", tail: "Wrap it up — the story moves on" },
    mic: { color: "blue", tip: "Your Cue — players, speak or answer", head: () => "Your Cue", tail: "The stage is yours — speak up or answer" }
  },
  player: {
    star: { color: "red", tip: "Star of Stage — this is my moment", head: (n) => `${n} is Star of Stage`, tail: "Spotlight, please — let them finish" },
    mic: { color: "blue", tip: "I'd like to keep talking", head: (n) => `${n} wants the mic`, tail: "More to say — may I continue?" },
    think: { color: "yellow", tip: "I need a moment to think", head: (n) => `${n} is thinking`, tail: "Give them a moment" }
  }
};
const BUTTON_ORDER = { gm: ["star", "next", "mic"], player: ["star", "mic", "think"] };

const CURTAIN = {
  break: {
    title: "Intermission",
    lines: [
      "The stage rests. Back shortly.",
      "Stretch, refill, return.",
      "Hold that thought — we resume soon.",
      "The tale catches its breath.",
      "Stand by. The curtain will rise again.",
      "A short pause between scenes."
    ]
  },
  end: {
    title: "Session End",
    lines: [
      "The curtain falls. Until next time.",
      "Thus ends tonight's tale.",
      "The candles gutter out. Rest well, heroes.",
      "The story sleeps — it will wake again.",
      "Every ending is only a pause between chapters.",
      "Lights down. See you next session."
    ]
  }
};

const TICKER_SPEED = 48; // px per second
const CURTAIN_IN_MS = 3400; // fade + title + underline, before the hold starts
const CURTAIN_OUT_MS = 2600;

/* ------------------------------------------------------------------ */
/*  Small helpers                                                      */
/* ------------------------------------------------------------------ */

const setting = (key) => game.settings.get(MOD, key);
const ESC_MAP = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ESC_MAP[c]);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const roleOf = (user) => (user.isGM ? "gm" : "player");

function getSignal(user) {
  const s = user.getFlag(MOD, "signal");
  return s?.type && SIGNALS[roleOf(user)][s.type] ? s : null;
}
const isAway = (user) => !!user.getFlag(MOD, "away");

function displayName(user) {
  if (setting("nameMode") === "character" && user.character?.name) return user.character.name;
  return user.name;
}

/* ------------------------------------------------------------------ */
/*  Actions                                                            */
/* ------------------------------------------------------------------ */

let autoClearTimer = null;

async function toggleSignal(type) {
  const user = game.user;
  if (!SIGNALS[roleOf(user)][type]) return;
  const on = getSignal(user)?.type !== type;
  const t = Date.now();
  await user.setFlag(MOD, "signal", { type: on ? type : null, t });

  clearTimeout(autoClearTimer);
  const secs = Number(setting("autoClear")) || 0;
  if (on && secs > 0) {
    autoClearTimer = setTimeout(() => {
      if (user.getFlag(MOD, "signal")?.t === t) user.setFlag(MOD, "signal", { type: null, t: Date.now() });
    }, secs * 1000);
  }
}

const clearSignal = (user) => user.setFlag(MOD, "signal", { type: null, t: Date.now() });
const toggleAway = (user) => user.setFlag(MOD, "away", !isAway(user));

async function clearAllSignals() {
  if (!game.user.isGM) return;
  for (const u of game.users) if (getSignal(u)) await clearSignal(u);
}

async function lowerCurtain(kind) {
  if (!game.user.isGM || !CURTAIN[kind]) return;
  const payload = {
    action: "curtain",
    kind,
    sub: pick(CURTAIN[kind].lines),
    hold: Math.max(0, Number(setting("curtainHold")) || 0),
    userId: game.user.id
  };
  game.socket.emit(SOCKET, payload);
  playCurtain(payload);
  menuOpen = false;
  renderPanel();
  clearAllSignals();

  // Swap to the home scene while the screen is black.
  const home = game.scenes.get(setting("homeScene"));
  if (home && !home.active) {
    setTimeout(() => {
      Promise.resolve(home.activate()).catch((err) => console.error(`${MOD} | could not activate home scene`, err));
    }, CURTAIN_IN_MS - 400);
  }
}

function raiseCurtainForAll() {
  if (!game.user.isGM) return;
  game.socket.emit(SOCKET, { action: "raise", userId: game.user.id });
  raiseCurtain();
}

/* ------------------------------------------------------------------ */
/*  Curtain overlay (fade to black)                                    */
/* ------------------------------------------------------------------ */

let curtainTimers = [];

function playCurtain({ kind, sub, hold }) {
  const def = CURTAIN[kind];
  if (!def) return;
  document.getElementById("stage-pacer-curtain")?.remove();
  curtainTimers.forEach(clearTimeout);
  curtainTimers = [];

  const el = document.createElement("div");
  el.id = "stage-pacer-curtain";
  el.className = `sp-root sp-curtain sp-kind-${kind}`;
  const letters = [...def.title]
    .map((ch, i) => (ch === " " ? `<span class="sp-gap"></span>` : `<span style="--i:${i}">${esc(ch)}</span>`))
    .join("");
  el.innerHTML = `
    <div class="sp-curtain-inner">
      <h1 class="sp-curtain-title" aria-label="${esc(def.title)}">${letters}</h1>
      <div class="sp-curtain-rule"><i></i><b></b><i></i></div>
      <p class="sp-curtain-sub">${esc(sub)}</p>
    </div>
    ${game.user.isGM ? `<div class="sp-curtain-hint">Click anywhere to raise the curtain</div>` : ""}`;
  if (game.user.isGM) {
    el.classList.add("sp-gm");
    el.addEventListener("click", raiseCurtainForAll);
  }
  document.body.appendChild(el);

  if (hold > 0) curtainTimers.push(setTimeout(raiseCurtain, CURTAIN_IN_MS + hold * 1000));
}

function raiseCurtain() {
  const el = document.getElementById("stage-pacer-curtain");
  if (!el || el.classList.contains("sp-leaving")) return;
  curtainTimers.forEach(clearTimeout);
  curtainTimers = [];
  el.classList.add("sp-leaving");
  curtainTimers.push(setTimeout(() => el.remove(), CURTAIN_OUT_MS));
}

/* ------------------------------------------------------------------ */
/*  Ticker (running strips at the top of the screen)                   */
/* ------------------------------------------------------------------ */

let tickerEl = null;
const strips = new Map(); // key -> element

function ensureTicker() {
  if (tickerEl?.isConnected) return tickerEl;
  tickerEl = document.createElement("div");
  tickerEl.id = "stage-pacer-ticker";
  tickerEl.className = "sp-root sp-ticker";
  document.body.appendChild(tickerEl);
  return tickerEl;
}

function activeSignals() {
  const out = [];
  for (const user of game.users) {
    if (!user.active) continue;
    const s = getSignal(user);
    if (!s) continue;
    const role = roleOf(user);
    const def = SIGNALS[role][s.type];
    const head = def.head(displayName(user));
    out.push({ key: `${user.id}|${s.type}|${head}`, role, type: s.type, def, head, t: s.t ?? 0 });
  }
  // DM strip first, then players in the order they pressed.
  return out.sort((a, b) => (a.role === b.role ? a.t - b.t : a.role === "gm" ? -1 : 1));
}

function buildStrip(sig) {
  const el = document.createElement("div");
  el.className = `sp-strip sp-${sig.def.color}`;
  const seg = `<span class="sp-seg">${ICONS[sig.type]}<b>${esc(sig.head)}</b><em>${esc(sig.def.tail)}</em><i>✦</i></span>`;
  const half = `<span class="sp-half">${seg.repeat(16)}</span>`;
  el.innerHTML = `<div class="sp-track">${half}${half}</div>`;
  requestAnimationFrame(() => {
    const track = el.firstElementChild;
    const w = track.firstElementChild?.offsetWidth || 3000;
    track.style.animationDuration = `${Math.round(w / TICKER_SPEED)}s`;
  });
  return el;
}

function renderTicker() {
  const root = ensureTicker();
  root.style.top = `${Number(setting("tickerTop")) || 0}px`;
  const sigs = activeSignals();
  const keys = new Set(sigs.map((s) => s.key));

  for (const [key, el] of strips) {
    if (keys.has(key)) continue;
    strips.delete(key);
    el.classList.add("sp-out");
    setTimeout(() => el.remove(), 450);
  }
  sigs.forEach((sig, idx) => {
    let el = strips.get(sig.key);
    if (!el) {
      el = buildStrip(sig);
      strips.set(sig.key, el);
      root.appendChild(el);
    }
    el.style.order = idx;
  });
}

/* ------------------------------------------------------------------ */
/*  Control panel                                                      */
/* ------------------------------------------------------------------ */

let panelEl = null;
let menuOpen = false;

function panelButtons() {
  const role = roleOf(game.user);
  const mine = getSignal(game.user)?.type;
  let html = BUTTON_ORDER[role]
    .map((type) => {
      const def = SIGNALS[role][type];
      return `<button type="button" class="sp-btn sp-${def.color}${mine === type ? " is-on" : ""}" data-action="signal" data-type="${type}" data-tooltip="${esc(def.tip)}" aria-label="${esc(def.tip)}" aria-pressed="${mine === type}">${ICONS[type]}</button>`;
    })
    .join("");
  if (role === "gm") {
    html += `<button type="button" class="sp-btn sp-stop${menuOpen ? " is-on" : ""}" data-action="menu" data-tooltip="Lower the curtain — Intermission / Session End" aria-label="Lower the curtain" aria-expanded="${menuOpen}">${ICONS.stop}</button>`;
  } else {
    const away = isAway(game.user);
    html += `<button type="button" class="sp-btn sp-door${away ? " is-away" : ""}" data-action="away" data-tooltip="${away ? "I'm back — switch my light on" : "BRB — switch my light off"}" aria-label="Toggle BRB" aria-pressed="${away}">${ICONS.door}</button>`;
  }
  return html;
}

function panelMenu() {
  if (!game.user.isGM || !menuOpen) return "";
  const homeId = setting("homeScene");
  const scenes = [...game.scenes].sort((a, b) => a.name.localeCompare(b.name));
  const options = [`<option value="">— Stay on this scene —</option>`]
    .concat(scenes.map((s) => `<option value="${s.id}"${s.id === homeId ? " selected" : ""}>${esc(s.name)}</option>`))
    .join("");
  return `
    <div class="sp-menu">
      <div class="sp-menu-label">Lower the curtain</div>
      <button type="button" class="sp-choice" data-action="curtain" data-kind="break">Intermission</button>
      <button type="button" class="sp-choice sp-choice-end" data-action="curtain" data-kind="end">Session End</button>
      <label class="sp-home"><span>Return to</span><select data-action="home">${options}</select></label>
    </div>`;
}

function panelRoster() {
  const gm = game.user.isGM;
  const players = game.users.filter((u) => !u.isGM && u.active).sort((a, b) => displayName(a).localeCompare(displayName(b)));
  const present = players.filter((u) => !isAway(u)).length;
  const rows = players
    .map((u) => {
      const away = isAway(u);
      const sig = getSignal(u);
      const def = sig ? SIGNALS.player[sig.type] : null;
      const canToggle = gm || u.isSelf;
      const lampTag = canToggle ? "button" : "span";
      const lampAttrs = canToggle ? ` type="button" data-action="lamp" data-user="${u.id}" data-tooltip="${away ? "Switch light on" : "Switch light off (BRB)"}"` : "";
      const lamp = `<${lampTag}${lampAttrs} class="sp-lamp" aria-label="${away ? "Away" : "Present"}"></${lampTag}>`;
      const markTag = gm ? "button" : "span";
      const markAttrs = gm ? ` type="button" data-action="clear" data-user="${u.id}" data-tooltip="Clear this signal"` : "";
      const mark = def ? `<${markTag}${markAttrs} class="sp-mark sp-${def.color}">${ICONS[sig.type]}</${markTag}>` : "";
      return `<li class="${away ? "is-away" : ""}${u.isSelf ? " is-self" : ""}">${lamp}<span class="sp-name">${esc(displayName(u))}</span>${away ? `<span class="sp-brb">BRB</span>` : ""}${mark}</li>`;
    })
    .join("");
  const anySignal = players.some((u) => getSignal(u));
  return `
    <div class="sp-roster-head"><span>On Stage</span><span class="sp-count">${present}/${players.length}</span>${
      gm && anySignal ? `<button type="button" class="sp-mini" data-action="clear-all" data-tooltip="Clear all player signals">${ICONS.clear}</button>` : ""
    }</div>
    <ul class="sp-roster">${rows || `<li class="sp-empty">No players on stage</li>`}</ul>`;
}

function renderPanel() {
  if (!panelEl) return;
  const folded = setting("folded");
  panelEl.classList.toggle("is-folded", folded);
  panelEl.innerHTML = `
    <header class="sp-head">
      <span class="sp-gem"></span>
      <span class="sp-title">Stage Pacer</span>
      <span class="sp-role">${game.user.isGM ? "DM" : "Player"}</span>
      <button type="button" class="sp-mini sp-fold" data-action="fold" data-tooltip="${folded ? "Show roster" : "Hide roster"}" aria-label="Toggle roster">${ICONS.fold}</button>
    </header>
    <div class="sp-buttons">${panelButtons()}</div>
    ${panelMenu()}
    ${folded ? "" : panelRoster()}`;
}

function placePanel(left, top) {
  const w = panelEl.offsetWidth || 232;
  left = Math.max(4, Math.min(left, window.innerWidth - w - 4));
  top = Math.max(4, Math.min(top, window.innerHeight - 40));
  panelEl.style.left = `${left}px`;
  panelEl.style.top = `${top}px`;
}

function createPanel() {
  panelEl = document.createElement("section");
  panelEl.id = "stage-pacer";
  panelEl.className = "sp-root sp-panel";
  document.body.appendChild(panelEl);
  renderPanel();

  const pos = setting("panelPos");
  if (Number.isFinite(pos?.left) && Number.isFinite(pos?.top)) placePanel(pos.left, pos.top);
  else placePanel(window.innerWidth - 580, window.innerHeight - 330);
  window.addEventListener("resize", () => placePanel(panelEl.offsetLeft, panelEl.offsetTop));

  // Drag by the header.
  panelEl.addEventListener("pointerdown", (ev) => {
    if (ev.button !== 0 || !ev.target.closest(".sp-head") || ev.target.closest("button")) return;
    ev.preventDefault();
    const ox = ev.clientX - panelEl.offsetLeft;
    const oy = ev.clientY - panelEl.offsetTop;
    panelEl.classList.add("is-dragging");
    const move = (e) => placePanel(e.clientX - ox, e.clientY - oy);
    const up = () => {
      window.removeEventListener("pointermove", move);
      panelEl.classList.remove("is-dragging");
      game.settings.set(MOD, "panelPos", { left: panelEl.offsetLeft, top: panelEl.offsetTop });
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up, { once: true });
  });

  panelEl.addEventListener("click", async (ev) => {
    const btn = ev.target.closest("[data-action]");
    if (!btn || btn.tagName === "SELECT") return;
    const user = btn.dataset.user ? game.users.get(btn.dataset.user) : null;
    try {
      switch (btn.dataset.action) {
        case "signal": await toggleSignal(btn.dataset.type); break;
        case "away": await toggleAway(game.user); break;
        case "lamp": if (user && (game.user.isGM || user.isSelf)) await toggleAway(user); break;
        case "clear": if (user && game.user.isGM) await clearSignal(user); break;
        case "clear-all": await clearAllSignals(); break;
        case "menu": menuOpen = !menuOpen; renderPanel(); break;
        case "curtain": await lowerCurtain(btn.dataset.kind); break;
        case "fold": await game.settings.set(MOD, "folded", !setting("folded")); renderPanel(); break;
      }
    } catch (err) {
      console.error(`${MOD} |`, err);
    }
  });

  panelEl.addEventListener("change", (ev) => {
    if (ev.target.dataset.action === "home" && game.user.isGM) game.settings.set(MOD, "homeScene", ev.target.value);
  });
}

/* ------------------------------------------------------------------ */
/*  Wiring                                                             */
/* ------------------------------------------------------------------ */

const THEMES = { crimson: "Black & Red", ash: "Black, Grey & White", amethyst: "White & Purple", abyss: "Black & Blue" };

function applyTheme() {
  const theme = setting("theme");
  document.documentElement.setAttribute("data-sp-theme", theme in THEMES ? theme : "crimson");
}

/* ------------------------------------------------------------------ */
/*  Grim Core (optional hub module that themes every Grim module)      */
/* ------------------------------------------------------------------ */

const CORE = "grim-core";

/** Grim Core's shared theme while it is driving Stage Pacer, otherwise null. */
function grimCoreTheme() {
  if (!game.modules.get(CORE)?.active) return null;
  try {
    const theme = game.settings.get(CORE, "theme");
    if (!theme || typeof theme !== "object") return null;
    if (Array.isArray(theme.off) && theme.off.includes(MOD)) return null; // unticked under "Modules that follow"
    return theme;
  } catch (err) {
    return null; // Grim Core not initialised (or an older build without this setting)
  }
}

/** While Grim Core drives the theme, lock Stage Pacer's own dropdown and say why. */
function markThemeManaged(html) {
  const root = html instanceof HTMLElement ? html : html?.[0];
  const select = root?.querySelector?.(`select[name="${MOD}.theme"]`);
  if (!select) return;
  const group = select.closest(".form-group") ?? select.parentElement;
  group.querySelector(".sp-core-note")?.remove();

  const theme = grimCoreTheme();
  select.disabled = !!theme;
  if (!theme) return;

  const note = document.createElement("p");
  note.className = "sp-core-note hint";
  const label = theme.preset === "custom" ? `a custom colour (${theme.accent ?? "accent"})` : THEMES[theme.preset] ?? theme.preset;
  note.innerHTML = `<span><i class="fa-solid fa-palette"></i> Managed by <b>Grim Core</b> — currently ${esc(label)}. Change it there, or untick Stage Pacer under “Modules that follow” to choose here.</span>`;
  const open = game.modules.get(CORE)?.api?.open;
  if (game.user.isGM && typeof open === "function") {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = "Open Grim Core";
    btn.addEventListener("click", (ev) => { ev.preventDefault(); open(); });
    note.appendChild(btn);
  }
  group.appendChild(note);
}

let refreshQueued = false;
function refresh() {
  if (refreshQueued) return;
  refreshQueued = true;
  setTimeout(() => {
    refreshQueued = false;
    renderTicker();
    renderPanel();
  }, 30);
}

Hooks.once("init", () => {
  const reg = (key, data) => game.settings.register(MOD, key, data);

  reg("theme", {
    name: "Colour theme",
    hint: "Set by the DM, applied to every player. Signal colours (red / yellow / blue) stay the same in every theme. If Grim Core is active, it sets this for you.",
    scope: "world", config: true, type: String, default: "crimson",
    choices: THEMES,
    onChange: () => applyTheme()
  });
  reg("nameMode", {
    name: "Name shown for players",
    hint: "Used in the ticker (\"… is Star of Stage\") and in the roster.",
    scope: "world", config: true, type: String, default: "player",
    choices: { player: "Player (user) name", character: "Assigned character name" },
    onChange: () => refresh()
  });
  reg("curtainHold", {
    name: "Curtain hold time (seconds)",
    hint: "How long Intermission / Session End stays on the black screen before fading back. 0 = stay until the DM clicks the screen.",
    scope: "world", config: true, type: Number, default: 8
  });
  reg("autoClear", {
    name: "Auto-clear signals after (seconds)",
    hint: "0 = a signal stays on until its button is pressed again.",
    scope: "world", config: true, type: Number, default: 0
  });
  reg("tickerTop", {
    name: "Ticker offset from top (px)",
    hint: "Push the running strip down if it covers something on your screen. Only affects you.",
    scope: "client", config: true, type: Number, default: 0,
    onChange: () => refresh()
  });
  reg("homeScene", { scope: "world", config: false, type: String, default: "" });
  reg("panelPos", { scope: "client", config: false, type: Object, default: {} });
  reg("folded", { scope: "client", config: false, type: Boolean, default: false });
});

Hooks.once("ready", () => {
  applyTheme();
  createPanel();
  renderTicker();

  game.socket.on(SOCKET, (data) => {
    if (!game.users.get(data?.userId)?.isGM) return;
    if (data.action === "curtain") playCurtain(data);
    else if (data.action === "raise") raiseCurtain();
  });

  for (const hook of ["updateUser", "userConnected", "createUser", "deleteUser"]) Hooks.on(hook, () => refresh());
  Hooks.on("updateActor", (actor) => {
    if (setting("nameMode") === "character" && game.users.some((u) => u.character?.id === actor.id)) refresh();
  });

  Hooks.on("renderSettingsConfig", (app, html) => markThemeManaged(html));

  game.modules.get(MOD).api = {
    toggleSignal, lowerCurtain, raiseCurtain: raiseCurtainForAll, clearAllSignals,
    /** { theme, managedBy } — managedBy is "grim-core" while the hub drives the colours. */
    theme: () => ({ theme: setting("theme"), managedBy: grimCoreTheme() ? CORE : null })
  };
});
