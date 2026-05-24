/* ============================================================
   WEDDING INVITATION — script.js
   All interactions, animations, maze game, countdown, gallery
   ============================================================ */

'use strict';

/* ============================================================
   CONFIGURATION
   ============================================================ */
const CONFIG = {
  weddingDate : new Date('2026-06-21T17:00:00'),
  groomName   : 'Ahmed',
  brideName   : 'Jana',
  particleCount : 25,
  heartInterval : 2800,
};

/* ============================================================
   MAZE DEFINITION
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
   WEB AUDIO
   ============================================================ */
let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playChime(freqs, type = 'sine', vol = 0.18) {
  try {
    const ctx = getAudioCtx();

    freqs.forEach((freq, i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = type;
      osc.frequency.value = freq;

      const start = ctx.currentTime + i * 0.12;

      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(vol, start + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.9);

      osc.start(start);
      osc.stop(start + 0.95);
    });
  } catch (e) {}
}

function soundEnvelopeOpen() {
  playChime([523, 659, 784, 1047], 'sine', 0.15);
}

function soundGameWin() {
  playChime([523,659,784,1047,1319], 'triangle', 0.18);
}

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

  const size = Math.random() * 6 + 3;
  const left = Math.random() * 100;
  const dur  = Math.random() * 18 + 12;
  const delay = Math.random() * 20;

  p.style.cssText = `
    width:${size}px;
    height:${size}px;
    left:${left}%;
    animation-duration:${dur}s;
    animation-delay:-${delay}s;
    opacity:0;
  `;

  dom.particles.appendChild(p);
}

function initParticles() {
  for (let i = 0; i < CONFIG.particleCount; i++) {
    createParticle();
  }
}

/* ============================================================
   FLOATING HEARTS
   ============================================================ */
function spawnHeart() {
  const h = document.createElement('div');

  h.className = 'fheart';
  h.textContent = '❤';

  const size  = Math.random() * 16 + 10;
  const left  = Math.random() * 100;
  const dur   = Math.random() * 10 + 10;
  const delay = Math.random() * 2;

  h.style.cssText = `
    left:${left}%;
    font-size:${size}px;
    animation-duration:${dur}s;
    animation-delay:-${delay}s;
  `;

  dom.hearts.appendChild(h);

  setTimeout(() => h.remove(), (dur + delay) * 1000);
}

function initHearts() {
  spawnHeart();
  setInterval(spawnHeart, CONFIG.heartInterval);
}

/* ============================================================
   ENVELOPE
   ============================================================ */
let envelopeOpened = false;

function openEnvelope() {
  if (envelopeOpened) return;

  envelopeOpened = true;

  dom.waxSeal.classList.add('pop');

  soundEnvelopeOpen();

  setTimeout(() => {
    dom.envelope.classList.add('opened', 'opening');
  }, 200);

  setTimeout(() => {
    showEnterButton();
  }, 2400);
}

function showEnterButton() {
  const letterInner = dom.envelope.querySelector('.letter-inner');

  const btn = document.createElement('button');

  btn.className = 'env-enter-btn';
  btn.textContent = 'Enter ✦';

  btn.setAttribute('aria-label', 'Enter the invitation');

  letterInner.appendChild(btn);

  requestAnimationFrame(() => {
    btn.style.opacity = '1';
  });

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    transitionToMain();
  });
}

function transitionToMain() {
  dom.envSection.classList.add('hide');

  dom.mainContent.classList.remove('hidden');
  dom.mainContent.removeAttribute('aria-hidden');

  window.scrollTo({ top: 0, behavior: 'auto' });

  setTimeout(triggerHeroReveal, 200);
}

function initEnvelope() {
  if (dom.envelope) {
    dom.envelope.addEventListener('click', openEnvelope);

    dom.envelope.addEventListener('touchstart', openEnvelope, {
      passive: true
    });

    dom.envelope.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openEnvelope();
      }
    });
  }
}

/* ============================================================
   SCROLL REVEAL
   ============================================================ */
let revealObserver = null;

function triggerHeroReveal() {
  const heroReveals = document.querySelectorAll('#hero-section .reveal-up');

  heroReveals.forEach((el, i) => {
    setTimeout(() => {
      el.classList.add('visible');
    }, i * 120);
  });
}

function initScrollReveal() {
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  document.querySelectorAll('.reveal-up:not(#hero-section .reveal-up)')
    .forEach(el => revealObserver.observe(el));
}

/* ============================================================
   COUNTDOWN
   ============================================================ */
function pad(n) {
  return String(n).padStart(2, '0');
}

function flipNumber(el, newVal) {
  const current = el.textContent;

  if (current === newVal) return;

  el.classList.remove('flip');

  void el.offsetWidth;

  el.textContent = newVal;

  el.classList.add('flip');

  setTimeout(() => {
    el.classList.remove('flip');
  }, 200);
}

function updateCountdown() {
  const now  = Date.now();
  const diff = CONFIG.weddingDate - now;

  if (diff <= 0) {
    dom.days.textContent    = '00';
    dom.hours.textContent   = '00';
    dom.minutes.textContent = '00';
    dom.seconds.textContent = '00';
    return;
  }

  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  flipNumber(dom.days, pad(d));
  flipNumber(dom.hours, pad(h));
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
