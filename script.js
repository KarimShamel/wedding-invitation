/* ============================================================
   WEDDING INVITATION — script.js
   Fixed Version (No Loading Freeze + Safe Element Checks)
   ============================================================ */

'use strict';

/* ============================================================
   CONFIGURATION
   ============================================================ */
const CONFIG = {
  weddingDate : new Date('2026-06-21T17:00:00'),
  groomName   : 'Ahmed',
  brideName   : 'Sara',
  particleCount : 25,
  heartInterval : 2800,
};

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
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
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

/* ============================================================
   LOADING SCREEN
   ============================================================ */
function hideLoadingScreen() {

  if (!dom.loadingScreen) return;

  dom.loadingScreen.classList.add('fade-out');

  dom.loadingScreen.addEventListener('transitionend', () => {
    dom.loadingScreen.remove();
  }, { once: true });
}

/* ============================================================
   PARTICLES
   ============================================================ */
function createParticle() {

  if (!dom.particles) return;

  const p = document.createElement('div');

  p.className = 'particle';

  const size  = Math.random() * 6 + 3;
  const left  = Math.random() * 100;
  const dur   = Math.random() * 18 + 12;
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

  if (!dom.particles) return;

  for (let i = 0; i < CONFIG.particleCount; i++) {
    createParticle();
  }
}

/* ============================================================
   FLOATING HEARTS
   ============================================================ */
function spawnHeart() {

  if (!dom.hearts) return;

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

  setTimeout(() => {
    h.remove();
  }, (dur + delay) * 1000);
}

function initHearts() {

  if (!dom.hearts) return;

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

  if (dom.waxSeal) {
    dom.waxSeal.classList.add('pop');
  }

  soundEnvelopeOpen();

  setTimeout(() => {
    if (dom.envelope) {
      dom.envelope.classList.add('opened', 'opening');
    }
  }, 200);

  setTimeout(() => {
    showEnterButton();
  }, 2400);
}

function showEnterButton() {

  if (!dom.envelope) return;

  const letterInner = dom.envelope.querySelector('.letter-inner');

  if (!letterInner) return;

  const btn = document.createElement('button');

  btn.className = 'env-enter-btn';
  btn.textContent = 'Enter ✦';

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

  if (dom.envSection) {
    dom.envSection.classList.add('hide');
  }

  if (dom.mainContent) {
    dom.mainContent.classList.remove('hidden');
    dom.mainContent.removeAttribute('aria-hidden');
  }

  window.scrollTo({
    top: 0,
    behavior: 'auto'
  });

  setTimeout(triggerHeroReveal, 200);
}

function initEnvelope() {

  if (!dom.envelope) return;

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

/* ============================================================
   SCROLL REVEAL
   ============================================================ */
let revealObserver = null;

function triggerHeroReveal() {

  const heroReveals =
    document.querySelectorAll('#hero-section .reveal-up');

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

  document
    .querySelectorAll('.reveal-up:not(#hero-section .reveal-up)')
    .forEach(el => revealObserver.observe(el));
}

/* ============================================================
   COUNTDOWN
   ============================================================ */
function pad(n) {
  return String(n).padStart(2, '0');
}

function flipNumber(el, newVal) {

  if (!el) return;

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

  if (
    !dom.days ||
    !dom.hours ||
    !dom.minutes ||
    !dom.seconds
  ) return;

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

  if (!dom.lbImg || !dom.lightbox) return;

  lbIndex = index;

  dom.lbImg.src = GALLERY_SRCS[lbIndex];
  dom.lbImg.alt = `Gallery photo ${lbIndex + 1}`;

  dom.lightbox.classList.remove('hidden');

  document.body.style.overflow = 'hidden';
}

function closeLightbox() {

  if (!dom.lightbox || !dom.lbImg) return;

  dom.lightbox.classList.add('hidden');

  document.body.style.overflow = '';

  dom.lbImg.src = '';
}

function lightboxStep(dir) {

  if (!dom.lbImg) return;

  lbIndex =
    (lbIndex + dir + GALLERY_SRCS.length) %
    GALLERY_SRCS.length;

  dom.lbImg.src = '';

  setTimeout(() => {

    dom.lbImg.src = GALLERY_SRCS[lbIndex];
    dom.lbImg.alt = `Gallery photo ${lbIndex + 1}`;

  }, 60);
}

function initGallery() {

  if (!dom.galleryItems.length) return;

  dom.galleryItems.forEach(item => {

    item.addEventListener('click', () => {
      openLightbox(Number(item.dataset.index));
    });

  });

  if (dom.lbClose) {
    dom.lbClose.addEventListener('click', closeLightbox);
  }

  if (dom.lbPrev) {
    dom.lbPrev.addEventListener('click', () => lightboxStep(-1));
  }

  if (dom.lbNext) {
    dom.lbNext.addEventListener('click', () => lightboxStep(1));
  }

  if (dom.lightbox) {

    dom.lightbox.addEventListener('click', (e) => {

      if (e.target === dom.lightbox) {
        closeLightbox();
      }
    });
  }

  document.addEventListener('keydown', (e) => {

    if (
      e.key === 'Escape' &&
      dom.lightbox &&
      !dom.lightbox.classList.contains('hidden')
    ) {
      closeLightbox();
    }
  });
}

/* ============================================================
   MUSIC
   ============================================================ */
let musicPlaying = false;

function initMusic() {

  if (!dom.musicBtn || !dom.bgMusic) return;

  dom.musicBtn.addEventListener('click', () => {

    if (!musicPlaying) {

      dom.bgMusic.play().then(() => {

        musicPlaying = true;

        if (dom.musicIcon) {
          dom.musicIcon.classList.remove('paused');
        }

        const lbl =
          dom.musicBtn.querySelector('.music-label');

        if (lbl) lbl.textContent = 'Pause';

      }).catch(() => {

        const lbl =
          dom.musicBtn.querySelector('.music-label');

        if (lbl) lbl.textContent = 'Unavailable';
      });

    } else {

      dom.bgMusic.pause();

      musicPlaying = false;

      if (dom.musicIcon) {
        dom.musicIcon.classList.add('paused');
      }

      const lbl =
        dom.musicBtn.querySelector('.music-label');

      if (lbl) lbl.textContent = 'Music';
    }
  });
}

/* ============================================================
   PARALLAX
   ============================================================ */
function initParallax() {

  const photoFrame =
    document.querySelector('.photo-frame-wrap');

  if (!photoFrame) return;

  let ticking = false;

  window.addEventListener('scroll', () => {

    if (!ticking) {

      requestAnimationFrame(() => {

        const rect = photoFrame.getBoundingClientRect();

        const center =
          rect.top +
          rect.height / 2 -
          window.innerHeight / 2;

        const shift = center * 0.04;

        photoFrame.style.transform =
          `translateY(${shift}px)`;

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

  try {

    initParticles();
    initHearts();

    initEnvelope();

    initMusic();

    initCountdown();

    initScrollReveal();

    initGallery();

    initParallax();

  } catch (err) {

    console.error('Initialization Error:', err);
  }

  // ALWAYS hide loading screen
  setTimeout(hideLoadingScreen, 1400);
}

/* ============================================================
   START
   ============================================================ */
document.addEventListener('DOMContentLoaded', init);
