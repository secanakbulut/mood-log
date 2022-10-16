// mood log
// 5 levels, one entry per day, kept in localStorage.
// today's entry can be overwritten if you change your mind.

const MOODS = [
  { value: 5, key: "great", label: "great", color: "#f7c66b" },
  { value: 4, key: "good",  label: "good",  color: "#cdc585" },
  { value: 3, key: "ok",    label: "ok",    color: "#a7b18e" },
  { value: 2, key: "low",   label: "low",   color: "#8a96a0" },
  { value: 1, key: "rough", label: "rough", color: "#6b7a8f" }
];

const STORAGE_KEY = "mood-log.entries.v1";
// linear interpolate heatmap stops, low to high
const STOP_LOW  = [107, 122, 143]; // #6b7a8f
const STOP_HIGH = [247, 198, 107]; // #f7c66b

function loadEntries() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch (e) {
    return {};
  }
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function dateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function todayKey() {
  return dateKey(new Date());
}

function colorForMood(value) {
  // value is 1..5, map to 0..1 then lerp the two stops
  const t = (value - 1) / 4;
  const r = Math.round(STOP_LOW[0] + (STOP_HIGH[0] - STOP_LOW[0]) * t);
  const g = Math.round(STOP_LOW[1] + (STOP_HIGH[1] - STOP_LOW[1]) * t);
  const b = Math.round(STOP_LOW[2] + (STOP_HIGH[2] - STOP_LOW[2]) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

function average(values) {
  if (!values.length) return null;
  const sum = values.reduce((a, b) => a + b, 0);
  return sum / values.length;
}

function buildPicker(entries) {
  const wrap = document.getElementById("picker");
  wrap.innerHTML = "";
  const today = todayKey();
  const current = entries[today];

  MOODS.forEach(m => {
    const btn = document.createElement("button");
    if (current === m.value) btn.classList.add("active");
    btn.innerHTML = `<span class="swatch" style="background:${m.color}"></span>${m.label}`;
    btn.addEventListener("click", () => {
      entries[today] = m.value;
      saveEntries(entries);
      buildPicker(entries);
      buildHeatmap(entries);
      updateAverages(entries);
      setStatus(`saved ${m.label} for today`);
    });
    wrap.appendChild(btn);
  });
}

function setStatus(text) {
  document.getElementById("status").textContent = text;
}

function buildHeatmap(entries) {
  const wrap = document.getElementById("heatmap");
  wrap.innerHTML = "";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // 90 cells, oldest first so today ends up bottom-right
  for (let i = 89; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const cell = document.createElement("div");
    cell.className = "cell";
    const k = dateKey(d);
    const v = entries[k];
    if (v) {
      cell.style.background = colorForMood(v);
      cell.title = `${k}: ${MOODS.find(m => m.value === v).label}`;
    } else {
      cell.title = `${k}: no entry`;
    }
    wrap.appendChild(cell);
  }
}

function updateAverages(entries) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const week = [];
  const month = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const v = entries[dateKey(d)];
    if (v) {
      month.push(v);
      if (i < 7) week.push(v);
    }
  }
  const w = average(week);
  const m = average(month);
  document.getElementById("avg-week").textContent = w === null ? "-" : w.toFixed(2);
  document.getElementById("avg-month").textContent = m === null ? "-" : m.toFixed(2);
}

function init() {
  const entries = loadEntries();
  buildPicker(entries);
  buildHeatmap(entries);
  updateAverages(entries);
}

init();
