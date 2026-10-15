const $  = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

window.addEventListener('load', () => setTimeout(() => $('#loader')?.classList.add('hide'), 500));

const themeToggle = $('#themeToggle');
document.documentElement.setAttribute('data-theme', localStorage.getItem('theme') || 'dark');
themeToggle.addEventListener('click', () => {
  const cur = document.documentElement.getAttribute('data-theme');
  const next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

const dot = $('#cursorDot'), outline = $('#cursorOutline');
let mx = 0, my = 0, ox = 0, oy = 0;
if (window.matchMedia('(pointer: fine)').matches) {
  window.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
  });
  (function loop() {
    ox += (mx - ox) * 0.15; oy += (my - oy) * 0.15;
    outline.style.transform = `translate(${ox}px, ${oy}px) translate(-50%,-50%)`;
    requestAnimationFrame(loop);
  })();
  document.addEventListener('mouseover', e => {
    if (e.target.closest('a, button, input, textarea, .magnetic'))
      outline.classList.add('hover');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest('a, button, input, textarea, .magnetic'))
      outline.classList.remove('hover');
  });
}

(function particles() {
  const canvas = $('#particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, parts = [];
  const COUNT = innerWidth < 768 ? 30 : 60;
  function resize() { w = canvas.width = innerWidth; h = canvas.height = innerHeight; }
  resize();
  addEventListener('resize', resize);
  for (let i = 0; i < COUNT; i++) parts.push({
    x: Math.random() * w, y: Math.random() * h,
    vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4,
    r: Math.random() * 1.6 + .4
  });
  (function loop() {
    ctx.clearRect(0, 0, w, h);
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    const pColor = dark ? 'rgba(124,92,255,.7)' : 'rgba(124,92,255,.5)';
    const lColor = dark ? 'rgba(124,92,255,.08)' : 'rgba(124,92,255,.06)';
    parts.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = pColor; ctx.fill();
    });
    for (let i = 0; i < parts.length; i++)
      for (let j = i + 1; j < parts.length; j++) {
        const dx = parts[i].x - parts[j].x, dy = parts[i].y - parts[j].y;
        const d = Math.hypot(dx, dy);
        if (d < 130) {
          ctx.beginPath();
          ctx.moveTo(parts[i].x, parts[i].y);
          ctx.lineTo(parts[j].x, parts[j].y);
          ctx.strokeStyle = lColor;
          ctx.lineWidth = .6;
          ctx.stroke();
        }
      }
    requestAnimationFrame(loop);
  })();
})();

const header = $('#header'), backToTop = $('#backToTop'), progress = $('#scrollProgress');
addEventListener('scroll', () => {
  const top = scrollY;
  const h = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = (top / h) * 100 + '%';
  header.classList.toggle('scrolled', top > 50);
  backToTop.classList.toggle('show', top > 500);
}, { passive: true });
backToTop.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

const menuBtn = $('#menuBtn'), navLinksEl = $('#navLinks');
menuBtn.addEventListener('click', () => {
  menuBtn.classList.toggle('open');
  navLinksEl.classList.toggle('open');
});
navLinksEl.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  menuBtn.classList.remove('open');
  navLinksEl.classList.remove('open');
}));

const sections = $$('section[id]');
const navEls = $$('.nav-link');
sections.forEach(s => new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const id = e.target.id;
      navEls.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + id));
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' }).observe(s));

const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); }
  });
}, { threshold: 0.12 });
const observeReveals = () => $$('.reveal:not(.visible)').forEach(el => revealObs.observe(el));

function toast(msg, type = 'success', dur = 3500) {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span style="font-size:1.2rem">${type === 'success' ? '✅' : '❌'}</span><span>${msg}</span>`;
  $('#toastContainer').appendChild(el);
  setTimeout(() => { el.classList.add('hide'); setTimeout(() => el.remove(), 300); }, dur);
}

function initMagnets() {
  $$('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX - r.left - r.width/2) * 0.15}px, ${(e.clientY - r.top - r.height/2) * 0.3}px)`;
    });
    el.addEventListener('mouseleave', () => el.style.transform = '');
  });
}

function typeRoles(roles) {
  const el = $('#typed');
  let i = 0, c = 0, del = false;
  (function tick() {
    const cur = roles[i];
    if (!del) {
      el.textContent = cur.slice(0, ++c);
      if (c === cur.length) { del = true; return setTimeout(tick, 1600); }
      setTimeout(tick, 70);
    } else {
      el.textContent = cur.slice(0, --c);
      if (c === 0) { del = false; i = (i + 1) % roles.length; return setTimeout(tick, 300); }
      setTimeout(tick, 35);
    }
  })();
}

function animateCounter(el, target, suffix) {
  const start = performance.now(), dur = 1600;
  (function frame(now) {
    const p = Math.min((now - start) / dur, 1);
    const e = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.floor(e * target) + suffix;
    if (p < 1) requestAnimationFrame(frame);
    else el.textContent = target + suffix;
  })(start);
}

async function loadProfile() {
  try {
    const data = await (await fetch('/api/profile')).json();
    $('#heroName').textContent = data.name;
    $('#heroTagline').textContent = data.tagline;
    document.title = `${data.name} | ${data.title}`;
    $('#footerName').textContent = data.name;
    typeRoles(data.roles);

    const icons = {
      github: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.2.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2.9-.3 1.9-.4 2.9-.4s2 .1 2.9.4c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.5-2.7 5.5-5.3 5.8.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z"/></svg>`,
      linkedin: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 2h-17C2.7 2 2 2.7 2 3.5v17C2 21.3 2.7 22 3.5 22h17c.8 0 1.5-.7 1.5-1.5v-17c0-.8-.7-1.5-1.5-1.5zM8 19H5V9h3v10zM6.5 7.7c-1 0-1.7-.8-1.7-1.7s.8-1.7 1.7-1.7 1.7.8 1.7 1.7-.8 1.7-1.7 1.7zM19 19h-3v-5.3c0-1.3-.5-2.1-1.6-2.1-.9 0-1.4.6-1.6 1.2-.1.2-.1.5-.1.8V19h-3V9h3v1.4c.4-.6 1.1-1.5 2.7-1.5 2 0 3.6 1.3 3.6 4V19z"/></svg>`,
      twitter: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.2 2h3.3l-7.2 8.3L23 22h-6.6l-5.2-6.8L5.2 22H1.9l7.7-8.8L1 2h6.8l4.7 6.2L18.2 2zm-1.2 18h1.8L7.1 3.9H5.2L17 20z"/></svg>`
    };
    $('#heroSocials').innerHTML = Object.entries(data.socials).map(([k, url]) =>
      `<a href="${url}" target="_blank" aria-label="${k}">${icons[k] || k}</a>`
    ).join('');

    $('#aboutText').textContent = data.about;
    $('#aboutInfo').innerHTML = `
      <div><strong>📍 Location:</strong> ${data.location}</div>
      <div><strong>📧 Email:</strong> ${data.email}</div>
      <div><strong>📞 Phone:</strong> ${data.phone}</div>
      <div><strong>💼 Status:</strong> ${data.availability}</div>
    `;

    const statsGrid = $('#statsGrid');
    statsGrid.innerHTML = data.stats.map(s => `
      <div class="stat-card reveal">
        <div class="stat-num" data-target="${s.value}" data-suffix="${s.suffix}">0${s.suffix}</div>
        <div class="stat-label">${s.label}</div>
      </div>
    `).join('');
    const statObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const n = e.target.querySelector('.stat-num');
          animateCounter(n, +n.dataset.target, n.dataset.suffix);
          statObs.unobserve(e.target);
        }
      });
    }, { threshold: .5 });
    statsGrid.querySelectorAll('.stat-card').forEach(c => statObs.observe(c));

    const timeline = $('#timeline');
    const items = [
      ...(data.experience || []).map(e => ({ title: e.role, sub: e.company, year: e.year, desc: e.desc })),
      ...(data.education || []).map(e => ({ title: e.degree, sub: e.school, year: e.year }))
    ];
    timeline.innerHTML = items.map(i => `
      <div class="tl-item">
        <div class="tl-head">
          <div class="tl-title">${i.title}</div>
          <div class="tl-year">${i.year}</div>
        </div>
        <div class="tl-sub">${i.sub}</div>
        ${i.desc ? `<p class="tl-desc">${i.desc}</p>` : ''}
      </div>
    `).join('');

    renderSkills(data.skills, 'all');
    $('#skillFilters').addEventListener('click', e => {
      const tab = e.target.closest('.tab');
      if (!tab) return;
      $$('#skillFilters .tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderSkills(data.skills, tab.dataset.filter);
    });

    $('#contactItems').innerHTML = `
      <a class="contact-item" href="mailto:${data.email}">
        <div class="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg></div>
        <div><div class="label">Email</div><div class="value">${data.email}</div></div>
      </a>
      <a class="contact-item" href="tel:${data.phone.replace(/\s/g,'')}">
        <div class="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg></div>
        <div><div class="label">Phone</div><div class="value">${data.phone}</div></div>
      </a>
      <div class="contact-item">
        <div class="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>
        <div><div class="label">Location</div><div class="value">${data.location}</div></div>
      </div>
    `;

    observeReveals();
    initMagnets();
  } catch (err) {
    console.error(err);
    toast('Failed to load profile', 'error');
  }
}

function renderSkills(skills, filter) {
  const grid = $('#skillsGrid');
  const list = filter === 'all' ? skills : skills.filter(s => s.category === filter);
  grid.innerHTML = list.map(s => `
    <div class="skill-card reveal">
      <div class="skill-header">
        <span class="skill-name">${s.name}</span>
        <span class="skill-percent">${s.level}%</span>
      </div>
      <div class="skill-bar"><div class="skill-fill" data-level="${s.level}"></div></div>
    </div>
  `).join('');
  const barObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const f = e.target.querySelector('.skill-fill');
        setTimeout(() => f.style.width = f.dataset.level + '%', 100);
        barObs.unobserve(e.target);
      }
    });
  }, { threshold: .3 });
  grid.querySelectorAll('.skill-card').forEach(c => barObs.observe(c));
  observeReveals();
}

const form = $('#contactForm'), submitBtn = $('#submitBtn');
['name', 'email', 'message'].forEach(id => {
  const input = document.getElementById(id);
  input.addEventListener('blur', () => validateField(id));
  input.addEventListener('input', () => {
    if (input.closest('.field').classList.contains('error')) validateField(id);
  });
});
function validateField(id) {
  const input = document.getElementById(id);
  const field = input.closest('.field');
  const errorEl = document.getElementById(id + 'Error');
  const val = input.value.trim();
  let error = '';
  if (id === 'name' && val.length < 2) error = 'Name must be at least 2 characters';
  if (id === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) error = 'Enter a valid email';
  if (id === 'message' && val.length < 10) error = 'Message must be at least 10 characters';
  errorEl.textContent = error;
  field.classList.toggle('error', !!error);
  return !error;
}
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const ok = ['name', 'email', 'message'].every(validateField);
  if (!ok) return toast('Please fix the errors', 'error');
  submitBtn.disabled = true;
  submitBtn.classList.add('loading');
  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: $('#name').value.trim(),
        email: $('#email').value.trim(),
        message: $('#message').value.trim()
      })
    });
    const data = await res.json();
    if (res.ok) {
      toast(data.message || 'Message sent!', 'success');
      form.reset();
      $$('.field').forEach(f => f.classList.remove('filled'));
    } else toast(data.error || 'Something went wrong', 'error');
  } catch { toast('Network error. Try again.', 'error'); }
  finally {
    submitBtn.disabled = false;
    submitBtn.classList.remove('loading');
  }
});

$('#year').textContent = new Date().getFullYear();
loadProfile();
observeReveals();
