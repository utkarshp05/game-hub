class ClickerGame {
  constructor(container, controller) {
    this.container = container;
    this.controller = controller;
    this.score = 0; this.clickValue = 1; this.multiplier = 1; this.autoValue = 0;
    this.init();
  }

  init() {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `display:flex;flex-direction:column;align-items:center;gap:1rem;width:100%;max-width:280px;`;

    this.scoreEl = document.createElement('div');
    this.scoreEl.style.cssText = `font-size:1.6rem;font-weight:800;color:#00ff88;text-shadow:0 0 10px #00ff88;`;

    this.statsEl = document.createElement('div');
    this.statsEl.style.cssText = `font-size:0.85rem;color:#aaa;text-align:center;`;

    this.btn = document.createElement('button');
    this.btn.textContent = '👆';
    this.btn.style.cssText = `width:150px;height:150px;border-radius:50%;background:linear-gradient(135deg,#ffaa00,#ff006e);border:3px solid #00ff88;font-size:3.5rem;cursor:pointer;box-shadow:0 0 30px rgba(255,170,0,0.6);transition:transform 0.1s,box-shadow 0.1s;`;
    this.btn.addEventListener('click', () => this.tap());
    this.btn.addEventListener('touchstart', e => { e.preventDefault(); this.btn.style.transform='scale(0.9)'; });
    this.btn.addEventListener('touchend', () => { this.btn.style.transform='scale(1)'; this.tap(); });

    const upgradeLabel = document.createElement('div');
    upgradeLabel.textContent = '⬆️ Upgrades';
    upgradeLabel.style.cssText = `font-size:0.9rem;font-weight:600;color:#00d4ff;width:100%;text-align:left;`;

    const upgradesBox = document.createElement('div');
    upgradesBox.style.cssText = `display:flex;flex-direction:column;gap:0.5rem;width:100%;`;

    this.u1 = this.makeUpgrade('💪 +1 Click Power', 10, () => { if(this.score>=10){this.score-=10;this.clickValue++;this.refresh();} });
    this.u2 = this.makeUpgrade('⚙️ Auto Earn', 50, () => { if(this.score>=50){this.score-=50;this.autoValue+=1;this.refresh();} });
    this.u3 = this.makeUpgrade('🚀 2× Multiplier', 100, () => { if(this.score>=100){this.score-=100;this.multiplier*=2;if(typeof Effects!=='undefined')Effects.createConfetti();this.refresh();} });

    upgradesBox.append(this.u1, this.u2, this.u3);
    wrapper.append(this.scoreEl, this.statsEl, this.btn, upgradeLabel, upgradesBox);
    this.container.appendChild(wrapper);
    this.refresh();

    setInterval(() => {
      if (this.autoValue > 0) { this.score += this.autoValue * this.multiplier * 0.1; this.controller.updateScore(Math.floor(this.score)); this.refresh(); }
    }, 100);
  }

  makeUpgrade(label, cost, fn) {
    const btn = document.createElement('button');
    btn.style.cssText = `background:linear-gradient(135deg,#1a1f3a,#0f3460);border:2px solid #00d4ff;color:white;padding:0.8rem;border-radius:8px;font-size:0.85rem;cursor:pointer;transition:all 0.2s;width:100%;box-shadow:0 0 10px rgba(0,212,255,0.2);`;
    btn._label = label; btn._cost = cost;
    btn.innerHTML = `${label}<br><span style="font-size:0.75rem;opacity:0.7">Cost: ${cost}</span>`;
    btn.addEventListener('click', () => { fn(); if(typeof audioManager!=='undefined') audioManager.pickup(); });
    return btn;
  }

  tap() {
    const gain = this.clickValue * this.multiplier;
    this.score += gain;
    this.controller.updateScore(Math.floor(this.score));
    this.btn.style.boxShadow = '0 0 50px rgba(255,170,0,0.9)';
    setTimeout(() => { this.btn.style.boxShadow = '0 0 30px rgba(255,170,0,0.6)'; }, 100);
    if (typeof audioManager !== 'undefined') audioManager.click();
    this.refresh();
  }

  refresh() {
    this.scoreEl.textContent = `💰 ${Math.floor(this.score).toLocaleString()}`;
    this.statsEl.textContent = `Click: +${this.clickValue * this.multiplier}  |  Auto: +${(this.autoValue * this.multiplier).toFixed(1)}/s`;
    [this.u1, this.u2, this.u3].forEach(b => {
      const canAfford = this.score >= b._cost;
      b.style.opacity = canAfford ? '1' : '0.4';
      b.style.border = canAfford ? '2px solid #00ff88' : '2px solid #00d4ff';
    });
  }

  stop() {}
}
