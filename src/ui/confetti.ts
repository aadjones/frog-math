import p5 from 'p5';
import { canvas } from './shared';

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  life: number;
  maxLife: number;
}

export class ConfettiSystem {
  private particles: ConfettiParticle[] = [];
  private active = false;
  private startTime = 0;
  private duration = 1500; // 1.5 seconds 
  private readonly colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'];

  private createParticle(x: number, y: number): ConfettiParticle {
    return {
      x,
      y,
      vx: (Math.random() - 0.5) * 8,
      vy: Math.random() * -8 - 2,
      color: this.colors[Math.floor(Math.random() * this.colors.length)],
      size: Math.random() * 6 + 3,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.3,
      life: 0,
      maxLife: Math.random() * 120 + 60
    };
  }

  start() {
    this.active = true;
    this.particles = [];
    this.startTime = Date.now();
    
    // Create initial burst of confetti
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * canvas.w;
      const y = Math.random() * canvas.h * 0.3; // Start from top third of screen
      this.particles.push(this.createParticle(x, y));
    }
  }

  update() {
    if (!this.active) return;

    // Check if duration has elapsed
    const elapsed = Date.now() - this.startTime;
    const shouldStopGenerating = elapsed > this.duration;

    // Add new particles occasionally (but stop after duration)
    if (!shouldStopGenerating && Math.random() < 0.3 && this.particles.length < 100) {
      const x = Math.random() * canvas.w;
      this.particles.push(this.createParticle(x, -10));
    }

    // Update existing particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      
      // Update physics
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.2; // gravity
      particle.rotation += particle.rotationSpeed;
      particle.life++;

      // Remove dead particles
      if (particle.life > particle.maxLife || particle.y > canvas.h + 20) {
        this.particles.splice(i, 1);
      }
    }

    // Stop confetti when duration elapsed and no particles left
    if (shouldStopGenerating && this.particles.length === 0) {
      this.active = false;
    }
  }

  draw(p: p5) {
    if (!this.active && this.particles.length === 0) return;

    p.push();
    for (const particle of this.particles) {
      p.push();
      p.translate(particle.x, particle.y);
      p.rotate(particle.rotation);
      
      // Fade out over time
      const alpha = Math.max(0, 1 - (particle.life / particle.maxLife));
      const color = p.color(particle.color);
      color.setAlpha(alpha * 255);
      p.fill(color);
      p.noStroke();
      
      // Draw confetti piece (rectangle)
      p.rectMode(p.CENTER);
      p.rect(0, 0, particle.size, particle.size * 0.6);
      p.pop();
    }
    p.pop();
  }

  isActive(): boolean {
    return this.active || this.particles.length > 0;
  }
} 