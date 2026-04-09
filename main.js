// Register Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js')
    .then(reg => console.log('SW registered'))
    .catch(err => console.log('SW registration failed'));
}

// Game Controller
class GameController {
  constructor() {
    this.currentGame = null;
    this.currentScore = 0;
    this.gameInstance = null;
    this.scores = this.loadScores();
    this.init();
  }

  init() {
    // DOM Elements
    this.mainMenu = document.getElementById('mainMenu');
    this.gameScreen = document.getElementById('gameScreen');
    this.gameContainer = document.getElementById('gameContainer');
    this.backBtn = document.getElementById('backBtn');
    this.scoreDisplay = document.getElementById('scoreDisplay');
    this.gameTitle = document.getElementById('gameTitle');

    // Event Listeners
    document.querySelectorAll('.game-card').forEach(card => {
      card.addEventListener('click', () => this.startGame(card.dataset.game));
    });

    this.backBtn.addEventListener('click', () => this.backToMenu());

    // Display scores
    this.updateScoresDisplay();
  }

  loadScores() {
    const saved = localStorage.getItem('gameScores');
    return saved ? JSON.parse(saved) : {
      memory: 0,
      snake: 0,
      puzzle: 0,
      flappy: 0,
      clicker: 0,
      color: 0
    };
  }

  saveScores() {
    localStorage.setItem('gameScores', JSON.stringify(this.scores));
  }

  updateScoresDisplay() {
    document.getElementById('score-memory').textContent = `Best: ${this.scores.memory}`;
    document.getElementById('score-snake').textContent = `Best: ${this.scores.snake}`;
    document.getElementById('score-puzzle').textContent = `Best: ${this.scores.puzzle}`;
    document.getElementById('score-flappy').textContent = `Best: ${this.scores.flappy}`;
    document.getElementById('score-clicker').textContent = `Best: ${Math.floor(this.scores.clicker)}`;
    document.getElementById('score-color').textContent = `Best: ${this.scores.color}`;
  }

  startGame(gameName) {
    this.currentGame = gameName;
    this.currentScore = 0;
    this.gameContainer.innerHTML = '';

    // Switch screens
    this.mainMenu.classList.remove('active');
    this.gameScreen.classList.add('active');

    // Set game title
    const titles = {
      memory: 'Memory Flip',
      snake: 'Snake',
      puzzle: 'Puzzle 2048',
      flappy: 'Flappy Jump',
      clicker: 'Tap Tycoon',
      color: 'Color Rush'
    };
    this.gameTitle.textContent = titles[gameName];

    // Start the appropriate game
    switch(gameName) {
      case 'memory':
        this.gameInstance = new MemoryFlip(this.gameContainer, this);
        break;
      case 'snake':
        this.gameInstance = new SnakeGame(this.gameContainer, this);
        break;
      case 'puzzle':
        this.gameInstance = new Puzzle2048(this.gameContainer, this);
        break;
      case 'flappy':
        this.gameInstance = new FlappyGame(this.gameContainer, this);
        break;
      case 'clicker':
        this.gameInstance = new ClickerGame(this.gameContainer, this);
        break;
      case 'color':
        this.gameInstance = new ColorMatchGame(this.gameContainer, this);
        break;
    }
  }

  updateScore(score) {
    this.currentScore = score;
    this.scoreDisplay.textContent = score;

    // Update best score if beaten
    if (score > this.scores[this.currentGame]) {
      this.scores[this.currentGame] = score;
      this.saveScores();
    }
  }

  backToMenu() {
    if (this.gameInstance && this.gameInstance.stop) {
      this.gameInstance.stop();
    }

    this.gameScreen.classList.remove('active');
    this.mainMenu.classList.add('active');
    this.updateScoresDisplay();
    this.currentGame = null;
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.gameController = new GameController();
});
