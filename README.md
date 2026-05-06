# 🤖 RobotikSD · Web de Proyectos del Aula

Web estática para mostrar los proyectos de la actividad extraescolar de Robótica, Programación e IA del **Colegio Saladares**. Gestionada con **Decap CMS** — sin tocar código.

---

## 📁 Estructura de carpetas

```
robotiksd-proyectos/
│
├── proyectos.html          ← Página principal de proyectos
├── index.html              ← Página principal existente (no modificar)
├── build.js                ← Script que convierte .md → data.json
├── netlify.toml            ← Configuración de Netlify (build + headers)
├── package.json
│
├── admin/
│   ├── index.html          ← Panel de Decap CMS
│   └── config.yml          ← Configuración del CMS (colecciones, campos)
│
├── js/
│   ├── proyectos.js        ← Lógica JS (renderiza todo desde data.json)
│   └── data.json           ← ⚡ AUTO-GENERADO por build.js — no editar a mano
│
├── content/                ← ✏️ Aquí escribe el CMS (archivos .md)
│   ├── proyectos/          ← Un .md por proyecto
│   ├── videos/             ← Un .md por vídeo de YouTube
│   ├── imagenes/           ← Un .md por foto de la galería
│   └── pdfs/               ← Un .md por documento PDF
│
├── media/
│   ├── images/             ← Imágenes subidas desde el CMS
│   └── pdfs/               ← PDFs subidos desde el CMS
│
└── img/                    ← Imágenes de la web principal (no tocar)
```

---

## 🚀 Despliegue en Netlify (recomendado)

### Paso 1 — Subir el proyecto a GitHub

```bash
git init
git add .
git commit -m "🚀 Proyecto inicial RobotikSD"
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
git push -u origin main
```

### Paso 2 — Conectar con Netlify

1. Ve a [netlify.com](https://netlify.com) → **Add new site → Import from Git**
2. Selecciona tu repositorio de GitHub
3. El `netlify.toml` ya configura todo automáticamente:
   - Build command: `npm install gray-matter && node build.js`
   - Publish directory: `.`
4. Haz clic en **Deploy site**

### Paso 3 — Activar Netlify Identity y Git Gateway

En el panel de Netlify:
1. **Site Settings → Identity → Enable Identity**
2. **Identity → Registration → Invite only** (solo tú puedes entrar)
3. **Identity → Services → Git Gateway → Enable**
4. Invítate a ti mismo: **Identity → Invite users** → escribe tu email

### Paso 4 — Acceder al CMS

- URL del CMS: `https://TU-SITIO.netlify.app/admin`
- Acepta la invitación en tu email
- ¡Listo para publicar contenido!

---

## ✏️ Flujo de trabajo del CMS

```
Tú (en /admin)          GitHub (repositorio)       Netlify (web pública)
      │                         │                          │
      │  1. Añades proyecto     │                          │
      │  desde el panel CMS     │                          │
      │─────────────────────────▶ Guarda .md en            │
      │                         │ content/proyectos/       │
      │                         │─────────────────────────▶│
      │                         │                 2. Build automático:
      │                         │                    node build.js
      │                         │                    genera data.json
      │                         │                          │
      │                         │                 3. Web actualizada
      │                         │                    en ~1 minuto ⚡
```

**En detalle:**
1. Entras en `/admin` con tu cuenta
2. Haces clic en "📁 Proyectos" → "Nuevo proyecto"
3. Rellenas los campos: título, categoría, descripción, imagen, etc.
4. Pulsas **Publicar** → Decap CMS crea un `.md` en `content/proyectos/`
5. Ese commit dispara un build en Netlify
6. `build.js` lee todos los `.md` y genera `js/data.json`
7. La web carga el nuevo `data.json` y muestra el proyecto automáticamente

---

## 💻 Desarrollo local

```bash
# Instalar dependencias
npm install

# Opción A: Solo construir el data.json
npm run build

# Opción B: Servidor local con CMS (requiere decap-server)
npm run dev
# → Web en http://localhost:3000
# → CMS en http://localhost:3000/admin  (sin autenticación en local)
```

Para el CMS local, añade esto al `config.yml`:
```yaml
local_backend: true
```
(Recuerda quitarlo antes de hacer push a producción)

---

## 🎨 Colores de gradiente para proyectos

Copia uno de estos en el campo "Color de fondo" del CMS:

| Tema | CSS |
|------|-----|
| Azul (Robótica) | `linear-gradient(135deg, #1565c0 0%, #00bcd4 100%)` |
| Rojo (Scratch) | `linear-gradient(135deg, #e53935 0%, #ff7043 100%)` |
| Verde (Arduino) | `linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%)` |
| Morado (Python) | `linear-gradient(135deg, #4527a0 0%, #7c4dff 100%)` |
| Rosa (IA) | `linear-gradient(135deg, #ad1457 0%, #f06292 100%)` |
| Amarillo (Web) | `linear-gradient(135deg, #f57f17 0%, #ffd600 100%)` |

---

## 🖼️ Optimización de imágenes

Antes de subir imágenes al CMS, optimízalas:

- **Tamaño máximo recomendado**: 800×600 px para galería, 1200×800 px para portada de proyecto
- **Peso máximo recomendado**: 300 KB por imagen
- **Herramientas gratuitas**:
  - [Squoosh.app](https://squoosh.app) — sin registro, directamente en el navegador
  - [TinyPNG.com](https://tinypng.com) — para PNG y JPG
  - [WebP Converter](https://convertio.co/es/jpg-webp/) — formato WebP (más ligero)

---

## ❓ Preguntas frecuentes

**¿Dónde se guardan las imágenes que subo desde el CMS?**
En `media/images/` dentro del repositorio de GitHub.

**¿Puedo añadir más categorías?**
Sí, edita el campo `category` en `admin/config.yml` y añade el botón de filtro correspondiente en `proyectos.html`.

**¿Y si quiero página de detalle para cada proyecto?**
El campo `body` (markdown) de cada proyecto está pensado para eso. Sería el siguiente paso: añadir una plantilla `proyecto-detalle.html` que lea el slug de la URL y muestre el contenido completo.

**¿Funciona sin Netlify?**
Sí, con GitHub Pages, pero sin build automático. Tendrías que ejecutar `node build.js` localmente y hacer push del `data.json` generado. Netlify es más cómodo porque lo hace solo.

---

© 2026 Academia Tecnópolis · Colegio Saladares
