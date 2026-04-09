class Puzzle2048 {
  constructor(container, controller) {
    this.container = container;
    this.controller = controller;
    this.gridSize = 4;
    this.grid = [];
    this.score = 0;
    this.init();
  }

  init() {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `display:flex;flex-direction:column;align-items:center;gap:1rem;width:100%;max-width:320px;`;

    const hint = document.createElement('div');
    hint.textContent = '👆 Swipe or use arrow keys to merge tiles';
    hint.style.cssText = `color:#aaa;font-size:0.85rem;text-align:center;`;

    this.board = document.createElement('div');
    this.board.style.cssText = `display:grid;grid-template-columns:repeat(4,1fr);gap:8px;background:rgba(0,0,0,0.4);padding:10px;border-radius:12px;border:2px solid #00d4ff;width:100%;box-shadow:0 0 20px rgba(0,212,255,0.3);`;

    for (let i = 0; i < 16; i++) {
      const cell = document.createElement('div');
      cell.style.cssText = `background:rgba(255,255,255,0.05);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:1.4rem;font-weight:800;aspect-ratio:1;color:white;transition:all 0.1s;`;
      this.board.appendChild(cell);
    }

    wrapper.appendChild(hint);
    wrapper.appendChild(this.board);
    this.container.appendChild(wrapper);

    this.grid = Array(4).fill(null).map(() => Array(4).fill(0));
    this.spawnTile();
    this.spawnTile();
    this.draw();
    this.setupControls();
  }

  setupControls() {
    let tx = 0, ty = 0;
    this.board.addEventListener('touchstart', e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, {passive:true});
    this.board.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - tx;
      const dy = e.changedTouches[0].clientY - ty;
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 30) this.move('right'); else if (dx < -30) this.move('left');
      } else {
        if (dy > 30) this.move('down'); else if (dy < -30) this.move('up');
      }
    }, {passive:true});
    document.addEventListener('keydown', e => {
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
        e.preventDefault();
        this.move(e.key.replace('Arrow','').toLowerCase());
      }
    });
  }

  spawnTile() {
    const empty = [];
    for (let r=0;r<4;r++) for (let c=0;c<4;c++) if (!this.grid[r][c]) empty.push({r,c});
    if (!empty.length) return;
    const {r,c} = empty[Math.floor(Math.random()*empty.length)];
    this.grid[r][c] = Math.random() < 0.9 ? 2 : 4;
  }

  slideRow(row) {
    let r = row.filter(v => v);
    for (let i=0;i<r.length-1;i++) {
      if (r[i]===r[i+1]) { r[i]*=2; this.score+=r[i]; r.splice(i+1,1); }
    }
    while (r.length<4) r.push(0);
    return r;
  }

  move(dir) {
    let moved = false;
    const prev = JSON.stringify(this.grid);
    if (dir==='left') {
      for (let r=0;r<4;r++) this.grid[r] = this.slideRow(this.grid[r]);
    } else if (dir==='right') {
      for (let r=0;r<4;r++) this.grid[r] = this.slideRow([...this.grid[r]].reverse()).reverse();
    } else if (dir==='up') {
      for (let c=0;c<4;c++) {
        const col = this.slideRow(this.grid.map(r=>r[c]));
        this.grid.forEach((r,i) => r[c]=col[i]);
      }
    } else if (dir==='down') {
      for (let c=0;c<4;c++) {
        const col = this.slideRow(this.grid.map(r=>r[c]).reverse()).reverse();
        this.grid.forEach((r,i) => r[c]=col[i]);
      }
    }
    moved = JSON.stringify(this.grid) !== prev;
    if (moved) {
      this.spawnTile();
      this.draw();
      this.controller.updateScore(this.score);
      if (typeof audioManager !== 'undefined') audioManager.click();
      if (this.isGameOver()) setTimeout(() => this.controller.showGameOver(this.score, 'No more moves!'), 400);
    }
  }

  isGameOver() {
    for (let r=0;r<4;r++) for (let c=0;c<4;c++) {
      if (!this.grid[r][c]) return false;
      if (c<3 && this.grid[r][c]===this.grid[r][c+1]) return false;
      if (r<3 && this.grid[r][c]===this.grid[r+1][c]) return false;
    }
    return true;
  }

  draw() {
    const cells = this.board.children;
    const colors = {0:'rgba(255,255,255,0.05)',2:'rgba(238,228,218,0.3)',4:'rgba(237,224,200,0.45)',8:'#f2b179',16:'#f59563',32:'#f67c5f',64:'#f65e3b',128:'#edcf72',256:'#edcc61',512:'#edc850',1024:'#edc53f',2048:'#edc22e'};
    [...cells].forEach((cell, i) => {
      const val = this.grid[Math.floor(i/4)][i%4];
      cell.textContent = val || '';
      cell.style.background = colors[val] || '#3c3c2f';
      cell.style.color = val > 4 ? 'white' : (val ? '#776e65' : 'transparent');
      cell.style.fontSize = val >= 1000 ? '1rem' : val >= 100 ? '1.2rem' : '1.4rem';
    });
  }

  stop() {}
}
