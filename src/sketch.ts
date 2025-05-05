/// <reference types="p5/global" />
import p5 from 'p5';
import { reachablePads } from './frogMath';

const padCount = 12;
let hopSize = 3;
let pads: p5.Vector[] = [];
let frogIdx = 0;
const leftMargin = 30;

new p5(p => {
  p.setup = () => {
    p.createCanvas(600 + leftMargin * 2, 120);
    const gap = 600 / (padCount - 1);
    pads = Array.from({ length: padCount }, (_, i) =>
      p.createVector(i * gap + leftMargin, p.height / 2)
    );
  };

  p.draw = () => {
    p.background(255);
    // draw pads
    const reachable = reachablePads(hopSize, padCount);
    pads.forEach((v, i) => {
      const hovered = p.dist(v.x, v.y, p.mouseX, p.mouseY) < 12;
      if (hovered) p.strokeWeight(3);
      else p.strokeWeight(1);
      p.fill(reachable.has(i) ? '#8f8' : '#ddd');
      p.circle(v.x, v.y, 24);
    });
    p.strokeWeight(1);
    // draw frog as emoji
    p.textSize(24);
    p.textAlign(p.CENTER, p.CENTER);
    p.text('🐸', pads[frogIdx].x, pads[frogIdx].y - 16);
  };

  p.mousePressed = () => {
    const idx = pads.findIndex(v => p.dist(v.x, v.y, p.mouseX, p.mouseY) < 12);
    if (idx >= 0 && (idx - frogIdx) % hopSize === 0) frogIdx = idx;
  };
});

export const setHopSize = (n: number) => { hopSize = n; };
