(() => {
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  const app = document.getElementById('app');
  const modal = document.getElementById('modal');
  const modalBody = document.getElementById('modalBody');
  const year = document.getElementById('year');
  const soundBtn = document.getElementById('soundBtn');
  const aboutBtn = document.getElementById('aboutBtn');

  year.textContent = String(new Date().getFullYear());

  // ---- Audio (tiny, generated) ----
  let soundOn = false;
  let audioCtx = null;

  function beep(type = 'click') {
    if (!soundOn) return;
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = 'sine';
    const now = audioCtx.currentTime;
    const f = type === 'play' ? 660 : type === 'hit' ? 220 : 440;
    o.frequency.setValueAtTime(f, now);
    g.gain.setValueAtTime(0.001, now);
    g.gain.exponentialRampToValueAtTime(0.07, now + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    o.connect(g);
    g.connect(audioCtx.destination);
    o.start(now);
    o.stop(now + 0.13);
  }

  soundBtn.addEventListener('click', () => {
    soundOn = !soundOn;
    soundBtn.textContent = `Звук: ${soundOn ? 'вкл' : 'выкл'}`;
    beep('click');
  });

  aboutBtn.addEventListener('click', () => {
    openModal(`
      <h2 style="margin:0 0 10px">CardStone</h2>
      <p style="margin:0; color: rgba(168,179,210,.95); line-height:1.55">
        Это мини‑клон по <b>логике</b> Hearthstone: матч (поле/рука/мана), коллекция, таверна.
        Я намеренно не копирую ассеты/брендинг Blizzard. Всё — оригинальные UI и процедурная "арт‑подложка".
      </p>
      <p style="margin:12px 0 0; color: rgba(168,179,210,.95); line-height:1.55">
        Если нужно ещё ближе к ощущению HS — можно докрутить: портреты, фреймы, анимации, ещё режимы.
      </p>
    `);
  });

  // ---- Modal ----
  function openModal(html) {
    modalBody.innerHTML = html;
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    beep('click');
  }
  function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  modal.addEventListener('click', (e) => {
    const t = e.target;
    if (t?.getAttribute && t.getAttribute('data-close') === '1') closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // ---- Router ----
  const routes = ['home', 'play', 'collection', 'shop', 'tavern'];
  let currentRoute = 'home';

  function setRoute(r) {
    if (!routes.includes(r)) r = 'home';
    currentRoute = r;
    history.replaceState({}, '', `#${r}`);
    $$('.nav__btn').forEach((b) => {
      b.setAttribute('aria-current', b.getAttribute('data-route') === r ? 'page' : 'false');
    });
    render();
  }

  $$('.nav__btn').forEach((b) => b.addEventListener('click', () => setRoute(b.getAttribute('data-route'))));
  $$('.logo').forEach((el) => el.addEventListener('click', () => setRoute('home')));

  function initFromHash() {
    const h = (location.hash || '').replace('#', '').trim();
    if (routes.includes(h)) setRoute(h);
    else setRoute('home');
  }

  // ---- Cards (original set) ----
  const CLASSES = ['Neutral', 'Mage', 'Rogue', 'Warrior'];
  const RARITY = ['Common', 'Rare', 'Epic', 'Legendary'];

  /** @type {{id:string,name:string,class:string,rarity:string,cost:number,attack:number,health:number,text:string,tags:string[]}[]} */
  const ALL = [
    { id:'CS_001', name:'Уличный Алхимик', class:'Mage', rarity:'Common', cost:2, attack:2, health:2, text:'Боевой клич: нанести 1 урон герою противника.', tags:['damage'] },
    { id:'CS_002', name:'Карта‑Лезвие', class:'Rogue', rarity:'Common', cost:1, attack:1, health:2, text:'После атаки: +1 атака до конца хода.', tags:['tempo'] },
    { id:'CS_003', name:'Страж Бастиона', class:'Warrior', rarity:'Rare', cost:3, attack:2, health:5, text:'Провокация.', tags:['taunt'] },
    { id:'CS_004', name:'Аркан‑Импульс', class:'Mage', rarity:'Rare', cost:4, attack:0, health:0, text:'Заклинание: нанести 4 урона герою.', tags:['spell','damage'] },
    { id:'CS_005', name:'Смелый Разведчик', class:'Neutral', rarity:'Common', cost:2, attack:3, health:1, text:'Простой темп. Иногда это всё.', tags:['tempo'] },
    { id:'CS_006', name:'Механ‑Сборщик', class:'Neutral', rarity:'Rare', cost:5, attack:4, health:5, text:'Боевой клич: вытянуть карту.', tags:['value'] },
    { id:'CS_007', name:'Сольный Летал', class:'Rogue', rarity:'Epic', cost:4, attack:4, health:2, text:'Рывок. (может атаковать сразу)', tags:['charge','damage'] },
    { id:'CS_008', name:'Золотой Дракончик', class:'Neutral', rarity:'Legendary', cost:7, attack:7, health:7, text:'Боевой клич: если у противника ≤15 хп — нанести 3 урона.', tags:['finisher'] },
    { id:'CS_009', name:'Магическая Печать', class:'Mage', rarity:'Epic', cost:2, attack:0, health:0, text:'Заклинание: получить 2 маны в этом ходу.', tags:['ramp','spell'] },
    { id:'CS_010', name:'Капитан Рывок', class:'Warrior', rarity:'Epic', cost:5, attack:5, health:3, text:'Рывок. После атаки: получить 1 броню.', tags:['charge'] },
  ];

  function artStyle(card) {
    // use real local illustrations when available, otherwise fall back to procedural gradients
    const illu = `./art/${card.id}.svg`;
    const n = card.id.split('').reduce((a,c)=>a+c.charCodeAt(0),0);
    const a = (n % 360);
    const b = (a + 70) % 360;
    const c = (a + 140) % 360;
    return `
      background:
        url('${illu}') center/cover no-repeat,
        radial-gradient(120px 80px at 25% 25%, hsla(${b}, 90%, 65%, .22), transparent 60%),
        radial-gradient(140px 90px at 80% 70%, hsla(${c}, 90%, 62%, .22), transparent 60%),
        linear-gradient(180deg, hsla(${a}, 60%, 55%, .18), rgba(0,0,0,.10));
    `;
  }

  // ---- Match ----
  let match = null;

  function newMatch() {
    // copy arrays so splice doesn't mutate the referenced deck stored in match
    const deck = shuffle(
      ALL.filter(c => c.class === 'Neutral' || c.class === 'Mage')
        .concat(ALL.filter(c => c.class === 'Neutral'))
    ).slice(0, 14);

    const enemyDeck = shuffle(
      ALL.filter(c => c.class === 'Neutral' || c.class === 'Rogue')
        .concat(ALL.filter(c => c.class === 'Neutral'))
    ).slice(0, 14);

    const hand = deck.slice(0, 3);
    const enemyHand = enemyDeck.slice(0, 3);

    match = {
      turn: 1,
      mana: 1,
      manaMax: 1,
      hp: 30,
      enemyHp: 30,
      deck: deck.slice(3),
      enemyDeck: enemyDeck.slice(3),
      hand,
      enemyHand,
      myLane: [],
      enemyLane: [],
      toast: 'Твой ход. Считай летал.',
    };

    beep('play');
  }

  function drawCard(who='me') {
    if (!match) return;
    const d = who==='me' ? match.deck : match.enemyDeck;
    const h = who==='me' ? match.hand : match.enemyHand;
    if (d.length === 0) return;
    h.push(d.shift());
  }

  function startTurn() {
    match.turn += 1;
    match.manaMax = Math.min(10, match.manaMax + 1);
    match.mana = match.manaMax;
    drawCard('me');
    match.toast = 'Твой ход.';
  }

  function endTurn() {
    // simple enemy: play first affordable minion/spell, then attack face with all minions
    match.toast = 'Ход противника…';

    // enemy gain mana
    const mMax = Math.min(10, Math.floor((match.turn+1)/2));
    let mana = mMax;

    // play cards
    match.enemyHand = match.enemyHand.filter((c) => {
      if (c.cost <= mana) {
        mana -= c.cost;
        if (c.tags.includes('spell')) {
          // spell to face
          const dmg = spellDamage(c);
          match.hp = Math.max(0, match.hp - dmg);
        } else {
          match.enemyLane.push(cloneMinion(c));
        }
        return false;
      }
      return true;
    });

    // attacks
    let dmg = match.enemyLane.reduce((a,m)=>a+m.attack,0);
    match.hp = Math.max(0, match.hp - dmg);

    // draw
    drawCard('enemy');

    if (match.hp === 0 || match.enemyHp === 0) return;
    startTurn();
  }

  function spellDamage(c) {
    if (c.id === 'CS_004') return 4;
    if (c.id === 'CS_001') return 1;
    if (c.id === 'CS_009') return 0;
    return 2;
  }

  function cloneMinion(c) {
    // minion stats
    let atk = c.attack;
    let hp = c.health;
    // legendary battlecry
    if (c.id === 'CS_008' && match.enemyHp <= 15) match.enemyHp = Math.max(0, match.enemyHp - 3);
    return { ...c, attack: atk, health: hp };
  }

  function playCardFromHand(i) {
    const c = match.hand[i];
    if (!c) return;
    if (c.cost > match.mana) {
      match.toast = 'Не хватает маны.';
      beep('hit');
      render();
      return;
    }
    match.mana -= c.cost;

    if (c.tags.includes('spell')) {
      if (c.id === 'CS_009') {
        match.mana = Math.min(10, match.mana + 2);
      } else {
        match.enemyHp = Math.max(0, match.enemyHp - spellDamage(c));
      }
    } else {
      match.myLane.push(cloneMinion(c));
      // CS_001 battlecry
      if (c.id === 'CS_001') match.enemyHp = Math.max(0, match.enemyHp - 1);
    }

    match.hand.splice(i, 1);
    beep('click');
    if (match.enemyHp === 0) {
      match.toast = 'Победа. Дима доволен.';
    }
    render();
  }

  function attackFace() {
    const dmg = match.myLane.reduce((a,m)=>a+m.attack,0);
    match.enemyHp = Math.max(0, match.enemyHp - dmg);
    match.toast = dmg ? `Атака в лицо: -${dmg}.` : 'Некем атаковать.';
    beep('hit');
    if (match.enemyHp === 0) match.toast = 'Победа. Красиво.';
    render();
  }

  // ---- Views ----
  function viewHome() {
    return `
      <section class="panel hero">
        <div>
          <h1>CardStone</h1>
          <p>
            Дима, это для тебя: мини‑клон по логике карточного баттлера.
            <b>Играть</b> — быстрый матч (рука/мана/поле), <b>Коллекция</b> — просмотр карт,
            <b>Таверна</b> — режимы на один вечер.
          </p>
          <div class="hero__actions">
            <button class="btn btn--primary" data-go="play">Запустить матч</button>
            <button class="btn" data-go="collection">Открыть коллекцию</button>
            <button class="btn" data-go="tavern">В таверну</button>
          </div>
          <div class="toast" style="margin-top:10px">
            P.S. Это не копия бренда/ассетов — просто ощущение и логика. Если хочешь — сделаю ещё ближе.
          </div>
        </div>
        <div class="card" style="align-self:stretch">
          <h2>Что нового</h2>
          <p>1) Матч: игра карт из руки, мана, поле, атака в лицо.</p>
          <p>2) Коллекция: поиск/фильтр, просмотр описаний.</p>
          <p>3) Таверна: мини‑режимы (дальше расширю).</p>
        </div>
      </section>

      <section class="panel" style="margin-top:12px">
        <div class="grid">
          <div class="card"><h2>Играть</h2><p>Один быстрый бой: поставить существ, нажать «атака в лицо», считать летал.</p></div>
          <div class="card"><h2>Коллекция</h2><p>Список карт CardStone, фильтры, просмотр описания.</p></div>
          <div class="card"><h2>Таверна</h2><p>Мини‑режимы: «Летал за ход», «Собери комбу» (добавлю постепенно).</p></div>
        </div>
      </section>
    `;
  }

  function viewPlay() {
    if (!match) newMatch();

    const manaCr = Array.from({length: 10}, (_,i)=>`<span class="crystal ${i < match.mana ? 'on':''}"></span>`).join('');

    return `
      <section class="panel match">
        <div class="hud">
          <div class="badge">
            <div class="heroChip">
              <div class="portrait" aria-hidden="true"></div>
              <div>
                <div class="badge__title">Дима</div>
                <div class="badge__muted">CardStone</div>
              </div>
            </div>
            <div class="stat">
              <span class="pill hp">ХП ${match.hp}</span>
              <span class="pill mana">Мана ${match.mana}/${match.manaMax}</span>
            </div>
          </div>

          <div class="badge">
            <div class="badge__title">Мана</div>
            <div class="crystals" aria-label="Кристаллы маны">${manaCr}</div>
          </div>

          <div class="badge">
            <div class="heroChip">
              <div class="portrait" aria-hidden="true"></div>
              <div>
                <div class="badge__title">Противник</div>
                <div class="badge__muted">бот‑темповик</div>
              </div>
            </div>
            <div class="stat">
              <span class="pill hp">ХП ${match.enemyHp}</span>
            </div>
          </div>
        </div>

        <div class="board" id="board">
          <div class="lanes">
            <div class="lane" id="enemyLane">
              <div class="lane__label">Поле противника</div>
              ${match.enemyLane.map(minionHTML).join('')}
            </div>
            <div class="lane" id="myLane">
              <div class="lane__label">Твоё поле (перетаскивай карты сюда)</div>
              ${match.myLane.map(minionHTML).join('')}
            </div>
          </div>
        </div>

        <div class="controls">
          <div class="hand" id="hand" aria-label="Рука">
            ${match.hand.map((c, i)=>handCardHTML(c,i)).join('')}
          </div>
          <div style="display:flex; gap:10px; flex-wrap:wrap">
            <button class="btn btn--small" id="attackBtn">Атака в лицо</button>
            <button class="btn btn--small" id="endTurnBtn">Конец хода</button>
            <button class="btn btn--small btn--danger" id="restartBtn">Новый матч</button>
          </div>
        </div>
        <div class="toast" id="toast">${escapeHtml(match.toast)}</div>
      </section>
    `;
  }

  function minionHTML(m) {
    return `
      <div class="minion" title="${escapeHtml(m.text)}">
        <div class="minion__art" style="${artStyle(m)}"></div>
        <div class="minion__meta">
          <span class="smallPill a">${m.attack}</span>
          <span class="smallPill h">${m.health}</span>
        </div>
        <div class="minion__body">
          <div class="minion__name">${escapeHtml(m.name)}</div>
        </div>
      </div>
    `;
  }

  function handCardHTML(c, i) {
    return `
      <button class="cardBtn" draggable="true" data-hand="${i}" title="${escapeHtml(c.text)}">
        <div class="cardBtn__art" style="${artStyle(c)}"></div>
        <div class="cardBtn__meta">
          <span class="smallPill m">${c.cost}</span>
          <span class="smallPill a">${c.attack}</span>
          <span class="smallPill h">${c.health}</span>
        </div>
        <div class="cardBtn__body">
          <div class="cardBtn__name">${escapeHtml(c.name)}</div>
          <div class="cardBtn__text">${escapeHtml(c.text)}</div>
        </div>
      </button>
    `;
  }

  function viewCollection() {
    const q = state.colQuery;
    const cls = state.colClass;
    const rar = state.colRarity;

    const items = ALL.filter(c => {
      if (cls !== 'All' && c.class !== cls) return false;
      if (rar !== 'All' && c.rarity !== rar) return false;
      if (q && !c.name.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });

    return `
      <section class="panel">
        <div class="toolbar">
          <input class="input" placeholder="Поиск карты…" value="${escapeAttr(q)}" id="colSearch" />
          <select class="select" id="colClass">
            ${['All', ...CLASSES].map(x=>`<option ${x===cls?'selected':''}>${x}</option>`).join('')}
          </select>
          <select class="select" id="colRarity">
            ${['All', ...RARITY].map(x=>`<option ${x===rar?'selected':''}>${x}</option>`).join('')}
          </select>
          <button class="btn btn--small" id="colRandom">Случайная</button>
        </div>

        <div class="collection" id="colGrid">
          ${items.map(c => `
            <div class="collect" data-card="${c.id}">
              <div class="collect__art" style="${artStyle(c)}"></div>
              <div class="collect__body">
                <div class="collect__name">${escapeHtml(c.name)}</div>
                <div class="collect__sub">${c.class} · ${c.rarity} · ${c.cost} маны</div>
              </div>
            </div>
          `).join('')}
        </div>
      </section>
    `;
  }

  function viewShop() {
    return `
      <section class="panel" style="padding: 16px">
        <h2 style="margin:0 0 10px">Магазин</h2>
        <p style="margin:0; color: rgba(168,179,210,.95); line-height:1.55">
          Это заглушка. Можно сделать прикольный "магазин": пак‑опенинг с анимацией, пыль/крафт,
          и чисто для кайфа — без платежей.
        </p>
        <div class="hero__actions" style="margin-top:12px">
          <button class="btn btn--primary" id="packBtn">Открыть пак (демо)</button>
        </div>
        <div class="toast" id="shopToast" style="margin-top:10px"></div>
      </section>
    `;
  }

  function viewTavern() {
    return `
      <section class="panel" style="padding: 16px">
        <h2 style="margin:0 0 10px">Таверна</h2>
        <p style="margin:0; color: rgba(168,179,210,.95); line-height:1.55">
          Режимы "на вечер". Сейчас: <b>Летал за ход</b> (встроен в матч — атака в лицо).
          Дальше добавлю: "Арена‑драфт" (пик из 3), "Паззлы" (точный летал).
        </p>
        <div class="hero__actions" style="margin-top:12px">
          <button class="btn btn--primary" data-go="play">В бой</button>
          <button class="btn" id="draftBtn">Драфт (демо)</button>
        </div>
        <div class="toast" id="tavernToast" style="margin-top:10px"></div>
      </section>
    `;
  }

  // ---- State for collection ----
  const state = {
    colQuery: '',
    colClass: 'All',
    colRarity: 'All',
  };

  function render() {
    let html = '';
    if (currentRoute === 'home') html = viewHome();
    if (currentRoute === 'play') html = viewPlay();
    if (currentRoute === 'collection') html = viewCollection();
    if (currentRoute === 'shop') html = viewShop();
    if (currentRoute === 'tavern') html = viewTavern();

    app.innerHTML = html;

    // wire generic go buttons
    $$('[data-go]').forEach((b) => b.addEventListener('click', () => setRoute(b.getAttribute('data-go'))));

    if (currentRoute === 'play') wireMatch();
    if (currentRoute === 'collection') wireCollection();
    if (currentRoute === 'shop') wireShop();
    if (currentRoute === 'tavern') wireTavern();
  }

  function wireMatch() {
    $('#attackBtn')?.addEventListener('click', attackFace);
    $('#endTurnBtn')?.addEventListener('click', () => { beep('click'); endTurn(); render(); });
    $('#restartBtn')?.addEventListener('click', () => { match = null; newMatch(); render(); });

    // click to play
    $$('#hand .cardBtn').forEach((b) => {
      b.addEventListener('click', () => {
        const i = Number(b.getAttribute('data-hand'));
        playCardFromHand(i);
      });
    });

    // drag drop to myLane
    const myLane = $('#myLane');
    const hand = $('#hand');

    hand?.addEventListener('dragstart', (e) => {
      const t = e.target;
      const i = t?.getAttribute?.('data-hand');
      if (!i) return;
      e.dataTransfer.setData('text/plain', i);
      beep('click');
    });

    myLane?.addEventListener('dragover', (e) => { e.preventDefault(); });
    myLane?.addEventListener('drop', (e) => {
      e.preventDefault();
      const i = Number(e.dataTransfer.getData('text/plain'));
      playCardFromHand(i);
    });
  }

  function wireCollection() {
    const input = $('#colSearch');
    const cls = $('#colClass');
    const rar = $('#colRarity');

    input?.addEventListener('input', () => { state.colQuery = input.value; render(); });
    cls?.addEventListener('change', () => { state.colClass = cls.value; render(); });
    rar?.addEventListener('change', () => { state.colRarity = rar.value; render(); });

    $('#colRandom')?.addEventListener('click', () => {
      const items = ALL.slice();
      const c = items[Math.floor(Math.random()*items.length)];
      showCard(c);
    });

    $$('#colGrid .collect').forEach((el) => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-card');
        const c = ALL.find(x=>x.id===id);
        if (c) showCard(c);
      });
    });
  }

  function showCard(c) {
    openModal(`
      <div style="display:grid; grid-template-columns: 1fr 1.2fr; gap: 12px">
        <div style="border-radius: 18px; border: 1px solid rgba(255,255,255,.12); overflow:hidden; background: rgba(0,0,0,.18)">
          <div style="height: 220px; ${artStyle(c)}"></div>
          <div style="padding: 12px">
            <div style="font-weight: 900; font-size: 18px">${escapeHtml(c.name)}</div>
            <div style="margin-top:8px; color: rgba(168,179,210,.95)">${escapeHtml(c.text)}</div>
          </div>
        </div>
        <div>
          <div style="display:flex; gap: 10px; flex-wrap:wrap">
            <span class="pill mana">${c.cost} маны</span>
            <span class="pill" style="border-color: rgba(38,231,166,.35); background: rgba(38,231,166,.12)">Атака ${c.attack}</span>
            <span class="pill hp">ХП ${c.health}</span>
          </div>
          <div style="margin-top:10px; color: rgba(168,179,210,.95)">
            Класс: <b>${c.class}</b> · Редкость: <b>${c.rarity}</b> · id: <code>${c.id}</code>
          </div>
          <div style="margin-top:10px; color: rgba(168,179,210,.95)">
            Теги: ${c.tags.map(t=>`<span class="chip" style="cursor:default">${t}</span>`).join(' ')}
          </div>
          <div style="margin-top:14px">
            <button class="btn btn--small btn--primary" id="addToHand">Добавить в руку (в матче)</button>
          </div>
          <div class="toast" style="margin-top:10px">Если хочешь — добавлю больше карт и механику торгов/секретов/баффов.</div>
        </div>
      </div>
    `);

    setTimeout(() => {
      $('#addToHand')?.addEventListener('click', () => {
        match = match || null;
        // if no match — create, then add
        if (!match) newMatch();
        match.hand.push(c);
        closeModal();
        setRoute('play');
      });
    }, 0);
  }

  function wireShop() {
    const toast = $('#shopToast');
    $('#packBtn')?.addEventListener('click', () => {
      const picks = shuffle(ALL).slice(0, 5);
      toast.textContent = `Пак: ${picks.map(p=>p.name).join(' · ')}`;
      beep('play');
    });
  }

  function wireTavern() {
    const toast = $('#tavernToast');
    $('#draftBtn')?.addEventListener('click', () => {
      const trio = shuffle(ALL).slice(0, 3);
      openModal(`
        <h2 style="margin:0 0 10px">Драфт (демо)</h2>
        <p style="margin:0 0 12px; color: rgba(168,179,210,.95)">Выбери 1 из 3 — добавлю в руку.</p>
        <div style="display:grid; grid-template-columns: repeat(3,1fr); gap: 10px">
          ${trio.map(c=>`
            <button class="btn" data-pick="${c.id}" style="text-align:left">
              <b>${escapeHtml(c.name)}</b><br/>
              <span style="color: rgba(168,179,210,.95)">${escapeHtml(c.text)}</span>
            </button>
          `).join('')}
        </div>
      `);

      setTimeout(() => {
        $$('[data-pick]').forEach((b) => b.addEventListener('click', () => {
          const id = b.getAttribute('data-pick');
          const c = ALL.find(x=>x.id===id);
          if (!c) return;
          if (!match) newMatch();
          match.hand.push(c);
          closeModal();
          toast.textContent = `Выбран: ${c.name} (добавлен в руку).`;
          setRoute('play');
        }));
      }, 0);

      beep('click');
    });
  }

  // ---- Utils ----
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, (c)=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  }
  function escapeAttr(s){
    return escapeHtml(s).replace(/\n/g,' ');
  }

  // ---- Background particles ----
  const canvas = document.getElementById('bg');
  const ctx = canvas.getContext('2d');
  const DPR = Math.min(2, window.devicePixelRatio || 1);
  let W=0,H=0, pts=[];
  function resize(){
    W = window.innerWidth|0; H = window.innerHeight|0;
    canvas.width = (W*DPR)|0; canvas.height=(H*DPR)|0;
    canvas.style.width=W+'px'; canvas.style.height=H+'px';
    ctx.setTransform(DPR,0,0,DPR,0,0);
    const n = Math.min(200, Math.floor((W*H)/14000));
    pts = Array.from({length:n},()=>({
      x: Math.random()*W,
      y: Math.random()*H,
      r: .6+Math.random()*1.4,
      a: .15+Math.random()*.35,
      v: .10+Math.random()*.35,
    }));
  }
  function tick(){
    ctx.clearRect(0,0,W,H);
    for (const p of pts){
      p.y += p.v;
      if (p.y>H+10){ p.y=-10; p.x=Math.random()*W; }
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle = `rgba(238,243,255,${p.a})`;
      ctx.fill();
    }
    requestAnimationFrame(tick);
  }
  window.addEventListener('resize', resize, {passive:true});
  resize();
  tick();

  // boot
  initFromHash();
})();
