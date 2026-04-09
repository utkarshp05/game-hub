class ColorMatchGame {
  constructor(container, controller) {
    this.container = container;
    this.controller = controller;

    this.score = 0;
    this.timeLeft = 30;
    this.gameRunning = true;
    this.level = 1;
    this.speed = 1500; // ms between new colors

    this.colors = ['#ff006e', '#00d4ff', '#00ff88', '#ffaa00', '#ff4444'];
    this.currentColor = '';
    this.targetColor = '';

    this.init();
  }

  init() {
    // Create UI
    const gameUI = document.createElement('div');
    gameUI.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2rem;
      width: 100%;
      max-width: 300px;
    `;

    // Timer
    this.timerDisplay = document.createElement('div');
    this.timerDisplay.style.cssText = `
      font-size: 2rem;
      font-weight: 700;
      color: #00ff88;
    `;

    // Color display box
    this.colorBox = document.createElement('div');
    this.colorBox.style.cssText = `
      width: 200px;
      height: 200px;
      border-radius: 16px;
      border: 3px solid #00d4ff;
      box-shadow: 0 0 30px currentColor;
      transition: background-color 0.3s ease;
    `;

    // Instructions
    const instruction = document.createElement('div');
    instruction.textContent = 'Tap when color matches:';
    instruction.style.cssText = `
      font-size: 0.9rem;
      color: #aaa;
      text-align: center;
    `;

    // Target color display
    this.targetDisplay = document.createElement('div');
    this.targetDisplay.style.cssText = `
      display: flex;
      gap: 0.5rem;
      justify-content: center;
      align-items: center;
    `;

    const targetBox = document.createElement('div');
    targetBox.style.cssText = `
      width: 60px;
      height: 60px;
      border-radius: 12px;
      border: 2px solid #00ff88;
      box-shadow: 0 0 20px #00ff88;
    `;
    this.targetColorBox = targetBox;

    this.targetDisplay.appendChild(targetBox);

    // Tap button
    this.tapButton = document.createElement('button');
    this.tapButton.textContent = '👇 TAP!';
    this.tapButton.style.cssText = `
      background: linear-gradient(135deg, #00ff88, #00d4ff);
      border: none;
      color: #000;
      padding: 1rem 2rem;
      border-radius: 12px;
      font-weight: 700;
      font-size: 1.1rem;
      cursor: pointer;
      transition: all 0.1s ease;
      box-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
      -webkit-tap-highlight-color: transparent;
    `;
    this.tapButton.addEventListener('click', () => this.checkMatch());
    this.tapButton.addEventListener('touchstart', () => {
      this.tapButton.style.transform = 'scale(0.95)';
    });
    this.tapButton.addEventListener('touchend', () => {
      this.tapButton.style.transform = 'scale(1)';
    });

    // Assemble
    gameUI.appendChild(this.timerDisplay);
    gameUI.appendChild(this.colorBox);
    gameUI.appendChild(instruction);
    gameUI.appendChild(this.targetDisplay);
    gameUI.appendChild(this.tapButton);

    this.container.appendChild(gameUI);

    // Start game
    this.nextRound();
    this.startTimer();
    this.changeColorCycle();
  }

  nextRound() {
    this.targetColor = this.colors[Math.floor(Math.random() * this.colors.length)];
    this.targetColorBox.style.backgroundColor = this.targetColor;
    this.targetColorBox.style.borderColor = this.targetColor;
    this.targetColorBox.style.boxShadow = `0 0 20px ${this.targetColor}`;
  }

  changeColorCycle() {
    if (!this.gameRunning) return;

    this.currentColor = this.colors[Math.floor(Math.random() * this.colors.length)];
    this.colorBox.style.backgroundColor = this.currentColor;

    setTimeout(() => this.changeColorCycle(), this.speed);
  }

  checkMatch() {
    if (!this.gameRunning) return;

    if (this.currentColor === this.targetColor) {
      this.score++;
      audioManager.win();
      Effects.createConfetti(
        window.innerWidth / 2,
        window.innerHeight / 2
      );
      this.nextRound();
      this.controller.updateScore(this.score);
    } else {
      audioManager.lose();
      Effects.createExplosion(window.innerWidth / 2, window.innerHeight / 2, '❌');
    }
  }

  startTimer() {
    const interval = setInterval(() => {
      if (!this.gameRunning) {
        clearInterval(interval);
        return;
      }

      this.timeLeft--;
      this.updateTimer();

      if (this.timeLeft <= 0) {
        clearInterval(interval);
        this.endGame();
      }
    }, 1000);
  }

  updateTimer() {
    this.timerDisplay.textContent = `Time: ${this.timeLeft}s`;

    // Change color based on time
    if (this.timeLeft > 10) {
      this.timerDisplay.style.color = '#00ff88';
    } else if (this.timeLeft > 5) {
      this.timerDisplay.style.color = '#ffaa00';
    } else {
      this.timerDisplay.style.color = '#ff4444';
    }
  }

  endGame() {
    this.gameRunning = false;
    audioManager.lose();
    setTimeout(() => {
      alert(`Game Over!\nScore: ${this.score}`);
      this.controller.backToMenu();
    }, 300);
  }

  stop() {
    this.gameRunning = false;
  }
}
