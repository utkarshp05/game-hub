class ColorMatchGame {
  constructor(container, controller) {
    this.container = container;
    this.controller = controller;
    this.score = 0; this.timeLeft = 30; this.running = true;
    this.colors = ['#ff006e','#00d4ff','#00ff88','#ffaa00','#ff4444'];
    this.names  = ['Pink','Cyan','Green','Orange','Red'];
    this.currentIdx = 0; this.targetIdx = 0;
    this.init();
  }

  init() {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `display:flex;flex-direction:column;align-items:center;gap:1.2rem;width:100%;max-width:300px;`;

    this.timerEl = document.createElement('div');
    this.timerEl.style.cssText = `font-size:2rem;font-weight:700;color:#00ff88;`;

    const label = document.createElement('div');
    label.textContent = 'Tap when the BIG color matches the SMALL target:';
    label.style.cssText = `font-size:0.85rem;color:#aaa;text-align:center;`;

    this.colorBox = document.createElement('div');
    this.colorBox.style.cssText = `width:180px;height:180px;border-radius:16px;border:3px solid #00d4ff;transition:background 0.2s ease;box-shadow:0 0 20px rgba(0,212,255,0.4);`;

    const targetRow = document.createElement('div');
    targetRow.style.cssText = `display:flex;align-items:center;gap:0.8rem;`;

    const targetLabel = document.createElement('div');
    targetLabel.textContent = 'Match →';
    targetLabel.style.cssText = `color:#aaa;font-size:0.85rem;`;

    this.targetBox = document.createElement('div');
    this.targetBox.style.cssText = `width:60px;height:60px;border-radius:10px;border:2px solid white;box-shadow:0 0 15px currentColor;`;

    targetRow.appendChild(targetLabel);
    targetRow.appendChild(this.targetBox);

    this.tapBtn = document.createElement('button');
    this.tapBtn.textContent = '✅ TAP!';
    this.tapBtn.style.cssText = `background:linear-gradient(135deg,#00ff88,#00d4ff);border:none;color:#000;padding:1rem 2.5rem;border-radius:12px;font-weight:800;font-size:1.2rem;cursor:pointer;box-shadow:0 0 20px rgba(0,255,136,0.5);width:100%;transition:transform 0.1s;`;
    this.tapBtn.addEventListener('click', () => this.checkMatch());
    this.tapBtn.addEventListener('touchstart', () => { this.tapBtn.style.transform='scale(0.95)'; });
    this.tapBtn.addEventListener('touchend', () => { this.tapBtn.style.transform='scale(1)'; this.checkMatch(); });

    wrapper.append(this.timerEl, label, this.colorBox, targetRow, this.tapBtn);
    this.container.appendChild(wrapper);

    this.nextTarget();
    this.cycleColor();
    this.startTimer();
  }

  nextTarget() {
    this.targetIdx = Math.floor(Math.random() * this.colors.length);
    this.targetBox.style.backgroundColor = this.colors[this.targetIdx];
    this.targetBox.style.boxShadow = `0 0 15px ${this.colors[this.targetIdx]}`;
  }

  cycleColor() {
    if (!this.running) return;
    this.currentIdx = Math.floor(Math.random() * this.colors.length);
    this.colorBox.style.backgroundColor = this.colors[this.currentIdx];
    this.colorBox.style.boxShadow = `0 0 25px ${this.colors[this.currentIdx]}`;
    const delay = Math.max(600, 1500 - this.score * 30);
    setTimeout(() => this.cycleColor(), delay);
  }

  checkMatch() {
    if (!this.running) return;
    if (this.currentIdx === this.targetIdx) {
      this.score++;
      this.controller.updateScore(this.score);
      if (typeof audioManager !== 'undefined') audioManager.win();
      if (typeof Effects !== 'undefined') Effects.createConfetti(window.innerWidth/2, window.innerHeight/2);
      this.tapBtn.style.background = 'linear-gradient(135deg,#00ff88,#00d4ff)';
      this.nextTarget();
    } else {
      if (typeof audioManager !== 'undefined') audioManager.lose();
      this.tapBtn.style.background = 'linear-gradient(135deg,#ff4444,#ff006e)';
      setTimeout(() => { this.tapBtn.style.background = 'linear-gradient(135deg,#00ff88,#00d4ff)'; }, 300);
    }
  }

  startTimer() {
    const t = setInterval(() => {
      if (!this.running) { clearInterval(t); return; }
      this.timeLeft--;
      this.timerEl.textContent = `⏱ ${this.timeLeft}s`;
      this.timerEl.style.color = this.timeLeft > 10 ? '#00ff88' : this.timeLeft > 5 ? '#ffaa00' : '#ff4444';
      if (this.timeLeft <= 0) { clearInterval(t); this.endGame(); }
    }, 1000);
    this.timerEl.textContent = `⏱ ${this.timeLeft}s`;
  }

  endGame() {
    this.running = false;
    setTimeout(() => this.controller.showGameOver(this.score, `${this.score} correct match${this.score !== 1 ? 'es' : ''} in 30s!`), 400);
  }

  stop() { this.running = false; }
}
