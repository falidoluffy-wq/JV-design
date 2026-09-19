import * as THREE from 'three';

// ==========================
// CONFIGURAÇÕES DA JV DESIGN
// ==========================
const CONTACT_EMAIL = 'contato@jvdesign.com.br';
const WHATSAPP_NUMBER = ''; // Ex.: 5547999999999 (DDI + DDD + número, somente dígitos)

// Reveal on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });

document.querySelectorAll('.reveal').forEach((el, index) => {
  el.style.transitionDelay = `${Math.min(index % 4, 3) * 45}ms`;
  observer.observe(el);
});

// Custom cursor (desktop only)
const cursor = document.querySelector('.cursor');
if (window.matchMedia('(pointer:fine)').matches && cursor) {
  window.addEventListener('mousemove', (event) => {
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
  });
  document.querySelectorAll('a, button, .service-item, .project-card').forEach((item) => {
    item.addEventListener('mouseenter', () => cursor.classList.add('big'));
    item.addEventListener('mouseleave', () => cursor.classList.remove('big'));
  });
}

// Mobile menu
const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
function closeMenu() {
  menuToggle?.classList.remove('active');
  mobileMenu?.classList.remove('open');
  menuToggle?.setAttribute('aria-expanded', 'false');
  mobileMenu?.setAttribute('aria-hidden', 'true');
}
menuToggle?.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  menuToggle.classList.toggle('active', isOpen);
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  mobileMenu.setAttribute('aria-hidden', String(!isOpen));
});
mobileMenu?.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));

// Contact links
const whatsappLink = document.querySelector('[data-whatsapp]');
if (whatsappLink && WHATSAPP_NUMBER) {
  const text = encodeURIComponent('Olá! Vim pelo site da JV Design e gostaria de conversar sobre um projeto.');
  whatsappLink.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
  whatsappLink.textContent = 'CONVERSAR NO WHATSAPP ↗';
  whatsappLink.target = '_blank';
  whatsappLink.rel = 'noopener';
}

// Contact form -> mail app. This keeps the demo backend-free.
const form = document.querySelector('#contact-form');
form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const name = data.get('name') || '';
  const company = data.get('company') || '';
  const service = data.get('service') || '';
  const message = data.get('message') || '';
  const subject = encodeURIComponent(`Novo projeto — ${service} — ${name}`);
  const body = encodeURIComponent(
    `Olá, JV Design!\n\nNome: ${name}\nEmpresa: ${company}\nProjeto: ${service}\n\nMensagem:\n${message}\n`
  );
  window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
});

// ==========================
// THREE.JS — HERO 3D
// ==========================
const canvas = document.querySelector('#three-canvas');
const heroVisual = document.querySelector('.hero-visual');
const fallback = document.querySelector('.fallback-visual');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (canvas && heroVisual) {
  try {
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.075);

    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.set(0.2, 1.0, 12.5);

    const rig = new THREE.Group();
    scene.add(rig);

    // Floating layered interfaces: structure → design → code → result.
    const panelGroup = new THREE.Group();
    panelGroup.rotation.set(-0.45, -0.34, -0.10);
    rig.add(panelGroup);

    const panelData = [
      { z: -1.7, y: 1.15, scale: .86, color: 0x161616, edge: 0x414141 },
      { z: -0.65, y: .38, scale: .94, color: 0x0d0d0d, edge: 0x707070 },
      { z: 0.45, y: -.36, scale: 1.0, color: 0x191919, edge: 0x989898 },
      { z: 1.6, y: -1.12, scale: 1.06, color: 0xeeeeea, edge: 0xffffff },
    ];

    const panels = [];
    panelData.forEach((data, index) => {
      const group = new THREE.Group();
      group.position.set((index - 1.5) * 0.08, data.y, data.z);
      group.scale.setScalar(data.scale);

      const geometry = new THREE.BoxGeometry(5.35, 3.15, 0.105, 1, 1, 1);
      const material = new THREE.MeshStandardMaterial({
        color: data.color,
        roughness: index === 3 ? 0.58 : 0.72,
        metalness: index === 3 ? 0.05 : 0.28,
      });
      const panel = new THREE.Mesh(geometry, material);
      group.add(panel);

      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(geometry),
        new THREE.LineBasicMaterial({ color: data.edge, transparent: true, opacity: .7 })
      );
      group.add(edges);

      // UI lines, intentionally abstract rather than fake website screenshots.
      const lineMaterial = new THREE.MeshBasicMaterial({ color: index === 3 ? 0x252525 : 0xb7b7b2 });
      const subtleMaterial = new THREE.MeshBasicMaterial({ color: index === 3 ? 0x9a9a95 : 0x555555 });
      const addLine = (w, h, x, y, mat = lineMaterial) => {
        const line = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
        line.position.set(x, y, .056);
        group.add(line);
      };
      addLine(1.55, .045, -1.55, 1.08, subtleMaterial);
      addLine(3.65, .16, -.55, .48, lineMaterial);
      addLine(2.65, .16, -1.05, .15, lineMaterial);
      addLine(1.48, .55, -1.58, -.86, subtleMaterial);
      addLine(1.48, .55, .04, -.86, subtleMaterial);
      addLine(1.48, .55, 1.66, -.86, subtleMaterial);

      // A small index chip.
      const chip = new THREE.Mesh(new THREE.PlaneGeometry(.32, .32), lineMaterial);
      chip.position.set(2.14, 1.05, .057);
      group.add(chip);

      panelGroup.add(group);
      panels.push(group);
    });

    // Thin structural frame behind panels.
    const frameGeo = new THREE.TorusGeometry(3.15, .012, 6, 100);
    const frameMat = new THREE.MeshBasicMaterial({ color: 0x383838, transparent: true, opacity: .6 });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.rotation.x = Math.PI / 2;
    frame.scale.y = .72;
    frame.position.z = -2.8;
    rig.add(frame);

    const ambient = new THREE.AmbientLight(0xffffff, 1.8);
    scene.add(ambient);
    const key = new THREE.DirectionalLight(0xffffff, 3.7);
    key.position.set(4, 7, 7);
    scene.add(key);
    const rim = new THREE.PointLight(0x888888, 20, 25, 2);
    rim.position.set(-5, -1, 6);
    scene.add(rim);

    const pointer = { x: 0, y: 0 };
    heroVisual.addEventListener('pointermove', (event) => {
      const rect = heroVisual.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width - .5) * 2;
      pointer.y = ((event.clientY - rect.top) / rect.height - .5) * 2;
    });
    heroVisual.addEventListener('pointerleave', () => { pointer.x = 0; pointer.y = 0; });

    let scrollProgress = 0;
    const updateScroll = () => {
      const rect = heroVisual.getBoundingClientRect();
      const viewport = window.innerHeight;
      scrollProgress = THREE.MathUtils.clamp((viewport - rect.top) / (viewport + rect.height), 0, 1);
    };
    window.addEventListener('scroll', updateScroll, { passive: true });
    updateScroll();

    function resize() {
      const width = heroVisual.clientWidth;
      const height = heroVisual.clientHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      const mobile = width < 520;
      camera.position.z = mobile ? 14.6 : 12.5;
      panelGroup.scale.setScalar(mobile ? .84 : 1);
    }
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(heroVisual);
    resize();

    const clock = new THREE.Clock();
    let visible = true;
    const heroObserver = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { threshold: 0.01 });
    heroObserver.observe(heroVisual);

    function animate() {
      requestAnimationFrame(animate);
      if (!visible) return;
      const t = clock.getElapsedTime();

      if (!reducedMotion) {
        rig.rotation.y += ((pointer.x * .09) - rig.rotation.y) * .045;
        rig.rotation.x += ((-pointer.y * .055) - rig.rotation.x) * .045;
        panelGroup.rotation.z = -0.10 + Math.sin(t * .28) * .018;
        panelGroup.position.y = Math.sin(t * .55) * .08;
        frame.rotation.z = t * .025;
      }

      // Scroll subtly separates layers instead of creating a flashy effect.
      panels.forEach((panel, index) => {
        const baseY = panelData[index].y;
        const direction = (index - 1.5);
        panel.position.y = baseY + direction * scrollProgress * .34;
        panel.position.z = panelData[index].z + direction * scrollProgress * .28;
      });

      renderer.render(scene, camera);
    }
    animate();
  } catch (error) {
    console.warn('Three.js/WebGL indisponível. Usando fallback visual.', error);
    canvas.style.display = 'none';
    fallback.style.display = 'grid';
  }
}
