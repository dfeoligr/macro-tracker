(function () {
  "use strict";

  // ---------- Storage keys ----------
  const K_GOALS = "mm_goals_v2";
  const K_FOOD = "mm_food_v2";
  const K_WEIGHT = "mm_weight";
  const K_NOTIF = "mm_notif_enabled";

  // ---------- Categories ----------
  const CATEGORIES = [
    { id: "lacteos", label: "Lácteos", icon: "🥛", color: "#4da3ff" },
    { id: "grasas", label: "Grasas", icon: "🥑", color: "#f5a623" },
    { id: "vegetales", label: "Vegetales", icon: "🥦", color: "#2ecc71" },
    { id: "frutas", label: "Frutas", icon: "🍎", color: "#ff6bd6" },
    { id: "proteinas", label: "Proteínas", icon: "🍗", color: "#ff5c5c" },
    { id: "carbohidratos", label: "Carbohidratos", icon: "🍞", color: "#b98cff" },
  ];
  const CAT_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

  const DEFAULT_GOALS = {
    lacteos: 2,
    grasas: 4,
    vegetales: 2,
    frutas: 3,
    proteinas: 5,
    carbohidratos: 6,
  };

  // ---------- Reference guide data ----------
  // Fuente: Escuela de Pacientes (Escuela Andaluza de Salud Pública) —
  // "Alimentación en Diabetes tipo 1", tabla de equivalencia de raciones.
  const GUIDE_DATA = {
    lacteos: [
      ["Leche entera / desnatada / semidesnatada", "1 vaso (200 ml)", "1"],
      ["Yogur natural", "1 envase (125 ml)", "1"],
      ["Yogur desnatado", "1 envase (125 ml)", "½"],
      ["Yogur con frutas", "1 envase (125 ml)", "1½"],
      ["Yogur griego", "1 envase (125 ml)", "1"],
      ["Petit suisse natural azucarado", "1 envase (60 g)", "1"],
      ["Queso de loncha", "4 lonchas (60 g)", "1"],
      ["Queso de untar", "2 cucharadas (40 g)", "1"],
      ["Quesitos", "3 unidades (50 g)", "1"],
      ["Queso curado / semicurado", "2 lonchas finas (40 g)", "1"],
      ["Natillas", "1 envase", "2½"],
      ["Flan de vainilla", "1 envase (125 ml)", "2"],
    ],
    grasas: [
      ["Aceite de oliva", "1 cucharadita (8 g)", "1"],
      ["Aceite de semillas", "1 cucharadita (8 g)", "1"],
      ["Mantequilla", "1 cucharada (12 g)", "1"],
      ["Margarina", "1 cucharada (12 g)", "1"],
      ["Mayonesa", "1 cucharada (12 g)", "1"],
      ["Nata", "1 cucharada (20 g)", "1"],
      ["Aceitunas", "12 unidades (50 g)", "1"],
      ["Manteca de cerdo", "1 cucharada (12 g)", "1"],
      ["Panceta / Tocino", "1 loncha fina (20 g)", "1"],
    ],
    vegetales: [
      ["Acelga cocida", "Plato hondo lleno", "1"],
      ["Alcachofa cocida", "1 plato pequeño", "1"],
      ["Brócoli cocido", "1 plato hondo lleno", "1"],
      ["Calabacín cocido", "1 unidad (300 g)", "1"],
      ["Cebolla cocida", "1 unidad (150 g)", "1"],
      ["Champiñón", "Plato hondo lleno", "1"],
      ["Espárrago / Espinaca cocida", "1 plato hondo lleno", "1"],
      ["Judías verdes cocidas", "1 plato hondo", "1"],
      ["Lechuga", "1 plato hondo lleno", "1"],
      ["Pepino", "1 unidad (100 g)", "½"],
      ["Pimientos asados", "2 medianos", "1"],
      ["Tomate crudo", "1 unidad (100 g)", "½"],
      ["Tomate frito", "7 cucharadas soperas", "1"],
      ["Zanahoria cocida", "3 unidades (50 g)", "1"],
    ],
    frutas: [
      ["Albaricoque", "1 pieza (50 g)", "½"],
      ["Cerezas", "10 piezas (80 g)", "1"],
      ["Ciruelas", "1 pieza (50 g)", "1"],
      ["Fresas / fresón", "150 g", "1"],
      ["Kiwi", "1 unidad (50 g)", "½"],
      ["Mandarina", "1 pieza (125 g)", "½"],
      ["Manzana roja", "1 pieza (200 g)", "2"],
      ["Melocotón", "1 unidad (200 g)", "2"],
      ["Melón", "200 g", "1"],
      ["Naranja", "1 unidad (200 g)", "2"],
      ["Pera", "1 unidad", "2½"],
      ["Piña", "1 rodaja", "1"],
      ["Plátano", "1 unidad", "3"],
      ["Sandía", "200 g", "1"],
      ["Uvas blancas", "10 uvas", "1"],
    ],
    proteinas: [
      ["Huevo", "1 unidad (50 g)", "1"],
      ["Pollo", "½ filete (50 g)", "1"],
      ["Ternera magra", "½ filete (50 g)", "1"],
      ["Conejo", "50 g", "1"],
      ["Cerdo magro", "½ filete (50 g)", "1"],
      ["Pavo", "½ filete (50 g)", "1"],
      ["Jamón cocido / serrano", "1 loncha fina (50 g)", "1"],
      ["Pescado blanco", "100 g", "1"],
      ["Pescado azul", "100 g", "1"],
      ["Gambas", "4 unidades grandes", "1"],
      ["Calamares / pulpo / sepia", "1 unidad mediana (100 g)", "1"],
      ["Mejillones", "4 unidades (100 g)", "1"],
    ],
    carbohidratos: [
      ["Pan blanco / de molde", "1 rebanada (20 g)", "1"],
      ["Arroz cocido", "3 cucharadas", "1"],
      ["Espaguetis / macarrones cocidos", "1 cucharón", "2"],
      ["Patatas cocidas / asadas", "1 pieza pequeña", "2"],
      ["Boniato / batata cocidos", "1 pieza pequeña", "2"],
      ["Garbanzos cocidos", "1 cucharón", "2"],
      ["Lentejas cocidas", "1 cucharón", "2"],
      ["Judías blancas cocidas", "1 cucharón", "2"],
      ["Galleta tipo María", "3 galletas", "1"],
      ["Galleta campurriana", "1 unidad", "1"],
    ],
  };

  // ---------- Helpers ----------
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  function pad(n) { return String(n).padStart(2, "0"); }
  function toKey(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }
  function keyToDate(key) {
    const [y, m, d] = key.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  function addDays(date, n) {
    const d = new Date(date);
    d.setDate(d.getDate() + n);
    return d;
  }
  function isSameDay(a, b) {
    return toKey(a) === toKey(b);
  }
  function loadJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }
  function saveJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }
  function formatRac(n) {
    const rounded = Math.round(n * 2) / 2;
    if (Number.isInteger(rounded)) return String(rounded);
    const whole = Math.floor(rounded);
    return whole > 0 ? `${whole}½` : "½";
  }
  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // ---------- State ----------
  let goals = loadJSON(K_GOALS, DEFAULT_GOALS);
  CATEGORIES.forEach((c) => { if (goals[c.id] == null) goals[c.id] = DEFAULT_GOALS[c.id]; });
  let foodLog = loadJSON(K_FOOD, {}); // { "YYYY-MM-DD": [ {id, category, amount, note} ] }
  let weightLog = loadJSON(K_WEIGHT, []); // [ {date, weight} ] sorted asc by date
  let currentDate = new Date();
  let currentRange = "30";
  let selectedCategory = null;
  let selectedAmount = 1;

  // ---------- Toast ----------
  let toastTimer = null;
  function showToast(message, kind) {
    const el = $("#toast");
    el.textContent = message;
    el.className = "toast show" + (kind ? " " + kind : "");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.classList.remove("show");
    }, 3200);
  }

  // ---------- Local notifications (best-effort, foreground/installed PWA) ----------
  function notify(title, body, kind) {
    showToast(body, kind);
    if ("Notification" in window && Notification.permission === "granted" && navigator.serviceWorker) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg) reg.showNotification(title, { body, icon: "icons/icon-192.png", badge: "icons/icon-192.png" });
      });
    }
  }

  // ---------- Tabs ----------
  function switchView(view) {
    $$(".view").forEach((v) => v.classList.add("hidden"));
    $(`#view-${view}`).classList.remove("hidden");
    $$(".tab-btn").forEach((b) => b.classList.toggle("active", b.dataset.view === view));
    $(".date-nav").style.visibility = view === "today" ? "visible" : "hidden";
    if (view === "weight") renderWeightView();
    if (view === "settings") renderSettings();
    if (view === "guide") renderGuide();
    if (view === "trend") renderTrend();
  }

  $$(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => switchView(btn.dataset.view));
  });

  // ---------- Date nav ----------
  function updateDateLabel() {
    const today = new Date();
    let label;
    if (isSameDay(currentDate, today)) label = "Hoy";
    else if (isSameDay(currentDate, addDays(today, -1))) label = "Ayer";
    else if (isSameDay(currentDate, addDays(today, 1))) label = "Mañana";
    else
      label = currentDate.toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short" });
    $("#currentDateLabel").textContent = label;
  }

  $("#prevDay").addEventListener("click", () => {
    currentDate = addDays(currentDate, -1);
    renderToday();
  });
  $("#nextDay").addEventListener("click", () => {
    currentDate = addDays(currentDate, 1);
    renderToday();
  });

  // ---------- Today view ----------
  function getDayTotals(dateKey) {
    const items = foodLog[dateKey] || [];
    const totals = {};
    CATEGORIES.forEach((c) => (totals[c.id] = 0));
    items.forEach((it) => {
      totals[it.category] = (totals[it.category] || 0) + (Number(it.amount) || 0);
    });
    return totals;
  }

  function buildCategoryGrid() {
    const grid = $("#categoryGrid");
    grid.innerHTML = "";
    CATEGORIES.forEach((c) => {
      const card = document.createElement("button");
      card.className = "cat-card";
      card.dataset.category = c.id;
      card.innerHTML = `
        <div class="cat-top">
          <span class="cat-icon">${c.icon}</span>
          <span class="cat-name">${c.label}</span>
        </div>
        <div class="cat-count"><span class="cc-cur">0</span> / <span class="cc-goal">0</span> raciones</div>
        <div class="cat-bar"><div class="cat-bar-fill" style="background:${c.color}"></div></div>
        <div class="cat-status">—</div>`;
      card.addEventListener("click", () => openModal(c.id));
      grid.appendChild(card);
    });
  }

  function renderToday() {
    updateDateLabel();
    const dateKey = toKey(currentDate);
    const totals = getDayTotals(dateKey);

    CATEGORIES.forEach((c) => {
      const card = $(`.cat-card[data-category="${c.id}"]`);
      if (!card) return;
      const cur = totals[c.id] || 0;
      const goal = goals[c.id] || 0;
      card.querySelector(".cc-cur").textContent = formatRac(cur);
      card.querySelector(".cc-goal").textContent = formatRac(goal);
      const pct = goal > 0 ? Math.min((cur / goal) * 100, 100) : 0;
      const fill = card.querySelector(".cat-bar-fill");
      fill.style.width = pct + "%";
      fill.classList.toggle("exceeded", cur > goal);

      const remaining = goal - cur;
      const statusEl = card.querySelector(".cat-status");
      statusEl.classList.remove("ok", "bad");
      if (goal <= 0) {
        statusEl.textContent = "sin meta";
      } else if (remaining > 0) {
        statusEl.textContent = `Quedan ${formatRac(remaining)}`;
      } else if (remaining === 0) {
        statusEl.textContent = "¡Completo!";
        statusEl.classList.add("ok");
      } else {
        statusEl.textContent = `+${formatRac(-remaining)} de más`;
        statusEl.classList.add("bad");
      }
    });

    // combined food list
    const items = (foodLog[dateKey] || []).slice().reverse();
    const list = $("#foodList");
    list.innerHTML = "";
    $("#emptyFood").classList.toggle("hidden", items.length > 0);
    items.forEach((it) => {
      const cat = CAT_BY_ID[it.category];
      const li = document.createElement("li");
      li.className = "food-item";
      li.innerHTML = `
        <div class="food-item-main">
          <div class="food-item-name">${cat.icon} ${escapeHtml(it.note || cat.label)}</div>
          <div class="food-item-cat">${cat.label}</div>
        </div>
        <div class="item-actions">
          <span class="food-item-cal">${formatRac(it.amount)}</span>
          <button class="delete-btn" data-id="${it.id}" aria-label="Eliminar">✕</button>
        </div>`;
      list.appendChild(li);
    });
    list.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", () => deleteFood(dateKey, btn.dataset.id));
    });
  }

  function deleteFood(dateKey, id) {
    foodLog[dateKey] = (foodLog[dateKey] || []).filter((it) => it.id !== id);
    saveJSON(K_FOOD, foodLog);
    renderToday();
  }

  function addFood(entry) {
    const dateKey = toKey(currentDate);
    if (!foodLog[dateKey]) foodLog[dateKey] = [];
    foodLog[dateKey].push(entry);
    saveJSON(K_FOOD, foodLog);
    renderToday();
    checkCategoryStatus(dateKey, entry.category);
  }

  function checkCategoryStatus(dateKey, catId) {
    const cat = CAT_BY_ID[catId];
    const totals = getDayTotals(dateKey);
    const cur = totals[catId] || 0;
    const goal = goals[catId] || 0;
    if (goal <= 0) return;
    const remaining = goal - cur;
    if (remaining < 0) {
      notify(`${cat.label}: te pasaste`, `Llevás ${formatRac(cur)} de ${formatRac(goal)} raciones, ${formatRac(-remaining)} de más.`, "bad");
    } else if (remaining === 0) {
      notify(`${cat.label}: ¡meta cumplida!`, `Completaste tus ${formatRac(goal)} raciones de ${cat.label.toLowerCase()} de hoy.`, "ok");
    } else if (remaining <= goal * 0.2) {
      notify(`${cat.label}: casi llegás`, `Te quedan ${formatRac(remaining)} raciones.`, "warn");
    } else {
      showToast(`${cat.label}: te quedan ${formatRac(remaining)} raciones.`);
    }
  }

  // ---------- Add entry modal ----------
  const modal = $("#addFoodModal");

  function buildCatSelect() {
    const wrap = $("#catSelect");
    wrap.innerHTML = "";
    CATEGORIES.forEach((c) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.dataset.category = c.id;
      btn.textContent = `${c.icon} ${c.label}`;
      btn.addEventListener("click", () => setSelectedCategory(c.id));
      wrap.appendChild(btn);
    });
  }

  function setSelectedCategory(catId) {
    selectedCategory = catId;
    $$("#catSelect button").forEach((b) => b.classList.toggle("active", b.dataset.category === catId));
  }

  function setSelectedAmount(amt) {
    selectedAmount = Math.max(0.5, Math.round(amt * 2) / 2);
    $("#amtValue").textContent = formatRac(selectedAmount);
    $$("#amtQuick button").forEach((b) => b.classList.toggle("active", parseFloat(b.dataset.amt) === selectedAmount));
  }

  $("#amtMinus").addEventListener("click", () => setSelectedAmount(selectedAmount - 0.5));
  $("#amtPlus").addEventListener("click", () => setSelectedAmount(selectedAmount + 0.5));
  $$("#amtQuick button").forEach((b) => {
    b.addEventListener("click", () => setSelectedAmount(parseFloat(b.dataset.amt)));
  });

  function openModal(catId) {
    buildCatSelect();
    setSelectedCategory(catId || CATEGORIES[0].id);
    setSelectedAmount(1);
    $("#foodName").value = "";
    modal.classList.remove("hidden");
  }
  function closeModal() {
    modal.classList.add("hidden");
  }
  $("#cancelAddFood").addEventListener("click", closeModal);
  $(".modal-backdrop", modal).addEventListener("click", closeModal);
  $("#confirmAddFood").addEventListener("click", () => {
    if (!selectedCategory) {
      showToast("Elegí un grupo", "warn");
      return;
    }
    const note = $("#foodName").value.trim();
    addFood({ id: uid(), category: selectedCategory, amount: selectedAmount, note });
    closeModal();
  });

  // ---------- Weight view ----------
  function getWeightForDate(dateKey) {
    return weightLog.find((w) => w.date === dateKey);
  }

  function saveWeightEntry(dateKey, weight) {
    const existing = getWeightForDate(dateKey);
    if (existing) {
      existing.weight = weight;
    } else {
      weightLog.push({ date: dateKey, weight });
    }
    weightLog.sort((a, b) => (a.date < b.date ? -1 : 1));
    saveJSON(K_WEIGHT, weightLog);
  }

  $("#saveWeight").addEventListener("click", () => {
    const val = parseFloat($("#weightInput").value);
    if (!val || val <= 0) {
      showToast("Ingresá un peso válido", "warn");
      return;
    }
    const todayKey = toKey(new Date());
    const prev = weightLog.length ? weightLog[weightLog.length - 1] : null;
    saveWeightEntry(todayKey, val);
    $("#weightInput").value = "";
    renderWeightView();
    if (prev && prev.date !== todayKey) {
      const diff = val - prev.weight;
      const dir = diff > 0 ? "subiste" : diff < 0 ? "bajaste" : "te mantuviste";
      showToast(`Registrado: ${val} kg (${dir} ${Math.abs(diff).toFixed(1)} kg desde el último registro)`, "ok");
    } else {
      showToast(`Peso de hoy actualizado: ${val} kg`, "ok");
    }
  });

  $$(".range-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$(".range-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentRange = btn.dataset.range;
      drawWeightChart();
    });
  });

  function filteredWeights() {
    if (currentRange === "all") return weightLog;
    const days = parseInt(currentRange, 10);
    const cutoff = addDays(new Date(), -days);
    return weightLog.filter((w) => keyToDate(w.date) >= cutoff);
  }

  function drawWeightChart() {
    const canvas = $("#weightChart");
    const data = filteredWeights();
    $("#emptyWeight").classList.toggle("hidden", weightLog.length > 0);
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.clientWidth || 340;
    const cssH = 220;
    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    if (data.length === 0) return;

    const pad = { l: 40, r: 14, t: 16, b: 24 };
    const w = cssW - pad.l - pad.r;
    const h = cssH - pad.t - pad.b;

    const values = data.map((d) => d.weight);
    let min = Math.min(...values);
    let max = Math.max(...values);
    if (min === max) { min -= 1; max += 1; }
    const margin = (max - min) * 0.15;
    min -= margin;
    max += margin;

    function xFor(i) {
      return pad.l + (data.length === 1 ? w / 2 : (i / (data.length - 1)) * w);
    }
    function yFor(v) {
      return pad.t + h - ((v - min) / (max - min)) * h;
    }

    ctx.strokeStyle = "#2a2e38";
    ctx.fillStyle = "#9aa0ab";
    ctx.font = "11px -apple-system, sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    const steps = 4;
    for (let i = 0; i <= steps; i++) {
      const v = min + ((max - min) * i) / steps;
      const y = yFor(v);
      ctx.beginPath();
      ctx.moveTo(pad.l, y);
      ctx.lineTo(pad.l + w, y);
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillText(v.toFixed(1), pad.l - 6, y);
    }

    ctx.beginPath();
    data.forEach((d, i) => {
      const x = xFor(i), y = yFor(d.weight);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = "#2ecc71";
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";
    ctx.stroke();

    const last = data[data.length - 1];
    ctx.lineTo(xFor(data.length - 1), pad.t + h);
    ctx.lineTo(xFor(0), pad.t + h);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, pad.t, 0, pad.t + h);
    grad.addColorStop(0, "rgba(46,204,113,0.25)");
    grad.addColorStop(1, "rgba(46,204,113,0)");
    ctx.fillStyle = grad;
    ctx.fill();

    data.forEach((d, i) => {
      const x = xFor(i), y = yFor(d.weight);
      ctx.beginPath();
      ctx.arc(x, y, i === data.length - 1 ? 4 : 2.5, 0, Math.PI * 2);
      ctx.fillStyle = "#2ecc71";
      ctx.fill();
    });

    const first = data[0];
    const change = last.weight - first.weight;
    const stats = $("#weightStats");
    stats.innerHTML = `
      <div>Actual<b>${last.weight.toFixed(1)} kg</b></div>
      <div>Cambio<b style="color:${change > 0 ? "#ff5c5c" : change < 0 ? "#2ecc71" : "#f2f3f5"}">${change > 0 ? "+" : ""}${change.toFixed(1)} kg</b></div>
      <div>Mín<b>${Math.min(...values).toFixed(1)} kg</b></div>
      <div>Máx<b>${Math.max(...values).toFixed(1)} kg</b></div>
    `;
  }

  function renderWeightView() {
    const todayKey = toKey(new Date());
    const todayEntry = getWeightForDate(todayKey);
    if (todayEntry) $("#weightInput").placeholder = `Hoy: ${todayEntry.weight} kg`;

    drawWeightChart();

    const list = $("#weightList");
    list.innerHTML = "";
    weightLog
      .slice()
      .reverse()
      .forEach((w) => {
        const li = document.createElement("li");
        li.className = "weight-item";
        const label = keyToDate(w.date).toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short" });
        li.innerHTML = `
          <div class="weight-item-date">${label}</div>
          <div class="item-actions">
            <span class="weight-item-val">${w.weight} kg</span>
            <button class="delete-btn" data-date="${w.date}" aria-label="Eliminar">✕</button>
          </div>`;
        list.appendChild(li);
      });
    list.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        weightLog = weightLog.filter((w) => w.date !== btn.dataset.date);
        saveJSON(K_WEIGHT, weightLog);
        renderWeightView();
      });
    });
  }

  window.addEventListener("resize", () => {
    if (!$("#view-weight").classList.contains("hidden")) drawWeightChart();
  });

  // ---------- Trend view ----------
  let trendCategory = CATEGORIES[0].id;
  let trendRange = "30";
  let trendCatSelectBuilt = false;

  function buildTrendCatSelect() {
    if (trendCatSelectBuilt) return;
    trendCatSelectBuilt = true;
    const wrap = $("#trendCatSelect");
    wrap.innerHTML = "";
    CATEGORIES.forEach((c) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.dataset.category = c.id;
      btn.textContent = `${c.icon} ${c.label}`;
      if (c.id === trendCategory) btn.classList.add("active");
      btn.addEventListener("click", () => {
        trendCategory = c.id;
        $$("#trendCatSelect button").forEach((b) => b.classList.toggle("active", b.dataset.category === c.id));
        drawTrendChart();
      });
      wrap.appendChild(btn);
    });
    $$("#trendRangeToggle .range-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        $$("#trendRangeToggle .range-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        trendRange = btn.dataset.range;
        drawTrendChart();
      });
    });
  }

  function trendDateKeys() {
    const days = parseInt(trendRange, 10);
    const keys = [];
    for (let i = days - 1; i >= 0; i--) {
      keys.push(toKey(addDays(new Date(), -i)));
    }
    return keys;
  }

  function drawTrendChart() {
    const canvas = $("#trendChart");
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.clientWidth || 340;
    const cssH = 240;
    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    const cat = CAT_BY_ID[trendCategory];
    const goal = goals[trendCategory] || 0;
    const keys = trendDateKeys();
    const values = keys.map((k) => getDayTotals(k)[trendCategory] || 0);

    const pad = { l: 34, r: 14, t: 16, b: 24 };
    const w = cssW - pad.l - pad.r;
    const h = cssH - pad.t - pad.b;

    const maxVal = Math.max(goal, ...values, 1) * 1.2;

    function xFor(i) {
      const step = w / keys.length;
      return pad.l + step * i + step / 2;
    }
    function yFor(v) {
      return pad.t + h - (v / maxVal) * h;
    }

    // grid + y labels
    ctx.strokeStyle = "#2a2e38";
    ctx.fillStyle = "#9aa0ab";
    ctx.font = "11px -apple-system, sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    const steps = 4;
    for (let i = 0; i <= steps; i++) {
      const v = (maxVal * i) / steps;
      const y = yFor(v);
      ctx.beginPath();
      ctx.moveTo(pad.l, y);
      ctx.lineTo(pad.l + w, y);
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillText(formatRac(v), pad.l - 6, y);
    }

    // bars
    const barStep = w / keys.length;
    const barW = Math.max(2, barStep * 0.55);
    values.forEach((v, i) => {
      if (v <= 0) return;
      const x = xFor(i) - barW / 2;
      const y = yFor(v);
      ctx.fillStyle = goal > 0 && v > goal ? "#ff5c5c" : cat.color;
      ctx.fillRect(x, y, barW, pad.t + h - y);
    });

    // goal line
    if (goal > 0) {
      const gy = yFor(goal);
      ctx.beginPath();
      ctx.setLineDash([5, 4]);
      ctx.moveTo(pad.l, gy);
      ctx.lineTo(pad.l + w, gy);
      ctx.strokeStyle = "#f2f3f5";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.textAlign = "left";
      ctx.fillStyle = "#f2f3f5";
      ctx.fillText(`Meta ${formatRac(goal)}`, pad.l + 4, Math.max(gy - 10, pad.t + 6));
    }

    // x labels (sparse)
    const days = keys.length;
    const labelEvery = days <= 7 ? 1 : days <= 30 ? 5 : 15;
    ctx.fillStyle = "#9aa0ab";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    keys.forEach((k, i) => {
      if (i % labelEvery !== 0 && i !== keys.length - 1) return;
      const label = keyToDate(k).toLocaleDateString("es-AR", { day: "numeric", month: "numeric" });
      ctx.fillText(label, xFor(i), pad.t + h + 6);
    });

    // stats
    let under = 0, met = 0, over = 0;
    values.forEach((v) => {
      if (v < goal) under++;
      else if (v === goal) met++;
      else over++;
    });
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const stats = $("#trendStats");
    if (goal > 0) {
      stats.innerHTML = `
        <div>Promedio<b>${formatRac(avg)}</b></div>
        <div>Mantenido<b style="color:#2ecc71">${met} días</b></div>
        <div>De menos<b style="color:#9aa0ab">${under} días</b></div>
        <div>De más<b style="color:#ff5c5c">${over} días</b></div>
      `;
    } else {
      stats.innerHTML = `<div>Promedio<b>${formatRac(avg)}</b></div><div>Sin meta configurada para este grupo</div>`;
    }
  }

  function renderTrend() {
    buildTrendCatSelect();
    drawTrendChart();
  }

  window.addEventListener("resize", () => {
    if (!$("#view-trend").classList.contains("hidden")) drawTrendChart();
  });

  // ---------- Guide view ----------
  let guideRendered = false;
  function renderGuide() {
    if (guideRendered) return;
    guideRendered = true;
    const container = $("#guideContent");
    container.innerHTML = "";
    CATEGORIES.forEach((c) => {
      const section = document.createElement("section");
      section.className = "guide-group";
      const rows = (GUIDE_DATA[c.id] || [])
        .map(
          ([food, qty, rac]) =>
            `<tr><td>${escapeHtml(food)}</td><td>${escapeHtml(qty)}</td><td>${escapeHtml(rac)} ${rac === "1" ? "ración" : "raciones"}</td></tr>`
        )
        .join("");
      section.innerHTML = `
        <div class="guide-group-header">
          <span class="cat-icon">${c.icon}</span>
          <h4 style="color:${c.color}">${c.label}</h4>
        </div>
        <table class="guide-table"><tbody>${rows}</tbody></table>`;
      container.appendChild(section);
    });
  }

  // ---------- Settings ----------
  function buildGoalFields() {
    const wrap = $("#goalFields");
    wrap.innerHTML = "";
    CATEGORIES.forEach((c) => {
      const field = document.createElement("div");
      field.className = "field";
      field.innerHTML = `
        <label for="goal_${c.id}">${c.icon} ${c.label} (raciones/día)</label>
        <input id="goal_${c.id}" type="number" inputmode="decimal" min="0" step="0.5" />`;
      wrap.appendChild(field);
    });
  }

  function renderSettings() {
    if (!$("#goal_" + CATEGORIES[0].id)) buildGoalFields();
    CATEGORIES.forEach((c) => {
      $("#goal_" + c.id).value = goals[c.id];
    });
  }

  $("#saveGoals").addEventListener("click", () => {
    CATEGORIES.forEach((c) => {
      goals[c.id] = parseFloat($("#goal_" + c.id).value) || 0;
    });
    saveJSON(K_GOALS, goals);
    const hint = $("#goalsSaved");
    hint.classList.remove("hidden");
    setTimeout(() => hint.classList.add("hidden"), 1800);
    renderToday();
  });

  $("#exportData").addEventListener("click", () => {
    const data = { goals, foodLog, weightLog, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `macros-backup-${toKey(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  $("#importDataBtn").addEventListener("click", () => $("#importDataFile").click());
  $("#importDataFile").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (data.goals) goals = data.goals;
        if (data.foodLog) foodLog = data.foodLog;
        if (data.weightLog) weightLog = data.weightLog;
        saveJSON(K_GOALS, goals);
        saveJSON(K_FOOD, foodLog);
        saveJSON(K_WEIGHT, weightLog);
        showToast("Datos importados correctamente", "ok");
        renderSettings();
        renderToday();
      } catch (err) {
        showToast("El archivo no es válido", "bad");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  });

  $("#resetData").addEventListener("click", () => {
    if (!confirm("¿Seguro que querés borrar todos los datos? Esta acción no se puede deshacer.")) return;
    goals = { ...DEFAULT_GOALS };
    foodLog = {};
    weightLog = [];
    saveJSON(K_GOALS, goals);
    saveJSON(K_FOOD, foodLog);
    saveJSON(K_WEIGHT, weightLog);
    renderSettings();
    renderToday();
    showToast("Datos borrados", "ok");
  });

  // ---------- Notification permission (best effort) ----------
  function maybeRequestNotificationPermission() {
    if (!("Notification" in window)) return;
    if (Notification.permission === "default" && !localStorage.getItem(K_NOTIF)) {
      localStorage.setItem(K_NOTIF, "asked");
      document.addEventListener(
        "click",
        function handler() {
          Notification.requestPermission();
          document.removeEventListener("click", handler);
        },
        { once: true }
      );
    }
  }

  // ---------- Service worker ----------
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("service-worker.js").catch(() => {});
    });
  }

  // ---------- Init ----------
  buildCategoryGrid();
  renderToday();
  maybeRequestNotificationPermission();
})();
