// Audio Effects Manager
class AudioManager {
  constructor() {
    this.enabled = localStorage.getItem('soundEnabled') !== 'false';
    this.updateToggleButton();
    this.setupToggleButton();
  }

  setupToggleButton() {
    const toggle = document.getElementById('soundToggle');
    if (toggle) {
      toggle.addEventListener('click', () => this.toggleSound());
    }
  }

  toggleSound() {
    this.enabled = !this.enabled;
    localStorage.setItem('soundEnabled', this.enabled);
    this.updateToggleButton();
  }

  updateToggleButton() {
    const toggle = document.getElementById('soundToggle');
    if (toggle) {
      toggle.textContent = this.enabled ? '🔊' : '🔇';
    }
  }

  // Play beep sound
  beep(frequency = 400, duration = 100) {
    if (!this.enabled) return;

    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (e) {
      console.log('Audio not available');
    }
  }

  // Click sound
  click() {
    this.beep(600, 80);
  }

  // Win sound
  win() {
    if (!this.enabled) return;
    this.beep(800, 100);
    setTimeout(() => this.beep(1000, 100), 100);
    setTimeout(() => this.beep(1200, 200), 200);
  }

  // Lose sound
  lose() {
    this.beep(400, 150);
    setTimeout(() => this.beep(300, 150), 100);
  }

  // Pickup sound
  pickup() {
    this.beep(800, 50);
    setTimeout(() => this.beep(1000, 50), 50);
  }

  // Hit sound
  hit() {
    this.beep(300, 100);
  }
}

// Initialize audio manager
const audioManager = new AudioManager();
