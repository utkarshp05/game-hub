class ClickerGame {
  constructor(container, controller) {
    this.container = container;
    this.controller = controller;

    this.score = 0;
    this.multiplier = 1;
    this.clickValue = 1;
    this.autoValue = 0;
    this.autoRate = 100; // ms
    this.upgradePrice = 10;

    this.init();
  }

  init() {
    // Create UI
    const gameUI = document.createElement('div');
    gameUI.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
      width: 100%;
      max-width: 280px;
      padding: 1rem;
    `;

    // Big tap button
    this.tapButton = document.createElement('button');
    this.tapButton.style.cssText = `
      width: 150px;
      height: 150px;
      border-radius: 50%;
      background: linear-gradient(135deg, #ffaa00, #ff006e);
      border: 3px solid #00ff88;
      font-size: 3rem;
      cursor: pointer;
      transition: all 0.1s ease;
      box-shadow: 0 0 30px rgba(255, 170, 0, 0.6);
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
    `;
    this.tapButton.textContent = '👆';
    this.tapButton.addEventListener('click', () => this.tap());
    this.tapButton.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.tapButton.style.transform = 'scale(0.95)';
    });
    this.tapButton.addEventListener('touchend', () => {
      this.tapButton.style.transform = 'scale(1)';
      this.tap();
    });

    // Score display
    this.scoreDisplay = document.createElement('div');
    this.scoreDisplay.style.cssText = `
      font-size: 1.5rem;
      font-weight: 700;
      color: #00ff88;
      text-align: center;
      min-width: 200px;
    `;

    // Stats
    this.statsDisplay = document.createElement('div');
    this.statsDisplay.style.cssText = `
      font-size: 0.85rem;
      color: #aaa;
      text-align: center;
      width: 100%;
    `;

    // Upgrades
    const upgradesLabel = document.createElement('div');
    upgradesLabel.textContent = 'Upgrades';
    upgradesLabel.style.cssText = `
      font-size: 0.9rem;
      font-weight: 600;
      color: #00d4ff;
      width: 100%;
      text-align: left;
      margin-top: 0.5rem;
    `;

    const upgradesContainer = document.createElement('div');
    upgradesContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      width: 100%;
    `;

    // Upgrade buttons
    this.upgradeClickBtn = this.createUpgradeButton('Click Power +1', '💪', () => this.upgradeClick());
    this.upgradeAutoBtn = this.createUpgradeButton('Auto Earn', '⚙️', () => this.upgradeAuto());
    this.upgradeMultiplierBtn = this.createUpgradeButton('2x Multiplier', '🚀', () => this.upgradeMultiplier());

    upgradesContainer.appendChild(this.upgradeClickBtn);
    upgradesContainer.appendChild(this.upgradeAutoBtn);
    upgradesContainer.appendChild(this.upgradeMultiplierBtn);

    // Assemble
    gameUI.appendChild(this.tapButton);
    gameUI.appendChild(this.scoreDisplay);
    gameUI.appendChild(this.statsDisplay);
    gameUI.appendChild(upgradesLabel);
    gameUI.appendChild(upgradesContainer);

    this.container.appendChild(gameUI);

    // Start auto income
    setInterval(() => {
      if (this.autoValue > 0) {
        this.score += this.autoValue * this.multiplier;
        this.controller.updateScore(Math.floor(this.score));
        this.updateDisplay();
      }
    }, this.autoRate);

    this.updateDisplay();
  }

  createUpgradeButton(label, emoji, callback) {
    const btn = document.createElement('button');
    btn.style.cssText = `
      background: linear-gradient(135deg, #1a1f3a, #0f3460);
      border: 2px solid #00d4ff;
      color: white;
      padding: 0.8rem;
      border-radius: 8px;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
      -webkit-tap-highlight-color: transparent;
    `;
    btn.innerHTML = `${emoji} ${label}<br><span style="font-size: 0.75rem; opacity: 0.8;">Cost: --</span>`;
    btn.addEventListener('click', callback);
    btn.addEventListener('touchstart', () => {
      btn.style.transform = 'scale(0.95)';
    });
    btn.addEventListener('touchend', () => {
      btn.style.transform = 'scale(1)';
    });
    return btn;
  }

  tap() {
    this.score += this.clickValue * this.multiplier;
    this.controller.updateScore(Math.floor(this.score));

    // Animate button
    this.tapButton.style.transform = 'scale(0.9)';
    setTimeout(() => {
      this.tapButton.style.transform = 'scale(1)';
    }, 50);

    // Show floating text
    const floatingText = document.createElement('div');
    floatingText.textContent = `+${this.clickValue * this.multiplier}`;
    floatingText.style.cssText = `
      position: fixed;
      left: ${this.tapButton.getBoundingClientRect().left + 75}px;
      top: ${this.tapButton.getBoundingClientRect().top}px;
      color: #00ff88;
      font-weight: 700;
      pointer-events: none;
      animation: particle-fall 1s ease-out forwards;
      z-index: 10;
    `;
    document.body.appendChild(floatingText);
    setTimeout(() => floatingText.remove(), 1000);

    audioManager.click();
    this.updateDisplay();
  }

  upgradeClick() {
    const cost = 10;
    if (this.score >= cost) {
      this.score -= cost;
      this.clickValue++;
      audioManager.pickup();
      Effects.createExplosion(
        this.tapButton.getBoundingClientRect().left + 75,
        this.tapButton.getBoundingClientRect().top,
        '💪'
      );
      this.updateDisplay();
    }
  }

  upgradeAuto() {
    const cost = 50;
    if (this.score >= cost) {
      this.score -= cost;
      this.autoValue += 0.5;
      audioManager.pickup();
      this.updateDisplay();
    }
  }

  upgradeMultiplier() {
    const cost = 100;
    if (this.score >= cost) {
      this.score -= cost;
      this.multiplier *= 2;
      audioManager.win();
      Effects.createConfetti();
      this.updateDisplay();
    }
  }

  updateDisplay() {
    this.scoreDisplay.textContent = `Score: ${Math.floor(this.score)}`;
    this.statsDisplay.innerHTML = `
      Click: ${this.clickValue} × ${this.multiplier}x<br>
      Auto: +${this.autoValue.toFixed(1)}/sec
    `;

    // Update upgrade buttons
    this.updateUpgradeButton(this.upgradeClickBtn, 10, 'Click Power +1');
    this.updateUpgradeButton(this.upgradeAutoBtn, 50, 'Auto Earn');
    this.updateUpgradeButton(this.upgradeMultiplierBtn, 100, '2x Multiplier');
  }

  updateUpgradeButton(btn, cost, label) {
    const canAfford = this.score >= cost;
    btn.innerHTML = `${label.match(/^[^+]*/)[0]}<br><span style="font-size: 0.75rem; opacity: 0.8;">Cost: ${cost}</span>`;
    btn.style.opacity = canAfford ? '1' : '0.5';
    btn.disabled = !canAfford;
  }

  stop() {
    // Cleanup
  }
}
