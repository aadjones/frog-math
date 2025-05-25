// Image loading utility for frog asset
import type p5 from 'p5';

let frogImage: HTMLImageElement | null = null;
let frogImagePromise: Promise<HTMLImageElement> | null = null;
let uberhopperImage: HTMLImageElement | null = null;
let uberhopperImagePromise: Promise<HTMLImageElement> | null = null;

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

export async function loadUberhopperImage(): Promise<HTMLImageElement> {
  if (uberhopperImage) {
    return uberhopperImage;
  }
  
  if (uberhopperImagePromise) {
    return uberhopperImagePromise;
  }
  
  uberhopperImagePromise = new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      uberhopperImage = img;
      resolve(img);
    };
    img.onerror = () => {
      console.warn('Failed to load uberhopper.png, falling back to emoji');
      reject(new Error('Failed to load uberhopper image'));
    };
    img.src = `${import.meta.env.BASE_URL}images/uberhopper.png`;
  });
  
  return uberhopperImagePromise;
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

export function loadUberhopperImageForP5(p: p5): Promise<p5.Image | null> {
  return new Promise((resolve) => {
    const imgPath = `${import.meta.env.BASE_URL}images/uberhopper.png`;
    p.loadImage(
      imgPath,
      (img) => resolve(img), // Success callback
      () => {
        console.warn('Failed to load uberhopper.png in p5, falling back to emoji');
        resolve(null); // Error callback
      }
    );
  });
}

// Helper to draw frog (either image or emoji fallback)
export function drawFrog(p: p5, x: number, y: number, frogImg?: p5.Image | null, size: number = 24, facingRight: boolean = true) {
  if (frogImg) {
    // Save the current transformation matrix
    p.push();
    
    // Move to the frog position
    p.translate(x, y);
    
    // Flip horizontally if facing right
    if (facingRight) {
      p.scale(-1, 1);
    }
    
    // Draw the image centered at the origin (since we translated)
    p.imageMode(p.CENTER);
    p.image(frogImg, 0, 0, size, size);
    
    // Restore the transformation matrix
    p.pop();
  } else {
    // Fallback to emoji (emojis don't need flipping)
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(size);
    p.text('🐸', x, y);
  }
}

// Helper to draw uberhopper (no direction logic needed)
export function drawUberhopper(p: p5, x: number, y: number, uberhopperImg?: p5.Image | null, size: number = 24) {
  if (uberhopperImg) {
    // Draw the image centered at x, y (no flipping needed)
    p.imageMode(p.CENTER);
    p.image(uberhopperImg, x, y, size, size);
  } else {
    // Fallback to emoji
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(size);
    p.text('🐸', x, y);
  }
} 