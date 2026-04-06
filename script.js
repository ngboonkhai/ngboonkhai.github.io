/*
  MIT License
  Copyright (c) 2025 ngboonkhai
*/

const sidebar      = document.getElementById('sidebar');
const overlay      = document.getElementById('overlay');
const hamburger    = document.getElementById('hamburger');
const sidebarClose = document.getElementById('sidebarClose');
const topbarTitle  = document.getElementById('topbarTitle');

const viewHome     = document.getElementById('viewHome');
const viewBitTool  = document.getElementById('viewBitTool');
const viewQuoteTool= document.getElementById('viewQuoteTool');

const views = {
  home:       { el: viewHome,      title: 'Developer Tools' },
  'bit-tool': { el: viewBitTool,   title: '🧮 Bit Manipulation Tool' },
  'quote-tool':{ el: viewQuoteTool, title: '✉️ Email Quote Appender' },
};

function showView(key) {
  Object.values(views).forEach(v => v.el.classList.add('hidden'));
  const target = views[key];
  if (!target) return;
  target.el.classList.remove('hidden');
  topbarTitle.textContent = target.title;

  document.querySelectorAll('.nav-item[data-view]').forEach(el => {
    el.classList.toggle('active', el.dataset.view === key);
  });

  closeSidebar();
}

function openSidebar()  { sidebar.classList.add('open');  overlay.classList.add('visible'); }
function closeSidebar() { sidebar.classList.remove('open'); overlay.classList.remove('visible'); }

hamburger.addEventListener('click', openSidebar);
sidebarClose.addEventListener('click', closeSidebar);
overlay.addEventListener('click', closeSidebar);

document.querySelectorAll('.nav-item[data-view]').forEach(el => {
  el.addEventListener('click', e => { e.preventDefault(); showView(el.dataset.view); });
});

document.querySelectorAll('.card-btn[data-view]').forEach(el => {
  el.addEventListener('click', () => showView(el.dataset.view));
});

// Restore last view from sessionStorage
const saved = sessionStorage.getItem('activeView');
if (saved && views[saved]) showView(saved);
else showView('home');

// Persist active view
document.querySelectorAll('[data-view]').forEach(el => {
  el.addEventListener('click', () => sessionStorage.setItem('activeView', el.dataset.view));
});
