/*
  assets/app.js (Static GitHub Pages version)
  ------------------------------------------
  GitHub Pages cannot run Flask/Python routes like /data.
  This file simulates your Flask /data endpoint entirely in the browser.

  It generates:
    - per-tube seed counts for 6 tubes
    - bucket metrics: skip/ideal/double/overdrop
    - a heatmap grid 8x14
    - history (last 20 points) for a small line chart

  NOTE: The random distributions match your Flask prototype:
    tube counts: random choice of [0,1,1,1,2,3]
    heatmap values: random choice of [0,1,1,2,3]
*/

(function () {
  // ------- Shared state (like your Flask globals) -------
  const state = {
    tubes: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1 },
    history: []
  };

  // ------- Helpers -------
  function classify(seedCount) {
    if (seedCount === 0) return "skip";
    if (seedCount === 1) return "ideal";
    if (seedCount === 2) return "double";
    return "overdrop";
  }

  const TUBE_CHOICES = [0, 1, 1, 1, 2, 3];
  const HEAT_CHOICES = [0, 1, 1, 2, 3];

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function nowTime() {
    const d = new Date();
    return d.toLocaleTimeString([], { hour12: false });
  }

  // ------- Data generator (replaces Flask /data) -------
  function generateData() {
    const metrics = { skip: 0, ideal: 0, double: 0, overdrop: 0 };

    Object.keys(state.tubes).forEach((tube) => {
      const count = pick(TUBE_CHOICES);
      state.tubes[tube] = count;
      metrics[classify(count)] += 1;
    });

    const heatmap = Array.from({ length: 8 }, () =>
      Array.from({ length: 14 }, () => pick(HEAT_CHOICES))
    );

    const total = Object.values(state.tubes).reduce((a, b) => a + b, 0);
    state.history.push({ time: nowTime(), total });

    return {
      tubes: state.tubes,
      metrics,
      history: state.history.slice(-20),
      heatmap
    };
  }

  // ------- DOM helpers -------
  function byId(id) { return document.getElementById(id); }
  function setText(id, text) {
    const el = byId(id);
    if (el) el.textContent = String(text);
  }

  function bucketLabel(count) {
    if (count === 0) return "skip";
    if (count === 1) return "ideal";
    if (count === 2) return "double";
    return "overdrop";
  }

  // ------- Canvas chart (no libraries) -------
  function drawHistory(canvas, points) {
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#0b1220";
    ctx.fillRect(0, 0, w, h);

    const values = points.map(p => p.total);
    const minV = Math.min(...values, 0);
    const maxV = Math.max(...values, 1);

    const pad = 30;
    const innerW = w - pad * 2;
    const innerH = h - pad * 2;

    ctx.strokeStyle = "#263353";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad, pad);
    ctx.lineTo(pad, h - pad);
    ctx.lineTo(w - pad, h - pad);
    ctx.stroke();

    if (points.length < 2) return;

    ctx.strokeStyle = "#7dd3fc";
    ctx.lineWidth = 2;
    ctx.beginPath();

    points.forEach((p, i) => {
      const x = pad + (i / (points.length - 1)) * innerW;
      const t = (p.total - minV) / (maxV - minV || 1);
      const y = (h - pad) - t * innerH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.stroke();

    ctx.fillStyle = "#9aa7c7";
    ctx.font = "12px system-ui";
    ctx.fillText(String(maxV), 6, pad + 4);
    ctx.fillText(String(minV), 6, h - pad);
  }

  // ------- Heatmap -------
  function renderHeatmap(container, grid) {
    container.innerHTML = "";
    grid.flat().forEach((v) => {
      const cell = document.createElement("div");
      cell.className = "heatcell";
      const intensity = Math.min(3, Math.max(0, v)) / 3;
      cell.style.backgroundColor = `hsl(210, 60%, ${14 + intensity * 28}%)`;
      cell.title = `Value: ${v}`;
      cell.textContent = v;
      container.appendChild(cell);
    });
  }

  // ------- Live page -------
  function initLivePage() {
    const statusPill = byId("liveStatus");
    const tubeTable = byId("tubeTable");
    const chart = byId("historyChart");
    const heatmapEl = byId("heatmap");

    function tick() {
      const payload = generateData();

      if (statusPill) {
        statusPill.textContent = "Live (simulated)";
        statusPill.classList.add("ok");
      }

      setText("kpiSkip", payload.metrics.skip);
      setText("kpiIdeal", payload.metrics.ideal);
      setText("kpiDouble", payload.metrics.double);
      setText("kpiOver", payload.metrics.overdrop);

      if (tubeTable) {
        tubeTable.innerHTML = "";
        Object.entries(payload.tubes).forEach(([tube, count]) => {
          const tr = document.createElement("tr");

          const tdTube = document.createElement("td");
          tdTube.textContent = `Tube ${tube}`;

          const tdCount = document.createElement("td");
          tdCount.textContent = count;

          const tdBucket = document.createElement("td");
          const b = bucketLabel(count);
          tdBucket.innerHTML = `<span class="badge ${b}">${b}</span>`;

          tr.appendChild(tdTube);
          tr.appendChild(tdCount);
          tr.appendChild(tdBucket);
          tubeTable.appendChild(tr);
        });
      }

      if (chart) drawHistory(chart, payload.history || []);
      if (heatmapEl) renderHeatmap(heatmapEl, payload.heatmap || []);
    }

    tick();
    setInterval(tick, 1000);
  }

  document.addEventListener("DOMContentLoaded", () => {
    const page = document.body.getAttribute("data-page");
    if (page === "live") initLivePage();
  });
})();
