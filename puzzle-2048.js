class Puzzle2048 {
  constructor(container, controller) {
    this.container = container;
    this.controller = controller;
    this.gridSize = 4;
    this.grid = [];
    this.score = 0;
    this.gameOverFlag = false;

    this.init();
  }

  init() {
    // Create UI
    this.createUI();

    // Initialize grid
    this.initGrid();
    this.spawnTile();
    this.spawnTile();

    // Setup controls
    this.setupControls();

    // Draw
    this.draw();
  }

  createUI() {
    const gameWrapper = document.createElement('div');
    gameWrapper.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      width: 100%;
      max-width: 300px;
    `;

    const board = document.createElement('div');
    board.id = 'puzzle-board';
    board.style.cssText = `
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.5rem;
      background: rgba(0, 0, 0, 0.3);
      padding: 0.5rem;
      border-radius: 12px;
      border: 2px solid #00d4ff;
      width: 100%;
      aspect-ratio: 1;
    `;

    // Create cells
    for (let i = 0; i < 16; i++) {
      const cell = document.createElement('div');
      cell.className = 'puzzle-cell';
      cell.style.cssText = `
        background: rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        font-weight: 700;
        aspect-ratio: 1;
        color: white;
      `;
      board.appendChild(cell);
    }

    const info = document.createElement('div');
    info.style.cssText = `
      text-align: center;
      font-size: 0.9rem;
      color: #aaa;
    `;
    info.textContent = 'Swipe to move tiles';

    gameWrapper.appendChild(board);
    gameWrapper.appendChild(info);

    this.container.appendChild(gameWrapper);
    this.board = board;
  }

  initGrid() {
    this.grid = Array(this.gridSize).fill(null).map(() => Array(this.gridSize).fill(0));
  }

  spawnTile() {
    const emptyCells = [];

    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        if (this.grid[i][j] === 0) {
          emptyCells.push({x: j, y: i});
        }
      }
    }

    if (emptyCells.length > 0) {
      const {x, y} = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      this.grid[y][x] = Math.random() < 0.9 ? 2 : 4;
    }
  }

  setupControls() {
    let touchStartX = 0;
    let touchStartY = 0;

    this.board.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    });

    this.board.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;

      this.handleSwipe(touchStartX, touchStartY, touchEndX, touchEndY);
    });

    // Keyboard fallback
    document.addEventListener('keydown', (e) => {
      switch(e.key) {
        case 'ArrowUp':
          this.move('up');
          e.preventDefault();
          break;
        case 'ArrowDown':
          this.move('down');
          e.preventDefault();
          break;
        case 'ArrowLeft':
          this.move('left');
          e.preventDefault();
          break;
        case 'ArrowRight':
          this.move('right');
          e.preventDefault();
          break;
      }
    });
  }

  handleSwipe(startX, startY, endX, endY) {
    const diffX = endX - startX;
    const diffY = endY - startY;
    const threshold = 30;

    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > threshold) {
        this.move('right');
      } else if (diffX < -threshold) {
        this.move('left');
      }
    } else {
      if (diffY > threshold) {
        this.move('down');
      } else if (diffY < -threshold) {
        this.move('up');
      }
    }
  }

  move(direction) {
    let moved = false;

    if (direction === 'left') {
      for (let i = 0; i < this.gridSize; i++) {
        const row = this.grid[i].slice();
        this.grid[i] = this.slideAndMerge(row);
        if (JSON.stringify(row) !== JSON.stringify(this.grid[i])) {
          moved = true;
        }
      }
    } else if (direction === 'right') {
      for (let i = 0; i < this.gridSize; i++) {
        const row = this.grid[i].reverse().slice();
        this.grid[i] = this.slideAndMerge(row).reverse();
        if (JSON.stringify(this.grid[i].reverse()) !== JSON.stringify(row.reverse())) {
          moved = true;
        }
      }
    } else if (direction === 'up') {
      for (let j = 0; j < this.gridSize; j++) {
        const col = this.grid.map(row => row[j]);
        const merged = this.slideAndMerge(col);
        for (let i = 0; i < this.gridSize; i++) {
          this.grid[i][j] = merged[i];
        }
        if (JSON.stringify(col) !== JSON.stringify(merged)) {
          moved = true;
        }
      }
    } else if (direction === 'down') {
      for (let j = 0; j < this.gridSize; j++) {
        const col = this.grid.map(row => row[j]).reverse();
        const merged = this.slideAndMerge(col).reverse();
        for (let i = 0; i < this.gridSize; i++) {
          this.grid[this.gridSize - 1 - i][j] = merged[i];
        }
        if (JSON.stringify(col) !== JSON.stringify(merged.reverse())) {
          moved = true;
        }
      }
    }

    if (moved) {
      this.spawnTile();
      this.updateScore();
      this.draw();

      if (this.isGameOver()) {
        this.gameOver();
      }
    }
  }

  slideAndMerge(line) {
    // Remove zeros
    let newLine = line.filter(val => val !== 0);

    // Merge
    for (let i = 0; i < newLine.length - 1; i++) {
      if (newLine[i] === newLine[i + 1]) {
        newLine[i] *= 2;
        newLine.splice(i + 1, 1);
        this.score += newLine[i];
      }
    }

    // Add zeros back
    while (newLine.length < this.gridSize) {
      newLine.push(0);
    }

    return newLine;
  }

  updateScore() {
    this.controller.updateScore(this.score);
  }

  isGameOver() {
    // Check if any moves possible
    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        if (this.grid[i][j] === 0) return false;

        // Check right
        if (j < this.gridSize - 1 && this.grid[i][j] === this.grid[i][j + 1]) return false;

        // Check down
        if (i < this.gridSize - 1 && this.grid[i][j] === this.grid[i + 1][j]) return false;
      }
    }

    return true;
  }

  draw() {
    const cells = this.board.querySelectorAll('.puzzle-cell');

    cells.forEach((cell, index) => {
      const row = Math.floor(index / 4);
      const col = index % 4;
      const value = this.grid[row][col];

      cell.textContent = value || '';
      cell.style.background = this.getTileColor(value);
      cell.style.color = value > 4 ? 'white' : '#666';
    });
  }

  getTileColor(value) {
    const colors = {
      0: 'rgba(255, 255, 255, 0.1)',
      2: 'rgba(238, 228, 218, 0.35)',
      4: 'rgba(237, 224, 200, 0.5)',
      8: '#f2b179',
      16: '#f59563',
      32: '#f67c5f',
      64: '#f65e3b',
      128: '#edcf72',
      256: '#edcc61',
      512: '#edc850',
      1024: '#edc53f',
      2048: '#edc22e'
    };

    return colors[value] || '#3c3c2f';
  }

  gameOver() {
    this.gameOverFlag = true;
    setTimeout(() => {
      alert(`Game Over!\nScore: ${this.score}`);
      this.controller.backToMenu();
    }, 100);
  }

  stop() {
    this.gameOverFlag = true;
  }
}
