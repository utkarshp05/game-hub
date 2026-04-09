class SnakeGame {
  constructor(container, controller) {
    this.container = container;
    this.controller = controller;
    this.gridSize = 20;
    this.tileSize = 16;
    this.gameSpeed = 120;
    this.isRunning = true;
    this.snake = [{x: 10, y: 10}];
    this.food = null;
    this.direction = {x: 1, y: 0};
    this.nextDirection = {x: 1, y: 0};
    this.score = 0;
    this.init();
  }

  init() {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `display:flex;flex-direction:column;align-items:center;gap:1rem;width:100%;`;

    const hint = document.createElement('div');
    hint.textContent = '👆 Swipe to move';
    hint.style.cssText = `color:#aaa;font-size:0.85rem;`;

    this.canvas = document.createElement('canvas');
    this.canvas.width = this.gridSize * this.tileSize;
    this.canvas.height = this.gridSize * this.tileSize;
    this.canvas.style.cssText = `border:2px solid #00d4ff;border-radius:12px;background:#050818;box-shadow:0 0 20px rgba(0,212,255,0.4);display:block;`;
    this.ctx = this.canvas.getContext('2d');

    wrapper.appendChild(hint);
    wrapper.appendChild(this.canvas);
    this.container.appendChild(wrapper);

    this.food = this.generateFood();
    this.setupControls();
    this.gameLoop();
  }

  setupControls() {
    let tx = 0, ty = 0;
    this.canvas.addEventListener('touchstart', e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, {passive:true});
    this.canvas.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - tx;
      const dy = e.changedTouches[0].clientY - ty;
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 20 && this.direction.x === 0) this.nextDirection = {x:1,y:0};
        else if (dx < -20 && this.direction.x === 0) this.nextDirection = {x:-1,y:0};
      } else {
        if (dy > 20 && this.direction.y === 0) this.nextDirection = {x:0,y:1};
        else if (dy < -20 && this.direction.y === 0) this.nextDirection = {x:0,y:-1};
      }
    }, {passive:true});
    document.addEventListener('keydown', e => {
      if (e.key==='ArrowUp' && this.direction.y===0) this.nextDirection={x:0,y:-1};
      if (e.key==='ArrowDown' && this.direction.y===0) this.nextDirection={x:0,y:1};
      if (e.key==='ArrowLeft' && this.direction.x===0) this.nextDirection={x:-1,y:0};
      if (e.key==='ArrowRight' && this.direction.x===0) this.nextDirection={x:1,y:0};
    });
  }

  gameLoop() {
    if (!this.isRunning) return;
    this.direction = {...this.nextDirection};
    this.update();
    this.draw();
    setTimeout(() => this.gameLoop(), this.gameSpeed);
  }

  update() {
    const head = {x: this.snake[0].x + this.direction.x, y: this.snake[0].y + this.direction.y};
    if (head.x < 0 || head.x >= this.gridSize || head.y < 0 || head.y >= this.gridSize) return this.gameOver();
    if (this.snake.some(s => s.x === head.x && s.y === head.y)) return this.gameOver();
    this.snake.unshift(head);
    if (head.x === this.food.x && head.y === this.food.y) {
      this.score += 10;
      this.controller.updateScore(this.score);
      this.food = this.generateFood();
      if (typeof audioManager !== 'undefined') audioManager.pickup();
    } else {
      this.snake.pop();
    }
  }

  generateFood() {
    let food;
    do {
      food = {x: Math.floor(Math.random()*this.gridSize), y: Math.floor(Math.random()*this.gridSize)};
    } while (this.snake.some(s => s.x===food.x && s.y===food.y));
    return food;
  }

  draw() {
    this.ctx.fillStyle = '#050818';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    // Grid dots
    this.ctx.fillStyle = 'rgba(0,212,255,0.05)';
    for (let x = 0; x < this.gridSize; x++)
      for (let y = 0; y < this.gridSize; y++)
        this.ctx.fillRect(x*this.tileSize+7, y*this.tileSize+7, 2, 2);
    // Snake
    this.snake.forEach((s, i) => {
      this.ctx.fillStyle = i===0 ? '#00ff88' : `rgba(0,212,255,${1 - i/this.snake.length * 0.6})`;
      this.ctx.fillRect(s.x*this.tileSize+1, s.y*this.tileSize+1, this.tileSize-2, this.tileSize-2);
    });
    // Food
    this.ctx.fillStyle = '#ffaa00';
    this.ctx.shadowColor = '#ffaa00';
    this.ctx.shadowBlur = 10;
    this.ctx.beginPath();
    this.ctx.arc(this.food.x*this.tileSize+this.tileSize/2, this.food.y*this.tileSize+this.tileSize/2, this.tileSize/2-2, 0, Math.PI*2);
    this.ctx.fill();
    this.ctx.shadowBlur = 0;
  }

  gameOver() {
    this.isRunning = false;
    if (typeof audioManager !== 'undefined') audioManager.lose();
    if (typeof Effects !== 'undefined') Effects.createExplosion(this.canvas.getBoundingClientRect().left + this.canvas.width/2, this.canvas.getBoundingClientRect().top + this.canvas.height/2, '💥');
    setTimeout(() => { alert(`Game Over!\nScore: ${this.score}`); this.controller.backToMenu(); }, 300);
  }

  stop() { this.isRunning = false; }
}
