class MemoryFlip {
  constructor(container, controller) {
    this.container = container;
    this.controller = controller;
    this.cards = [];
    this.flipped = [];
    this.matched = 0;
    this.moves = 0;

    this.init();
  }

  init() {
    // Create pairs of cards (8 pairs = 16 cards)
    const symbols = ['🎮', '🎲', '🎯', '🎨', '🎭', '🎪', '🎸', '🎺'];
    this.cardData = [...symbols, ...symbols].sort(() => Math.random() - 0.5);

    // Build board
    this.buildBoard();
  }

  buildBoard() {
    const board = document.createElement('div');
    board.className = 'memory-board';
    board.style.cssText = `
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.5rem;
      padding: 1rem;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 12px;
      border: 2px solid #00d4ff;
      max-width: 300px;
      margin: auto;
    `;

    this.cardData.forEach((symbol, index) => {
      const card = document.createElement('div');
      card.className = 'memory-card';
      card.dataset.index = index;
      card.dataset.symbol = symbol;
      card.textContent = '?';
      card.style.cssText = `
        background: linear-gradient(135deg, #1a1f3a, #0f3460);
        border: 2px solid #00d4ff;
        border-radius: 8px;
        padding: 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
        font-weight: 700;
        aspect-ratio: 1;
        cursor: pointer;
        transition: all 0.2s ease;
        user-select: none;
        color: white;
      `;

      card.addEventListener('click', () => this.flipCard(card));
      card.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.flipCard(card);
      });

      board.appendChild(card);
      this.cards.push(card);
    });

    this.container.appendChild(board);
  }

  flipCard(card) {
    // Prevent clicking too fast or already matched cards
    if (this.flipped.length >= 2 || card.classList.contains('flipped') || card.classList.contains('matched')) {
      return;
    }

    // Flip the card
    card.classList.add('flipped');
    card.textContent = card.dataset.symbol;
    card.style.background = '#00d4ff';
    card.style.color = '#000';
    card.style.borderColor = '#00ff88';
    this.flipped.push(card);

    audioManager.click();

    // Check for match
    if (this.flipped.length === 2) {
      this.moves++;
      this.checkMatch();
    }
  }

  checkMatch() {
    const [card1, card2] = this.flipped;

    if (card1.dataset.symbol === card2.dataset.symbol) {
      // Match found
      setTimeout(() => {
        card1.classList.add('matched');
        card2.classList.add('matched');
        card1.style.opacity = '0.5';
        card2.style.opacity = '0.5';
        card1.style.cursor = 'default';
        card2.style.cursor = 'default';
        this.matched += 2;
        this.flipped = [];

        audioManager.win();
        Effects.createConfetti();

        // Check win condition
        if (this.matched === this.cards.length) {
          this.win();
        }
      }, 300);
    } else {
      // No match - flip back
      setTimeout(() => {
        card1.classList.remove('flipped');
        card2.classList.remove('flipped');
        card1.textContent = '?';
        card2.textContent = '?';
        card1.style.background = 'linear-gradient(135deg, #1a1f3a, #0f3460)';
        card2.style.background = 'linear-gradient(135deg, #1a1f3a, #0f3460)';
        card1.style.color = 'white';
        card2.style.color = 'white';
        card1.style.borderColor = '#00d4ff';
        card2.style.borderColor = '#00d4ff';
        this.flipped = [];

        audioManager.lose();
      }, 800);
    }

    // Update score based on moves
    this.updateScore();
  }

  updateScore() {
    // Score = cards matched - moves (fewer moves = better score)
    const score = Math.max(0, this.matched - this.moves);
    this.controller.updateScore(score);
  }

  win() {
    const finalScore = Math.max(0, this.matched - this.moves);
    setTimeout(() => this.controller.showGameOver(finalScore, `Completed in ${this.moves} moves! 🎉`), 400);
  }

  stop() {
    // Cleanup if needed
  }
}
