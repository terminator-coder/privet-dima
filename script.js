(() => {
  const $ = (id) => document.getElementById(id);

  const status = $("status");
  const modeBtn = $("modeBtn");
  const ctfBtn = $("ctfBtn");
  const year = $("year");
  const quoteText = $("quoteText");
  const quoteBtn = $("quoteBtn");
  const hsHint = $("hsHint");
  const hsRandomBtn = $("hsRandomBtn");
  const hsQuizBtn = $("hsQuizBtn");
  const hsGameBtn = $("hsGameBtn");
  const hsGame = $("hsGame");
  const hsEnemyHp = $("hsEnemyHp");
  const hsMana = $("hsMana");
  const hsDmg = $("hsDmg");
  const hsStreak = $("hsStreak");
  const hsHand = $("hsHand");
  const hsGameReset = $("hsGameReset");
  const hsGameCheck = $("hsGameCheck");
  const hsGameNext = $("hsGameNext");
  const hsGameStatus = $("hsGameStatus");
  const hsGameHint = $("hsGameHint");

  const hsGallery = document.querySelector('.hs__gallery');
  const hsModal = $("hsModal");
  const hsModalImg = $("hsModalImg");
  const hsModalTitle = $("hsModalTitle");
  const hsModalBody = $("hsModalBody");
  const hsModalMeta = $("hsModalMeta");
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

  // Favorite cards (images from HearthstoneJSON art CDN)
  const FAVS = [
    {
      id: 'EX1_134',
      name: 'Си-7 Агент',
      why: 'Супер-честный темп + точечный урон. Люблю такие карты: простые, но решающие.',
      tag: 'tempo',
    },
    {
      id: 'EX1_620',
      name: 'Молтен-гигант',
      why: 'Карта из эпохи, когда математика по хп была отдельной игрой.',
      tag: 'swing',
    },
    {
      id: 'EX1_620t',
      name: 'Пасхалка',
      why: 'Если не загрузится арт — тоже ок: Дима увидит, что я продумал фолбэк.',
      tag: 'easter',
      hidden: true,
    },
    {
      id: 'EX1_561',
      name: 'Алекстраза',
      why: 'Иконический «поставил план на летал» одним движением.',
      tag: 'lethal',
    },
    {
      id: 'LOE_011',
      name: 'Рено Джексон',
      why: 'Кнопка «не умереть», которая часто выигрывает игру сама.',
      tag: 'stabilize',
    },
    {
      id: 'BOT_548',
      name: 'Зиллиакс',
      why: 'Когда нужна универсальность: таунт/хил/яд/магнит — и всё в одной карте.',
      tag: 'utility',
    },
  ].filter(c => !c.hidden);

  const artUrl = (id) => `https://art.hearthstonejson.com/v1/render/latest/enUS/512x/${id}.png`;

  function openModal(card) {
    if (!hsModal) return;
    hsModalImg.src = artUrl(card.id);
    hsModalImg.alt = card.name;
    hsModalTitle.textContent = card.name;
    hsModalBody.textContent = card.why;
    hsModalMeta.textContent = `id: ${card.id} · тег: ${card.tag}`;
    hsModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!hsModal) return;
    hsModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  hsModal?.addEventListener('click', (e) => {
    const t = e.target;
    if (t && t.getAttribute && t.getAttribute('data-close') === '1') closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // Gallery render
  if (hsGallery) {
    hsGallery.innerHTML = '';
    for (const card of FAVS) {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'hs-item';
      el.innerHTML = `
        <img loading="lazy" src="${artUrl(card.id)}" alt="${card.name}">
        <div class="hs-item__cap">
          <p class="hs-item__title">${card.name}</p>
          <p class="hs-item__sub">${card.why}</p>
        </div>
      `;
      el.addEventListener('click', () => {
        openModal(card);
        pulse(1);
      });
      // fallback if blocked
      el.querySelector('img')?.addEventListener('error', () => {
        el.querySelector('img').src = `data:image/svg+xml;utf8,${encodeURIComponent(svgFallback(card.name))}`;
      });
      hsGallery.appendChild(el);
    }
  }

  function svgFallback(title) {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="800" height="520">
        <defs>
          <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
            <stop stop-color="#7C5CFF" offset="0"/>
            <stop stop-color="#26E7A6" offset="1"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="#0A1024"/>
        <circle cx="120" cy="120" r="190" fill="url(#g)" opacity="0.22"/>
        <circle cx="700" cy="420" r="240" fill="url(#g)" opacity="0.18"/>
        <text x="40" y="280" fill="#EAF0FF" font-size="36" font-family="system-ui, -apple-system, Segoe UI, Roboto">${escapeXml(title)}</text>
        <text x="40" y="330" fill="#A9B4D0" font-size="18" font-family="system-ui, -apple-system, Segoe UI, Roboto">арт недоступен — но сайт всё равно красивый</text>
      </svg>
    `.trim();
  }

  function escapeXml(s){
    return String(s).replace(/[<>&\"']/g, (c) => ({'<':'&lt;','>':'&gt;','&':'&amp;','\"':'&quot;',"'":'&apos;'}[c]));
  }

  // Random card button
  hsRandomBtn?.addEventListener('click', () => {
    const card = FAVS[Math.floor(Math.random() * FAVS.length)];
    openModal(card);
    status.textContent = `Рандом‑пик: ${card.name}`;
    pulse(2);
  });

  // Mini quiz: guess the card by hint
  const QUIZ = [
    { q: 'Карта‑универсал: таунт + хил + магнетизм (и ещё пачка слов)', a: 'Зиллиакс' },
    { q: 'Кнопка «не умереть», если колода без дубликатов', a: 'Рено Джексон' },
    { q: 'Темповый агент, который «щёлкает» и продолжает давить', a: 'Си-7 Агент' },
  ];
  hsQuizBtn?.addEventListener('click', () => {
    const item = QUIZ[Math.floor(Math.random() * QUIZ.length)];
    const guess = prompt(`HS мини‑викторина\n\nПодсказка: ${item.q}\n\nКто это?`);
    if (guess == null) return;
    const ok = guess.trim().toLowerCase().includes(item.a.toLowerCase());
    status.textContent = ok ? 'Верно. Дима, хорош.' : `Почти. Ответ: ${item.a}`;
    pulse(ok ? 2 : 1);
  });

  // Mini game: "Find lethal" (simple, fast, fun)
  const DECK = [
    { id: 'CS2_029', name: 'Фаерболл', mana: 4, dmg: 6, text: '6 урона.' },
    { id: 'CS2_024', name: 'Фростболт', mana: 2, dmg: 3, text: '3 урона.' },
    { id: 'EX1_116', name: 'Лирой Дженкинс', mana: 5, dmg: 6, text: 'Рывок. 6 урона сразу.' },
    { id: 'CS2_124', name: 'Волчий всадник', mana: 3, dmg: 3, text: 'Рывок. 3 урона.' },
    { id: 'EX1_238', name: 'Громмаш Адский Крик', mana: 8, dmg: 4, text: 'Рывок. 4 урона (без энрейджа).', note: 'без комбо' },
    { id: 'EX1_116', name: 'Лирой Дженкинс', mana: 5, dmg: 6, text: 'Рывок. 6 урона сразу.' },
    { id: 'CS2_124', name: 'Волчий всадник', mana: 3, dmg: 3, text: 'Рывок. 3 урона.' },
  ];

  let game = {
    enemyHp: 0,
    mana: 10,
    selected: new Set(),
    streak: 0,
    hand: [],
  };

  function pickHand() {
    // 6 cards, biased toward damage
    const pool = [...DECK];
    const hand = [];
    while (hand.length < 6) {
      const c = pool[Math.floor(Math.random() * pool.length)];
      if (!hand.includes(c)) hand.push(c);
    }
    return hand;
  }

  function calc() {
    let mana = 0;
    let dmg = 0;
    for (const idx of game.selected) {
      const c = game.hand[idx];
      mana += c.mana;
      dmg += c.dmg;
    }
    return { mana, dmg };
  }

  function renderHand() {
    if (!hsHand) return;
    hsHand.innerHTML = '';
    game.hand.forEach((c, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'hand-card';
      b.setAttribute('data-i', String(i));
      b.setAttribute('aria-label', `${c.name}, мана ${c.mana}, урон ${c.dmg}`);
      b.innerHTML = `
        <img loading="lazy" src="${artUrl(c.id)}" alt="${c.name}">
        <div class="hand-card__meta">
          <span class="hand-card__mana">${c.mana}</span>
          <span class="hand-card__dmg">${c.dmg ? ('⚔ ' + c.dmg) : '—'}</span>
        </div>
        <div class="hand-card__cap">
          <div class="hand-card__title">${c.name}</div>
          <div class="hand-card__sub">${c.text}</div>
        </div>
      `;
      b.querySelector('img')?.addEventListener('error', () => {
        b.querySelector('img').src = `data:image/svg+xml;utf8,${encodeURIComponent(svgFallback(c.name))}`;
      });
      b.addEventListener('click', () => toggleCard(i));
      hsHand.appendChild(b);
    });
    syncUI();
  }

  function syncUI() {
    const { mana, dmg } = calc();
    hsEnemyHp.textContent = String(game.enemyHp);
    hsMana.textContent = String(mana);
    hsDmg.textContent = String(dmg);
    hsStreak.textContent = String(game.streak);

    hsHand?.querySelectorAll('.hand-card').forEach((el) => {
      const i = Number(el.getAttribute('data-i'));
      const on = game.selected.has(i);
      el.classList.toggle('hand-card--on', on);
    });

    const over = mana > 10;
    hsMana.parentElement.style.color = over ? 'rgba(255,77,109,.95)' : '';
  }

  function toggleCard(i) {
    if (game.selected.has(i)) game.selected.delete(i);
    else game.selected.add(i);
    syncUI();
  }

  function newPuzzle() {
    game.hand = pickHand();
    game.selected = new Set();

    // choose enemy hp so that there is usually a solution
    const possible = [12, 14, 15, 16, 18, 20];
    game.enemyHp = possible[Math.floor(Math.random() * possible.length)];

    hsGameStatus.textContent = '';
    hsGameHint.textContent = 'Цель: уложить противника за 1 ход, не превышая 10 маны. Клик по карте — выбрать/снять.';
    renderHand();
  }

  function checkLethal() {
    const { mana, dmg } = calc();
    if (mana > 10) {
      hsGameStatus.textContent = 'Перебор маны. Сначала оптимизируй.';
      hsGameStatus.style.color = 'rgba(255,77,109,.95)';
      return;
    }
    if (dmg >= game.enemyHp) {
      game.streak += 1;
      hsGameStatus.textContent = 'Летал найден. Красиво.';
      hsGameStatus.style.color = 'rgba(38,231,166,.95)';
      pulse(2);
      syncUI();
    } else {
      game.streak = 0;
      hsGameStatus.textContent = `Не добил: нужно ещё ${game.enemyHp - dmg}.`;
      hsGameStatus.style.color = 'rgba(255,77,109,.95)';
      pulse(1);
      syncUI();
    }
  }

  hsGameBtn?.addEventListener('click', () => {
    if (!hsGame) return;
    hsGame.hidden = !hsGame.hidden;
    if (!hsGame.hidden) {
      status.textContent = 'Мини‑игра HS включена.';
      newPuzzle();
      hsGame.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
  hsGameReset?.addEventListener('click', () => { game.selected = new Set(); syncUI(); hsGameStatus.textContent=''; });
  hsGameCheck?.addEventListener('click', checkLethal);
  hsGameNext?.addEventListener('click', newPuzzle);

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
