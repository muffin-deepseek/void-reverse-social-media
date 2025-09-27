// Sound Effects Utility for Void Terminal
// Generates synthetic sounds using Web Audio API

class SoundEffects {
  private audioContext: AudioContext | null = null;
  private isEnabled: boolean = true;

  constructor() {
    // Initialize audio context on first user interaction
    this.initializeAudioContext();
  }

  private initializeAudioContext() {
    if (typeof window !== 'undefined' && window.AudioContext) {
      try {
        this.audioContext = new AudioContext();
      } catch (error) {
        console.warn('Web Audio API not supported:', error);
        this.isEnabled = false;
      }
    } else {
      this.isEnabled = false;
    }
  }

  private ensureAudioContext() {
    if (!this.audioContext && this.isEnabled) {
      this.initializeAudioContext();
    }
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.1) {
    if (!this.isEnabled || !this.audioContext) return;

    this.ensureAudioContext();
    
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      oscillator.type = type;
      
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (error) {
      console.warn('Error playing sound:', error);
    }
  }

  // Deletion sound effects
  playDeleteSound(type: 'slide' | 'explode' | 'fade' | 'glitch' = 'slide') {
    switch (type) {
      case 'slide':
        // Descending sweep sound
        this.playTone(800, 0.3, 'sawtooth', 0.05);
        setTimeout(() => this.playTone(400, 0.2, 'sawtooth', 0.03), 100);
        break;
      
      case 'explode':
        // Explosive burst sound
        this.playTone(200, 0.1, 'square', 0.08);
        setTimeout(() => this.playTone(150, 0.1, 'square', 0.06), 50);
        setTimeout(() => this.playTone(100, 0.1, 'square', 0.04), 100);
        break;
      
      case 'fade':
        // Ethereal fade sound
        this.playTone(600, 0.5, 'sine', 0.04);
        setTimeout(() => this.playTone(400, 0.3, 'sine', 0.03), 200);
        break;
      
      case 'glitch':
        // Glitchy digital sound
        this.playTone(1000, 0.05, 'square', 0.06);
        setTimeout(() => this.playTone(800, 0.05, 'square', 0.05), 50);
        setTimeout(() => this.playTone(600, 0.05, 'square', 0.04), 100);
        setTimeout(() => this.playTone(400, 0.1, 'sawtooth', 0.03), 150);
        break;
    }
  }

  // Hover sound effects
  playHoverSound() {
    this.playTone(1200, 0.1, 'sine', 0.02);
  }

  // Click sound effects
  playClickSound() {
    this.playTone(800, 0.05, 'square', 0.03);
    setTimeout(() => this.playTone(600, 0.05, 'square', 0.02), 25);
  }

  // Error sound effects
  playErrorSound() {
    this.playTone(200, 0.2, 'square', 0.06);
    setTimeout(() => this.playTone(150, 0.2, 'square', 0.05), 100);
  }

  // Success sound effects
  playSuccessSound() {
    this.playTone(523, 0.1, 'sine', 0.04); // C5
    setTimeout(() => this.playTone(659, 0.1, 'sine', 0.04), 100); // E5
    setTimeout(() => this.playTone(784, 0.2, 'sine', 0.04), 200); // G5
  }

  // Enable/disable sounds
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  toggleEnabled() {
    this.isEnabled = !this.isEnabled;
    return this.isEnabled;
  }
}

// Create singleton instance
export const soundEffects = new SoundEffects();

// Export types
export type DeletionSoundType = 'slide' | 'explode' | 'fade' | 'glitch';
