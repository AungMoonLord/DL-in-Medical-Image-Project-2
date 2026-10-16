// Renders $$...$$ (display) and \( ... \) (inline) with KaTeX once its deferred scripts have loaded.
// Offline, the raw TeX stays visible, which is still readable.
window.addEventListener("load", function () {
  if (typeof renderMathInElement !== "function") return;
  try {
    renderMathInElement(document.body, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "\\(", right: "\\)", display: false },
      ],
      throwOnError: false,
    });
  } catch (e) {
    console.warn("KaTeX render failed", e);
  }
});
