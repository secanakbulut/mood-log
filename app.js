// mood log
// 5 levels, one entry per day, kept in localStorage.

const MOODS = [
  { value: 5, key: "great", label: "great", color: "#f7c66b" },
  { value: 4, key: "good",  label: "good",  color: "#cdc585" },
  { value: 3, key: "ok",    label: "ok",    color: "#a7b18e" },
  { value: 2, key: "low",   label: "low",   color: "#8a96a0" },
  { value: 1, key: "rough", label: "rough", color: "#6b7a8f" }
];

const STORAGE_KEY = "mood-log.entries.v1";

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

function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
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
      setStatus(`saved ${m.label} for today`);
    });
    wrap.appendChild(btn);
  });
}

function setStatus(text) {
  document.getElementById("status").textContent = text;
}

function init() {
  const entries = loadEntries();
  buildPicker(entries);
}

init();
