// Particle Effects Manager
class Effects {
  static createConfetti(x = window.innerWidth / 2, y = window.innerHeight / 2) {
    const emojis = ['🎉', '✨', '⭐', '🎊', '💫', '🌟', '🎆'];
    const count = 20;
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      particle.style.left = (x + (Math.random() - 0.5) * 100) + 'px';
      particle.style.top = (y + (Math.random() - 0.5) * 100) + 'px';
      particle.style.opacity = '1';
      document.body.appendChild(particle);
      setTimeout(() => particle.remove(), 2000);
    }
  }
  static createExplosion(x, y, emoji = '💥') {
    for (let i = 0; i < 8; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.textContent = emoji;
      particle.style.left = x + 'px';
      particle.style.top = y + 'px';
      particle.style.animation = `particle-fall ${0.8 + Math.random() * 0.4}s ease-out forwards`;
      particle.style.transform = `rotate(${Math.random() * 360}deg)`;
      document.body.appendChild(particle);
      setTimeout(() => particle.remove(), 1200);
    }
  }
  static pulseElement(element) {
    element.style.animation = 'none';
    setTimeout(() => { element.style.animation = 'pulse 0.5s ease-out'; }, 10);
  }
}
