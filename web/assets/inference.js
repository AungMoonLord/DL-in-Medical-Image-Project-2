"use strict";
(function () {
  // Must match data/class_mappings.py (index = breed_id used during training).
  const BREEDS = [
    "abyssinian", "american_bulldog", "american_pit_bull_terrier", "basset_hound",
    "beagle", "bengal", "birman", "bombay", "boxer", "british_shorthair",
    "chihuahua", "egyptian_mau", "english_cocker_spaniel", "english_setter",
    "german_shorthaired", "great_pyrenees", "havanese", "japanese_chin",
    "keeshond", "leonberger", "maine_coon", "miniature_pinscher", "newfoundland",
    "persian", "pomeranian", "pug", "ragdoll", "russian_blue", "saint_bernard",
    "samoyed", "scottish_terrier", "shiba_inu", "siamese", "sphynx",
    "staffordshire_bull_terrier", "wheaten_terrier", "yorkshire_terrier"
  ];
  const CATS = new Set(["abyssinian", "bengal", "birman", "bombay", "british_shorthair", "egyptian_mau",
    "maine_coon", "persian", "ragdoll", "russian_blue", "siamese", "sphynx"]);
  const SPECIES = ["แมว", "หมา"];
  const SIZE = 224, HW = SIZE * SIZE;
  const MEAN = [0.485, 0.456, 0.406], STD = [0.229, 0.224, 0.225];
  const TRI = [[0x44, 0x01, 0x54], [0x21, 0x91, 0x8C], [0xFD, 0xE7, 0x25]];
  // Values from the notebook (official test split, PyTorch) for side-by-side comparison.
  const REPORTED = { miou: 0.8266, dice: 0.8987, iou: [0.9466, 0.8964, 0.6368],
    bAcc: 0.9169, bF1: 0.9154, bP: 0.9188, bR: 0.9165, sAcc: 0.9951, sF1: 0.9944 };
  const ORT_DIST = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/";
  const MODEL_URL = "model/pet_multitask.onnx";

  const $ = (id) => document.getElementById(id);
  const nice = (n) => n.split("_").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
  const pct = (v, d = 2) => (v * 100).toFixed(d) + "%";
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  let session = null;
  let backendUsed = "";

  function setStatus(el, msg, kind) {
    el.textContent = msg;
    el.className = "status" + (kind ? " " + kind : "");
  }

  // ---------------------------------------------------------------- model
  async function createSession(bytes) {
    if (typeof ort === "undefined") throw new Error("โหลดไลบรารี onnxruntime-web ไม่สำเร็จ (ต้องต่ออินเทอร์เน็ตครั้งแรก)");
    ort.env.wasm.wasmPaths = ORT_DIST;
    ort.env.wasm.numThreads = self.crossOriginIsolated ? Math.min(4, navigator.hardwareConcurrency || 1) : 1;
    const pref = $("backend").value;
    const order = pref === "auto" ? (navigator.gpu ? ["webgpu", "wasm"] : ["wasm"]) : [pref];
    let lastErr = null;
    for (const ep of order) {
      try {
        const s = await ort.InferenceSession.create(bytes, { executionProviders: [ep], graphOptimizationLevel: "all" });
        return { s, ep };
      } catch (e) {
        console.warn("backend failed:", ep, e);
        lastErr = e;
      }
    }
    throw lastErr || new Error("ไม่มี backend ที่ใช้ได้");
  }

  async function fetchBytes(url, onProgress) {
    const res = await fetch(url);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const total = Number(res.headers.get("content-length")) || 0;
    if (!res.body) return new Uint8Array(await res.arrayBuffer());
    const reader = res.body.getReader();
    const chunks = [];
    let got = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      got += value.length;
      if (total) onProgress(got / total);
    }
    const out = new Uint8Array(got);
    let off = 0;
    for (const c of chunks) { out.set(c, off); off += c.length; }
    return out;
  }

  async function loadModel(getBytes, label) {
    const st = $("modelStatus"), prog = $("modelProg");
    prog.hidden = false;
    prog.firstElementChild.style.width = "0%";
    setStatus(st, "กำลังอ่านไฟล์โมเดล " + label + " …");
    try {
      const bytes = await getBytes((p) => { prog.firstElementChild.style.width = (p * 100).toFixed(0) + "%"; });
      prog.firstElementChild.style.width = "100%";
      setStatus(st, "กำลังเตรียมโมเดล (" + (bytes.length / 1048576).toFixed(0) + " MB) …");
      const { s, ep } = await createSession(bytes);
      session = s;
      backendUsed = ep;
      const t0 = performance.now();
      await runBatch(new Float32Array(3 * HW), 1);
      const warm = performance.now() - t0;
      setStatus(st, `พร้อมใช้งาน · ${label} · backend: ${ep.toUpperCase()} · รอบแรก ${warm.toFixed(0)} ms`, "ok");
      $("evalStart").disabled = !evalItems.length;
    } catch (e) {
      console.error(e);
      session = null;
      setStatus(st, "โหลดโมเดลไม่สำเร็จ: " + (e && e.message ? e.message : e), "err");
    } finally {
      prog.hidden = true;
    }
  }

  async function runBatch(data, n) {
    const tensor = new ort.Tensor("float32", data, [n, 3, SIZE, SIZE]);
    const out = await session.run({ [session.inputNames[0]]: tensor });
    return {
      seg: out.seg_logits.data,
      breed: out.breed_logits.data,
      species: out.species_logits.data,
    };
  }

  // ---------------------------------------------------------------- preprocessing
  // Decode to RGBA at native resolution. Evaluation ignores EXIF orientation to match PIL.
  async function decode(blob, applyOrientation) {
    let bmp;
    try {
      bmp = await createImageBitmap(blob, {
        imageOrientation: applyOrientation ? "from-image" : "none",
        premultiplyAlpha: "none",
        colorSpaceConversion: "none",
      });
    } catch (e) {
      bmp = await createImageBitmap(blob);
    }
    const c = document.createElement("canvas");
    c.width = bmp.width;
    c.height = bmp.height;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(bmp, 0, 0);
    if (bmp.close) bmp.close();
    return ctx.getImageData(0, 0, c.width, c.height);
  }

  // Same coefficients as PIL's antialiased BILINEAR resample (what torchvision uses for PIL images).
  function coeffs(inSize, outSize) {
    const scale = inSize / outSize;
    const fs = Math.max(scale, 1);
    const list = [];
    for (let o = 0; o < outSize; o++) {
      const center = (o + 0.5) * scale;
      const xmin = Math.max(Math.trunc(center - fs + 0.5), 0);
      const xmax = Math.min(Math.trunc(center + fs + 0.5), inSize);
      const w = new Float64Array(Math.max(xmax - xmin, 0));
      let sum = 0;
      for (let x = 0; x < w.length; x++) {
        const t = Math.abs((x + xmin - center + 0.5) / fs);
        w[x] = t < 1 ? 1 - t : 0;
        sum += w[x];
      }
      if (sum > 0) for (let x = 0; x < w.length; x++) w[x] /= sum;
      list.push({ xmin, w });
    }
    return list;
  }

  const clip8 = (v) => (v <= 0 ? 0 : v >= 255 ? 255 : Math.floor(v + 0.5));

  function resizeRGB(img, outW, outH) {
    const { width: W, height: H, data } = img;
    const cx = coeffs(W, outW), cy = coeffs(H, outH);
    const tmp = new Uint8Array(outW * H * 3);
    for (let y = 0; y < H; y++) {
      const row = y * W * 4;
      for (let o = 0; o < outW; o++) {
        const { xmin, w } = cx[o];
        let r = 0, g = 0, b = 0;
        for (let k = 0; k < w.length; k++) {
          const p = row + (xmin + k) * 4;
          r += data[p] * w[k]; g += data[p + 1] * w[k]; b += data[p + 2] * w[k];
        }
        const q = (y * outW + o) * 3;
        tmp[q] = clip8(r); tmp[q + 1] = clip8(g); tmp[q + 2] = clip8(b);
      }
    }
    const out = new Uint8Array(outW * outH * 3);
    for (let o = 0; o < outH; o++) {
      const { xmin, w } = cy[o];
      for (let x = 0; x < outW; x++) {
        let r = 0, g = 0, b = 0;
        for (let k = 0; k < w.length; k++) {
          const p = ((xmin + k) * outW + x) * 3;
          r += tmp[p] * w[k]; g += tmp[p + 1] * w[k]; b += tmp[p + 2] * w[k];
        }
        const q = (o * outW + x) * 3;
        out[q] = clip8(r); out[q + 1] = clip8(g); out[q + 2] = clip8(b);
      }
    }
    return out;
  }

  function writeTensor(rgb, dst, offset) {
    for (let p = 0; p < HW; p++) {
      for (let c = 0; c < 3; c++) {
        dst[offset + c * HW + p] = (rgb[p * 3 + c] / 255 - MEAN[c]) / STD[c];
      }
    }
  }

  // Trimap: 1 = pet, 2 = background, 3 = boundary  ->  0 = background, 1 = pet, 2 = boundary.
  // Nearest resize uses PIL's sampling rule src = floor((dst + 0.5) * scale).
  function trimapToMask(img) {
    const { width: W, height: H, data } = img;
    const sx = W / SIZE, sy = H / SIZE;
    const out = new Uint8Array(HW);
    for (let y = 0; y < SIZE; y++) {
      const yy = Math.min(Math.floor((y + 0.5) * sy), H - 1);
      for (let x = 0; x < SIZE; x++) {
        const xx = Math.min(Math.floor((x + 0.5) * sx), W - 1);
        const v = data[(yy * W + xx) * 4];
        out[y * SIZE + x] = v === 1 ? 1 : v === 3 ? 2 : 0;
      }
    }
    return out;
  }

  function softmax(arr, start, len) {
    let m = -Infinity;
    for (let i = 0; i < len; i++) m = Math.max(m, arr[start + i]);
    const out = new Float64Array(len);
    let s = 0;
    for (let i = 0; i < len; i++) { out[i] = Math.exp(arr[start + i] - m); s += out[i]; }
    for (let i = 0; i < len; i++) out[i] /= s;
    return out;
  }

  const argmax = (a) => { let b = 0; for (let i = 1; i < a.length; i++) if (a[i] > a[b]) b = i; return b; };

  function segArgmax(seg, i) {
    const base = i * 3 * HW;
    const mask = new Uint8Array(HW);
    for (let p = 0; p < HW; p++) {
      const a = seg[base + p], b = seg[base + HW + p], c = seg[base + 2 * HW + p];
      mask[p] = a >= b ? (a >= c ? 0 : 2) : (b >= c ? 1 : 2);
    }
    return mask;
  }

  function labelFromName(stem) {
    const name = stem.replace(/_\d+$/, "").toLowerCase();
    return BREEDS.indexOf(name);
  }

  function barRow(label, v, color, strong) {
    const lab = strong ? "<b>" + esc(label) + "</b>" : esc(label);
    return `<div class="mrow wide"><span>${lab}</span><span class="mtrack"><i style="width:${(v * 100).toFixed(1)}%;background:${color}"></i></span><span class="v">${pct(v, 1)}</span></div>`;
  }

  // ---------------------------------------------------------------- inference mode
  const view = { img: null, mask: null, mode: "overlay" };

  async function handleImage(file) {
    const st = $("infStatus");
    if (!file) return;
    if (!session) { setStatus(st, "กรุณาโหลดโมเดลก่อน (ส่วน \"โหลดโมเดล\" ด้านบน)", "err"); return; }
    setStatus(st, "กำลังประมวลผล " + file.name + " …");
    try {
      const img = await decode(file, true);
      const t0 = performance.now();
      const rgb = resizeRGB(img, SIZE, SIZE);
      const input = new Float32Array(3 * HW);
      writeTensor(rgb, input, 0);
      const t1 = performance.now();
      const out = await runBatch(input, 1);
      const t2 = performance.now();

      const mask = segArgmax(out.seg, 0);
      const bp = softmax(out.breed, 0, BREEDS.length);
      const sp = softmax(out.species, 0, 2);
      view.img = img;
      view.mask = mask;
      renderView();
      renderPreds(bp, sp, mask);

      $("infMeta").innerHTML =
        `<dt>ไฟล์</dt><dd>${esc(file.name)}</dd>` +
        `<dt>ขนาดเดิม</dt><dd>${img.width} × ${img.height}</dd>` +
        `<dt>เตรียมภาพ</dt><dd>${(t1 - t0).toFixed(0)} ms</dd>` +
        `<dt>โมเดล</dt><dd>${(t2 - t1).toFixed(0)} ms · ${backendUsed.toUpperCase()}</dd>`;
      $("infResult").hidden = false;
      setStatus(st, "เสร็จแล้ว", "ok");
    } catch (e) {
      console.error(e);
      setStatus(st, "ประมวลผลภาพไม่สำเร็จ: " + (e && e.message ? e.message : e), "err");
    }
  }

  function renderPreds(bp, sp, mask) {
    const s = argmax(sp);
    $("spAns").textContent = `${SPECIES[s]} · ${pct(sp[s], 1)}`;
    $("spBars").innerHTML = barRow("แมว", sp[0], "var(--tri-pet)", s === 0) + barRow("หมา", sp[1], "var(--tri-edge)", s === 1);

    const order = Array.from(bp.keys()).sort((a, b) => bp[b] - bp[a]).slice(0, 5);
    const top = order[0];
    $("brAns").textContent = `${nice(BREEDS[top])} · ${pct(bp[top], 1)}`;
    $("brBars").innerHTML = order.map((k, i) =>
      barRow(`${nice(BREEDS[k])} (${CATS.has(BREEDS[k]) ? "แมว" : "หมา"})`, bp[k], i === 0 ? "var(--accent)" : "var(--muted)", i === 0)).join("");

    const notes = [];
    const breedSpecies = CATS.has(BREEDS[top]) ? 0 : 1;
    if (breedSpecies !== s) {
      notes.push(`<b>สองหัวตอบขัดกัน:</b> หัวสายพันธุ์ทาย ${esc(nice(BREEDS[top]))} ซึ่งเป็น${SPECIES[breedSpecies]} แต่หัวหมาแมวตอบว่าเป็น${SPECIES[s]} เพราะสองหัวถูกออกแบบให้แยกกันตามโจทย์`);
    }
    if (bp[top] < 0.5) {
      notes.push("<b>ความมั่นใจต่ำ:</b> ภาพนี้อาจเป็นสายพันธุ์ที่ไม่มีใน 37 สายพันธุ์ หรือมองเห็นตัวสัตว์ไม่ชัด");
    }
    const el = $("consist");
    el.innerHTML = notes.join("<br>");
    el.hidden = notes.length === 0;

    const counts = [0, 0, 0];
    for (let p = 0; p < HW; p++) counts[mask[p]]++;
    $("pctBg").textContent = pct(counts[0] / HW, 1);
    $("pctPet").textContent = pct(counts[1] / HW, 1);
    $("pctEdge").textContent = pct(counts[2] / HW, 1);
  }

  function maskCanvas(mask, kind) {
    const c = document.createElement("canvas");
    c.width = SIZE; c.height = SIZE;
    const ctx = c.getContext("2d");
    const id = ctx.createImageData(SIZE, SIZE);
    for (let p = 0; p < HW; p++) {
      const k = mask[p], q = p * 4;
      if (kind === "alpha") {
        id.data[q] = id.data[q + 1] = id.data[q + 2] = 0;
        id.data[q + 3] = k === 1 ? 255 : k === 2 ? 140 : 0;
      } else {
        id.data[q] = TRI[k][0]; id.data[q + 1] = TRI[k][1]; id.data[q + 2] = TRI[k][2]; id.data[q + 3] = 255;
      }
    }
    ctx.putImageData(id, 0, 0);
    return c;
  }

  function renderView() {
    if (!view.img) return;
    const { img, mask, mode } = view;
    const scale = Math.min(1, 720 / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * scale)), h = Math.max(1, Math.round(img.height * scale));
    const cv = $("view");
    cv.width = w; cv.height = h;
    const ctx = cv.getContext("2d");
    ctx.clearRect(0, 0, w, h);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const src = document.createElement("canvas");
    src.width = img.width; src.height = img.height;
    src.getContext("2d").putImageData(img, 0, 0);

    if (mode === "mask") {
      ctx.drawImage(maskCanvas(mask, "color"), 0, 0, w, h);
      return;
    }
    ctx.drawImage(src, 0, 0, w, h);
    if (mode === "overlay") {
      ctx.globalAlpha = Number($("alpha").value) / 100;
      ctx.drawImage(maskCanvas(mask, "color"), 0, 0, w, h);
      ctx.globalAlpha = 1;
    } else if (mode === "cutout") {
      ctx.globalCompositeOperation = "destination-in";
      ctx.drawImage(maskCanvas(mask, "alpha"), 0, 0, w, h);
      ctx.globalCompositeOperation = "source-over";
    }
  }

  // ---------------------------------------------------------------- evaluation mode
  let evalItems = [];
  let evalRecords = [];
  let stopFlag = false;

  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  async function scanFolder(fileList) {
    const st = $("scanStatus");
    const images = new Map(), trimaps = new Map();
    let testFile = null;
    for (const f of fileList) {
      const path = (f.webkitRelativePath || f.name).replace(/\\/g, "/");
      const base = path.split("/").pop();
      if (base.startsWith("._")) continue; // macOS metadata files shipped inside the official archive
      const lower = base.toLowerCase();
      const stem = base.replace(/\.[^.]+$/, "");
      if (lower === "test.txt") testFile = f;
      else if (/\/trimaps\//i.test("/" + path) && lower.endsWith(".png")) trimaps.set(stem, f);
      else if (/\.(jpe?g|png|webp|bmp)$/.test(lower) && !/\/(trimaps|xmls)\//i.test("/" + path)) {
        if (!images.has(stem)) images.set(stem, f);
      }
    }

    let testSet = null;
    if (testFile && $("useTest").checked) {
      try {
        const txt = await testFile.text();
        testSet = new Set(txt.split(/\r?\n/).filter((l) => l && !l.startsWith("#")).map((l) => l.split(/\s+/)[0]));
      } catch (e) {
        console.warn("cannot read test.txt", e);
      }
    }

    let items = [];
    for (const [stem, file] of [...images.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1))) {
      if (testSet && !testSet.has(stem)) continue;
      items.push({ stem, file, breed: labelFromName(stem), maskFile: trimaps.get(stem) || null });
    }
    const limit = Math.max(0, Number($("limit").value) || 0);
    if (limit && limit < items.length) {
      const rnd = mulberry32(42);
      for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(rnd() * (i + 1));
        [items[i], items[j]] = [items[j], items[i]];
      }
      items = items.slice(0, limit);
    }
    evalItems = items;

    const labelled = items.filter((it) => it.breed >= 0).length;
    const masked = items.filter((it) => it.maskFile).length;
    const parts = [`พบภาพ ${images.size.toLocaleString()} ภาพ`];
    if (testSet) parts.push(`ตาม test.txt ${testSet.size.toLocaleString()} รายการ`);
    else if (testFile) parts.push("มี test.txt แต่ไม่ได้ใช้");
    parts.push(`จะประเมิน ${items.length.toLocaleString()} ภาพ`, `มีป้ายสายพันธุ์ ${labelled.toLocaleString()}`, `มี Mask ${masked.toLocaleString()}`);
    setStatus(st, parts.join(" · "), items.length ? "ok" : "err");
    $("evalStart").disabled = !items.length || !session;
    if (items.length && !session) setStatus(st, st.textContent + " · โหลดโมเดลก่อนจึงจะเริ่มได้", "ok");
  }

  function newAccumulators() {
    return {
      seg: new Float64Array(9),
      breed: new Int32Array(37 * 37),
      sp: new Int32Array(4),
      n: 0, nSeg: 0, nCls: 0, failed: 0, disagree: 0, spFromBreed: 0,
    };
  }

  async function runEvaluation() {
    if (!session || !evalItems.length) return;
    const st = $("evalStatus"), bar = $("evalProg").firstElementChild;
    const B = BATCH_OVERRIDE || (backendUsed === "webgpu" ? 8 : 4);
    const acc = newAccumulators();
    evalRecords = [];
    stopFlag = false;
    $("evalStart").disabled = true;
    $("evalStop").disabled = false;
    $("evalCsv").disabled = true;
    const t0 = performance.now();

    for (let i = 0; i < evalItems.length && !stopFlag; i += B) {
      const chunk = evalItems.slice(i, i + B);
      const prepared = [];
      for (const it of chunk) {
        try {
          const img = await decode(it.file, false);
          const rgb = resizeRGB(img, SIZE, SIZE);
          let gt = null;
          if (it.maskFile) gt = trimapToMask(await decode(it.maskFile, false));
          prepared.push({ it, rgb, gt });
        } catch (e) {
          console.warn("skip", it.stem, e);
          acc.failed++;
        }
      }
      if (!prepared.length) continue;

      const input = new Float32Array(prepared.length * 3 * HW);
      prepared.forEach((p, k) => writeTensor(p.rgb, input, k * 3 * HW));
      let out;
      try {
        out = await runBatch(input, prepared.length);
      } catch (e) {
        console.error(e);
        setStatus(st, "โมเดลทำงานผิดพลาด: " + (e && e.message ? e.message : e), "err");
        break;
      }

      prepared.forEach((p, k) => {
        const pred = segArgmax(out.seg, k);
        const bp = softmax(out.breed, k * 37, 37);
        const sp = softmax(out.species, k * 2, 2);
        const pb = argmax(bp), ps = argmax(sp);
        const rec = { file: p.it.stem, trueBreed: p.it.breed, predBreed: pb, breedConf: bp[pb], predSpecies: ps, speciesConf: sp[ps], petIoU: null };
        acc.n++;
        if (pb >= 0 && (CATS.has(BREEDS[pb]) ? 0 : 1) !== ps) acc.disagree++;

        if (p.gt) {
          let inter = 0, uni = 0;
          for (let q = 0; q < HW; q++) {
            const g = p.gt[q], r = pred[q];
            acc.seg[g * 3 + r]++;
            const gp = g === 1, rp = r === 1;
            if (gp && rp) inter++;
            if (gp || rp) uni++;
          }
          rec.petIoU = uni ? inter / uni : 1;
          acc.nSeg++;
        }
        if (p.it.breed >= 0) {
          const ts = CATS.has(BREEDS[p.it.breed]) ? 0 : 1;
          acc.breed[p.it.breed * 37 + pb]++;
          acc.sp[ts * 2 + ps]++;
          if ((CATS.has(BREEDS[pb]) ? 0 : 1) === ts) acc.spFromBreed++;
          acc.nCls++;
          rec.trueSpecies = ts;
        }
        evalRecords.push(rec);
      });

      const done = Math.min(i + B, evalItems.length);
      const el = (performance.now() - t0) / 1000;
      const eta = (el / done) * (evalItems.length - done);
      bar.style.width = ((done / evalItems.length) * 100).toFixed(1) + "%";
      setStatus(st, `${done.toLocaleString()} / ${evalItems.length.toLocaleString()} ภาพ · ${(done / el).toFixed(1)} ภาพ/วินาที · เหลือราว ${fmtTime(eta)}`);
      if (done % (B * 10) === 0 || done === evalItems.length) renderEval(acc);
    }

    renderEval(acc);
    const el = (performance.now() - t0) / 1000;
    setStatus(st, `${stopFlag ? "หยุดแล้ว" : "เสร็จแล้ว"} · ประเมิน ${acc.n.toLocaleString()} ภาพใน ${fmtTime(el)}${acc.failed ? ` · อ่านไม่ได้ ${acc.failed} ภาพ` : ""}`, "ok");
    $("evalStart").disabled = false;
    $("evalStop").disabled = true;
    $("evalCsv").disabled = !evalRecords.length;
  }

  function fmtTime(s) {
    if (!isFinite(s)) return "–";
    if (s < 60) return s.toFixed(0) + " วินาที";
    const m = Math.floor(s / 60);
    return m < 60 ? `${m} นาที ${Math.round(s % 60)} วินาที` : `${Math.floor(m / 60)} ชม. ${m % 60} นาที`;
  }

  // Macro scores follow sklearn: average over labels that appear in y_true or y_pred, zero_division = 0.
  function classMetrics(cm, K) {
    const per = [];
    let tpSum = 0, total = 0;
    for (let k = 0; k < K; k++) {
      let row = 0, col = 0;
      for (let j = 0; j < K; j++) { row += cm[k * K + j]; col += cm[j * K + k]; }
      const tp = cm[k * K + k];
      tpSum += tp; total += row;
      const P = col ? tp / col : 0, R = row ? tp / row : 0;
      per.push({ k, P, R, F1: P + R ? (2 * P * R) / (P + R) : 0, support: row, present: row + col > 0 });
    }
    const used = per.filter((x) => x.present);
    const mean = (f) => (used.length ? used.reduce((s, x) => s + x[f], 0) / used.length : 0);
    return { per, acc: total ? tpSum / total : 0, P: mean("P"), R: mean("R"), F1: mean("F1"), total };
  }

  function segMetrics(cm) {
    const iou = [], dice = [];
    for (let c = 0; c < 3; c++) {
      let row = 0, col = 0;
      for (let j = 0; j < 3; j++) { row += cm[c * 3 + j]; col += cm[j * 3 + c]; }
      const tp = cm[c * 3 + c];
      iou.push(row + col - tp ? tp / (row + col - tp) : 1);
      dice.push(row + col ? (2 * tp) / (row + col) : 1);
    }
    return { iou, dice, miou: iou.reduce((a, b) => a + b) / 3, mdice: dice.reduce((a, b) => a + b) / 3 };
  }

  const cmpRow = (name, v, ref) => `<tr><td>${name}</td><td class="num">${v}</td><td class="num">${ref}</td></tr>`;

  function renderEval(acc) {
    $("evalResult").hidden = false;
    const hasSeg = acc.nSeg > 0, hasCls = acc.nCls > 0;
    const seg = hasSeg ? segMetrics(acc.seg) : null;
    const br = hasCls ? classMetrics(acc.breed, 37) : null;
    const sp = hasCls ? classMetrics(acc.sp, 2) : null;

    $("evalStats").innerHTML = [
      [acc.n.toLocaleString(), "ภาพที่ประเมินแล้ว"],
      [seg ? seg.miou.toFixed(4) : "–", "mIoU"],
      [br ? pct(br.acc) : "–", "Breed Accuracy"],
      [sp ? pct(sp.acc) : "–", "Species Accuracy"],
    ].map(([k, l]) => `<div class="stat"><span class="k">${k}</span><span class="l">${l}</span></div>`).join("");

    if (seg) {
      const names = ["พื้นหลัง", "ตัวสัตว์", "ขอบ"], cols = ["var(--tri-bg)", "var(--tri-pet)", "var(--tri-edge)"];
      $("iouBars").innerHTML = seg.iou.map((v, c) =>
        `<div class="mrow"><span>${names[c]}</span><span class="mtrack"><i style="width:${(v * 100).toFixed(2)}%;background:${cols[c]}"></i></span><span class="v">${v.toFixed(3)}</span></div>`).join("") +
        `<div class="mrow"><span><b>mIoU</b></span><span class="mtrack"><i style="width:${(seg.miou * 100).toFixed(2)}%;background:var(--accent)"></i></span><span class="v"><b>${seg.miou.toFixed(3)}</b></span></div>`;
      $("segTable").innerHTML =
        cmpRow("Mean IoU (mIoU)", seg.miou.toFixed(4), REPORTED.miou.toFixed(4)) +
        cmpRow("Mean Dice", seg.mdice.toFixed(4), REPORTED.dice.toFixed(4)) +
        ["พื้นหลัง", "ตัวสัตว์", "ขอบ"].map((n, c) => cmpRow("IoU · " + n, seg.iou[c].toFixed(4), REPORTED.iou[c].toFixed(4))).join("") +
        cmpRow("จำนวนภาพที่มี Mask", acc.nSeg.toLocaleString(), "3,669");
    } else {
      $("iouBars").innerHTML = "";
      $("segTable").innerHTML = `<tr><td colspan="3" class="muted">ไม่พบ Mask เฉลย (annotations/trimaps/*.png)</td></tr>`;
    }

    if (br) {
      $("breedTable").innerHTML =
        cmpRow("Accuracy", pct(br.acc), pct(REPORTED.bAcc)) +
        cmpRow("Macro F1", pct(br.F1), pct(REPORTED.bF1)) +
        cmpRow("Macro Precision", pct(br.P), pct(REPORTED.bP)) +
        cmpRow("Macro Recall", pct(br.R), pct(REPORTED.bR));
      drawConfusion(acc.breed);
      const pairs = [];
      for (let i = 0; i < 37; i++) for (let j = 0; j < 37; j++) if (i !== j && acc.breed[i * 37 + j]) pairs.push([i, j, acc.breed[i * 37 + j]]);
      pairs.sort((a, b) => b[2] - a[2]);
      $("pairTable").innerHTML = pairs.slice(0, 10).map(([i, j, n]) =>
        `<tr><td>${esc(nice(BREEDS[i]))}</td><td>${esc(nice(BREEDS[j]))}</td><td class="num">${n}</td></tr>`).join("") ||
        `<tr><td colspan="3" class="muted">ยังไม่มีคู่ที่ทายผิด</td></tr>`;
      $("perBreed").innerHTML = br.per.filter((x) => x.support).sort((a, b) => a.F1 - b.F1).map((x) =>
        `<tr><td>${esc(nice(BREEDS[x.k]))} <span class="muted">(${CATS.has(BREEDS[x.k]) ? "แมว" : "หมา"})</span></td><td class="num">${pct(x.P, 1)}</td><td class="num">${pct(x.R, 1)}</td><td class="num">${pct(x.F1, 1)}</td><td class="num">${x.support}</td></tr>`).join("");
    } else {
      $("breedTable").innerHTML = `<tr><td colspan="3" class="muted">ไม่พบป้ายสายพันธุ์จากชื่อไฟล์</td></tr>`;
    }

    if (sp) {
      const c = acc.sp;
      $("spTable").innerHTML = [0, 1].map((t) =>
        `<tr><td><b>${SPECIES[t]} จริง</b></td><td class="num">${c[t * 2]}</td><td class="num">${c[t * 2 + 1]}</td><td class="num">${pct(sp.per[t].P)}</td><td class="num">${pct(sp.per[t].R)}</td><td class="num">${pct(sp.per[t].F1)}</td></tr>`).join("");
      $("spSummary").innerHTML =
        cmpRow("Accuracy (หัวหมาแมว)", pct(sp.acc), pct(REPORTED.sAcc)) +
        cmpRow("Macro F1", pct(sp.F1), pct(REPORTED.sF1)) +
        cmpRow("Accuracy ถ้าอนุมานจากหัวสายพันธุ์", pct(acc.spFromBreed / acc.nCls), "–") +
        cmpRow("ภาพที่สองหัวตอบขัดกัน", `${acc.disagree} (${pct(acc.disagree / acc.n)})`, "–");
    }
  }

  function drawConfusion(cm) {
    const K = 37, cell = 14, margin = 168;
    const cv = $("cmBreed");
    const size = margin + K * cell + 8;
    const dpr = window.devicePixelRatio || 1;
    cv.width = size * dpr; cv.height = size * dpr;
    cv.style.width = size + "px"; cv.style.height = size + "px";
    const ctx = cv.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, size, size);
    ctx.font = "10px 'IBM Plex Mono', monospace";
    ctx.fillStyle = "#3a3646";
    for (let i = 0; i < K; i++) {
      ctx.textAlign = "right"; ctx.textBaseline = "middle";
      ctx.fillText(nice(BREEDS[i]), margin - 6, margin + i * cell + cell / 2);
      ctx.save();
      ctx.translate(margin + i * cell + cell / 2, margin - 6);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = "left";
      ctx.fillText(nice(BREEDS[i]), 0, 0);
      ctx.restore();
    }
    for (let i = 0; i < K; i++) {
      let row = 0;
      for (let j = 0; j < K; j++) row += cm[i * K + j];
      for (let j = 0; j < K; j++) {
        const v = row ? cm[i * K + j] / row : 0;
        // White → accent teal (#17706B), with a sqrt ramp so small off-diagonal counts stay visible.
        const t = Math.sqrt(v);
        ctx.fillStyle = `rgb(${Math.round(255 - t * (255 - 23))},${Math.round(255 - t * (255 - 112))},${Math.round(255 - t * (255 - 107))})`;
        ctx.fillRect(margin + j * cell, margin + i * cell, cell - 1, cell - 1);
      }
    }
    cv.onmousemove = (ev) => {
      const r = cv.getBoundingClientRect();
      const x = ev.clientX - r.left - margin, y = ev.clientY - r.top - margin;
      const j = Math.floor(x / cell), i = Math.floor(y / cell);
      if (i < 0 || j < 0 || i >= K || j >= K) return;
      let row = 0;
      for (let q = 0; q < K; q++) row += cm[i * K + q];
      const n = cm[i * K + j];
      $("cmHover").textContent = `จริง ${nice(BREEDS[i])} → ทาย ${nice(BREEDS[j])}: ${n} ภาพ${row ? ` (${pct(n / row, 1)} ของแถว)` : ""}`;
    };
  }

  function downloadCsv() {
    const head = ["file", "true_breed", "pred_breed", "breed_conf", "true_species", "pred_species", "species_conf", "pet_iou", "breed_correct"];
    const lines = [head.join(",")];
    for (const r of evalRecords) {
      lines.push([
        r.file,
        r.trueBreed >= 0 ? BREEDS[r.trueBreed] : "",
        BREEDS[r.predBreed],
        r.breedConf.toFixed(4),
        r.trueSpecies === undefined ? "" : (r.trueSpecies ? "dog" : "cat"),
        r.predSpecies ? "dog" : "cat",
        r.speciesConf.toFixed(4),
        r.petIoU === null ? "" : r.petIoU.toFixed(4),
        r.trueBreed >= 0 ? String(r.trueBreed === r.predBreed) : "",
      ].join(","));
    }
    const blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "pet_eval_predictions.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  // ---------------------------------------------------------------- wiring
  function selectTab(which) {
    const inf = which === "inf";
    $("tabInf").setAttribute("aria-selected", String(inf));
    $("tabEval").setAttribute("aria-selected", String(!inf));
    $("panelInf").hidden = !inf;
    $("panelEval").hidden = inf;
  }

  // Optional URL overrides, e.g. inference.html?backend=wasm&batch=1
  const params = new URLSearchParams(location.search);
  const BATCH_OVERRIDE = Math.max(0, Number(params.get("batch")) || 0);

  document.addEventListener("DOMContentLoaded", () => {
    if (["auto", "webgpu", "wasm"].includes(params.get("backend"))) $("backend").value = params.get("backend");
    $("tabInf").addEventListener("click", () => selectTab("inf"));
    $("tabEval").addEventListener("click", () => selectTab("eval"));

    $("modelFile").addEventListener("change", (e) => {
      const f = e.target.files && e.target.files[0];
      if (f) loadModel(async () => new Uint8Array(await f.arrayBuffer()), f.name);
    });
    $("modelAuto").addEventListener("click", () => loadModel((p) => fetchBytes(MODEL_URL, p), MODEL_URL));

    const drop = $("drop");
    $("imgFile").addEventListener("change", (e) => handleImage(e.target.files && e.target.files[0]));
    drop.addEventListener("dragover", (e) => { e.preventDefault(); drop.classList.add("over"); });
    drop.addEventListener("dragleave", () => drop.classList.remove("over"));
    drop.addEventListener("drop", (e) => {
      e.preventDefault();
      drop.classList.remove("over");
      handleImage(e.dataTransfer.files && e.dataTransfer.files[0]);
    });

    document.querySelectorAll(".seg button[data-mode]").forEach((b) => b.addEventListener("click", () => {
      view.mode = b.dataset.mode;
      document.querySelectorAll(".seg button[data-mode]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      renderView();
    }));
    $("alpha").addEventListener("input", renderView);

    let lastFiles = null;
    $("dirInput").addEventListener("change", (e) => {
      lastFiles = e.target.files;
      if (lastFiles && lastFiles.length) scanFolder(lastFiles);
    });
    const rescan = () => { if (lastFiles && lastFiles.length) scanFolder(lastFiles); };
    $("useTest").addEventListener("change", rescan);
    $("limit").addEventListener("change", rescan);
    $("evalStart").addEventListener("click", runEvaluation);
    $("evalStop").addEventListener("click", () => { stopFlag = true; });
    $("evalCsv").addEventListener("click", downloadCsv);

    if (location.protocol.startsWith("http")) {
      loadModel((p) => fetchBytes(MODEL_URL, p), MODEL_URL);
    } else {
      setStatus($("modelStatus"), "เปิดจากไฟล์โดยตรง (file://) · กด \"เลือกไฟล์โมเดล\" แล้วเลือก web/model/pet_multitask.onnx");
    }
  });
})();
