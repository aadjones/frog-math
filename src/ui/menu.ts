export function mountMenu(container: HTMLElement, onSelect: (mode:'single'|'multi')=>void){
  container.innerHTML = '';

  // Main wrapper
  const wrapper = document.createElement('div');
  wrapper.style.display = 'flex';
  wrapper.style.flexDirection = 'column';
  wrapper.style.alignItems = 'center';
  wrapper.style.justifyContent = 'center';
  wrapper.style.minHeight = '100vh';
  wrapper.style.background = 'linear-gradient(135deg, #e0ffe7 0%, #b3e5fc 100%)';
  wrapper.style.padding = '32px 0';

  // Frog emoji splash
  const frog = document.createElement('div');
  frog.textContent = '🐸';
  frog.style.fontSize = '96px';
  frog.style.marginBottom = '8px';
  wrapper.appendChild(frog);

  // Title
  const title = document.createElement('h1');
  title.textContent = 'FrogMath';
  title.style.fontFamily = 'Fredoka One, Comic Sans MS, sans-serif';
  title.style.fontSize = '3rem';
  title.style.letterSpacing = '2px';
  title.style.color = '#2e7d32';
  title.style.margin = '0 0 8px 0';
  wrapper.appendChild(title);

  // Tagline
  const tagline = document.createElement('div');
  tagline.textContent = 'Leap into learning with every hop!';
  tagline.style.fontSize = '1.3rem';
  tagline.style.color = '#388e3c';
  tagline.style.marginBottom = '32px';
  tagline.style.fontWeight = 'bold';
  wrapper.appendChild(tagline);

  // Mode cards container
  const cards = document.createElement('div');
  cards.style.display = 'flex';
  cards.style.gap = '32px';
  cards.style.marginBottom = '40px';

  // Single-hopper card
  const singleCard = document.createElement('button');
  singleCard.id = 'singleBtn';
  singleCard.innerHTML = '<span style="font-size:2rem;">🟢</span><br><b>Single‑hopper</b><br><span style="font-size:1rem; color:#555;">Explore the river</span>';
  singleCard.style.background = '#fff';
  singleCard.style.border = '2px solid #4caf50';
  singleCard.style.borderRadius = '18px';
  singleCard.style.padding = '32px 36px';
  singleCard.style.fontSize = '1.2rem';
  singleCard.style.cursor = 'pointer';
  singleCard.style.boxShadow = '0 4px 16px rgba(44, 167, 80, 0.10)';
  singleCard.style.transition = 'transform 0.1s, box-shadow 0.1s';
  singleCard.onmouseenter = () => { singleCard.style.transform = 'scale(1.05)'; singleCard.style.boxShadow = '0 8px 24px rgba(44, 167, 80, 0.18)'; };
  singleCard.onmouseleave = () => { singleCard.style.transform = 'scale(1)'; singleCard.style.boxShadow = '0 4px 16px rgba(44, 167, 80, 0.10)'; };
  cards.appendChild(singleCard);

  // Multi-hopper card
  const multiCard = document.createElement('button');
  multiCard.id = 'multiBtn';
  multiCard.innerHTML = '<span style="font-size:2rem;">🟩🟩</span><br><b>Multi‑hopper</b><br><span style="font-size:1rem; color:#555;">Discover your true potential</span>';
  multiCard.style.background = '#fff';
  multiCard.style.border = '2px solid #0288d1';
  multiCard.style.borderRadius = '18px';
  multiCard.style.padding = '32px 36px';
  multiCard.style.fontSize = '1.2rem';
  multiCard.style.cursor = 'pointer';
  multiCard.style.boxShadow = '0 4px 16px rgba(2, 136, 209, 0.10)';
  multiCard.style.transition = 'transform 0.1s, box-shadow 0.1s';
  multiCard.onmouseenter = () => { multiCard.style.transform = 'scale(1.05)'; multiCard.style.boxShadow = '0 8px 24px rgba(2, 136, 209, 0.18)'; };
  multiCard.onmouseleave = () => { multiCard.style.transform = 'scale(1)'; multiCard.style.boxShadow = '0 4px 16px rgba(2, 136, 209, 0.10)'; };
  cards.appendChild(multiCard);

  wrapper.appendChild(cards);

  // Customer review / quote
  const review = document.createElement('div');
  review.style.fontSize = '1.1rem';
  review.style.fontStyle = 'italic';
  review.style.color = '#333';
  review.style.maxWidth = '420px';
  review.style.textAlign = 'center';
  review.innerHTML = '“My kid never liked school until she started hopping with FrogMath. Now, she keeps muttering inscrutable things about flügenfrögen."<br><span style="font-size:0.95em; color:#388e3c;">— Jeff Hashfield</span>';
  wrapper.appendChild(review);

  // Add everything to the container
  container.appendChild(wrapper);

  // Wire up the buttons
  singleCard.addEventListener('click', ()=>onSelect('single'));
  multiCard.addEventListener('click', ()=>onSelect('multi'));
} 