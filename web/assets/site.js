// Theme toggle shared by every page. Preference is a per-viewer convenience, so storage failures are ignored.
(function () {
  var KEY = "pet-mtl-theme";
  var root = document.documentElement;
  try {
    var saved = localStorage.getItem(KEY);
    if (saved === "light" || saved === "dark") root.setAttribute("data-theme", saved);
  } catch (e) {}

  function current() {
    var t = root.getAttribute("data-theme");
    if (t) return t;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.querySelector(".themebtn");
    if (!btn) return;
    var icon = btn.classList.contains("icon");
    var paint = function () {
      var dark = current() === "dark";
      btn.textContent = icon ? (dark ? "☀" : "☾") : (dark ? "☀ สว่าง" : "☾ มืด");
      btn.title = dark ? "เปลี่ยนเป็นโหมดสว่าง" : "เปลี่ยนเป็นโหมดมืด";
    };
    paint();
    btn.addEventListener("click", function () {
      var next = current() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem(KEY, next); } catch (e) {}
      paint();
    });
  });
})();
