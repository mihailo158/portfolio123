const WEB3FORMS_KEY = '0563cd09-6c7a-4abf-8aae-056d31b56ec8';

/* =========================================
   1. ПРЕЛОАДЕР (0% -> 100%)
========================================= */
const preloader = document.getElementById('preloader');
const preloaderFill = document.getElementById('preloaderFill');
const preloaderCount = document.getElementById('preloaderCount');

let loadVal = 0;
const loadTimer = setInterval(() => {
  loadVal += Math.floor(Math.random() * 14) + 8;
  if (loadVal >= 100) {
    loadVal = 100;
    clearInterval(loadTimer);
    setTimeout(() => {
      preloader.classList.add('done');
      runHeroEntrance();
    }, 180);
  }
  preloaderFill.style.width = loadVal + '%';
  preloaderCount.textContent = loadVal + '%';
}, 45);

/* =========================================
   2. ПЛАВНИЙ ІНЕРЦІЙНИЙ СКРОЛ (LENIS)
========================================= */
let lenis;
let scrollProgress = 0;
let scrollVelocity = 0;

if (window.Lenis) {
  lenis = new Lenis({
    duration: 1.25,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true
  });

  lenis.on('scroll', (e) => {
    scrollProgress = e.progress || 0;
    scrollVelocity = e.velocity || 0;
    const bar = document.getElementById('scrollProgress');
    if (bar) bar.style.width = (scrollProgress * 100) + '%';
    if (window.ScrollTrigger) ScrollTrigger.update();
  });

  function rafLenis(time) {
    lenis.raf(time);
    requestAnimationFrame(rafLenis);
  }
  requestAnimationFrame(rafLenis);
} else {
  window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress = max > 0 ? window.scrollY / max : 0;
    const bar = document.getElementById('scrollProgress');
    if (bar) bar.style.width = (scrollProgress * 100) + '%';
  });
}

/* =========================================
   3. 3D WEBGL СЦЕНА, ЯКА КРУТИТЬСЯ ВІД КОЛЕСИКА
========================================= */
if (window.THREE) {
  const canvas = document.getElementById('webglCanvas');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 7.2;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Освітлення (кривавий неон + холодний блік)
  scene.add(new THREE.AmbientLight(0xffffff, 0.35));

  const redLight = new THREE.PointLight(0xff1e2d, 5.5, 25);
  redLight.position.set(4, 3, 5);
  scene.add(redLight);

  const rimLight = new THREE.PointLight(0xffffff, 2.2, 22);
  rimLight.position.set(-5, -3, 4);
  scene.add(rimLight);

  const deepLight = new THREE.PointLight(0x991b1b, 4, 20);
  deepLight.position.set(0, -5, 2);
  scene.add(deepLight);

  // Головна 3D-група
  const heroGroup = new THREE.Group();
  scene.add(heroGroup);

  // 1) Темний хромований рідкий вузол
  const knotGeo = new THREE.TorusKnotGeometry(1.45, 0.42, 160, 26);
  const knotMat = new THREE.MeshStandardMaterial({
    color: 0x16070a,
    emissive: 0x3a050b,
    metalness: 0.92,
    roughness: 0.16
  });
  const knotMesh = new THREE.Mesh(knotGeo, knotMat);
  heroGroup.add(knotMesh);

  // 2) Сяюча червона геометрична сітка навколо
  const shellGeo = new THREE.IcosahedronGeometry(2.65, 2);
  const shellMat = new THREE.MeshBasicMaterial({
    color: 0xff2a36,
    wireframe: true,
    transparent: true,
    opacity: 0.16
  });
  const shellMesh = new THREE.Mesh(shellGeo, shellMat);
  heroGroup.add(shellMesh);

  // 3) Два орбітальні кільця
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.14 });
  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(3.3, 0.012, 16, 120), ringMat);
  ring1.rotation.x = Math.PI / 2.5;
  heroGroup.add(ring1);

  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(3.9, 0.01, 16, 120), new THREE.MeshBasicMaterial({ color: 0xff2a36, transparent: true, opacity: 0.25 }));
  ring2.rotation.y = Math.PI / 3;
  heroGroup.add(ring2);

  // 4) 1000 3D-частинок у просторі
  const count = 1000;
  const posArr = new Float32Array(count * 3);
  const colArr = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    posArr[i * 3] = (Math.random() - 0.5) * 26;
    posArr[i * 3 + 1] = (Math.random() - 0.5) * 26;
    posArr[i * 3 + 2] = (Math.random() - 0.5) * 24 - 2;
    const isRed = Math.random() > 0.45;
    colArr[i * 3] = isRed ? 1.0 : 0.9;
    colArr[i * 3 + 1] = isRed ? 0.16 : 0.9;
    colArr[i * 3 + 2] = isRed ? 0.22 : 0.95;
  }
  const partGeo = new THREE.BufferGeometry();
  partGeo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
  partGeo.setAttribute('color', new THREE.BufferAttribute(colArr, 3));
  const particles = new THREE.Points(partGeo, new THREE.PointsMaterial({
    size: 0.055,
    vertexColors: true,
    transparent: true,
    opacity: 0.75
  }));
  scene.add(particles);

  // Реакція на мишку
  let mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  const clock = new THREE.Clock();
  let extraSpin = 0;

  function animate3D() {
    const t = clock.getElapsedTime();
    extraSpin += scrollVelocity * 0.0018;

    // Плавний рух 3D-фігури по екрану залежно від скролу
    const targetX = Math.sin(scrollProgress * Math.PI * 2.2) * 2.4;
    const targetY = Math.cos(scrollProgress * Math.PI * 1.5) * 0.8;
    const targetScale = 1 + Math.sin(scrollProgress * Math.PI) * 0.35;

    heroGroup.position.x += (targetX - heroGroup.position.x) * 0.06;
    heroGroup.position.y += (targetY - heroGroup.position.y) * 0.06;
    heroGroup.scale.setScalar(heroGroup.scale.x + (targetScale - heroGroup.scale.x) * 0.06);

    // Обертання від часу + від колесика миші
    knotMesh.rotation.x = t * 0.28 + scrollProgress * Math.PI * 4 + extraSpin;
    knotMesh.rotation.y = t * 0.38 + scrollProgress * Math.PI * 6;
    shellMesh.rotation.x = -t * 0.14 - scrollProgress * Math.PI * 2;
    shellMesh.rotation.y = -t * 0.22;

    ring1.rotation.z = t * 0.35 + scrollProgress * 8;
    ring2.rotation.x = t * 0.25 - scrollProgress * 6;

    // Політ крізь частинки при прокрутці
    particles.rotation.y = t * 0.03 + mouseX * 0.12;
    particles.rotation.x = scrollProgress * 1.8 + mouseY * 0.08;
    camera.position.z = 7.2 - Math.sin(scrollProgress * Math.PI) * 1.6;
    camera.position.x += (mouseX * 0.65 - camera.position.x) * 0.05;
    camera.position.y += (-mouseY * 0.45 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);

    // Живе червоне світло
    redLight.position.x = Math.sin(t * 0.9) * 5;
    redLight.position.y = Math.cos(t * 0.7) * 4;

    renderer.render(scene, camera);
    requestAnimationFrame(animate3D);
  }
  animate3D();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

/* =========================================
   4. GSAP СКРОЛ-АНІМАЦІЇ ТА ЛІЧИЛЬНИКИ
========================================= */
function runHeroEntrance() {
  if (window.gsap) {
    gsap.from('.reveal-hero', {
      y: 36,
      opacity: 0,
      duration: 0.9,
      stagger: 0.1,
      ease: 'power3.out'
    });
  }
  document.querySelectorAll('.scramble-auto').forEach(el => scrambleText(el));
  animateCounters();
}

if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);

  document.querySelectorAll('.gs-reveal').forEach((el) => {
    gsap.from(el, {
      y: 48,
      scale: 0.96,
      opacity: 0,
      duration: 0.85,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 86%',
        once: true
      }
    });
  });
}

function animateCounters() {
  document.querySelectorAll('.counter').forEach(el => {
    const target = +el.dataset.target;
    if (target === 0) { el.textContent = '0'; return; }
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 35));
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        el.textContent = target;
        clearInterval(timer);
      } else {
        el.textContent = current;
      }
    }, 30);
  });
}

/* =========================================
   5. ГЛІТЧ / СКРЕМБЛ ДЕКОДУВАННЯ ТЕКСТУ
========================================= */
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%@';
function scrambleText(el) {
  const finalText = el.dataset.text || el.textContent;
  let frame = 0;
  const interval = setInterval(() => {
    el.textContent = finalText
      .split('')
      .map((char, idx) => {
        if (char === ' ') return ' ';
        if (idx < frame) return finalText[idx];
        return chars[Math.floor(Math.random() * chars.length)];
      })
      .join('');
    frame += 0.6;
    if (frame >= finalText.length) {
      el.textContent = finalText;
      clearInterval(interval);
    }
  }, 24);
}
document.querySelectorAll('.scramble').forEach(el => {
  el.addEventListener('mouseenter', () => scrambleText(el));
});

/* =========================================
   6. 3D-НАХИЛ КАРТОК + СКЛЯНИЙ БЛІК
========================================= */
if (window.matchMedia('(pointer: fine)').matches) {
  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rx = ((y / rect.height) - 0.5) * -10;
      const ry = ((x / rect.width) - 0.5) * 10;

      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
      card.style.setProperty('--gx', `${x}px`);
      card.style.setProperty('--gy', `${y}px`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0)';
    });
  });

  // Магнітні кнопки
  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const dx = (e.clientX - rect.left - rect.width / 2) * 0.25;
      const dy = (e.clientY - rect.top - rect.height / 2) * 0.25;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0, 0)';
    });
  });

  // Кастомний скляний курсор
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  const label = document.getElementById('cursorLabel');
  let cx = 0, cy = 0, rx = 0, ry = 0;

  window.addEventListener('mousemove', (e) => {
    cx = e.clientX;
    cy = e.clientY;
    dot.style.left = cx + 'px';
    dot.style.top = cy + 'px';
  });

  function followCursor() {
    rx += (cx - rx) * 0.16;
    ry += (cy - ry) * 0.16;
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    requestAnimationFrame(followCursor);
  }
  followCursor();

  document.querySelectorAll('a, button, [data-cursor]').forEach(el => {
    el.addEventListener('mouseenter', () => {
      ring.classList.add('active');
      label.textContent = el.dataset.cursor || '';
    });
    el.addEventListener('mouseleave', () => {
      ring.classList.remove('active');
      label.textContent = '';
    });
  });
}

/* =========================================
   7. ФІЛЬТР КЕЙСІВ, FAQ, АВТОВИБІР І ФОРМА
========================================= */
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    projectCards.forEach(card => {
      card.classList.toggle('hidden', filter !== 'all' && card.dataset.category !== filter);
    });
  });
});

document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.parentElement;
    const answer = item.querySelector('.faq-answer');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(el => {
      el.classList.remove('open');
      el.querySelector('.faq-answer').style.maxHeight = null;
    });
    if (!isOpen) {
      item.classList.add('open');
      answer.style.maxHeight = answer.scrollHeight + 'px';
    }
  });
});

const serviceSelect = document.getElementById('serviceSelect');
document.querySelectorAll('.select-service').forEach(link => {
  link.addEventListener('click', () => {
    if (link.dataset.service && serviceSelect) serviceSelect.value = link.dataset.service;
  });
});

const form = document.getElementById('contactForm');
const statusText = document.getElementById('formStatus');
const submitBtn = document.getElementById('submitBtn');

form.addEventListener('submit', async function (event) {
  event.preventDefault();
  submitBtn.disabled = true;
  submitBtn.querySelector('span').textContent = 'Надсилаємо...';

  const formData = new FormData(form);
  formData.append('access_key', WEB3FORMS_KEY);
  formData.append('subject', 'Новий клієнт із портфоліо Xwaret!');

  try {
    const response = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: formData });
    const result = await response.json();
    if (result.success) {
      statusText.style.color = '#4ade80';
      statusText.textContent = 'Заявку надіслано! Скоро звʼяжуся з вами.';
      form.reset();
    } else {
      throw new Error('Error');
    }
  } catch (error) {
    statusText.style.color = '#f87171';
    statusText.textContent = 'Не вдалося надіслати. Напишіть напряму в Telegram @klm_145.';
  } finally {
    submitBtn.disabled = false;
    submitBtn.querySelector('span').textContent = 'Надіслати заявку';
  }
});
