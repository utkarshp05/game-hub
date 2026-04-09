class SnakeGame {
  constructor(container, controller) {
    this.container = container;
    this.controller = controller;

    // Game settings
    this.gridSize = 20;
    this.tileSize = 15;
    this.gameSpeed = 100;
    this.isRunning = true;

    // Game state
    this.snake = [{x: 10, y: 10}];
    this.food = this.generateFood();
    this.direction = {x: 1, y: 0};
    this.nextDirection = {x: 1, y: 0};
    this.score = 0;

    this.init();
  }

  init() {
    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.gridSize * this.tileSize;
    this.canvas.height = this.gridSize * this.tileSize;
    this.ctx = this.canvas.getContext('2d');

    this.container.appendChild(this.canvas);

    // Touch controls
    this.setupControls();

    // Start game loop
    this.gameLoop();
  }

  setupControls() {
    let touchStartX = 0;
    let touchStartY = 0;

    this.canvas.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touchEndX = e.touches[0].clientX;
      const touchEndY = e.touches[0].clientY;

      this.handleSwipe(touchStartX, touchStartY, touchEndX, touchEndY);
      touchStartX = touchEndX;
      touchStartY = touchEndY;
    });

    // Keyboard fallback
    document.addEventListener('keydown', (e) => {
      switch(e.key) {
        case 'ArrowUp':
          if (this.direction.y === 0) this.nextDirection = {x: 0, y: -1};
          break;
        case 'ArrowDown':
          if (this.direction.y === 0) this.nextDirection = {x: 0, y: 1};
          break;
        case 'ArrowLeft':
          if (this.direction.x === 0) this.nextDirection = {x: -1, y: 0};
          break;
        case 'ArrowRight':
          if (this.direction.x === 0) this.nextDirection = {x: 1, y: 0};
          break;
      }
    });
  }

  handleSwipe(startX, startY, endX, endY) {
    const diffX = endX - startX;
    const diffY = endY - startY;

    const threshold = 30;

    if (Math.abs(diffX) > Math.abs(diffY)) {
      // Horizontal swipe
      if (diffX > threshold && this.direction.x === 0) {
        this.nextDirection = {x: 1, y: 0};
      } else if (diffX < -threshold && this.direction.x === 0) {
        this.nextDirection = {x: -1, y: 0};
      }
    } else {
      // Vertical swipe
      if (diffY > threshold && this.direction.y === 0) {
        this.nextDirection = {x: 0, y: 1};
      } else if (diffY < -threshold && this.direction.y === 0) {
        this.nextDirection = {x: 0, y: -1};
      }
    }
  }

  gameLoop() {
    if (!this.isRunning) return;

    this.direction = this.nextDirection;
    this.update();
    this.draw();

    setTimeout(() => this.gameLoop(), this.gameSpeed);
  }

  update() {
    // Calculate new head position
    const head = this.snake[0];
    const newHead = {
      x: head.x + this.direction.x,
      y: head.y + this.direction.y
    };

    // Check wall collision
    if (newHead.x < 0 || newHead.x >= this.gridSize ||
        newHead.y < 0 || newHead.y >= this.gridSize) {
      this.gameOver();
      return;
    }

    // Check self collision
    if (this.snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
      this.gameOver();
      return;
    }

    // Add new head
    this.snake.unshift(newHead);

    // Check food collision
    if (newHead.x === this.food.x && newHead.y === this.food.y) {
      this.score += 10;
      this.controller.updateScore(this.score);
      this.food = this.generateFood();
    } else {
      // Remove tail if no food eaten
      this.snake.pop();
    }
  }

  generateFood() {
    let food;
    let isOnSnake = true;

    while (isOnSnake) {
      food = {
        x: Math.floor(Math.random() * this.gridSize),
        y: Math.floor(Math.random() * this.gridSize)
      };
      isOnSnake = this.snake.some(segment => segment.x === food.x && segment.y === food.y);
    }

    return food;
  }

  draw() {
    // Clear canvas
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw snake
    this.snake.forEach((segment, index) => {
      if (index === 0) {
        this.ctx.fillStyle = '#00ff88';
      } else {
        this.ctx.fillStyle = '#00d4ff';
      }

      this.ctx.fillRect(
        segment.x * this.tileSize,
        segment.y * this.tileSize,
        this.tileSize - 1,
        this.tileSize - 1
      );
    });

    // Draw food
    this.ctx.fillStyle = '#ffaa00';
    this.ctx.beginPath();
    this.ctx.arc(
      this.food.x * this.tileSize + this.tileSize / 2,
      this.food.y * this.tileSize + this.tileSize / 2,
      this.tileSize / 2 - 1,
      0,
      Math.PI * 2
    );
    this.ctx.fill();
  }

  gameOver() {
    this.isRunning = false;
    alert(`Game Over!\nScore: ${this.score}`);
    this.controller.backToMenu();
  }

  stop() {
    this.isRunning = false;
  }
}
