class FlappyGame {
  constructor(container, controller) {
    this.container = container;
    this.controller = controller;
    this.W = 300; this.H = 480;
    this.gravity = 0.45; this.flapPower = -10;
    this.pipeSpeed = 3; this.pipeGap = 130;
    this.isRunning = true;
    this.bird = {x:60, y:200, w:28, h:28, vy:0};
    this.pipes = []; this.score = 0; this.frame = 0;
    this.init();
  }

  init() {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `display:flex;flex-direction:column;align-items:center;gap:0.5rem;width:100%;`;

    const hint = document.createElement('div');
    hint.textContent = '👆 Tap / Spacebar to flap';
    hint.style.cssText = `color:#aaa;font-size:0.85rem;`;

    this.canvas = document.createElement('canvas');
    this.canvas.width = this.W;
    this.canvas.height = this.H;
    this.canvas.style.cssText = `border:2px solid #00d4ff;border-radius:12px;background:#050818;box-shadow:0 0 20px rgba(0,212,255,0.4);display:block;max-width:100%;cursor:pointer;`;
    this.ctx = this.canvas.getContext('2d');

    this.canvas.addEventListener('click', () => this.flap());
    this.canvas.addEventListener('touchstart', e => { e.preventDefault(); this.flap(); }, {passive:false});
    document.addEventListener('keydown', e => { if (e.code==='Space') { e.preventDefault(); this.flap(); } });

    wrapper.appendChild(hint);
    wrapper.appendChild(this.canvas);
    this.container.appendChild(wrapper);
    this.gameLoop();
  }

  flap() {
    if (!this.isRunning) return;
    this.bird.vy = this.flapPower;
    if (typeof audioManager !== 'undefined') audioManager.click();
  }

  gameLoop() {
    if (!this.isRunning) return;
    this.update();
    this.draw();
    requestAnimationFrame(() => this.gameLoop());
  }

  update() {
    this.bird.vy += this.gravity;
    this.bird.y += this.bird.vy;
    if (this.bird.y + this.bird.h > this.H || this.bird.y < 0) return this.gameOver();

    this.frame++;
    if (this.frame % 100 === 0) {
      const gapY = 80 + Math.random() * (this.H - this.pipeGap - 100);
      this.pipes.push({x: this.W, gapY, scored: false});
    }

    for (let i = this.pipes.length-1; i >= 0; i--) {
      this.pipes[i].x -= this.pipeSpeed;
      if (this.pipes[i].x + 50 < 0) { this.pipes.splice(i,1); continue; }

      const p = this.pipes[i];
      const bx = this.bird.x, by = this.bird.y, bw = this.bird.w, bh = this.bird.h;
      if (bx+bw > p.x+4 && bx < p.x+46) {
        if (by < p.gapY || by+bh > p.gapY+this.pipeGap) return this.gameOver();
      }
      if (!p.scored && p.x+50 < this.bird.x) {
        p.scored = true; this.score++;
        this.controller.updateScore(this.score);
        if (typeof audioManager !== 'undefined') audioManager.pickup();
      }
    }
  }

  draw() {
    const ctx = this.ctx;
    ctx.fillStyle = '#050818';
    ctx.fillRect(0,0,this.W,this.H);

    // Stars
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    for (let i=0;i<30;i++) {
      const sx = (i*97+this.frame*0.1) % this.W;
      const sy = (i*53) % this.H;
      ctx.fillRect(sx,sy,1,1);
    }

    // Pipes
    this.pipes.forEach(p => {
      const grad = ctx.createLinearGradient(p.x,0,p.x+50,0);
      grad.addColorStop(0,'#00d4ff'); grad.addColorStop(1,'#0066aa');
      ctx.fillStyle = grad;
      ctx.fillRect(p.x, 0, 50, p.gapY);
      ctx.fillRect(p.x, p.gapY+this.pipeGap, 50, this.H);
      ctx.fillStyle = '#00ff88';
      ctx.fillRect(p.x-4, p.gapY-10, 58, 10);
      ctx.fillRect(p.x-4, p.gapY+this.pipeGap, 58, 10);
    });

    // Bird
    ctx.fillStyle = '#ffaa00';
    ctx.shadowColor = '#ffaa00'; ctx.shadowBlur = 12;
    ctx.fillRect(this.bird.x, this.bird.y, this.bird.w, this.bird.h);
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'white';
    ctx.fillRect(this.bird.x+8, this.bird.y+7, 6, 6);
    ctx.fillStyle = '#333';
    ctx.fillRect(this.bird.x+11, this.bird.y+9, 3, 3);
  }

  gameOver() {
    this.isRunning = false;
    if (typeof audioManager !== 'undefined') audioManager.lose();
    setTimeout(() => this.controller.showGameOver(this.score, `Passed ${this.score} pipe${this.score !== 1 ? 's' : ''}!`), 400);
  }

  stop() { this.isRunning = false; }
}
