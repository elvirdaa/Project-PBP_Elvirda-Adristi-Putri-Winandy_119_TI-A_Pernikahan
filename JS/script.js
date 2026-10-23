const CONFIG = {
  tanggal: '2026-10-31T08:00:00+07:00',
  noWA: '6282341059670', 
  lokasi: 'Madiun, Jawa Timur',
  jumlahFoto: 10,
  key: 'ucapan-romi-yusha'
};
 
const $ = id => {
  const el = document.getElementById(id);
  if (!el) console.warn(`Elemen #${id} tidak ditemukan.`);
  return el;
};
 
window.addEventListener('load', () => {
  window.setTimeout(() => $('loader')?.classList.add('done'), 800);
});
 
 
const guestName = new URLSearchParams(window.location.search).get('to');
if (guestName && $('guest')) $('guest').textContent = guestName;
 
 
if ($('map')) $('map').src = `https://maps.google.com/maps?q=${encodeURIComponent(CONFIG.lokasi)}&hl=id&z=15&output=embed`;
if ($('mapLink')) $('mapLink').href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONFIG.lokasi)}`;
 
 
const bgm = $('bgm');
const musicBtn = $('musicBtn');
$('openBtn')?.addEventListener('click', () => {
  $('cover')?.classList.add('hide');
  $('content')?.classList.remove('d-none');
  $('bottomNav')?.classList.remove('d-none');
  musicBtn?.classList.remove('d-none');
  document.body.classList.remove('locked');
  if (bgm) bgm.play().then(() => musicBtn?.classList.add('play')).catch(() => {});
  observeReveal();
});
musicBtn?.addEventListener('click', () => {
  if (!bgm) return;
  if (bgm.paused) bgm.play().then(() => musicBtn.classList.add('play')).catch(() => {});
  else { bgm.pause(); musicBtn.classList.remove('play'); }
});
 
 
function tick() {
  const target = new Date(CONFIG.tanggal).getTime();
  let diff = Math.max(0, target - Date.now());
  const parts = [['Hari', 86400000], ['Jam', 3600000], ['Menit', 60000], ['Detik', 1000]];
  if ($('countdown')) $('countdown').innerHTML = parts.map(([label, unit]) => {
    const number = Math.floor(diff / unit);
    diff -= number * unit;
    return `<div><b>${number}</b><small>${label}</small></div>`;
  }).join('');
}
tick();
window.setInterval(tick, 1000);
 
 
let currentPhoto = 1;
const modalElement = $('imgModal');
const modal = modalElement && window.bootstrap ? bootstrap.Modal.getOrCreateInstance(modalElement) : null;
const gallery = $('gallery');
 
function showPhoto(number) {
  currentPhoto = ((number - 1 + CONFIG.jumlahFoto) % CONFIG.jumlahFoto) + 1;
  const modalImg = $('modalImg');
  if (modalImg) modalImg.src = `assets/img/foto-${currentPhoto}.jpg`;
}
if (gallery) {
  gallery.innerHTML = '';
  for (let i = 1; i <= CONFIG.jumlahFoto; i++) {
    const col = document.createElement('div');
    col.className = 'col-6 col-md-4 gallery-item';
    const img = document.createElement('img');
    img.src = `assets/img/foto-${i}.jpg`;
    img.alt = `Foto kenangan ${i}`;
    img.loading = 'lazy';
    img.onerror = () => {
      img.alt = `Foto ${i} belum tersedia. Tambahkan file assets/img/foto-${i}.jpg`;
      img.style.background = '#e9e3d9';
    };
    img.addEventListener('click', () => { showPhoto(i); if (modal) modal.show(); });
    col.appendChild(img);
    gallery.appendChild(col);
  }
}
$('prevImg')?.addEventListener('click', () => showPhoto(currentPhoto - 1));
$('nextImg')?.addEventListener('click', () => showPhoto(currentPhoto + 1));
window.addEventListener('keydown', event => {
  if (!modalElement?.classList.contains('show')) return;
  if (event.key === 'ArrowLeft') showPhoto(currentPhoto - 1);
  if (event.key === 'ArrowRight') showPhoto(currentPhoto + 1);
});
 
 
document.querySelectorAll('[data-copy]').forEach(button => {
  button.addEventListener('click', async () => {
    const target = $(button.dataset.copy);
    if (!target) return;
    const oldText = button.textContent;
    try {
      await navigator.clipboard.writeText(target.textContent.trim());
      button.textContent = 'Tersalin!';
    } catch {
      button.textContent = 'Salin manual';
      window.prompt('Salin teks berikut:', target.textContent.trim());
    }
    window.setTimeout(() => button.textContent = oldText, 1600);
  });
});
 
 
const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));
 
function loadGreetings() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CONFIG.key) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}
function renderGreetings() {
  const data = loadGreetings();
  const count = status => data.filter(item => item.hadir === status).length;
  if ($('stats')) {
    $('stats').innerHTML = `
      <div><b>${count('Hadir')}</b>Hadir</div>
      <div><b>${count('Ragu')}</b>Masih ragu</div>
      <div><b>${count('Tidak Hadir')}</b>Tidak hadir</div>`;
  }
  if ($('listUcapan')) {
    $('listUcapan').innerHTML = data.map(item => `
      <article class="ucapan-item">
        <div class="avatar">${escapeHTML((item.nama || '?').trim().charAt(0).toUpperCase() || '?')}</div>
        <div><strong>${escapeHTML(item.nama)}</strong> <small>· ${escapeHTML(item.waktu)}</small>
          <p class="mb-0 mt-1">${escapeHTML(item.ucapan)}</p>
          <small>Konfirmasi: ${escapeHTML(item.hadir)}</small>
        </div>
      </article>`).join('');
  }
}
$('simpan')?.addEventListener('click', () => {
  const nama = $('nama')?.value.trim() || '';
  const ucapan = $('ucapan')?.value.trim() || '';
  const hadir = $('hadir')?.value || 'Ragu';
  if (!nama || !ucapan) { alert('Isi nama dan ucapan terlebih dahulu ya.'); return; }
  const data = loadGreetings();
  data.unshift({
    nama, hadir, ucapan,
    waktu: new Date().toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  });
  try {
    localStorage.setItem(CONFIG.key, JSON.stringify(data));
  } catch {
    alert('Ucapan tidak dapat disimpan di browser ini.');
    return;
  }
  $('ucapan').value = '';
  renderGreetings();
});
$('kirim')?.addEventListener('click', () => {
  const nama = $('nama')?.value.trim() || '';
  const hadir = $('hadir')?.value || 'Ragu';
  const ucapan = $('ucapan')?.value.trim() || '';
  if (!nama) { alert('Isi nama terlebih dahulu ya.'); return; }
  const message = encodeURIComponent(`Nama: ${nama}\nKehadiran: ${hadir}\nUcapan: ${ucapan}`);
  window.open(`https://wa.me/${CONFIG.noWA}?text=${message}`, '_blank', 'noopener');
});
renderGreetings();
 
 
let observer;
function observeReveal() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('show'));
    return;
  }
  if (observer) observer.disconnect();
  observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
      observer.unobserve(entry.target);
    }
  }), { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}
observeReveal();
 
// Progress bar halaman
window.addEventListener('scroll', () => {
  const root = document.documentElement;
  const max = root.scrollHeight - root.clientHeight;
  if ($('progress')) $('progress').style.width = `${max > 0 ? root.scrollTop / max * 100 : 0}%`;
});
 
const canvas = $('petals');
const context = canvas?.getContext ? canvas.getContext('2d') : null;
if (canvas && context) {
  let width = 0, height = 0;
  const petals = [];
  function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  for (let i = 0; i < 24; i++) petals.push({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: 2 + Math.random() * 4,
    speed: 0.4 + Math.random() * 0.8,
    angle: Math.random() * 6
  });
  function animatePetals() {
    context.clearRect(0, 0, width, height);
    for (const petal of petals) {
      petal.y += petal.speed;
      petal.angle += 0.02;
      petal.x += Math.sin(petal.angle) * 0.5;
      if (petal.y > height + 10) { petal.y = -10; petal.x = Math.random() * width; }
      context.beginPath();
      context.ellipse(petal.x, petal.y, petal.r, petal.r * 0.65, petal.angle, 0, Math.PI * 2);
      context.fillStyle = 'rgba(255,255,255,.65)';
      context.fill();
    }
    window.requestAnimationFrame(animatePetals);
  }
  animatePetals();
}
