class FlappyGame {
  constructor(container, controller) {
    this.container = container;
    this.controller = controller;

    // Game settings
    this.canvasWidth = 300;
    this.canvasHeight = 500;
    this.gravity = 0.5;
    this.flapPower = -12;
    this.pipeSpeed = 4;
    this.pipeGap = 120;
    this.isRunning = true;

    // Bird state
    this.bird = {
      x: 50,
      y: 150,
      width: 30,
      height: 30,
      velocityY: 0
    };

    this.score = 0;
    this.pipes = [];
    this.frameCount = 0;

    this.init();
  }

  init() {
    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.canvasWidth;
    this.canvas.height = this.canvasHeight;
    this.ctx = this.canvas.getContext('2d');

    this.container.appendChild(this.canvas);

    // Controls
    this.canvas.addEventListener('touchstart', () => this.flap());
    document.addEventListener('keydown', (e) => {
      if (e.key === ' ') {
        e.preventDefault();
        this.flap();
      }
    });

    // Start game
    this.gameLoop();
  }

  flap() {
    if (!this.isRunning) return;
    this.bird.velocityY = this.flapPower;
    audioManager.click();
  }

  generatePipe() {
    const minHeight = 50;
    const maxHeight = this.canvasHeight - this.pipeGap - 50;
    const gapStart = minHeight + Math.random() * (maxHeight - minHeight);

    return {
      x: this.canvasWidth,
      gapStart: gapStart,
      gapEnd: gapStart + this.pipeGap,
      scored: false
    };
  }

  gameLoop() {
    if (!this.isRunning) return;

    this.update();
    this.draw();

    requestAnimationFrame(() => this.gameLoop());
  }

  update() {
    // Apply gravity
    this.bird.velocityY += this.gravity;
    this.bird.y += this.bird.velocityY;

    // Check ground and ceiling collision
    if (this.bird.y + this.bird.height > this.canvasHeight ||
        this.bird.y < 0) {
      this.gameOver();
      return;
    }

    // Generate pipes
    this.frameCount++;
    if (this.frameCount % 90 === 0) {
      this.pipes.push(this.generatePipe());
    }

    // Update pipes
    for (let i = this.pipes.length - 1; i >= 0; i--) {
      this.pipes[i].x -= this.pipeSpeed;

      // Remove off-screen pipes
      if (this.pipes[i].x + 50 < 0) {
        this.pipes.splice(i, 1);
        continue;
      }

      // Check collision
      if (this.checkCollision(this.pipes[i])) {
        this.gameOver();
        return;
      }

      // Check score
      if (!this.pipes[i].scored && this.pipes[i].x + 50 < this.bird.x) {
        this.pipes[i].scored = true;
        this.score++;
        this.controller.updateScore(this.score);
        audioManager.pickup();
      }
    }
  }

  checkCollision(pipe) {
    const birdLeft = this.bird.x;
    const birdRight = this.bird.x + this.bird.width;
    const birdTop = this.bird.y;
    const birdBottom = this.bird.y + this.bird.height;

    const pipeLeft = pipe.x;
    const pipeRight = pipe.x + 50;

    if (birdRight > pipeLeft && birdLeft < pipeRight) {
      if (birdTop < pipe.gapStart || birdBottom > pipe.gapEnd) {
        return true;
      }
    }

    return false;
  }

  draw() {
    // Clear background
    this.ctx.fillStyle = 'rgba(10, 14, 39, 0.8)';
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Draw bird
    this.ctx.fillStyle = '#ffaa00';
    this.ctx.fillRect(this.bird.x, this.bird.y, this.bird.width, this.bird.height);
    this.ctx.fillStyle = '#fff';
    this.ctx.fillRect(this.bird.x + 8, this.bird.y + 8, 6, 6);

    // Draw pipes
    this.pipes.forEach(pipe => {
      // Upper pipe
      this.ctx.fillStyle = '#00d4ff';
      this.ctx.fillRect(pipe.x, 0, 50, pipe.gapStart);

      // Lower pipe
      this.ctx.fillRect(pipe.x, pipe.gapEnd, 50, this.canvasHeight - pipe.gapEnd);

      // Add glow
      this.ctx.strokeStyle = '#00ff88';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(pipe.x, 0, 50, pipe.gapStart);
      this.ctx.strokeRect(pipe.x, pipe.gapEnd, 50, this.canvasHeight - pipe.gapEnd);
    });
  }

  gameOver() {
    this.isRunning = false;
    audioManager.lose();
    Effects.createExplosion(this.bird.x, this.bird.y, '💥');
    setTimeout(() => {
      alert(`Game Over!\nScore: ${this.score}`);
      this.controller.backToMenu();
    }, 300);
  }

  stop() {
    this.isRunning = false;
  }
}
