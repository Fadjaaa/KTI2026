// Tandai JS aktif (untuk lepas fallback .no-js di CSS)
document.documentElement.classList.remove('no-js');

// =====================================================
// LAYAR PEMBUKA (INTRO LOADER)
// Body dimulai dengan class "is-loading" (blur + redup).
// Setelah halaman & aset selesai dimuat (atau batas waktu
// tercapai, mana pun lebih dulu), class diganti ke
// "is-loaded" sehingga nav & konten utama bertransisi dari
// blur menuju jelas, dan overlay pembuka memudar keluar.
// =====================================================
const introLoader = document.getElementById('introLoader');
let introFinished = false;

function finishIntro(){
  if (introFinished) return;
  introFinished = true;
  document.body.classList.remove('is-loading');
  document.body.classList.add('is-loaded');
  if (introLoader){
    // Buang elemen loader dari DOM setelah animasi memudarnya selesai
    window.setTimeout(() => introLoader.remove(), 900);
  }
}

if (document.readyState === 'complete'){
  window.setTimeout(finishIntro, 500);
} else {
  window.addEventListener('load', () => window.setTimeout(finishIntro, 700));
}
// Jaga-jaga: jika event 'load' lambat (mis. aset besar/lambat),
// tetap buka halaman setelah beberapa detik agar tidak terjebak.
window.setTimeout(finishIntro, 3200);

// =====================================================
// NAV TRANSPARAN SAAT DIGULIR
// Posisi nav tetap (fixed di atas, tidak ikut berpindah),
// hanya latar belakangnya yang memudar jadi lebih transparan
// begitu halaman mulai digulir menjauh dari paling atas.
// =====================================================
const navEl = document.getElementById('nav');
function updateNavOnScroll(){
  if (!navEl) return;
  navEl.classList.toggle('nav-scrolled', window.scrollY > 12);
}
window.addEventListener('scroll', updateNavOnScroll, { passive:true });
updateNavOnScroll();

// =====================================================
// MODE TERANG / GELAP
// (dibungkus try/catch: sebagian browser menolak akses
// localStorage saat file dibuka langsung dari komputer/HP
// tanpa server — tanpa try/catch, seluruh script.js bisa
// berhenti jalan dan tombol lain ikut mati)
// =====================================================
const root = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const iconMoon = document.getElementById('iconMoon');
const iconSun = document.getElementById('iconSun');

function getStoredTheme(){
  try { return localStorage.getItem('theme'); }
  catch (e) { return null; }
}
function storeTheme(theme){
  try { localStorage.setItem('theme', theme); }
  catch (e) { /* abaikan jika localStorage tidak tersedia */ }
}

function applyTheme(theme){
  root.setAttribute('data-theme', theme);
  storeTheme(theme);
  const isLight = theme === 'light';
  iconMoon.style.display = isLight ? 'none' : 'block';
  iconSun.style.display = isLight ? 'block' : 'none';
}

let prefersLight = false;
try { prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches; }
catch (e) { /* abaikan */ }

const savedTheme = getStoredTheme() || (prefersLight ? 'light' : 'dark');
applyTheme(savedTheme);

themeToggle.addEventListener('click', () => {
  const current = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  applyTheme(current);
  syncThemeSwatches();
});

// =====================================================
// POPOVER: PILIH TEMA WARNA (dekorasi tambahan)
// =====================================================
const themeCaret = document.getElementById('themeCaret');
const themePopover = document.getElementById('themePopover');
const themeSwatches = themePopover.querySelectorAll('.popover-swatch');

function syncThemeSwatches(){
  const current = root.getAttribute('data-theme');
  themeSwatches.forEach(btn => {
    btn.classList.toggle('is-active', btn.dataset.theme === current);
  });
}
syncThemeSwatches();

function closeAllPopovers(except){
  document.querySelectorAll('.popover').forEach(p => {
    if (p !== except) p.classList.remove('open');
  });
  document.querySelectorAll('.popover-caret').forEach(c => {
    if (!except || c.getAttribute('aria-controls') !== except.id){
      c.setAttribute('aria-expanded', 'false');
    }
  });
}

themeCaret.addEventListener('click', (e) => {
  e.stopPropagation();
  const willOpen = !themePopover.classList.contains('open');
  closeAllPopovers();
  themePopover.classList.toggle('open', willOpen);
  themeCaret.setAttribute('aria-expanded', String(willOpen));
});

themeSwatches.forEach(btn => {
  btn.addEventListener('click', () => {
    applyTheme(btn.dataset.theme);
    syncThemeSwatches();
    themePopover.classList.remove('open');
    themeCaret.setAttribute('aria-expanded', 'false');
  });
});

// =====================================================
// TOMBOL MUSIK
// =====================================================
const musicToggle = document.getElementById('musicToggle');
const bgMusic = document.getElementById('bgMusic');
const iconPlay = document.getElementById('iconPlay');
const iconPause = document.getElementById('iconPause');

// =====================================================
// PENGATUR VOLUME
// (disimpan di localStorage lewat try/catch, sama seperti
// tema, agar tetap aman jika dibuka langsung tanpa server)
// =====================================================
const volumeSlider = document.getElementById('volumeSlider');
const volumeValue = document.getElementById('volumeValue');
const volumeMute = document.getElementById('volumeMute');
const iconVolumeOn = document.getElementById('iconVolumeOn');
const iconVolumeOff = document.getElementById('iconVolumeOff');

function getStoredVolume(){
  try {
    const v = localStorage.getItem('musicVolume');
    return v !== null ? Number(v) : null;
  } catch (e) { return null; }
}
function storeVolume(v){
  try { localStorage.setItem('musicVolume', String(v)); }
  catch (e) { /* abaikan jika localStorage tidak tersedia */ }
}

let lastVolume = 50;

function setVolume(v){
  v = Math.min(100, Math.max(0, Math.round(v)));
  bgMusic.volume = v / 100;
  if (volumeSlider) volumeSlider.value = v;
  if (volumeValue) volumeValue.textContent = v + '%';

  const isMuted = v === 0;
  if (volumeMute) volumeMute.setAttribute('aria-pressed', String(isMuted));
  if (iconVolumeOn) iconVolumeOn.style.display = isMuted ? 'none' : 'block';
  if (iconVolumeOff) iconVolumeOff.style.display = isMuted ? 'block' : 'none';

  if (v > 0) lastVolume = v;
  storeVolume(v);
}

const savedVolume = getStoredVolume();
setVolume(savedVolume !== null ? savedVolume : 50);

if (volumeSlider){
  volumeSlider.addEventListener('input', () => setVolume(Number(volumeSlider.value)));
}
if (volumeMute){
  volumeMute.addEventListener('click', () => {
    const current = Number(volumeSlider ? volumeSlider.value : 0);
    setVolume(current > 0 ? 0 : (lastVolume || 50));
  });
}

musicToggle.addEventListener('click', () => {
  const isPlaying = musicToggle.getAttribute('aria-pressed') === 'true';

  if (isPlaying){
    bgMusic.pause();
  } else {
    bgMusic.play().catch(() => {
      // Browser bisa menolak autoplay tanpa interaksi;
      // ini aman diabaikan karena tombol ini sendiri adalah interaksi pengguna.
    });
  }

  const nowPlaying = !isPlaying;
  musicToggle.setAttribute('aria-pressed', String(nowPlaying));
  iconPlay.style.display = nowPlaying ? 'none' : 'block';
  iconPause.style.display = nowPlaying ? 'block' : 'none';
});

// =====================================================
// POPOVER: PILIH LAGU (dekorasi tambahan)
// =====================================================
const musicCaret = document.getElementById('musicCaret');
const musicPopover = document.getElementById('musicPopover');
const trackOptions = musicPopover.querySelectorAll('.popover-option');

musicCaret.addEventListener('click', (e) => {
  e.stopPropagation();
  const willOpen = !musicPopover.classList.contains('open');
  closeAllPopovers();
  musicPopover.classList.toggle('open', willOpen);
  musicCaret.setAttribute('aria-expanded', String(willOpen));
});

trackOptions.forEach(btn => {
  btn.addEventListener('click', () => {
    const wasPlaying = musicToggle.getAttribute('aria-pressed') === 'true';
    bgMusic.src = btn.dataset.track;
    trackOptions.forEach(o => o.classList.toggle('is-active', o === btn));
    if (wasPlaying){
      bgMusic.play().catch(() => {});
    }
    musicPopover.classList.remove('open');
    musicCaret.setAttribute('aria-expanded', 'false');
  });
});

// Tutup semua popover saat klik di luar area popover
document.addEventListener('click', (e) => {
  if (!e.target.closest('.popover-wrap')) closeAllPopovers();
});

// =====================================================
// MENU MOBILE
// =====================================================
const navBurger = document.getElementById('navBurger');
const navLinks = document.getElementById('navLinks');

navBurger.addEventListener('click', () => {
  navBurger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navBurger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

// =====================================================
// KETUK FOTO SAMPUL UNTUK GANTI (4 FOTO BERGILIR)
// =====================================================
const heroPhoto = document.getElementById('heroPhoto');
const heroPhotoHint = document.getElementById('heroPhotoHint');

if (heroPhoto){
  // Urutan 4 foto yang akan bergilir setiap diketuk/klik.
  // Ganti nama file di sini jika nama foto berbeda.
  const heroPhotos = ['P3.png', 'P2.png', 'P1.png', 'P0.png'];
  let heroPhotoIndex = 0;

  function swapHeroPhoto(){
    heroPhotoIndex = (heroPhotoIndex + 1) % heroPhotos.length;
    heroPhoto.classList.add('is-swapping');

    window.setTimeout(() => {
      heroPhoto.src = heroPhotos[heroPhotoIndex];
    }, 150);

    window.setTimeout(() => {
      heroPhoto.classList.remove('is-swapping');
    }, 320);

    // Setelah pertama kali diketuk, hint tidak perlu tampil lagi
    if (heroPhotoHint) heroPhotoHint.style.display = 'none';
  }

  heroPhoto.addEventListener('click', swapHeroPhoto);
  heroPhoto.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' '){
      e.preventDefault();
      swapHeroPhoto();
    }
  });
}

// =====================================================
// ANIMASI "BUKA HALAMAN BUKU" SAAT SETIAP BAGIAN DISCROLL
// (bukan sekadar gulir polos — tiap bagian terbuka miring
// dari atas seperti lembar buku yang dibalik, lalu jatuh
// rata ke posisinya)
// =====================================================
let pageFlipObserver = null;
try {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const flipTargets = document.querySelectorAll('.page-flip');

  if (reduceMotion) {
    flipTargets.forEach(el => el.classList.add('is-flipped'));
  } else if ('IntersectionObserver' in window) {
    pageFlipObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-flipped');
          pageFlipObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    flipTargets.forEach(el => pageFlipObserver.observe(el));
  } else {
    // Browser lama tanpa IntersectionObserver: langsung tampilkan
    flipTargets.forEach(el => el.classList.add('is-flipped'));
  }
} catch (e) {
  // Jika terjadi error tak terduga, pastikan konten tetap terlihat
  document.querySelectorAll('.page-flip').forEach(el => el.classList.add('is-flipped'));
}

// =====================================================
// EFEK NOT MUSIK BETERBANGAN SAAT TOMBOL UNDUH DIKLIK
// =====================================================
const heroDownload = document.querySelector('.hero-download');

// Daftar 7 file PDF per bab yang akan diunduh sekaligus.
// Ganti nama file di sini sesuai nama file PDF yang sebenarnya.
const heroDownloadFiles = [
  'FACHRI AKBAR DJAELANI_KTI 2026.rtf',
];

function downloadMultipleFiles(fileList){
  // Browser membatasi banyak unduhan otomatis yang terjadi bersamaan
  // (biasanya akan memunculkan izin/notifikasi "situs ini mencoba
  // mengunduh banyak file"), jadi tiap unduhan diberi jeda kecil
  // secara berurutan agar semuanya berhasil terpicu.
  fileList.forEach((fileUrl, index) => {
    window.setTimeout(() => {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileUrl.split('/').pop();
      document.body.appendChild(link);
      link.click();
      link.remove();
    }, index * 400);
  });
}

if (heroDownload){
  heroDownload.addEventListener('click', (e) => {
    // Cegah aksi bawaan tautan (yang hanya mengunduh 1 file lewat href),
    // lalu picu pengunduhan ketujuh file secara manual.
    e.preventDefault();
    downloadMultipleFiles(heroDownloadFiles);

    let reduceMotion = false;
    try { reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
    catch (e) { /* abaikan */ }
    if (reduceMotion) return;

    const symbols = ['♪', '♫', '♬', '♩'];
    const rect = heroDownload.getBoundingClientRect();

    for (let i = 0; i < 8; i++){
      const note = document.createElement('span');
      note.className = 'note-burst';
      note.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      note.style.left = (rect.left + window.scrollX + rect.width / 2 + (Math.random() - 0.5) * 60) + 'px';
      note.style.top  = (rect.top + window.scrollY) + 'px';
      note.style.setProperty('--dx', ((Math.random() - 0.5) * 140) + 'px');
      note.style.setProperty('--rot', ((Math.random() - 0.5) * 60) + 'deg');
      document.body.appendChild(note);
      note.addEventListener('animationend', () => note.remove());
    }
  });
}

// =====================================================
// TANDAI LINK NAV YANG SEDANG AKTIF SAAT SCROLL
// =====================================================
// =====================================================
// LIGHTBOX: PERBESAR FOTO BAB SAAT DISENTUH/DIKLIK
// =====================================================
const imgLightbox = document.getElementById('imgLightbox');
const imgLightboxImg = document.getElementById('imgLightboxImg');
const imgLightboxClose = document.getElementById('imgLightboxClose');
const zoomableFigureImages = document.querySelectorAll('.chapter-figure img');

let lastFocusedBeforeLightbox = null;

function openImgLightbox(img){
  if (!imgLightbox || !imgLightboxImg) return;
  lastFocusedBeforeLightbox = document.activeElement;
  imgLightboxImg.src = img.currentSrc || img.src;
  imgLightboxImg.alt = img.alt || '';
  imgLightbox.classList.add('open');
  imgLightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  if (imgLightboxClose) imgLightboxClose.focus();
}

function closeImgLightbox(){
  if (!imgLightbox) return;
  imgLightbox.classList.remove('open');
  imgLightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (lastFocusedBeforeLightbox) lastFocusedBeforeLightbox.focus();
}

zoomableFigureImages.forEach(img => {
  img.setAttribute('tabindex', '0');
  img.setAttribute('role', 'button');
  if (!img.getAttribute('aria-label')) img.setAttribute('aria-label', 'Ketuk untuk memperbesar gambar');

  img.addEventListener('click', () => openImgLightbox(img));
  img.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' '){
      e.preventDefault();
      openImgLightbox(img);
    }
  });
});

if (imgLightboxClose) imgLightboxClose.addEventListener('click', closeImgLightbox);

if (imgLightbox){
  // Menutup saat area gelap di luar foto disentuh/diklik
  imgLightbox.addEventListener('click', (e) => {
    if (e.target === imgLightbox) closeImgLightbox();
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && imgLightbox && imgLightbox.classList.contains('open')){
    closeImgLightbox();
  }
});

// =====================================================
// TANDAI LINK NAV YANG SEDANG AKTIF SAAT SCROLL
// =====================================================
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-link');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting){
      const id = entry.target.getAttribute('id');
      navItems.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' });

sections.forEach(section => observer.observe(section));
