// Rolls the wave dividers like water, ported from the app's Wave.swift.
// Each curve point rides two swells travelling opposite ways; crests move
// most and the bottom edge stays put. The still curve rendered by
// _includes/wave.html is the only copy of each shape. Only on-screen waves
// animate, waves marked data-wave-still never do, and reduced motion holds
// them all still.
(function () {
  var els = Array.prototype.slice.call(document.querySelectorAll("[data-wave]:not([data-wave-still])"));
  if (!els.length || !("IntersectionObserver" in window)) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var visible = new Set();
  var frame = null;

  // "M0 60 L1440 60 C..." -> [["M", 0, 60], ["L", 1440, 60], ["C", ...]]
  function parse(d) {
    var cmds = [];
    d.match(/[MLCZ]|-?\d+(\.\d+)?/g).forEach(function (token) {
      if (/[MLC]/.test(token)) cmds.push([token]);
      else if (token !== "Z") cmds[cmds.length - 1].push(Number(token));
    });
    return cmds;
  }

  function swell(x, t) {
    var u = x / 1440;
    return 7 * Math.sin(2 * Math.PI * (u - t / 7)) + 4 * Math.sin(2 * Math.PI * (1.6 * u + t / 5));
  }

  function pathAt(wave, t) {
    var h = wave.h;
    return wave.cmds.map(function (cmd) {
      var out = cmd[0];
      for (var i = 1; i < cmd.length; i += 2) {
        var x = cmd[i];
        var y = cmd[i + 1];
        out += " " + x + " " + (y + swell(x, t) * (h - y) / h).toFixed(2);
      }
      return out;
    }).join(" ") + " Z";
  }

  function tick() {
    // Wall-clock seconds, so every wave rolls in step. Wrapped at 35s, a
    // whole number of both the 7s and 5s swells, so the wrap never jumps.
    var t = (Date.now() / 1000) % 35;
    visible.forEach(function (wave) {
      wave.path.setAttribute("d", pathAt(wave, t));
    });
    frame = visible.size ? requestAnimationFrame(tick) : null;
  }

  function start() {
    if (frame === null && visible.size && !reduce.matches) frame = requestAnimationFrame(tick);
  }

  function stop() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
  }

  var waves = els.map(function (el) {
    var path = el.querySelector("path");
    var still = path.getAttribute("d");
    el.wave = { path: path, still: still, cmds: parse(still), h: el.querySelector("svg").viewBox.baseVal.height };
    return el.wave;
  });

  var observer = new IntersectionObserver(function (changes) {
    changes.forEach(function (change) {
      if (change.isIntersecting) visible.add(change.target.wave);
      else visible.delete(change.target.wave);
    });
    if (visible.size) start();
    else stop();
  });
  els.forEach(function (el) { observer.observe(el); });

  reduce.addEventListener("change", function () {
    if (reduce.matches) {
      stop();
      waves.forEach(function (wave) { wave.path.setAttribute("d", wave.still); });
    } else {
      start();
    }
  });
})();
