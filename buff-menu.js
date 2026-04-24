// ═══ Gumax — BUFF163-style category picker ═══
// Componente compartilhado entre index.html e analise.html.
// Mostra ícones de categoria (Rifle, Pistola, Faca, Luvas, etc.) e dropdowns
// com os modelos de cada arma.
//
// Uso:
//   1. Incluir este script na página: <script src="buff-menu.js"></script>
//   2. Criar div container: <div id="buffMenu"></div>
//   3. Inicializar: BuffMenu.init('buffMenu', { onPick: (weaponName) => {...} })
//      - onPick é chamada quando usuário clica num modelo (ex: "AK-47")
//
// O picker NÃO filtra sozinho — delega a callback onPick pro consumer decidir
// o que fazer (filtrar grid, pre-encher search, etc).

(function () {
  const WEAPONS = {
    knife: {
      label: 'Faca', icon: '🔪',
      items: ['★ Karambit', '★ M9 Bayonet', '★ Butterfly Knife', '★ Bayonet',
              '★ Flip Knife', '★ Gut Knife', '★ Huntsman Knife', '★ Falchion Knife',
              '★ Bowie Knife', '★ Shadow Daggers', '★ Navaja Knife', '★ Stiletto Knife',
              '★ Talon Knife', '★ Ursus Knife', '★ Classic Knife', '★ Nomad Knife',
              '★ Paracord Knife', '★ Skeleton Knife', '★ Survival Knife', '★ Kukri Knife'],
    },
    gloves: {
      label: 'Luvas', icon: '🧤',
      items: ['★ Sport Gloves', '★ Driver Gloves', '★ Specialist Gloves',
              '★ Moto Gloves', '★ Bloodhound Gloves', '★ Hand Wraps',
              '★ Hydra Gloves', '★ Broken Fang Gloves'],
    },
    rifle: {
      label: 'Rifle', icon: '🎯',
      items: ['AK-47', 'M4A4', 'M4A1-S', 'AUG', 'SG 553', 'FAMAS', 'Galil AR',
              'AWP', 'SSG 08', 'SCAR-20', 'G3SG1'],
    },
    pistol: {
      label: 'Pistola', icon: '🔫',
      items: ['Desert Eagle', 'USP-S', 'Glock-18', 'P2000', 'P250',
              'Five-SeveN', 'R8 Revolver', 'Dual Berettas', 'Tec-9',
              'CZ75-Auto', 'Zeus x27'],
    },
    smg: {
      label: 'SMG', icon: '💫',
      items: ['MAC-10', 'MP9', 'MP7', 'MP5-SD', 'UMP-45', 'P90', 'PP-Bizon'],
    },
    shotgun: {
      label: 'Escopeta', icon: '💥',
      items: ['Nova', 'XM1014', 'Sawed-Off', 'MAG-7'],
    },
    mg: {
      label: 'Metralhadora', icon: '⚡',
      items: ['M249', 'Negev'],
    },
    sticker: {
      label: 'Adesivo', icon: '🏷️',
      items: ['Sticker | Katowice 2014', 'Sticker | IEM Katowice 2019',
              'Sticker | Howling Dawn', 'Sticker | Crown', 'Sticker | Poorly Drawn',
              '(Pesquisa livre na busca pra achar qualquer sticker)'],
    },
    charm: {
      label: 'Charm', icon: '✨',
      items: ['Charm | Die-cast AK', 'Charm | Disco MAC', 'Charm | Whittle Knife',
              'Charm | Baby\'s AWP', 'Charm | Chicken Lil\'', 'Charm | Hot Howl',
              '(Pesquisa livre na busca pra achar qualquer charm)'],
    },
    agent: {
      label: 'Agente', icon: '🎭',
      items: ['Special Agent Ava | FBI', 'Sir Bloody Silent Darrell | The Professionals',
              'Number K | The Professionals', 'The Elite Mr. Muhlik | Elite Crew',
              'Cmdr. Frank \'Wet Sox\' Baroud | SEAL Frogman',
              '(Pesquisa livre na busca pra achar qualquer agente)'],
    },
    other: {
      label: 'Outros', icon: '📦',
      items: ['Music Kit', 'Graffiti', 'Pin', 'Patch', 'Coupon', 'Collectible'],
    },
  };

  const CSS = `
    .buff-menu {
      background: linear-gradient(180deg, rgba(20,16,40,.85), rgba(10,8,20,.7));
      border: 1px solid rgba(139,92,246,.15);
      border-radius: 14px;
      padding: 14px;
      margin: 0 auto 24px;
      max-width: 1200px;
      position: relative;
    }
    .buff-cat-row {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
      justify-content: center;
      padding-bottom: 10px;
      border-bottom: 1px solid rgba(255,255,255,.05);
    }
    .buff-cat {
      position: relative;
      padding: 10px 14px;
      border-radius: 10px;
      cursor: pointer;
      transition: background .15s, transform .1s;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      min-width: 80px;
      font-size: 12px;
      color: var(--text-secondary, #cbd5e1);
      user-select: none;
    }
    .buff-cat:hover {
      background: rgba(139,92,246,.12);
      color: var(--primary-light, #a855f7);
    }
    .buff-cat.active {
      background: rgba(139,92,246,.18);
      color: var(--primary-light, #a855f7);
    }
    .buff-cat-icon { font-size: 22px; line-height: 1; }
    .buff-cat-label { font-weight: 600; }
    .buff-dropdown {
      display: none;
      padding: 14px 10px 8px;
      flex-wrap: wrap;
      gap: 6px;
      animation: fadeInDropdown .18s ease;
    }
    .buff-dropdown.visible { display: flex; }
    @keyframes fadeInDropdown { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
    .buff-weapon {
      padding: 8px 14px;
      background: rgba(139,92,246,.08);
      border: 1px solid rgba(139,92,246,.18);
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
      color: var(--text-primary, #e0e7ff);
      transition: all .15s;
      white-space: nowrap;
    }
    .buff-weapon:hover {
      background: rgba(139,92,246,.22);
      border-color: rgba(139,92,246,.5);
      transform: translateY(-1px);
    }
    .buff-weapon.hint {
      background: transparent;
      border: 1px dashed rgba(255,255,255,.15);
      color: var(--text-muted, #94a3b8);
      font-style: italic;
      cursor: default;
    }
    .buff-weapon.hint:hover { transform: none; }
    @media (max-width: 720px) {
      .buff-cat { min-width: 60px; padding: 8px 6px; font-size: 10px; }
      .buff-cat-icon { font-size: 18px; }
    }
  `;

  let currentCategory = null;
  let onPickCallback = null;

  function render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = `
      <div class="buff-menu">
        <div class="buff-cat-row">
          ${Object.entries(WEAPONS).map(([key, cat]) => `
            <div class="buff-cat" data-key="${key}" onclick="BuffMenu._toggle('${key}')">
              <span class="buff-cat-icon">${cat.icon}</span>
              <span class="buff-cat-label">${cat.label}</span>
            </div>
          `).join('')}
        </div>
        <div class="buff-dropdown" id="buffDropdown"></div>
      </div>
    `;
  }

  function toggle(key) {
    const cat = WEAPONS[key];
    if (!cat) return;
    const dropdown = document.getElementById('buffDropdown');
    const wasActive = currentCategory === key;
    document.querySelectorAll('.buff-cat').forEach(el => el.classList.remove('active'));

    if (wasActive) {
      dropdown.classList.remove('visible');
      dropdown.innerHTML = '';
      currentCategory = null;
      return;
    }

    currentCategory = key;
    const activeCat = document.querySelector(`.buff-cat[data-key="${key}"]`);
    if (activeCat) activeCat.classList.add('active');

    dropdown.innerHTML = cat.items.map(name => {
      const isHint = name.startsWith('(');
      return `<span class="buff-weapon ${isHint ? 'hint' : ''}"
                    ${isHint ? '' : `onclick="BuffMenu._pick('${name.replace(/'/g, "\\'").replace(/"/g, '&quot;')}')"`}>${name}</span>`;
    }).join('');
    dropdown.classList.add('visible');
  }

  function pick(name) {
    if (typeof onPickCallback === 'function') {
      onPickCallback(name);
    }
  }

  function init(containerId, opts = {}) {
    // Injeta CSS uma vez
    if (!document.getElementById('buff-menu-css')) {
      const style = document.createElement('style');
      style.id = 'buff-menu-css';
      style.textContent = CSS;
      document.head.appendChild(style);
    }
    onPickCallback = opts.onPick || null;
    render(containerId);
  }

  window.BuffMenu = { init, _toggle: toggle, _pick: pick, WEAPONS };
})();
