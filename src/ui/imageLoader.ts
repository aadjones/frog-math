// Image loading utility for frog asset
import type p5 from 'p5';

let frogImage: HTMLImageElement | null = null;
let frogImagePromise: Promise<HTMLImageElement> | null = null;

export async function loadFrogImage(): Promise<HTMLImageElement> {
  if (frogImage) {
    return frogImage;
  }
  
  if (frogImagePromise) {
    return frogImagePromise;
  }
  
  frogImagePromise = new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      frogImage = img;
      resolve(img);
    };
    img.onerror = () => {
      console.warn('Failed to load frog.png, falling back to emoji');
      reject(new Error('Failed to load frog image'));
    };
    img.src = `${import.meta.env.BASE_URL}images/frog.png`;
  });
  
  return frogImagePromise;
}

// For p5.js sketches - load the image using p5's loadImage
export function loadFrogImageForP5(p: p5): Promise<p5.Image | null> {
  return new Promise((resolve) => {
    const imgPath = `${import.meta.env.BASE_URL}images/frog.png`;
    p.loadImage(
      imgPath,
      (img) => resolve(img), // Success callback
      () => {
        console.warn('Failed to load frog.png in p5, falling back to emoji');
        resolve(null); // Error callback
      }
    );
  });
}

// Helper to draw frog (either image or emoji fallback)
export function drawFrog(p: p5, x: number, y: number, frogImg?: p5.Image | null, size: number = 24) {
  if (frogImg) {
    // Draw the image centered at x, y
    p.imageMode(p.CENTER);
    p.image(frogImg, x, y, size, size);
  } else {
    // Fallback to emoji
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(size);
    p.text('🐸', x, y);
  }
} 