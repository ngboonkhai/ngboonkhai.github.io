/*
  MIT License
  Copyright (c) 2025 ngboonkhai
*/

const sidebar      = document.getElementById('sidebar');
const overlay      = document.getElementById('overlay');
const hamburger    = document.getElementById('hamburger');
const sidebarClose = document.getElementById('sidebarClose');
const topbarTitle  = document.getElementById('topbarTitle');

const viewHome        = document.getElementById('viewHome');
const viewBitTool     = document.getElementById('viewBitTool');
const viewQuoteTool   = document.getElementById('viewQuoteTool');
const viewRegmapBrowse= document.getElementById('viewRegmapBrowse');
const viewRegmapFrame = document.getElementById('viewRegmapFrame');

const views = {
  home:          { el: viewHome,         title: 'Developer Tools' },
  'bit-tool':    { el: viewBitTool,      title: '🧮 Bit Manipulation Tool' },
  'quote-tool':  { el: viewQuoteTool,    title: '✉️ Email Quote Appender' },
  'regmap-browse':{ el: viewRegmapBrowse, title: '📋 Register Map' },
  'regmap-frame': { el: viewRegmapFrame,  title: '📋 Register Map' },
};

// ── Register Map catalog: vendor → device family → file ────────
// Add new vendors/devices here; the vendor and device pickers are
// rendered automatically from this data.
const registerMapCatalog = {
  altera: {
    label: 'Altera',
    icon: '🔷',
    devices: {
      agilex5: {
        label: 'Agilex® 5',
        icon: '🧩',
        desc: 'HPS (Hard Processor System) Register Address Map — rev C0, RC12',
        file: 'tools/register_map/Altera/Agilex5/HPS_Reg_Map.AG5.revC0.RC12.html',
        source: 'https://docs.altera.com/v/u/resources/775831/agilextm-5-hps-register-map',
      },
    },
  },
};

function showView(key) {
  Object.values(views).forEach(v => v.el.classList.add('hidden'));
  const target = views[key];
  if (!target) return;
  target.el.classList.remove('hidden');
  topbarTitle.textContent = target.title;

  document.querySelectorAll('.nav-item[data-view]').forEach(el => {
    el.classList.toggle('active', el.dataset.view === 'regmap-browse'
      ? (key === 'regmap-browse' || key === 'regmap-frame')
      : el.dataset.view === key);
  });

  closeSidebar();
}

function openSidebar()  { sidebar.classList.add('open');  overlay.classList.add('visible'); }
function closeSidebar() { sidebar.classList.remove('open'); overlay.classList.remove('visible'); }

// ── Collapse sidebar to icons-only (desktop) ────────────────────
const sidebarCollapse = document.getElementById('sidebarCollapse');

function applyCollapsedState() {
  const collapsed = localStorage.getItem('sidebarCollapsed') === 'true';
  document.body.classList.toggle('sidebar-collapsed', collapsed);
  sidebarCollapse.textContent = collapsed ? '»' : '«';
}

sidebarCollapse.addEventListener('click', () => {
  const collapsed = document.body.classList.toggle('sidebar-collapsed');
  localStorage.setItem('sidebarCollapsed', collapsed);
  sidebarCollapse.textContent = collapsed ? '»' : '«';
});

applyCollapsedState();

hamburger.addEventListener('click', openSidebar);
sidebarClose.addEventListener('click', closeSidebar);
overlay.addEventListener('click', closeSidebar);

document.querySelectorAll('.nav-item[data-view]').forEach(el => {
  el.addEventListener('click', e => {
    e.preventDefault();
    if (el.dataset.view === 'regmap-browse') {
      renderRegmapVendors();
    }
    showView(el.dataset.view);
  });
});

document.querySelectorAll('.card-btn[data-view]').forEach(el => {
  el.addEventListener('click', () => {
    if (el.dataset.view === 'regmap-browse') renderRegmapVendors();
    showView(el.dataset.view);
  });
});

// ── Register Map browsing (vendor → device) ─────────────────────
const regmapBreadcrumb = document.getElementById('regmapBreadcrumb');
const regmapBrowseTitle= document.getElementById('regmapBrowseTitle');
const regmapBrowseLead = document.getElementById('regmapBrowseLead');
const regmapCards      = document.getElementById('regmapCards');
const regmapIframe     = document.getElementById('regmapIframe');
const regmapLoading    = document.getElementById('regmapLoading');
const regmapBackBtn    = document.getElementById('regmapBackBtn');
const regmapNewTabLink = document.getElementById('regmapNewTabLink');
const regmapSourceLink = document.getElementById('regmapSourceLink');

function makeCard({ icon, title, desc, onOpen }) {
  const card = document.createElement('div');
  card.className = 'tool-card';
  card.innerHTML = `
    <div class="tool-card-icon">${icon}</div>
    <h2>${title}</h2>
    <p>${desc}</p>
  `;
  const btn = document.createElement('button');
  btn.className = 'card-btn';
  btn.textContent = 'Open →';
  btn.addEventListener('click', onOpen);
  card.appendChild(btn);
  return card;
}

function renderRegmapVendors() {
  regmapBreadcrumb.innerHTML = '<span>Register Map</span>';
  regmapBrowseTitle.textContent = 'Register Map';
  regmapBrowseLead.textContent = 'Choose a vendor to browse its available register map references.';
  regmapCards.innerHTML = '';

  Object.entries(registerMapCatalog).forEach(([vendorKey, vendor]) => {
    const deviceCount = Object.keys(vendor.devices).length;
    regmapCards.appendChild(makeCard({
      icon: vendor.icon,
      title: vendor.label,
      desc: `${deviceCount} device family${deviceCount === 1 ? '' : ' families'} available.`,
      onOpen: () => renderRegmapDevices(vendorKey),
    }));
  });
}

function renderRegmapDevices(vendorKey) {
  const vendor = registerMapCatalog[vendorKey];
  if (!vendor) { renderRegmapVendors(); return; }

  regmapBreadcrumb.innerHTML = `
    <a href="#" id="regmapCrumbRoot">Register Map</a>
    <span class="sep">/</span>
    <span>${vendor.label}</span>
  `;
  document.getElementById('regmapCrumbRoot').addEventListener('click', e => {
    e.preventDefault();
    renderRegmapVendors();
  });

  regmapBrowseTitle.textContent = vendor.label;
  regmapBrowseLead.textContent = 'Choose a device family to open its register map.';
  regmapCards.innerHTML = '';

  Object.entries(vendor.devices).forEach(([deviceKey, device]) => {
    regmapCards.appendChild(makeCard({
      icon: device.icon,
      title: device.label,
      desc: device.desc,
      onOpen: () => openRegisterMap(vendorKey, deviceKey),
    }));
  });
}

function openRegisterMap(vendorKey, deviceKey) {
  const vendor = registerMapCatalog[vendorKey];
  const device = vendor && vendor.devices[deviceKey];
  if (!device) return;

  regmapBackBtn.dataset.vendor = vendorKey;
  regmapNewTabLink.href = device.file;
  regmapSourceLink.href = device.source || device.file;
  regmapLoading.classList.remove('hidden');

  if (regmapIframe.src.endsWith(device.file)) {
    // Already loaded once; just reveal it.
    regmapLoading.classList.add('hidden');
  } else {
    regmapIframe.src = device.file;
  }

  showView('regmap-frame');
  topbarTitle.textContent = `📋 ${vendor.label} — ${device.label}`;
}

regmapIframe.addEventListener('load', () => regmapLoading.classList.add('hidden'));

regmapBackBtn.addEventListener('click', () => {
  const vendorKey = regmapBackBtn.dataset.vendor;
  if (vendorKey && registerMapCatalog[vendorKey]) renderRegmapDevices(vendorKey);
  else renderRegmapVendors();
  showView('regmap-browse');
});

// Restore last view from sessionStorage
const saved = sessionStorage.getItem('activeView');
// A URL hash (e.g. from about.html / privacy.html nav links) takes
// priority over the remembered session view, so links like
// index.html#regmap-browse always land on the right tool.
const hashView = location.hash ? location.hash.slice(1) : '';
const initialView = (hashView && views[hashView]) ? hashView
  : (saved && views[saved]) ? saved
  : 'home';

if (hashView && views[hashView]) history.replaceState(null, '', location.pathname + location.search);

if (initialView === 'regmap-browse') { renderRegmapVendors(); showView('regmap-browse'); }
else showView(initialView);

// Persist active view
document.querySelectorAll('[data-view]').forEach(el => {
  el.addEventListener('click', () => sessionStorage.setItem('activeView', el.dataset.view));
});
