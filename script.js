(() => {
  const $ = (id) => document.getElementById(id);

  const status = $("status");
  const modeBtn = $("modeBtn");
  const ctfBtn = $("ctfBtn");
  const year = $("year");
  const quoteText = $("quoteText");
  const quoteBtn = $("quoteBtn");
  const hsHint = $("hsHint");
  const flagInput = $("flagInput");
  const flagBtn = $("flagBtn");
  const flagStatus = $("flagStatus");

  year.textContent = String(new Date().getFullYear());

  // Quotes (no spoilers, just vibe)
  const QUOTES = [
    "«Если сейчас тяжело — значит ты прокачиваешься.»",
    "«Спокойно. План. Действие. Профит.»",
    "«Дисциплина — это когда мотивация не нужна.»",
    "«Не магия, а практика.»",
    "«Победа — это сумма маленьких решений.»",
    "«Сначала считай летал, потом красиво играй.»",
  ];
  let qi = 0;
  quoteBtn?.addEventListener("click", () => {
    qi = (qi + 1) % QUOTES.length;
    quoteText.textContent = QUOTES[qi];
  });

  // "Режим Димы" — subtle UX polish
  let mode = false;
  modeBtn?.addEventListener("click", () => {
    mode = !mode;
    document.documentElement.style.setProperty(
      "--accent",
      mode ? "#FF5CA8" : "#7C5CFF"
    );
    document.documentElement.style.setProperty(
      "--accent2",
      mode ? "#FFD166" : "#26E7A6"
    );

    status.textContent = mode
      ? "Режим Димы включён: +10 к фокусу, +5 к спокойствию."
      : "Режим Димы выключен: возвращаемся в базу.";

    if (mode) pulse(2);
  });

  // Hearthstone mini-cards
  const HS = {
    mulligan: "Муллиган: оставляй план на 1–3 хода. В сомнениях — бери карту, которая ускоряет темп.",
    tempo: "Темп: ставь угрозы так, чтобы оппонент тратил ману реактивно.",
    value: "Вэлью: не жадничай. Вэлью хорошо, когда оно не отдаёт темп бесплатно.",
    lethal: "Летал: сначала посчитай урон (с учётом силы героя/баффов), потом жми кнопки.",
  };

  document.querySelectorAll('.hs-card').forEach((b) => {
    b.addEventListener('click', () => {
      const key = b.getAttribute('data-card');
      if (!key || !HS[key]) return;
      hsHint.textContent = HS[key];
      pulse(1);
    });
  });

  // Tiny confetti (no libs)
  function pulse(intensity = 1) {
    const count = 18 * intensity;
    for (let i = 0; i < count; i++) {
      const p = document.createElement("span");
      p.className = "p";
      p.style.left = `${Math.random() * 100}%`;
      p.style.top = `${(Math.random() * 20) + 4}%`;
      p.style.opacity = String(0.7 + Math.random() * 0.3);
      p.style.transform = `translate(-50%, -50%) rotate(${Math.random() * 360}deg)`;
      p.style.background = Math.random() > 0.5
        ? "rgba(124,92,255,.95)"
        : "rgba(38,231,166,.90)";
      document.body.appendChild(p);
      const dx = (Math.random() - 0.5) * 220;
      const dy = 220 + Math.random() * 260;
      p.animate([
        { transform: p.style.transform, filter: "blur(0px)", offset: 0 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${Math.random() * 720}deg)`, filter: "blur(0.3px)", offset: 1 },
      ], {
        duration: 1000 + Math.random() * 700,
        easing: "cubic-bezier(.2,.7,.2,1)",
      });
      setTimeout(() => p.remove(), 1900);
    }
  }

  // CTF: obfuscated flag
  const enc = "RVRGe0RJTUFfU0tJTExTX0FORF9XSU5TfQ=="; // base64
  const flag = atob(enc);

  ctfBtn?.addEventListener("click", () => {
    // reveal panel area + slight drama
    document.getElementById("ctf")?.scrollIntoView({ behavior: "smooth", block: "start" });
    status.textContent = "CTF-панель открыта. Дальше — дело за Димой.";
    pulse(1);
  });

  flagBtn?.addEventListener("click", () => {
    const v = (flagInput.value || "").trim();
    if (!v) {
      flagStatus.textContent = "Введи флаг.";
      return;
    }
    if (v === flag) {
      flagStatus.textContent = "Верно. Дима, ты машина.";
      flagStatus.style.color = "rgba(38,231,166,.95)";
      pulse(2);
    } else {
      flagStatus.textContent = "Не то. Подсказка: в коде всё честно.";
      flagStatus.style.color = "rgba(255,77,109,.95)";
    }
  });

  // Background stars
  const canvas = document.getElementById("stars");
  const ctx = canvas.getContext("2d");

  const DPR = Math.min(2, window.devicePixelRatio || 1);
  let W = 0, H = 0;
  let stars = [];

  function resize() {
    W = Math.floor(window.innerWidth);
    H = Math.floor(window.innerHeight);
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    const n = Math.min(220, Math.floor((W * H) / 12000));
    stars = new Array(n).fill(0).map(() => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: 0.6 + Math.random() * 1.2,
      a: 0.25 + Math.random() * 0.55,
      v: 0.15 + Math.random() * 0.45,
    }));
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);
    for (const s of stars) {
      s.y += s.v;
      if (s.y > H + 10) {
        s.y = -10;
        s.x = Math.random() * W;
      }
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(234,240,255,${s.a})`;
      ctx.fill();
    }
    requestAnimationFrame(tick);
  }

  window.addEventListener("resize", resize, { passive: true });
  resize();
  tick();

  // small particles style injected (keeps CSS clean)
  const style = document.createElement("style");
  style.textContent = `
    .p{ position: fixed; width: 8px; height: 8px; border-radius: 3px; z-index: 6; pointer-events:none; box-shadow: 0 8px 22px rgba(0,0,0,.35); }
  `;
  document.head.appendChild(style);
})();
