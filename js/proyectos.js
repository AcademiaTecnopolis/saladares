/**
 * proyectos.js — RobotikSD
 * Galería de fotos, vídeos y PDFs organizada por curso.
 *
 * DATOS:
 *   js/data.json            → lista de cursos (cursos) y documentos PDF (pdfs)
 *   js/data-AAAA-AA.json    → fotos y vídeos de cada curso (uno por curso)
 *
 * Todos se editan desde el panel /admin (Decap CMS).
 * Para añadir un curso nuevo, ver las instrucciones en config.yml.
 */

// ─── CONFIG ─────────────────────────────────────────────────────────────────
const DATA_URL = '/saladares/js/data.json';
const YOUTUBE_NOCOOKIE = 'https://www.youtube-nocookie.com/embed/';

// ─── STATE ──────────────────────────────────────────────────────────────────
let courses = [];          // [{ id, images, videos }]  (más reciente primero)
let allPDFs = [];
let activeCourse = null;

// ─── BOOTSTRAP ──────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  initMediaTabs();
  initLightbox();
  renderCourseTabs();
  renderAll();
});

// ─── DATA LOADING ───────────────────────────────────────────────────────────
async function fetchJSON(url) {
  const res = await fetch(url + '?t=' + Date.now());
  if (!res.ok) throw new Error(url + ' → ' + res.status);
  return res.json();
}

async function loadData() {
  try {
    const data = await fetchJSON(DATA_URL);
    allPDFs = data.pdfs || [];

    const list = data.cursos || [];
    const loaded = await Promise.all(list.map(async c => {
      try {
        const d = await fetchJSON(c.file);
        return { id: c.id, images: d.images || [], videos: d.videos || [] };
      } catch (e) {
        console.warn('No se pudo cargar el curso ' + c.id, e);
        return { id: c.id, images: [], videos: [] };
      }
    }));

    // Más reciente primero (2026-27 antes que 2025-26)
    courses = loaded.sort((a, b) => b.id.localeCompare(a.id));

    // Curso por defecto: el más reciente que ya tenga contenido
    const withContent = courses.find(c => c.images.length || c.videos.length);
    activeCourse = (withContent || courses[0] || {}).id || null;
  } catch (e) {
    console.warn('No se pudo cargar data.json', e);
  }
}

function currentCourse() {
  return courses.find(c => c.id === activeCourse) || { id: '', images: [], videos: [] };
}

// "2025-26" → "2025-2026"
function longCourse(id) {
  const m = /^(\d{4})-(\d{2})$/.exec(id || '');
  return m ? `${m[1]}-${m[1].slice(0, 2)}${m[2]}` : (id || '');
}

// ─── SELECTOR DE CURSO ──────────────────────────────────────────────────────
function renderCourseTabs() {
  const box = document.getElementById('course-tabs');
  if (!box) return;
  box.innerHTML = '';
  if (courses.length < 2) { box.classList.add('hidden'); return; }

  courses.forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn' + (c.id === activeCourse ? ' active' : '');
    btn.textContent = 'Curso ' + longCourse(c.id);
    btn.addEventListener('click', () => {
      activeCourse = c.id;
      box.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderAll();
    });
    box.appendChild(btn);
  });
}

// ─── MEDIA TABS ─────────────────────────────────────────────────────────────
function initMediaTabs() {
  document.querySelectorAll('#media-tabs .media-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#media-tabs .media-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.media-panel').forEach(p => p.classList.add('hidden'));
      btn.classList.add('active');
      document.getElementById('panel-' + btn.dataset.tab).classList.remove('hidden');
      // Los PDFs no se dividen por curso: se oculta el selector
      const ct = document.getElementById('course-tabs');
      if (ct) ct.style.display = btn.dataset.tab === 'pdfs' ? 'none' : '';
    });
  });
}

// ─── RENDER ALL ─────────────────────────────────────────────────────────────
function renderAll() {
  renderVideos();
  renderGallery();
  renderPDFs();
  updateStats();
  updateCourseLabels();
}

function updateCourseLabels() {
  const hero = document.getElementById('hero-curso');
  if (hero && activeCourse) hero.textContent = longCourse(activeCourse);
  const foot = document.getElementById('footer-curso');
  if (foot && courses[0]) foot.textContent = longCourse(courses[0].id);
}

// ─── RENDER VIDEOS ──────────────────────────────────────────────────────────
function renderVideos() {
  const grid  = document.getElementById('videos-grid');
  const empty = document.getElementById('videos-empty');
  const videos = currentCourse().videos;
  grid.innerHTML = '';
  if (!videos.length) { grid.classList.add('hidden'); empty.classList.remove('hidden'); return; }

  grid.classList.remove('hidden');
  empty.classList.add('hidden');

  videos.forEach(v => {
    const embedId = extractYoutubeId(v.youtubeId || v.url || '');
    const card = document.createElement('div');
    card.className = 'video-card';
    card.innerHTML = `
      <div class="video-wrapper">
        <iframe
          src="${YOUTUBE_NOCOOKIE}${embedId}?rel=0&modestbranding=1"
          title="${v.title}"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          loading="lazy">
        </iframe>
      </div>
      <div class="video-info">
        <div class="video-title">${v.title}</div>
        ${v.description ? `<div class="video-desc">${v.description}</div>` : ''}
      </div>
    `;
    grid.appendChild(card);
  });
}

function extractYoutubeId(str) {
  // Acepta ID suelto, URL completa o youtu.be
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  for (const p of patterns) {
    const m = str.match(p);
    if (m) return m[1];
  }
  return str;
}

// ─── RENDER GALLERY ─────────────────────────────────────────────────────────
function renderGallery() {
  const grid  = document.getElementById('gallery-grid');
  const empty = document.getElementById('gallery-empty');
  const images = currentCourse().images;
  grid.innerHTML = '';
  if (!images.length) { grid.classList.add('hidden'); empty.classList.remove('hidden'); return; }

  grid.classList.remove('hidden');
  empty.classList.add('hidden');

  images.forEach(img => {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.onclick = () => openLightbox(img.src, img.alt);
    item.innerHTML = `<img src="${img.src}" alt="${img.alt || ''}" loading="lazy" onerror="this.closest('.gallery-item').style.display='none'">`;
    grid.appendChild(item);
  });
}

// ─── RENDER PDFs ────────────────────────────────────────────────────────────
function renderPDFs() {
  const list  = document.getElementById('pdfs-list');
  const empty = document.getElementById('pdfs-empty');
  list.innerHTML = '';
  if (!allPDFs.length) { list.classList.add('hidden'); empty.classList.remove('hidden'); return; }

  list.classList.remove('hidden');
  empty.classList.add('hidden');

  allPDFs.forEach(pdf => {
    const card = document.createElement('a');
    card.className = 'pdf-card';
    card.href = pdf.url;
    card.target = '_blank';
    card.rel = 'noopener noreferrer';
    card.innerHTML = `
      <div class="pdf-icon"><span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1">picture_as_pdf</span></div>
      <div class="pdf-meta">
        <div class="pdf-name">${pdf.name}</div>
        <div class="pdf-size">${pdf.description || ''} ${pdf.size ? '· ' + pdf.size : ''}</div>
      </div>
      <div class="pdf-dl"><span class="material-symbols-outlined">download</span></div>
    `;
    list.appendChild(card);
  });
}

// ─── STATS ──────────────────────────────────────────────────────────────────
let statTimers = {};
function updateStats() {
  const animCount = (id, target) => {
    const el = document.getElementById(id);
    if (!el) return;
    clearInterval(statTimers[id]);
    let n = 0;
    const step = Math.max(1, Math.floor(target / 30));
    el.textContent = 0;
    if (!target) return;
    statTimers[id] = setInterval(() => {
      n = Math.min(n + step, target);
      el.textContent = n;
      if (n >= target) clearInterval(statTimers[id]);
    }, 40);
  };
  const c = currentCourse();
  animCount('stat-videos', c.videos.length);
  animCount('stat-fotos',  c.images.length);
}

// ─── LIGHTBOX ───────────────────────────────────────────────────────────────
function initLightbox() {
  document.getElementById('lightbox').addEventListener('click', e => {
    if (e.target.id === 'lightbox') closeLightbox();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeLightbox();
  });
}

function openLightbox(src, alt) {
  const lb = document.getElementById('lightbox');
  document.getElementById('lb-img').src = src;
  document.getElementById('lb-img').alt = alt || '';
  const cap = document.getElementById('lb-caption');
  if (cap) cap.textContent = alt || '';
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}
