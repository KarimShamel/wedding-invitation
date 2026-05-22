/* ============================================================
   WEDDING INVITATION — script.js
   All interactions, animations, maze game, countdown, gallery
   ============================================================ */

'use strict';

/* ============================================================
   CONFIGURATION  ← Edit these to customise the wedding
   ============================================================ */
const CONFIG = {
  weddingDate : new Date('2026-06-21T17:00:00'), // Wedding datetime
  groomName   : 'Ahmed',
  brideName   : 'Sara',
  particleCount : 25,
  heartInterval : 2800,   // ms between new floating hearts
};

/* ============================================================
   MAZE DEFINITION
   0 = walkable path   1 = wall
   Groom starts at [1][1], Bride is at [13][13]
   ============================================================ */
const MAZE_MAP = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,0,1,1,1,0,1,1,1,0,1],
  [1,0,1,0,0,0,0,0,1,0,0,0,1,0,1],
  [1,0,1,0,1,1,1,0,1,1,1,0,1,0,1],
  [1,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
  [1,1,1,0,1,0,1,1,1,0,1,0,1,1,1],
  [1,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,0,1,0,1,1,1,1,1,0,1],
  [1,0,0,0,1,0,0,0,1,0,0,0,0,0,1],
  [1,1,1,0,1,1,1,0,1,0,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
  [1,0,1,1,1,1,1,1,1,1,1,0,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

/* ============================================================
   DOM REFERENCES
   ============================================================ */
const dom = {
  loadingScreen  : document.getElementById('loading-screen'),
  particles      : document.getElementById('particles-container'),
  hearts         : document.getElementById('hearts-container'),
  confetti       : document.getElementById('confetti-container'),
  musicBtn       : document.getElementById('music-toggle'),
  musicIcon      : document.querySelector('#music-toggle .music-icon'),
  bgMusic        : document.getElementById('bg-music'),
  envSection     : document.getElementById('envelope-section'),
  envelope       : document.getElementById('envelope'),
  waxSeal        : document.getElementById('wax-seal'),
  mainContent    : document.getElementById('main-content'),
  days           : document.getElementById('count-days'),
  hours          : document.getElementById('count-hours'),
  minutes        : document.getElementById('count-minutes'),
  seconds        : document.getElementById('count-seconds'),
  mazeCanvas     : document.getElementById('maze-canvas'),
  gameWin        : document.getElementById('game-win'),
  btnReplay      : document.getElementById('btn-replay'),
  btnUp          : document.getElementById('btn-up'),
  btnDown        : document.getElementById('btn-down'),
  btnLeft        : document.getElementById('btn-left'),
  btnRight       : document.getElementById('btn-right'),
  galleryItems   : document.querySelectorAll('.gallery-item'),
  lightbox       : document.getElementById('lightbox'),
  lbImg          : document.getElementById('lb-img'),
  lbClose        : document.getElementById('lb-close'),
  lbPrev         : document.getElementById('lb-prev'),
  lbNext         : document.getElementById('lb-next'),
};

/* ============================================================
   WEB AUDIO — synthesised sound effects (no audio files needed)
   ============================================================ */
let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

/**
 * Play a simple melodic chime
 * @param {number[]} freqs   array of frequencies in Hz
 * @param {string}   type    oscillator type
 * @param {number}   vol     volume 0-1
 */
function playChime(freqs, type = 'sine', vol = 0.18) {
  try {
    const ctx = getAudioCtx();
    freqs.forEach((freq, i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type      = type;
      osc.frequency.value = freq;
      const start = ctx.currentTime + i * 0.12;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(vol, start + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.9);
      osc.start(start);
      osc.stop(start + 0.95);
    });
  } catch (e) { /* audio blocked — silent fallback */ }
}

// Envelope-open chime: rising arpeggio
function soundEnvelopeOpen() { playChime([523, 659, 784, 1047], 'sine', 0.15); }
// Game-win fanfare
function soundGameWin()      { playChime([523,659,784,1047,1319], 'triangle', 0.18); }

/* ============================================================
   LOADING SCREEN
   ============================================================ */
function hideLoadingScreen() {
  dom.loadingScreen.classList.add('fade-out');
  dom.loadingScreen.addEventListener('transitionend', () => {
    dom.loadingScreen.remove();
  }, { once: true });
}

/* ============================================================
   PARTICLES
   ============================================================ */
function createParticle() {
  const p = document.createElement('div');
  p.className = 'particle';
  const size = Math.random() * 6 + 3;          // 3–9 px
  const left = Math.random() * 100;             // % from left
  const dur  = Math.random() * 18 + 12;         // 12–30 s
  const delay = Math.random() * 20;             // stagger

  p.style.cssText = `
    width:${size}px; height:${size}px;
    left:${left}%;
    animation-duration:${dur}s;
    animation-delay:-${delay}s;
    opacity:0;
  `;
  dom.particles.appendChild(p);
}

function initParticles() {
  for (let i = 0; i < CONFIG.particleCount; i++) createParticle();
}

/* ============================================================
   FLOATING HEARTS
   ============================================================ */
function spawnHeart() {
  const h = document.createElement('div');
  h.className = 'fheart';
  h.textContent = '❤';
  const size  = Math.random() * 16 + 10;       // 10–26 px
  const left  = Math.random() * 100;
  const dur   = Math.random() * 10 + 10;       // 10–20 s
  const delay = Math.random() * 2;

  h.style.cssText = `
    left:${left}%;
    font-size:${size}px;
    animation-duration:${dur}s;
    animation-delay:-${delay}s;
  `;
  dom.hearts.appendChild(h);
  // Remove after animation completes to avoid DOM bloat
  setTimeout(() => h.remove(), (dur + delay) * 1000);
}

function initHearts() {
  spawnHeart(); // immediate first heart
  setInterval(spawnHeart, CONFIG.heartInterval);
}

/* ============================================================
   ENVELOPE
   ============================================================ */
let envelopeOpened = false;

function openEnvelope() {
  if (envelopeOpened) return;
  envelopeOpened = true;

  // Pop the wax seal
  dom.waxSeal.classList.add('pop');
  soundEnvelopeOpen();

  // Open animation
  setTimeout(() => {
    dom.envelope.classList.add('opened', 'opening');
  }, 200);

  // After letter is visible, show "Enter" button
  setTimeout(() => {
    showEnterButton();
  }, 2400);
}

function showEnterButton() {
  // Insert the Enter button into the letter-inner div
  const letterInner = dom.envelope.querySelector('.letter-inner');
  const btn = document.createElement('button');
  btn.className = 'env-enter-btn';
  btn.textContent = 'Enter ✦';
  btn.setAttribute('aria-label', 'Enter the invitation');
  letterInner.appendChild(btn);

  // Trigger reflow so the transition fires
  requestAnimationFrame(() => btn.style.opacity = '1');

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    transitionToMain();
  });
}

function transitionToMain() {
  // Fade out envelope section
  dom.envSection.classList.add('hide');

  // Show & animate main content
  dom.mainContent.classList.remove('hidden');
  dom.mainContent.removeAttribute('aria-hidden');

  // Scroll to top smoothly
  window.scrollTo({ top: 0, behavior: 'auto' });

  // Trigger initial reveal animations after a short delay
  setTimeout(triggerHeroReveal, 200);
}

function initEnvelope() {
  dom.envelope.addEventListener('click', openEnvelope);
  dom.envelope.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openEnvelope(); }
  });
}

/* ============================================================
   SCROLL-REVEAL — Intersection Observer
   ============================================================ */
let revealObserver = null;

function triggerHeroReveal() {
  // Manually trigger the hero section's reveal-up elements immediately
  const heroReveals = document.querySelectorAll('#hero-section .reveal-up');
  heroReveals.forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), i * 120);
  });
}

function initScrollReveal() {
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target); // fire once
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  // Observe all reveal-up elements except those inside hero (handled separately)
  document.querySelectorAll('.reveal-up:not(#hero-section .reveal-up)')
    .forEach(el => revealObserver.observe(el));
}

/* ============================================================
   COUNTDOWN TIMER
   ============================================================ */
function pad(n) { return String(n).padStart(2, '0'); }

function flipNumber(el, newVal) {
  const current = el.textContent;
  if (current === newVal) return;
  el.classList.remove('flip');
  void el.offsetWidth; // reflow
  el.textContent = newVal;
  el.classList.add('flip');
  setTimeout(() => el.classList.remove('flip'), 200);
}

function updateCountdown() {
  const now  = Date.now();
  const diff = CONFIG.weddingDate - now;

  if (diff <= 0) {
    // Wedding day!
    dom.days.textContent    = '00';
    dom.hours.textContent   = '00';
    dom.minutes.textContent = '00';
    dom.seconds.textContent = '00';
    return;
  }

  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000)  / 60000);
  const s = Math.floor((diff % 60000)    / 1000);

  flipNumber(dom.days,    pad(d));
  flipNumber(dom.hours,   pad(h));
  flipNumber(dom.minutes, pad(m));
  flipNumber(dom.seconds, pad(s));
}

function initCountdown() {
  updateCountdown();
  setInterval(updateCountdown, 1000);
}

/* ============================================================
   MAZE GAME
   ============================================================ */
const CELL = 32;           // px per cell (will scale on small screens)
const ROWS = MAZE_MAP.length;
const COLS = MAZE_MAP[0].length;

// Colour palette for the maze (matching site theme)
const MAZE_COLORS = {
  bg    : '#FAF0E6',       // path
  wall  : '#C9A84C',       // gold wall
  wallSh: '#A67C2E',       // wall shadow edge
  groom : '#6B4F3A',       // dark brown circle
  bride : '#D98A97',       // blush circle
  goal  : 'rgba(244,184,193,0.35)', // soft highlight at bride position
};

let gameState = {
  groomR : 1, groomC : 1,    // groom start
  brideR : 13, brideC : 13,  // bride goal
  won    : false,
};

let mazeCtx   = null;
let cellSize  = CELL;

function resizeMazeCanvas() {
  const wrap = dom.mazeCanvas.parentElement;

  // Safe width fallback
  let availableWidth = wrap.clientWidth;

  // Prevent invalid sizes
  if (!availableWidth || availableWidth < 100) {
    availableWidth = 320;
  }

  const maxW = Math.min(availableWidth - 24, 480);

  // Ensure positive cell size
  cellSize = Math.max(16, Math.floor(maxW / COLS));

  const w = cellSize * COLS;
  const h = cellSize * ROWS;

  dom.mazeCanvas.width = w;
  dom.mazeCanvas.height = h;
}

function drawMaze() {
  const ctx = mazeCtx;
  const cs  = cellSize;

  ctx.clearRect(0, 0, dom.mazeCanvas.width, dom.mazeCanvas.height);

  // Draw each cell
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = c * cs;
      const y = r * cs;

      if (MAZE_MAP[r][c] === 1) {
        // Wall
        ctx.fillStyle = MAZE_COLORS.wall;
        ctx.fillRect(x, y, cs, cs);
        // Inner bevel shadow
        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        ctx.fillRect(x + cs - 3, y, 3, cs);
        ctx.fillRect(x, y + cs - 3, cs, 3);
      } else {
        // Path
        ctx.fillStyle = MAZE_COLORS.bg;
        ctx.fillRect(x, y, cs, cs);
      }
    }
  }

  // Goal glow
  const goalX = gameState.brideC * cs;
  const goalY = gameState.brideR * cs;
  ctx.fillStyle = MAZE_COLORS.goal;
  ctx.fillRect(goalX, goalY, cs, cs);

  // Draw groom
  drawActor(ctx, gameState.groomC, gameState.groomR, MAZE_COLORS.groom, '🤵', cs);

  // Draw bride
  drawActor(ctx, gameState.brideC, gameState.brideR, MAZE_COLORS.bride, '👰', cs);
}

function drawActor(ctx, col, row, color, emoji, cs) {
  const x = col * cs + cs / 2;
  const y = row * cs + cs / 2;
  const r = cs * 0.38;

  // Circle background
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.lineWidth   = 2;
  ctx.stroke();

  // Emoji (if canvas font rendering allows)
  ctx.font         = `${Math.floor(cs * 0.5)}px serif`;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, x, y + 1);
}

function moveGroom(dr, dc) {
  if (gameState.won) return;

  const nr = gameState.groomR + dr;
  const nc = gameState.groomC + dc;

  // Boundary & wall check
  if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) return;
  if (MAZE_MAP[nr][nc] === 1) return;

  gameState.groomR = nr;
  gameState.groomC = nc;
  drawMaze();

  // Win condition
  if (nr === gameState.brideR && nc === gameState.brideC) {
    winGame();
  }
}

function winGame() {
  gameState.won = true;
  dom.gameWin.classList.remove('hidden');
  soundGameWin();
  launchConfetti();
}

function resetGame() {
  gameState.groomR = 1;
  gameState.groomC = 1;
  gameState.won    = false;
  dom.gameWin.classList.add('hidden');
  drawMaze();
}

function initMaze() {
  mazeCtx = dom.mazeCanvas.getContext('2d');
  resizeMazeCanvas();
  drawMaze();

  // Keyboard controls
  document.addEventListener('keydown', (e) => {
    if (!dom.mainContent.classList.contains('hidden')) {
      switch (e.key) {
        case 'ArrowUp':    e.preventDefault(); moveGroom(-1,  0); break;
        case 'ArrowDown':  e.preventDefault(); moveGroom( 1,  0); break;
        case 'ArrowLeft':  e.preventDefault(); moveGroom( 0, -1); break;
        case 'ArrowRight': e.preventDefault(); moveGroom( 0,  1); break;
      }
    }
  });

  // On-screen button controls
  dom.btnUp.addEventListener('click',    () => moveGroom(-1,  0));
  dom.btnDown.addEventListener('click',  () => moveGroom( 1,  0));
  dom.btnLeft.addEventListener('click',  () => moveGroom( 0, -1));
  dom.btnRight.addEventListener('click', () => moveGroom( 0,  1));

  // Touch swipe support
  let touchStartX = 0, touchStartY = 0;
  dom.mazeCanvas.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    e.preventDefault();
  }, { passive: false });
  dom.mazeCanvas.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy)) {
      dx > 0 ? moveGroom(0, 1) : moveGroom(0, -1);
    } else {
      dy > 0 ? moveGroom(1, 0) : moveGroom(-1, 0);
    }
    e.preventDefault();
  }, { passive: false });

  // Reset button
  dom.btnReplay.addEventListener('click', resetGame);

  // Re-draw on resize
  window.addEventListener('resize', () => {
    resizeMazeCanvas();
    drawMaze();
  });
}

/* ============================================================
   GALLERY + LIGHTBOX
   ============================================================ */
const GALLERY_SRCS = [
  'img/gallery1.jpg',
  'img/gallery2.jpg',
  'img/gallery3.jpg',
  'img/gallery4.jpg',
  'img/gallery5.jpg',
  'img/gallery6.jpg',
];
let lbIndex = 0;

function openLightbox(index) {
  lbIndex = index;
  const src = GALLERY_SRCS[lbIndex];
  dom.lbImg.src = src;
  dom.lbImg.alt = `Gallery photo ${lbIndex + 1}`;
  dom.lightbox.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  dom.lightbox.classList.add('hidden');
  document.body.style.overflow = '';
  dom.lbImg.src = '';
}

function lightboxStep(dir) {
  lbIndex = (lbIndex + dir + GALLERY_SRCS.length) % GALLERY_SRCS.length;
  dom.lbImg.src = '';
  setTimeout(() => {
    dom.lbImg.src = GALLERY_SRCS[lbIndex];
    dom.lbImg.alt = `Gallery photo ${lbIndex + 1}`;
  }, 60);
}

function initGallery() {
  dom.galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      openLightbox(Number(item.dataset.index));
    });
  });

  dom.lbClose.addEventListener('click', closeLightbox);
  dom.lbPrev.addEventListener('click',  () => lightboxStep(-1));
  dom.lbNext.addEventListener('click',  () => lightboxStep(1));

  // Close on backdrop click
  dom.lightbox.addEventListener('click', (e) => {
    if (e.target === dom.lightbox) closeLightbox();
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !dom.lightbox.classList.contains('hidden')) closeLightbox();
    if (e.key === 'ArrowLeft'  && !dom.lightbox.classList.contains('hidden')) lightboxStep(-1);
    if (e.key === 'ArrowRight' && !dom.lightbox.classList.contains('hidden')) lightboxStep(1);
  });
}

/* ============================================================
   MUSIC TOGGLE
   ============================================================ */
let musicPlaying = false;

function initMusic() {
  dom.musicBtn.addEventListener('click', () => {
    if (!musicPlaying) {
      dom.bgMusic.play().then(() => {
        musicPlaying = true;
        dom.musicIcon.classList.remove('paused');
        dom.musicBtn.querySelector('.music-label').textContent = 'Pause';
      }).catch(() => {
        // Autoplay blocked — inform user
        dom.musicBtn.querySelector('.music-label').textContent = 'Unavailable';
      });
    } else {
      dom.bgMusic.pause();
      musicPlaying = false;
      dom.musicIcon.classList.add('paused');
      dom.musicBtn.querySelector('.music-label').textContent = 'Music';
    }
  });
}

/* ============================================================
   CONFETTI
   ============================================================ */
const CONF_COLORS = [
  '#C9A84C','#E8C97A','#F4B8C1','#D98A97',
  '#FDF6EC','#FAF0E6','#A67C2E','#E8929F',
];

function launchConfetti() {
  const count = 140;
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'conf-piece';

      const x    = Math.random() * 100;
      const size = Math.random() * 10 + 6;
      const dur  = Math.random() * 2.5 + 1.8;
      const color = CONF_COLORS[Math.floor(Math.random() * CONF_COLORS.length)];
      const shape = Math.random() > 0.5 ? '50%' : '2px';

      el.style.cssText = `
        left:${x}%;
        top:-20px;
        width:${size}px;
        height:${size * (Math.random() * 0.8 + 0.5)}px;
        background:${color};
        border-radius:${shape};
        animation-duration:${dur}s;
        animation-delay:${Math.random() * 0.8}s;
      `;
      dom.confetti.appendChild(el);
      setTimeout(() => el.remove(), (dur + 1.5) * 1000);
    }, Math.random() * 600);
  }
}

/* ============================================================
   PARALLAX  — subtle depth on photo section
   ============================================================ */
function initParallax() {
  const photoFrame = document.querySelector('.photo-frame-wrap');
  if (!photoFrame) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const rect   = photoFrame.getBoundingClientRect();
        const center = rect.top + rect.height / 2 - window.innerHeight / 2;
        const shift  = center * 0.04;
        photoFrame.style.transform = `translateY(${shift}px)`;
        ticking = false;
      });
      ticking = true;
    }
  });
}

/* ============================================================
   MAIN INIT
   ============================================================ */
function init() {
  // 1. Particles & hearts (start immediately for envelope screen atmosphere)
  initParticles();
  initHearts();

  // 2. Envelope interaction
  initEnvelope();

  // 3. Music toggle
  initMusic();

  // 4. Everything inside main-content initialised once (lazy OK as section won't
  //    be visible until envelope opens, but timers etc must be ready)
  initCountdown();
  initScrollReveal();
  initMaze();
  initGallery();
  initParallax();

  // 5. Dismiss loading screen
  // Give fonts a moment to load before revealing the envelope
  setTimeout(hideLoadingScreen, 1400);
}

// Kick off when DOM is ready
document.addEventListener('DOMContentLoaded', init);
