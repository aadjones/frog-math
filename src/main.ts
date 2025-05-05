import { mountMenu } from './ui/menu';

const root = document.getElementById('app')!;   // add <div id="app"></div> in index.html
mountMenu(root, async mode => {
  root.innerHTML = '';                          // clear menu
  if (mode === 'single') {
    const { mountSingle } = await import('./ui/single');
    mountSingle(root);
  } else {
    const { mountMulti } = await import('./ui/multi');
    mountMulti(root);
  }
}); 