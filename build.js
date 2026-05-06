#!/usr/bin/env node
/**
 * build.js — RobotikSD Content Builder
 * ─────────────────────────────────────────────────────────────
 * Lee todos los archivos Markdown de content/ (generados por
 * Decap CMS) y los compila en js/data.json que usa la web.
 *
 * USO:
 *   node build.js          → genera js/data.json
 *   npm run build          → mismo comando vía package.json
 *
 * AUTOMÁTICO EN NETLIFY:
 *   El build command en netlify.toml llama a este script antes
 *   de publicar, así el JSON siempre está actualizado.
 *
 * DEPENDENCIAS:
 *   npm install gray-matter   (parsea el front-matter YAML de los .md)
 */

const fs   = require('fs');
const path = require('path');

// ── Intentar cargar gray-matter, o usar parser manual ────────
let matter;
try {
  matter = require('gray-matter');
} catch {
  console.warn('⚠️  gray-matter no instalado. Usando parser YAML básico.');
  console.warn('   Ejecuta: npm install gray-matter');
  matter = null;
}

// ─── HELPERS ─────────────────────────────────────────────────
function readMarkdownDir(dirPath) {
  const absDir = path.join(__dirname, dirPath);
  if (!fs.existsSync(absDir)) return [];

  return fs.readdirSync(absDir)
    .filter(f => f.endsWith('.md'))
    .map(file => {
      const raw = fs.readFileSync(path.join(absDir, file), 'utf8');
      if (matter) {
        const { data, content } = matter(raw);
        return { ...data, _body: content.trim(), _file: file };
      }
      // Fallback: parse manual muy básico
      return parseBasicFrontmatter(raw, file);
    })
    .filter(Boolean)
    .sort((a, b) => {
      // Ordenar por fecha descendente
      if (a.date && b.date) return new Date(b.date) - new Date(a.date);
      return 0;
    });
}

function parseBasicFrontmatter(raw, file) {
  const match = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  const obj = { _file: file };
  match[1].split('\n').forEach(line => {
    const sep = line.indexOf(':');
    if (sep === -1) return;
    const key = line.slice(0, sep).trim();
    let val   = line.slice(sep + 1).trim();
    // Booleans
    if (val === 'true')  val = true;
    if (val === 'false') val = false;
    // Numbers
    if (!isNaN(val) && val !== '') val = Number(val);
    // Remove surrounding quotes
    if (typeof val === 'string') val = val.replace(/^["']|["']$/g, '');
    obj[key] = val;
  });
  return obj;
}

function slug(title) {
  return (title || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// ─── LOAD COLLECTIONS ────────────────────────────────────────
console.log('🔨 RobotikSD Build — generando js/data.json...\n');

const projects = readMarkdownDir('content/proyectos').map(p => ({
  id:          p.id || slug(p.title),
  title:       p.title       || 'Sin título',
  category:    p.category    || 'otro',
  description: p.description || '',
  image:       p.image       || '',
  emoji:       p.emoji       || '🔧',
  gradient:    p.gradient    || 'linear-gradient(135deg, #1565c0 0%, #00bcd4 100%)',
  tags:        Array.isArray(p.tags) ? p.tags : (p.tags ? [p.tags] : []),
  hasVideo:    Boolean(p.hasVideo),
  hasPDF:      Boolean(p.hasPDF),
  date:        p.date        || '',
  course:      p.course      || ''
}));

const videos = readMarkdownDir('content/videos').map(v => ({
  id:          v.id || slug(v.title),
  youtubeId:   v.youtubeId   || '',
  title:       v.title       || 'Vídeo sin título',
  description: v.description || '',
  projectId:   v.projectId   || '',
  date:        v.date        || ''
}));

const images = readMarkdownDir('content/imagenes').map(img => ({
  id:        img.id || slug(img.alt),
  src:       img.src       || '',
  alt:       img.alt       || '',
  projectId: img.projectId || '',
  date:      img.date      || ''
}));

const pdfs = readMarkdownDir('content/pdfs').map(pdf => ({
  id:          pdf.id || slug(pdf.name),
  name:        pdf.name        || 'Documento.pdf',
  url:         pdf.url         || '',
  description: pdf.description || '',
  size:        pdf.size        || '',
  projectId:   pdf.projectId   || '',
  date:        pdf.date        || ''
}));

// ─── WRITE OUTPUT ────────────────────────────────────────────
const output = { projects, videos, images, pdfs };
const outPath = path.join(__dirname, 'js', 'data.json');

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf8');

// ─── SUMMARY ─────────────────────────────────────────────────
console.log(`✅ js/data.json generado correctamente:\n`);
console.log(`   📁 Proyectos : ${projects.length}`);
console.log(`   🎬 Vídeos    : ${videos.length}`);
console.log(`   🖼️  Imágenes  : ${images.length}`);
console.log(`   📄 PDFs      : ${pdfs.length}`);
console.log(`\n🚀 Listo para desplegar.`);
