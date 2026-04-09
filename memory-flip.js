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

    this.cardData.forEach((symbol, index) => {
      const card = document.createElement('div');
      card.className = 'memory-card';
      card.dataset.index = index;
      card.dataset.symbol = symbol;
      card.textContent = '?';

      card.addEventListener('click', () => this.flipCard(card));

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
    this.flipped.push(card);

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
        this.matched += 2;
        this.flipped = [];

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
        this.flipped = [];
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
    setTimeout(() => {
      alert(`🎉 You Won!\nMoves: ${this.moves}\nScore: ${finalScore}`);
      this.controller.backToMenu();
    }, 300);
  }

  stop() {
    // Cleanup if needed
  }
}
