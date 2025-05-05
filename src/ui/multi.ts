export function mountMulti(container: HTMLElement) {
  // Add Back to Menu button in its own div at the top
  const navDiv = document.createElement('div');
  navDiv.style.margin = '16px 0 8px 12px';
  const backBtn = document.createElement('button');
  backBtn.textContent = '← Back to Menu';
  backBtn.style.fontSize = '16px';
  navDiv.appendChild(backBtn);
  container.appendChild(navDiv);
  backBtn.addEventListener('click', async () => {
    container.innerHTML = '';
    const { mountMenu } = await import('./menu');
    mountMenu(container, async mode => {
      container.innerHTML = '';
      if (mode === 'single') {
        const { mountSingle } = await import('./single');
        mountSingle(container);
      } else {
        const { mountMulti } = await import('./multi');
        mountMulti(container);
      }
    });
  });

  // Add the coming soon message as a DOM element
  const msg = document.createElement('p');
  msg.style.fontSize = '24px';
  msg.textContent = 'Coming soon 🐸✨';
  container.appendChild(msg);
} 