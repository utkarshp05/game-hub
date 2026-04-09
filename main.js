// Register Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js')
    .then(() => console.log('SW registered'))
    .catch(err => console.log('SW error', err));
}

class GameController {
  constructor() {
    this.currentGame = null;
    this.currentScore = 0;
    this.gameInstance = null;
    this.scores = this.loadScores();
    this.playStats = this.loadPlayStats();
    this.init();
  }

  init() {
    this.mainMenu   = document.getElementById('mainMenu');
    this.gameScreen = document.getElementById('gameScreen');
    this.statsScreen = document.getElementById('statsScreen');
    this.gameContainer = document.getElementById('gameContainer');
    this.statsContainer = document.getElementById('statsContainer');
    this.backBtn      = document.getElementById('backBtn');
    this.statsBackBtn = document.getElementById('statsBackBtn');
    this.scoreDisplay = document.getElementById('scoreDisplay');
    this.gameTitle    = document.getElementById('gameTitle');
    this.statsBtn     = document.getElementById('statsBtn');

    document.querySelectorAll('.game-card').forEach(card => {
      card.addEventListener('click', () => this.startGame(card.dataset.game));
    });
    this.backBtn.addEventListener('click', () => this.backToMenu());
    this.statsBackBtn.addEventListener('click', () => this.backToMenu());
    this.statsBtn.addEventListener('click', () => this.showStats());

    this.updateScoresDisplay();
  }

  loadScores() {
    try {
      return JSON.parse(localStorage.getItem('gameScores')) || {};
    } catch { return {}; }
  }

  saveScores() {
    localStorage.setItem('gameScores', JSON.stringify(this.scores));
  }

  loadPlayStats() {
    try {
      return JSON.parse(localStorage.getItem('playStats')) || { totalGames: 0, gameCounts: {} };
    } catch { return { totalGames: 0, gameCounts: {} }; }
  }

  savePlayStats() {
    localStorage.setItem('playStats', JSON.stringify(this.playStats));
  }

  updateScoresDisplay() {
    const games = ['memory','snake','puzzle','flappy','clicker','color'];
    games.forEach(g => {
      const el = document.getElementById(`score-${g}`);
      if (el) el.textContent = `Best: ${Math.floor(this.scores[g] || 0)}`;
    });
  }

  startGame(gameName) {
    this.currentGame  = gameName;
    this.currentScore = 0;
    this.gameContainer.innerHTML = '';
    this.scoreDisplay.textContent = '0';

    this.mainMenu.classList.remove('active');
    this.statsScreen.classList.remove('active');
    this.gameScreen.classList.add('active');

    const titles = {
      memory: 'Memory Flip', snake: 'Snake', puzzle: 'Puzzle 2048',
      flappy: 'Flappy Jump', clicker: 'Tap Tycoon', color: 'Color Rush'
    };
    this.gameTitle.textContent = titles[gameName] || gameName;

    switch (gameName) {
      case 'memory':  this.gameInstance = new MemoryFlip(this.gameContainer, this);   break;
      case 'snake':   this.gameInstance = new SnakeGame(this.gameContainer, this);    break;
      case 'puzzle':  this.gameInstance = new Puzzle2048(this.gameContainer, this);   break;
      case 'flappy':  this.gameInstance = new FlappyGame(this.gameContainer, this);   break;
      case 'clicker': this.gameInstance = new ClickerGame(this.gameContainer, this);  break;
      case 'color':   this.gameInstance = new ColorMatchGame(this.gameContainer, this); break;
    }
  }

  updateScore(score) {
    this.currentScore = score;
    this.scoreDisplay.textContent = Math.floor(score);
    if (score > (this.scores[this.currentGame] || 0)) {
      this.scores[this.currentGame] = score;
      this.saveScores();
    }
  }

  // Called by games when they end — shows a nice overlay instead of alert()
  showGameOver(finalScore, message = '') {
    if (this.gameInstance && this.gameInstance.stop) this.gameInstance.stop();

    const isNewBest = finalScore > (this.scores[this.currentGame] || 0);
    if (finalScore > 0) {
      this.scores[this.currentGame] = Math.max(finalScore, this.scores[this.currentGame] || 0);
      this.saveScores();
    }

    // Track stats
    this.playStats.totalGames = (this.playStats.totalGames || 0) + 1;
    this.playStats.gameCounts = this.playStats.gameCounts || {};
    this.playStats.gameCounts[this.currentGame] = (this.playStats.gameCounts[this.currentGame] || 0) + 1;
    // Determine favourite
    const counts = this.playStats.gameCounts;
    this.playStats.favoriteGame = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, Object.keys(counts)[0]);
    this.savePlayStats();

    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position:absolute;top:0;left:0;width:100%;height:100%;
      background:rgba(10,14,39,0.95);display:flex;flex-direction:column;
      align-items:center;justify-content:center;gap:1.2rem;z-index:50;
      animation:fadeIn 0.3s ease-out;
    `;

    const title = document.createElement('div');
    title.textContent = isNewBest ? '🏆 New Best!' : '🎮 Game Over';
    title.style.cssText = `font-size:2.2rem;font-weight:900;color:${isNewBest ? '#ffaa00' : '#00d4ff'};text-shadow:0 0 20px currentColor;`;

    const scoreEl = document.createElement('div');
    scoreEl.textContent = `Score: ${Math.floor(finalScore)}`;
    scoreEl.style.cssText = `font-size:3rem;font-weight:800;color:#00ff88;text-shadow:0 0 15px #00ff88;`;

    if (message) {
      const msg = document.createElement('div');
      msg.textContent = message;
      msg.style.cssText = `font-size:1rem;color:#aaa;`;
      overlay.appendChild(msg);
    }

    const bestEl = document.createElement('div');
    bestEl.textContent = `Best: ${Math.floor(this.scores[this.currentGame] || 0)}`;
    bestEl.style.cssText = `font-size:1.1rem;color:#aaa;`;

    const btnRow = document.createElement('div');
    btnRow.style.cssText = `display:flex;gap:1rem;margin-top:0.5rem;`;

    const playAgainBtn = document.createElement('button');
    playAgainBtn.textContent = '▶ Play Again';
    playAgainBtn.style.cssText = `padding:0.9rem 1.8rem;border-radius:12px;border:none;background:linear-gradient(135deg,#00d4ff,#00ff88);color:#000;font-weight:800;font-size:1rem;cursor:pointer;box-shadow:0 0 20px rgba(0,212,255,0.5);`;
    playAgainBtn.addEventListener('click', () => this.startGame(this.currentGame));

    const menuBtn = document.createElement('button');
    menuBtn.textContent = '🏠 Menu';
    menuBtn.style.cssText = `padding:0.9rem 1.8rem;border-radius:12px;border:2px solid #00d4ff;background:transparent;color:#00d4ff;font-weight:700;font-size:1rem;cursor:pointer;`;
    menuBtn.addEventListener('click', () => this.backToMenu());

    btnRow.appendChild(playAgainBtn);
    btnRow.appendChild(menuBtn);

    overlay.appendChild(title);
    overlay.appendChild(scoreEl);
    overlay.appendChild(bestEl);
    overlay.appendChild(btnRow);

    this.gameContainer.style.position = 'relative';
    this.gameContainer.appendChild(overlay);

    if (isNewBest && typeof Effects !== 'undefined') Effects.createConfetti();
    if (typeof audioManager !== 'undefined') audioManager.win();
  }

  showStats() {
    this.statsScreen.classList.add('active');
    this.mainMenu.classList.remove('active');

    const gameNames = {
      memory: '🧠 Memory Flip', snake: '🐍 Snake', puzzle: '🔢 Puzzle 2048',
      flappy: '🐦 Flappy Jump', clicker: '👆 Tap Tycoon', color: '🎨 Color Rush'
    };

    const fav = this.playStats.favoriteGame;
    let html = `
      <div class="stat-card">
        <h3>📈 Overall Stats</h3>
        <div class="stat-item">
          <span class="stat-label">Games Played</span>
          <span class="stat-value">${this.playStats.totalGames || 0}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Favourite Game</span>
          <span class="stat-value">${fav ? gameNames[fav] : 'None yet'}</span>
        </div>
      </div>
      <div class="stat-card">
        <h3>🏆 High Scores</h3>
    `;

    Object.entries(gameNames).forEach(([key, name]) => {
      html += `
        <div class="stat-item">
          <span class="stat-label">${name}</span>
          <span class="stat-value">${Math.floor(this.scores[key] || 0)}</span>
        </div>
      `;
    });

    html += `</div>`;
    this.statsContainer.innerHTML = html;
  }

  backToMenu() {
    if (this.gameInstance && this.gameInstance.stop) this.gameInstance.stop();
    this.gameInstance = null;
    this.gameScreen.classList.remove('active');
    this.statsScreen.classList.remove('active');
    this.mainMenu.classList.add('active');
    this.updateScoresDisplay();
    this.currentGame = null;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.gameController = new GameController();
});
