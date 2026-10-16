"use strict";
(function () {
  const B = window.PET_BREEDS || [];
  const SRC = window.PET_SOURCES || {};
  const REF = window.PET_REFERENCE || [];
  const S = window.PET_STATS || { per_breed: {}, images: null, confusion: null, breed_names: [] };
  const per = S.per_breed || {};
  const byKey = Object.fromEntries(B.map((b) => [b.key, b]));
  const NS = "http://www.w3.org/2000/svg";
  const $ = (id) => document.getElementById(id);
  const nice = (k) => k.split("_").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const pct = (v, d = 1) => (v * 100).toFixed(d) + "%";
  const fmt = (n) => n.toLocaleString("en-US");
  const thName = (k) => (byKey[k] ? byKey[k].th : nice(k));
  const spColor = (sp) => (sp === "cat" ? "var(--s-cat)" : "var(--s-dog)");
  const TRI = ["#440154", "#21918C", "#FDE725"];
  // Overall test scores, used as reference lines in the scatter.
  const OVERALL = { f1: S.test ? S.test.breed.f1_macro : 0.9154, iou: S.test ? S.test.seg.iou[1] : 0.8964 };

  // ------------------------------------------------------------ svg helpers
  function el(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function text(parent, x, y, s, attrs) {
    const t = el("text", Object.assign({ x, y }, attrs || {}), parent);
    t.textContent = s;
    return t;
  }
  // Bar with a 4px rounded data end and a square baseline end.
  function hbar(parent, x, y, w, h, fill, roundEnd) {
    const r = roundEnd ? Math.min(4, w / 2, h / 2) : 0;
    const d = `M${x},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h - r}Q${x + w},${y + h} ${x + w - r},${y + h}H${x}Z`;
    return el("path", { d, fill, class: "mk" }, parent);
  }
  function vbar(parent, x, y, w, h, fill) {
    const r = Math.min(4, w / 2, h);
    const d = `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
    return el("path", { d, fill, class: "mk" }, parent);
  }
  function svgFor(container, width, height) {
    container.replaceChildren();
    const svg = el("svg", { viewBox: `0 0 ${width} ${height}`, width, height, role: "img" }, container);
    return svg;
  }

  // ------------------------------------------------------------ tooltip
  const tip = $("tip");
  function showTip(ev, rows, color) {
    tip.replaceChildren();
    rows.forEach(([v, l], i) => {
      const line = document.createElement("div");
      if (i === 0 && color) {
        const k = document.createElement("span");
        k.className = "k";
        k.style.background = color;
        line.appendChild(k);
      }
      const b = document.createElement("b");
      b.textContent = v;
      line.appendChild(b);
      if (l) line.appendChild(document.createTextNode(" " + l));
      tip.appendChild(line);
    });
    tip.hidden = false;
    const x = Math.min(ev.clientX + 14, window.innerWidth - tip.offsetWidth - 8);
    const y = Math.min(ev.clientY + 14, window.innerHeight - tip.offsetHeight - 8);
    tip.style.left = x + "px";
    tip.style.top = y + "px";
  }
  const hideTip = () => { tip.hidden = true; };
  function hover(node, rowsFn, color, onClick) {
    node.addEventListener("pointermove", (ev) => showTip(ev, rowsFn(), color));
    node.addEventListener("pointerleave", hideTip);
    if (onClick) {
      node.style.cursor = "pointer";
      node.setAttribute("tabindex", "0");
      node.addEventListener("click", onClick);
      node.addEventListener("keydown", (ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); onClick(); } });
    }
    node.addEventListener("focus", () => {
      const r = node.getBoundingClientRect();
      showTip({ clientX: r.right, clientY: r.top }, rowsFn(), color);
    });
    node.addEventListener("blur", hideTip);
  }

  // ------------------------------------------------------------ charts
  function chartSplit() {
    const host = $("chSplit").querySelector(".plot");
    const W = Math.max(300, host.clientWidth), rowH = 24, gap = 16, L = 78, R = 56;
    const rows = [["trainval", 1188, 2492], ["test", 1183, 2486]];
    const H = rows.length * (rowH + gap) + 4;
    const svg = svgFor(host, W, H);
    const max = 3680, sx = (W - L - R) / max;
    rows.forEach(([name, c, d], i) => {
      const y = i * (rowH + gap) + 4;
      text(svg, 0, y + rowH / 2 + 4, name, { class: "lab" });
      const wc = c * sx - 1, wd = d * sx - 1;
      const segs = [[L, wc, c, "แมว", "var(--s-cat)", false], [L + wc + 2, wd, d, "หมา", "var(--s-dog)", true]];
      segs.forEach(([x, w, n, lab, col, round]) => {
        const p = hbar(svg, x, y, w, rowH, col, round);
        hover(p, () => [[fmt(n), `ภาพ${lab} · ${name}`], [pct(n / (c + d)), "ของชุดนี้"]], col);
        const label = `${lab} ${fmt(n)}`;
        if (w > label.length * 7 + 12) text(svg, x + 8, y + rowH / 2 + 4, label, { style: "fill:#1E1A29;font:500 12px var(--f-body);pointer-events:none" });
      });
      text(svg, L + (c + d) * sx + 6, y + rowH / 2 + 4, fmt(c + d), {});
    });
  }

  function columns(hostId, values, labels, opts) {
    const host = $(hostId).querySelector(".plot");
    const W = Math.max(300, host.clientWidth), H = 220, L = 44, Bt = 28, T = 22;
    const svg = svgFor(host, W, H);
    const max = opts.max, n = values.length;
    const slot = (W - L - 4) / n, bw = Math.min(24, slot - 4);
    const sy = (H - Bt - T) / max;
    opts.ticks.forEach((t) => {
      const y = H - Bt - t * sy;
      el("line", { x1: L, x2: W, y1: y, y2: y, class: t === 0 ? "axisl" : "gridl" }, svg);
      text(svg, L - 6, y + 4, t >= 1000 ? t / 1000 + "K" : String(t), { "text-anchor": "end" });
    });
    values.forEach((v, i) => {
      const x = L + i * slot + (slot - bw) / 2, h = v * sy;
      const b = vbar(svg, x, H - Bt - h, bw, Math.max(h, 0.5), "var(--s-one)");
      const hit = el("rect", { x: L + i * slot, y: T, width: slot, height: H - Bt - T, class: "hit" }, svg);
      hover(hit, () => [[fmt(v), "ภาพ"], [opts.tipLabel(i), ""]], "var(--s-one)");
      if (opts.show && opts.show[i]) text(svg, x + bw / 2, H - Bt - h - 6, opts.show[i], { "text-anchor": "middle", class: "lab" });
      if (labels[i]) text(svg, x + bw / 2, H - 10, labels[i], { "text-anchor": "middle" });
    });
    if (opts.vline !== undefined) {
      const x = L + opts.vline * slot;
      el("line", { x1: x, x2: x, y1: T - 6, y2: H - Bt, class: "axisl", "stroke-width": 1.5 }, svg);
      text(svg, x + 4, T + 4, opts.vlineLabel, {});
    }
  }

  function chartImages() {
    const im = S.images;
    if (!im) return;
    const hl = im.hist_longest, total = hl.reduce((a, b) => a + b, 0);
    const lab = ["100", "200", "300", "400", "500", "600", "700", "800", "900", "1000+"];
    const peak = hl.indexOf(Math.max(...hl));
    const show = hl.map((v, i) => (i === peak ? `${fmt(v)} (${pct(v / total, 0)})` : ""));
    columns("chLongest", hl, lab, {
      max: 7000, ticks: [0, 2000, 4000, 6000], show,
      tipLabel: (i) => (i === 9 ? "ด้านยาว 1000 px ขึ้นไป" : `ด้านยาว ${100 * (i + 1)}–${100 * (i + 1) + 99} px`),
    });
    const ha = im.hist_aspect;
    const al = ha.map((_, i) => ([0, 5, 10].includes(i) ? (0.5 + i * 0.1).toFixed(1) : i === 14 ? "2.0" : ""));
    const named = { 1: "2:3", 2: "3:4", 8: "4:3", 10: "3:2" };
    columns("chAspect", ha, al, {
      max: 2400, ticks: [0, 1000, 2000], show: ha.map((_, i) => named[i] || ""), vline: 5, vlineLabel: "จัตุรัส",
      tipLabel: (i) => `สัดส่วน ${(0.5 + i * 0.1).toFixed(1)}–${(0.6 + i * 0.1).toFixed(1)}`,
    });

    const host = $("chPixels").querySelector(".plot");
    const W = Math.max(300, host.clientWidth), H = 62;
    const svg = svgFor(host, W, H);
    const parts = [["พื้นหลัง", im.bg_mean], ["ตัวสัตว์", im.fg_mean], ["ขอบ", im.edge_mean]];
    let x = 0;
    parts.forEach(([name, v], i) => {
      const w = v * W - (i < 2 ? 2 : 0);
      const p = hbar(svg, x, 4, w, 24, TRI[i], i === 2);
      hover(p, () => [[pct(v), `ของพิกเซลทั้งหมดเป็น${name}`]], TRI[i]);
      const key = el("rect", { x: x, y: 36, width: 10, height: 10, rx: 2, fill: TRI[i] }, svg);
      const t = text(svg, x + 14, 45, `${name} ${pct(v)}`, { class: "lab" });
      const tw = t.getComputedTextLength ? t.getComputedTextLength() : 0;
      if (x + 14 + tw > W) {
        // Keep the last label inside the chart: right-align it with its key in front.
        t.setAttribute("x", W);
        t.setAttribute("text-anchor", "end");
        key.setAttribute("x", W - tw - 14);
      }
      x += w + 2;
    });

    $("imgStats").innerHTML = [
      ["ความละเอียด", `กว้าง ${im.w_min}–${fmt(im.w_max)} (มัธยฐาน ${im.w_med}) · สูง ${im.h_min}–${fmt(im.h_max)} (มัธยฐาน ${im.h_med}) พิกเซล`, "ขนาดไม่เท่ากัน จึงต้อง Resize เป็น 224×224"],
      ["สัดส่วนภาพ", `${im.ar_p5.toFixed(2)} ถึง ${im.ar_p95.toFixed(2)} (ช่วง 90% กลาง) · แนวนอน ${pct(im.landscape)}`, "การบีบเป็นจัตุรัสเหมือนกันทั้งตอนเทรนและทดสอบ"],
      ["โหมดสี", `RGB ${fmt(im.modes.RGB)} ภาพ · อื่น ๆ ${im.modes_other}`, "แปลงเป็น RGB 3 ช่องเสมอ เพราะ backbone ImageNet รับ 3 ช่อง"],
      ["พื้นที่ trimap", `ตัวสัตว์ ${pct(im.fg_mean)} · พื้นหลัง ${pct(im.bg_mean)} · ขอบ ${pct(im.edge_mean)}`, "ใส่ Dice loss ให้คลาสขอบที่เล็กกว่ามีน้ำหนักเท่ากัน"],
      ["ไฟล์ในโฟลเดอร์ images/", `${fmt(im.files_total)} ไฟล์ · มีป้ายใน list.txt ${fmt(7349)} ภาพ`, "ใช้รายชื่อ trainval.txt / test.txt จึงไม่หยิบไฟล์ที่ไม่มีป้าย"],
    ].map((r) => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join("");
  }

  function chartScatter() {
    const host = $("chScatter").querySelector(".plot");
    const W = Math.max(300, host.clientWidth), H = Math.min(420, Math.max(300, W * 0.6)), L = 46, Bt = 40, T = 12, R = 16;
    const svg = svgFor(host, W, H);
    const xd = [0.79, 0.94], yd = [0.6, 1.0];
    const sx = (v) => L + ((v - xd[0]) / (xd[1] - xd[0])) * (W - L - R);
    const sy = (v) => H - Bt - ((v - yd[0]) / (yd[1] - yd[0])) * (H - Bt - T);
    [0.6, 0.7, 0.8, 0.9, 1.0].forEach((t) => {
      el("line", { x1: L, x2: W - R, y1: sy(t), y2: sy(t), class: t === 0.6 ? "axisl" : "gridl" }, svg);
      text(svg, L - 6, sy(t) + 4, pct(t, 0), { "text-anchor": "end" });
    });
    [0.8, 0.85, 0.9].forEach((t) => {
      el("line", { x1: sx(t), x2: sx(t), y1: T, y2: H - Bt, class: "gridl" }, svg);
      text(svg, sx(t), H - Bt + 16, t.toFixed(2), { "text-anchor": "middle" });
    });
    text(svg, (W + L) / 2, H - 6, "Pet IoU (ระบายสีตัวสัตว์) →", { "text-anchor": "middle" });
    text(svg, L + 4, T + 10, "↑ Breed F1", {});
    el("line", { x1: sx(OVERALL.iou), x2: sx(OVERALL.iou), y1: T, y2: H - Bt, stroke: "var(--muted)", "stroke-opacity": 0.45, "stroke-width": 1 }, svg);
    el("line", { x1: L, x2: W - R, y1: sy(OVERALL.f1), y2: sy(OVERALL.f1), stroke: "var(--muted)", "stroke-opacity": 0.45, "stroke-width": 1 }, svg);

    const pts = B.filter((b) => per[b.key]).map((b) => ({ b, p: per[b.key] }));
    const labelled = new Set(pts.filter(({ p }) => p.f1 < 0.8 || p.pet_iou < 0.84).map(({ b }) => b.key));
    pts.forEach(({ b, p }) => {
      const cx = sx(p.pet_iou), cy = sy(p.f1), col = spColor(b.species);
      el("circle", { cx, cy, r: 5, fill: col, stroke: "var(--surface)", "stroke-width": 2, class: "mk" }, svg);
      const hit = el("circle", { cx, cy, r: 12, class: "hit", "aria-label": nice(b.key) }, svg);
      hover(hit, () => [[pct(p.f1), "Breed F1"], [p.pet_iou.toFixed(3), "Pet IoU"], [nice(b.key), `· ${b.th}`]], col, () => openDrawer(b.key));
      if (labelled.has(b.key)) {
        const right = cx < W - 170;
        text(svg, cx + (right ? 10 : -10), cy + 4, nice(b.key), { "text-anchor": right ? "start" : "end", class: "lab", style: "pointer-events:none" });
      }
    });

    $("perfTable").innerHTML = pts.slice().sort((a, b) => a.p.f1 - b.p.f1).map(({ b, p }) =>
      `<tr><td>${esc(nice(b.key))}</td><td>${b.species === "cat" ? "แมว" : "หมา"}</td><td class="num">${pct(p.f1)}</td><td class="num">${pct(p.recall)}</td><td class="num">${p.pet_iou.toFixed(3)}</td></tr>`).join("");
  }

  function chartPairs() {
    const cm = S.confusion, names = S.breed_names;
    if (!cm) return;
    const pairs = [];
    for (let i = 0; i < 37; i++) for (let j = 0; j < 37; j++) if (i !== j && cm[i][j]) pairs.push([names[i], names[j], cm[i][j]]);
    pairs.sort((a, b) => b[2] - a[2]);
    const top = pairs.slice(0, 10);
    const host = $("chPairs").querySelector(".plot");
    const W = Math.max(300, host.clientWidth), narrow = W < 560;
    const rowH = narrow ? 34 : 22, gap = 8, L = narrow ? 0 : 300, R = 90;
    const H = top.length * (rowH + gap);
    const svg = svgFor(host, W, H);
    const max = top[0][2], sx = (W - L - R) / max;
    top.forEach(([a, b, n], i) => {
      const y = i * (rowH + gap);
      const cross = (byKey[a] && byKey[b] && byKey[a].species !== byKey[b].species);
      const label = `${nice(a)} → ${nice(b)}`;
      const by = narrow ? y + 16 : y;
      const bh = narrow ? 14 : rowH;
      text(svg, narrow ? 0 : L - 8, narrow ? y + 11 : y + rowH / 2 + 4, label, { "text-anchor": narrow ? "start" : "end", class: "lab" });
      const bar = hbar(svg, L, by, Math.max(n * sx, 2), bh, "var(--s-one)", true);
      hover(bar, () => [[fmt(n), "ภาพ"], [label, cross ? "(ข้ามชนิด)" : ""]], "var(--s-one)", () => openDrawer(a));
      text(svg, L + n * sx + 6, by + bh / 2 + 4, fmt(n) + (cross ? "  ข้ามชนิด" : ""), {});
    });
  }

  function renderCharts() {
    chartSplit();
    chartImages();
    chartScatter();
    chartPairs();
  }

  // ------------------------------------------------------------ groups table
  const GROUPS = [
    ["บูลลี่", ["american_pit_bull_terrier", "staffordshire_bull_terrier", "american_bulldog", "boxer"], "ขนสั้น กล้ามเนื้อหนา หัวกว้าง", "ขนาดตัว ความยาวปาก หน้ากากดำของ Boxer"],
    ["แมวลายจุด / ticked", ["bengal", "egyptian_mau", "abyssinian"], "ขนสั้นลายจุดหรือสีอบอุ่น ตัวเพรียว", "Bengal ลายดอกและขนเงา · Mau ลาย M และตาเขียว · Abyssinian ไม่มีลาย"],
    ["Colorpoint ตาฟ้า", ["ragdoll", "birman", "siamese"], "หน้า หู หางสีเข้ม ตาสีฟ้า", "Birman อุ้งเท้าขาว · Ragdoll ตัวใหญ่ขนฟู · Siamese ขนสั้นหัวลิ่ม"],
    ["แมวเทา/ดำขนสั้น", ["british_shorthair", "russian_blue", "bombay"], "ขนสั้นสีเรียบ", "สีตา: British ทองแดง · Russian เขียว · Bombay ดำสนิทตาทอง"],
    ["สปิตซ์ขนฟู", ["samoyed", "pomeranian", "keeshond", "great_pyrenees", "shiba_inu"], "ขนฟูหนา หางม้วน หูตั้ง", "Samoyed ขาวยิ้ม · Keeshond เทามีแว่น · Pomeranian จิ๋ว"],
    ["หมายักษ์ขนยาว", ["leonberger", "newfoundland", "saint_bernard"], "ตัวใหญ่ ขนหนา หัวกว้าง", "Newfoundland ดำ · Saint Bernard ขาว-แดง · Leonberger ทองหน้ากากดำ"],
    ["ตัวจิ๋วหูใหญ่", ["chihuahua", "miniature_pinscher", "sphynx"], "ตัวเล็ก หูใหญ่ ผิวหรือขนเรียบ", "Sphynx เป็นแมวไม่มีขน · Min Pin สีดำ-น้ำตาล"],
    ["หูห้อยล่ากลิ่น", ["beagle", "basset_hound"], "สามสี หูห้อย", "ความยาวขาและหู"],
    ["ขนยาวตัวเล็ก", ["havanese", "yorkshire_terrier", "japanese_chin", "english_cocker_spaniel", "wheaten_terrier"], "ขนยาวนุ่มเป็นลอน", "สีขนและรูปหน้า"],
  ];
  function groupTable() {
    const cm = S.confusion;
    $("groupTable").innerHTML = GROUPS.map((g) => {
      let n = "–";
      if (cm) {
        const idx = g[1].map((k) => S.breed_names.indexOf(k));
        let c = 0;
        idx.forEach((i) => idx.forEach((j) => { if (i !== j) c += cm[i][j]; }));
        n = fmt(c);
      }
      const chips = g[1].map((k) => `<button class="chipbtn" type="button" data-open="${k}">${esc(thName(k))}</button>`).join(" ");
      return `<tr><td><b>${g[0]}</b></td><td><div class="chiprow">${chips}</div></td><td>${g[2]}</td><td>${g[3]}</td><td class="num">${n}</td></tr>`;
    }).join("");
  }

  // ------------------------------------------------------------ catalogue
  const state = { f: "all", s: "name", q: "" };
  function renderGrid() {
    const q = state.q.toLowerCase();
    const list = B.filter((b) => (state.f === "all" || b.species === state.f) &&
      (!q || b.key.replace(/_/g, " ").includes(q) || b.th.toLowerCase().includes(q)));
    list.sort((a, b) => {
      if (state.s === "f1" && per[a.key] && per[b.key]) return per[a.key].f1 - per[b.key].f1;
      if (state.s === "iou" && per[a.key] && per[b.key]) return per[a.key].pet_iou - per[b.key].pet_iou;
      return a.key < b.key ? -1 : 1;
    });
    $("grid").innerHTML = list.map((b) => {
      const p = per[b.key];
      const f1 = p ? `<span class="f1${p.f1 < 0.8 ? " lo" : ""}">${pct(p.f1, 0)}</span>` : "";
      const img = p && p.thumb ? `<img src="${esc(p.thumb)}" alt="" loading="lazy">` : "";
      return `<button class="tile" type="button" data-open="${b.key}" aria-label="${esc(nice(b.key))} ${b.species === "cat" ? "แมว" : "หมา"}${p ? " F1 " + pct(p.f1, 0) : ""}">` +
        `${img}<span class="sp-dot" style="background:${spColor(b.species)}"></span>` +
        `<span class="ov"><span class="nm">${esc(nice(b.key))}</span>${f1}</span></button>`;
    }).join("") || '<p class="muted">ไม่พบสายพันธุ์ที่ค้นหา</p>';
  }

  // ------------------------------------------------------------ reference breeds
  const rstate = { f: "all" };
  function renderRefs() {
    const list = REF.filter((r) => rstate.f === "all" || (rstate.f === "th" ? r.origin.includes("ประเทศไทย") : r.species === rstate.f));
    $("refs").innerHTML = list.map((r) => {
      const thai = r.origin.includes("ประเทศไทย") ? '<span class="badge-th">ไทย</span>' : "";
      const alike = r.alike.length
        ? `<div class="chiprow"><span class="th">น่าจะถูกทายเป็น:</span>${r.alike.map((k) => `<button class="chipbtn" type="button" data-open="${k}">${esc(thName(k))}</button>`).join("")}</div>`
        : '<p class="th">ไม่มีสายพันธุ์ใดในชุดข้อมูลที่คล้ายชัดเจน</p>';
      const src = r.src.map(([l, u]) => `<a class="ext" href="${esc(u)}" target="_blank" rel="noopener">${l}</a>`).join("");
      return `<article class="ref-card"><div class="top"><h3>${esc(r.name)}</h3><span class="sp ${r.species}" style="font:500 .72rem/1 var(--f-mono)">${r.species === "cat" ? "แมว" : "หมา"}</span></div>` +
        `<p class="th">${esc(r.th)} · ${esc(r.origin)} ${thai}</p><p>${esc(r.look)}</p><p class="th">${esc(r.why)}</p>${alike}<div class="srcs">${src}</div></article>`;
    }).join("");
  }

  // ------------------------------------------------------------ drawer
  const drawer = $("drawer"), scrim = $("scrim");
  let lastFocus = null;
  function openDrawer(key) {
    const b = byKey[key];
    if (!b) return;
    const p = per[key];
    const src = (SRC[key] || []).map(([l, u]) => `<a class="ext" href="${esc(u)}" target="_blank" rel="noopener">${l}</a>`).join("");
    const kpi = (v, l) => `<div><b>${v}</b><span>${l}</span></div>`;
    const kpis = p ? `<div class="kpis">${kpi(pct(p.f1), "F1")}${kpi(pct(p.recall), "Recall")}${kpi(pct(p.precision), "Precision")}${kpi(p.pet_iou.toFixed(3), "Pet IoU")}${kpi(p.test_n, "ภาพ test")}${kpi(p.trainval_n, "ภาพ trainval")}</div>` : "";
    const confused = p && p.confused.length
      ? `<div><p class="th">โมเดลทายผิดเป็น</p><div class="chiprow">${p.confused.map(([k, n]) => `<button class="chipbtn" type="button" data-open="${k}">${esc(thName(k))} · ${n}</button>`).join("")}</div></div>` : "";
    const outsiders = REF.filter((r) => r.alike.includes(key));
    const out = outsiders.length ? `<div><p class="th">สายพันธุ์นอกชุดข้อมูลที่อาจถูกทายเป็นสายพันธุ์นี้</p><p>${outsiders.map((r) => esc(r.name)).join(", ")}</p></div>` : "";
    drawer.innerHTML =
      `<button class="x" type="button" aria-label="ปิด">✕</button>` +
      `<div class="ph">${p && p.thumb ? `<img src="${esc(p.thumb)}" alt="ตัวอย่างภาพ ${esc(nice(key))}">` : ""}</div>` +
      `<div class="bd">` +
      `<div class="top" style="display:flex;justify-content:space-between;gap:8px;align-items:baseline"><h3>${esc(nice(key))}</h3><span class="sp ${b.species}" style="font:500 .72rem/1 var(--f-mono);padding:4px 8px;border-radius:999px;background:${b.species === "cat" ? "var(--accent-soft)" : "var(--mark)"}">${b.species === "cat" ? "แมว" : "หมา"}</span></div>` +
      `<p class="muted">${esc(b.th)} · ${esc(b.origin)}</p>` + kpis +
      `<div><p class="th">ลักษณะที่เห็นได้จากภาพ</p><ul>${b.look.map((l) => `<li>${esc(l)}</li>`).join("")}</ul></div>` +
      (b.note ? `<p class="warn" style="font-size:.88rem;color:var(--down);background:var(--down-soft);border-radius:8px;padding:8px 10px">${esc(b.note)}</p>` : "") +
      `<div><p class="th">หน้าคล้าย</p><div class="chiprow">${b.alike.map((k) => `<button class="chipbtn" type="button" data-open="${k}">${esc(thName(k))}</button>`).join("")}</div></div>` +
      confused + out +
      `<div><p class="th">แหล่งอ้างอิง</p><div class="srcs">${src}</div></div>` +
      (p && p.thumb_src ? `<p class="status">ภาพตัวอย่าง: ${esc(p.thumb_src)}.jpg (test)</p>` : "") +
      `</div>`;
    drawer.querySelector(".x").addEventListener("click", closeDrawer);
    if (!drawer.classList.contains("open")) lastFocus = document.activeElement;
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    drawer.scrollTop = 0;
    scrim.hidden = false;
    document.querySelectorAll(".tile").forEach((t) => t.setAttribute("aria-pressed", String(t.dataset.open === key)));
    drawer.focus({ preventScroll: true });
    try { history.replaceState(null, "", "#breed=" + key); } catch (e) {}
  }
  function closeDrawer() {
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    scrim.hidden = true;
    document.querySelectorAll(".tile").forEach((t) => t.setAttribute("aria-pressed", "false"));
    try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  // ------------------------------------------------------------ wiring
  document.addEventListener("click", (ev) => {
    const t = ev.target.closest("[data-open]");
    if (t) openDrawer(t.dataset.open);
  });
  scrim.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (ev) => { if (ev.key === "Escape" && drawer.classList.contains("open")) closeDrawer(); });

  document.querySelectorAll("#catalogue .filters button").forEach((btn) => btn.addEventListener("click", () => {
    const attr = btn.dataset.f ? "f" : "s";
    state[attr] = btn.dataset[attr];
    document.querySelectorAll(`#catalogue .filters button[data-${attr}]`).forEach((x) => x.setAttribute("aria-pressed", String(x === btn)));
    renderGrid();
  }));
  $("q").addEventListener("input", (e) => { state.q = e.target.value.trim(); renderGrid(); });
  document.querySelectorAll("#outside .filters button").forEach((btn) => btn.addEventListener("click", () => {
    rstate.f = btn.dataset.rf;
    document.querySelectorAll("#outside .filters button").forEach((x) => x.setAttribute("aria-pressed", String(x === btn)));
    renderRefs();
  }));

  renderCharts();
  groupTable();
  renderGrid();
  renderRefs();
  let rt = 0;
  window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(renderCharts, 150); });
  const m = location.hash.match(/^#breed=([a-z_]+)$/);
  if (m) openDrawer(m[1]);
})();
