/**
 * app.js — status/countdown calculation + rendering
 * -------------------------------------------------------------
 * Everything here reads from `schedules` / `peopleMeta` / `peopleOrder`
 * (data.js). Nothing in this file is person- or semester-specific —
 * edit data.js instead.
 * -------------------------------------------------------------
 */

// ---------- CONFIG ----------
const DAY_CODES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_LABELS = { Sun: "Sun", Mon: "Mon", Tue: "Tue", Wed: "Wed", Thu: "Thu", Fri: "Fri", Sat: "Sat" };
const GRID_START_MIN = 7 * 60;   // 07:00 — grid top
const GRID_END_MIN = 24 * 60;    // 24:00 — grid bottom
const REFRESH_MS = 30 * 1000;    // recompute status every 30s
const MIN_USEFUL_WINDOW = 15;    // minutes — shortest "everyone free" window worth showing

// ---------- TIME HELPERS ----------

/** "13:05" -> 785 (minutes since midnight) */
function toMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/** minutes since midnight -> "1:05 PM" */
function formatClock(mins) {
  mins = ((mins % 1440) + 1440) % 1440;
  let h = Math.floor(mins / 60);
  const m = mins % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${String(m).padStart(2, "0")} ${ampm}`;
}

function formatDuration(mins) {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`;
}

function dayCodeFor(date) {
  return DAY_CODES[date.getDay()]; // getDay(): 0=Sun ... 6=Sat, matches DAY_CODES order
}

function entriesForDay(person, dayCode) {
  return schedules[person]
    .filter((e) => e.day === dayCode)
    .slice()
    .sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
}

// ---------- STATUS COMPUTATION ----------

/**
 * Returns the live status for one person right now.
 * { state: 'class' | 'free', current, next, freeUntil, headline, detail }
 */
function getStatus(person, now) {
  const dayCode = dayCodeFor(now);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const today = entriesForDay(person, dayCode);

  const current = today.find((e) => toMinutes(e.start) <= nowMin && nowMin < toMinutes(e.end));
  if (current) {
    const endMin = toMinutes(current.end);
    const remaining = endMin - nowMin;
    return {
      state: "class",
      current,
      headline: "In class",
      detail: `${current.class}`,
      sub: `Free in ${formatDuration(remaining)} · ${formatClock(endMin)}`,
    };
  }

  const next = today.find((e) => toMinutes(e.start) > nowMin);
  if (next) {
    const untilMin = toMinutes(next.start);
    return {
      state: "free",
      next,
      headline: "Free",
      detail: `Until ${formatClock(untilMin)}`,
      sub: `Then ${next.class}`,
    };
  }

  return {
    state: "free",
    next: null,
    headline: "Free",
    detail: "Rest of the day",
    sub: dayCode === "Fri" || dayCode === "Sat" ? "Weekend — no classes" : "No more classes today",
  };
}

// ---------- "EVERYONE FREE" FINDER ----------

/** Merge a day's entries into non-overlapping busy [start,end] intervals. */
function busyIntervals(person, dayCode) {
  const list = entriesForDay(person, dayCode).map((e) => [toMinutes(e.start), toMinutes(e.end)]);
  const merged = [];
  for (const [s, e] of list) {
    const last = merged[merged.length - 1];
    if (last && s <= last[1]) last[1] = Math.max(last[1], e);
    else merged.push([s, e]);
  }
  return merged;
}

/** Complement of busy intervals within [floorMin, GRID_END_MIN]. */
function freeIntervals(person, dayCode, floorMin) {
  const busy = busyIntervals(person, dayCode);
  const free = [];
  let cursor = floorMin;
  for (const [s, e] of busy) {
    if (s > cursor) free.push([cursor, Math.min(s, GRID_END_MIN)]);
    cursor = Math.max(cursor, e);
  }
  if (cursor < GRID_END_MIN) free.push([cursor, GRID_END_MIN]);
  return free.filter(([s, e]) => e > s);
}

function intersect(a, b) {
  const out = [];
  let i = 0, j = 0;
  while (i < a.length && j < b.length) {
    const s = Math.max(a[i][0], b[j][0]);
    const e = Math.min(a[i][1], b[j][1]);
    if (e > s) out.push([s, e]);
    if (a[i][1] < b[j][1]) i++; else j++;
  }
  return out;
}

/**
 * Scans forward from `now` (today, then up to 6 more days) for the next
 * window where all 4 friends are simultaneously free, at least
 * MIN_USEFUL_WINDOW minutes long.
 */
function findNextGroupFreeWindow(now) {
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const d = new Date(now);
    d.setDate(d.getDate() + dayOffset);
    const dayCode = dayCodeFor(d);
    const floor = dayOffset === 0 ? now.getHours() * 60 + now.getMinutes() : GRID_START_MIN;

    let common = null;
    for (const person of peopleOrder) {
      const free = freeIntervals(person, dayCode, floor);
      common = common === null ? free : intersect(common, free);
      if (common.length === 0) break;
    }
    if (common && common.length) {
      const win = common.find(([s, e]) => e - s >= MIN_USEFUL_WINDOW) || common[0];
      return { dayOffset, dayCode, start: win[0], end: win[1] };
    }
  }
  return null;
}

function describeGroupWindow(win, now) {
  if (!win) return "No shared free window in the next week.";
  const dayName = win.dayOffset === 0 ? "today" : win.dayOffset === 1 ? "tomorrow" : DAY_LABELS[win.dayCode];
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const startedAlready = win.dayOffset === 0 && win.start <= nowMin;
  const endsDay = win.end >= GRID_END_MIN;

  if (startedAlready) {
    return endsDay
      ? "Everyone's free right now, for the rest of the day."
      : `Everyone's free right now, until ${formatClock(win.end)}.`;
  }
  const range = endsDay ? `from ${formatClock(win.start)}` : `${formatClock(win.start)}–${formatClock(win.end)}`;
  return `Everyone's next free together: ${dayName}, ${range}.`;
}

// ---------- RENDERING: DASHBOARD ----------

function initials(name) {
  return name
    .split(/[\s-]+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function renderDashboard(now) {
  const wrap = document.getElementById("dashboard-cards");
  const prevStates = renderDashboard._prevStates || {};
  const nextStates = {};

  wrap.querySelectorAll(".card").forEach((el) => el.dataset.keep = "0");

  peopleOrder.forEach((person) => {
    const status = getStatus(person, now);
    nextStates[person] = status.state;
    const flipped = prevStates[person] && prevStates[person] !== status.state;

    let card = wrap.querySelector(`[data-person="${person}"]`);
    if (!card) {
      card = document.createElement("article");
      card.className = "card";
      card.dataset.person = person;
      card.innerHTML = `
        <div class="card-top">
          <span class="avatar" style="--accent:${peopleMeta[person].color}">${initials(person)}</span>
          <span class="name">${person}</span>
        </div>
        <div class="status-row">
          <span class="dot"></span>
          <span class="headline"></span>
        </div>
        <p class="detail"></p>
        <p class="sub"></p>
      `;
      wrap.appendChild(card);
    }

    card.classList.toggle("is-class", status.state === "class");
    card.classList.toggle("is-free", status.state === "free");
    card.querySelector(".headline").textContent = status.headline;
    card.querySelector(".detail").textContent = status.detail;
    card.querySelector(".sub").textContent = status.sub;
    card.dataset.keep = "1";

    if (flipped) {
      card.classList.remove("flip");
      // restart animation
      void card.offsetWidth;
      card.classList.add("flip");
    }
  });

  renderDashboard._prevStates = nextStates;

  const groupWindow = findNextGroupFreeWindow(now);
  document.getElementById("group-banner-text").textContent = describeGroupWindow(groupWindow, now);
}

// ---------- RENDERING: WEEKLY SCHEDULE GRID ----------

let selectedPerson = "all"; // "all" | person name

function buildGridSkeleton() {
  const gridDays = document.getElementById("grid-days");
  gridDays.innerHTML = "";

  DAY_CODES.forEach((day) => {
    const col = document.createElement("div");
    col.className = "day-col";
    col.dataset.day = day;

    const header = document.createElement("div");
    header.className = "day-col-header";
    header.textContent = DAY_LABELS[day];
    col.appendChild(header);

    const track = document.createElement("div");
    track.className = "day-track";
    track.dataset.day = day;
    col.appendChild(track);

    gridDays.appendChild(col);
  });

  const hourRows = document.getElementById("hour-rows");
  hourRows.innerHTML = "";
  for (let m = GRID_START_MIN; m < GRID_END_MIN; m += 60) {
    const row = document.createElement("div");
    row.className = "hour-label";
    row.textContent = formatClock(m).replace(":00", "");
    hourRows.appendChild(row);
  }
}

function pctFor(min) {
  return ((min - GRID_START_MIN) / (GRID_END_MIN - GRID_START_MIN)) * 100;
}

function renderGrid(now) {
  const totalSpan = GRID_END_MIN - GRID_START_MIN;
  const people = selectedPerson === "all" ? peopleOrder : [selectedPerson];
  const laneWidth = 100 / people.length;

  document.querySelectorAll(".day-track").forEach((track) => {
    const day = track.dataset.day;
    track.innerHTML = "";

    people.forEach((person, laneIndex) => {
      entriesForDay(person, day).forEach((entry) => {
        const s = Math.max(toMinutes(entry.start), GRID_START_MIN);
        const e = Math.min(toMinutes(entry.end), GRID_END_MIN);
        if (e <= s) return;

        const block = document.createElement("div");
        block.className = "block";
        block.style.top = pctFor(s) + "%";
        block.style.height = ((e - s) / totalSpan) * 100 + "%";
        block.style.left = laneIndex * laneWidth + "%";
        block.style.width = laneWidth + "%";
        block.style.setProperty("--accent", peopleMeta[person].color);
        block.innerHTML = `
          <span class="block-person">${selectedPerson === "all" ? initials(person) : entry.class}</span>
          <span class="block-class">${selectedPerson === "all" ? entry.class : entry.location}</span>
        `;
        block.title = `${person} · ${entry.class}\n${entry.start}–${entry.end} · ${entry.location}`;
        track.appendChild(block);
      });
    });

    // "now" line, only on today's column
    if (day === dayCodeFor(now)) {
      const nowMin = now.getHours() * 60 + now.getMinutes();
      if (nowMin >= GRID_START_MIN && nowMin <= GRID_END_MIN) {
        const line = document.createElement("div");
        line.className = "now-line";
        line.style.top = pctFor(nowMin) + "%";
        track.appendChild(line);
      }
    }
  });
}

function renderPersonTabs() {
  const tabs = document.getElementById("person-tabs");
  tabs.innerHTML = "";
  const options = [{ key: "all", label: "All 4" }, ...peopleOrder.map((p) => ({ key: p, label: p }))];
  options.forEach((opt) => {
    const btn = document.createElement("button");
    btn.className = "tab";
    btn.textContent = opt.label;
    btn.dataset.key = opt.key;
    btn.classList.toggle("active", selectedPerson === opt.key);
    btn.addEventListener("click", () => {
      selectedPerson = opt.key;
      renderPersonTabs();
      renderGrid(new Date());
    });
    tabs.appendChild(btn);
  });
}

// ---------- "WHAT IS EVERYONE DOING AT THIS TIME" (click a day column) ----------

function showMomentPanel(dayCode, minute, anchorEl) {
  const panel = document.getElementById("moment-panel");
  const rows = peopleOrder.map((person) => {
    const entry = entriesForDay(person, dayCode).find(
      (e) => toMinutes(e.start) <= minute && minute < toMinutes(e.end)
    );
    const label = entry ? entry.class : "Free";
    return `<div class="moment-row">
      <span class="avatar small" style="--accent:${peopleMeta[person].color}">${initials(person)}</span>
      <span class="moment-name">${person}</span>
      <span class="moment-status ${entry ? "busy" : "free"}">${label}</span>
    </div>`;
  }).join("");

  panel.innerHTML = `
    <div class="moment-panel-header">
      <span>${DAY_LABELS[dayCode]} · ${formatClock(minute)}</span>
      <button id="moment-close" aria-label="Close">&times;</button>
    </div>
    ${rows}
  `;
  panel.classList.add("open");
  document.getElementById("moment-close").addEventListener("click", () => panel.classList.remove("open"));
}

function wireGridClicks() {
  document.getElementById("grid-days").addEventListener("click", (evt) => {
    const track = evt.target.closest(".day-track");
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const fraction = (evt.clientY - rect.top) / rect.height;
    const minute = Math.round(GRID_START_MIN + fraction * (GRID_END_MIN - GRID_START_MIN));
    showMomentPanel(track.dataset.day, minute, track);
  });
}

// ---------- VIEW SWITCHING ----------

function wireViewToggle() {
  const buttons = document.querySelectorAll(".view-toggle button");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const view = btn.dataset.view;
      document.getElementById("dashboard-view").classList.toggle("hidden", view !== "dashboard");
      document.getElementById("schedule-view").classList.toggle("hidden", view !== "schedule");
      if (view === "schedule") renderGrid(new Date());
    });
  });
}

// ---------- CLOCK ----------

function tickClock() {
  const now = new Date();
  document.getElementById("live-clock").textContent = now.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
  document.getElementById("live-day").textContent = now.toLocaleDateString([], {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

// ---------- INIT ----------

function init() {
  buildGridSkeleton();
  renderPersonTabs();
  wireGridClicks();
  wireViewToggle();

  const tick = () => {
    const now = new Date();
    tickClock();
    renderDashboard(now);
    if (!document.getElementById("schedule-view").classList.contains("hidden")) {
      renderGrid(now);
    }
  };

  tick();
  setInterval(tick, REFRESH_MS);
  setInterval(tickClock, 1000); // seconds tick separately, for a live-feeling clock
}

document.addEventListener("DOMContentLoaded", init);
