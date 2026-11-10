document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.main-nav');
  const navLinks = document.querySelectorAll('.main-nav a');
  const yearEl = document.getElementById('year');
  const contactForm = document.getElementById('contactForm');
  const pageShell = document.querySelector('.page-shell');
  const explosionPrompt = document.getElementById('explosionPrompt');
  const newYearStage = document.getElementById('newYearStage');
  const fireworksCanvas = document.getElementById('fireworksCanvas');
  const stormLayer = document.getElementById('stormLayer');
  const stormFlash = document.getElementById('stormFlash');
  const closeNewYearModal = document.getElementById('closeNewYearModal');
  let stormLoopTimer = null;
  let overlayTimer = null;
  let overlayHideTimer = null;
  let stopFireworksFrame = null;

  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  if (contactForm) {
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const name = document.getElementById('name')?.value.trim();
      const email = document.getElementById('email')?.value.trim();
      const message = document.getElementById('message')?.value.trim();

      if (!name || !email || !message) {
        alert('Vui lòng điền đầy đủ thông tin trước khi gửi.');
        return;
      }

      const submitButton = contactForm.querySelector('button[type="submit"]');
      if (submitButton) {
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Đã Gửi!';
        submitButton.disabled = true;

        setTimeout(() => {
          submitButton.textContent = originalText;
          submitButton.disabled = false;
          contactForm.reset();
          alert('Cảm ơn bạn! Tin nhắn của bạn đã được gửi thành công.');
        }, 1800);
      }
    });
  }

  function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }

  function createLightningBolt() {
    if (!stormLayer) return;

    const bolt = document.createElement('div');
    bolt.className = 'lightning-bolt';
    bolt.style.left = `${randomBetween(8, 92)}vw`;
    bolt.style.height = `${randomBetween(26, 62)}vh`;
    bolt.style.transform = `skewX(${randomBetween(-18, 18)}deg)`;
    stormLayer.appendChild(bolt);

    setTimeout(() => bolt.remove(), 320);
  }

  function triggerStormFlash() {
    if (!stormFlash) return;

    stormFlash.classList.remove('flash');
    void stormFlash.offsetWidth;
    stormFlash.classList.add('flash');
    createLightningBolt();
  }

  function stopStormLoop() {
    if (stormLoopTimer) {
      clearTimeout(stormLoopTimer);
      stormLoopTimer = null;
    }
  }

  function lightningLoop() {
    triggerStormFlash();
    const delay = randomBetween(1400, 4500);
    stormLoopTimer = setTimeout(lightningLoop, delay);
  }

  stormLoopTimer = setTimeout(lightningLoop, randomBetween(600, 1800));

  function createBurstParticles(x, y) {
    const burstCount = 42;

    for (let i = 0; i < burstCount; i += 1) {
      const particle = document.createElement('span');
      particle.className = 'burst-particle';
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.background = `hsl(${Math.random() * 360}, 100%, 70%)`;
      particle.style.setProperty('--dx', `${randomBetween(-110, 110)}px`);
      particle.style.setProperty('--dy', `${randomBetween(-110, 110)}px`);
      document.body.appendChild(particle);

      setTimeout(() => particle.remove(), 800);
    }
  }

  function stopFireworks() {
    if (stopFireworksFrame) {
      cancelAnimationFrame(stopFireworksFrame);
      stopFireworksFrame = null;
    }

    if (fireworksCanvas) {
      const ctx = fireworksCanvas.getContext('2d');
      ctx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);
    }
  }

  function startFireworks() {
    if (!fireworksCanvas) return;

    const ctx = fireworksCanvas.getContext('2d');
    const fireworks = [];
    const particles = [];

    const resizeCanvas = () => {
      const ratio = window.devicePixelRatio || 1;
      fireworksCanvas.width = window.innerWidth * ratio;
      fireworksCanvas.height = window.innerHeight * ratio;
      fireworksCanvas.style.width = `${window.innerWidth}px`;
      fireworksCanvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    function createRocket() {
      fireworks.push({
        x: Math.random() * window.innerWidth,
        y: window.innerHeight,
        targetX: Math.random() * window.innerWidth,
        targetY: Math.random() * (window.innerHeight * 0.45),
        hue: Math.random() * 360,
        speed: 3 + Math.random() * 2
      });
    }

    function explode(x, y, hue) {
      for (let i = 0; i < 54; i += 1) {
        const angle = (Math.PI * 2 * i) / 54;
        const speed = 2 + Math.random() * 4;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 80 + Math.random() * 50,
          hue,
          size: 2 + Math.random() * 2.8
        });
      }
    }

    function render() {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      if (Math.random() < 0.08) {
        createRocket();
      }

      for (let i = fireworks.length - 1; i >= 0; i -= 1) {
        const rocket = fireworks[i];
        rocket.x += (rocket.targetX - rocket.x) * 0.08;
        rocket.y += (rocket.targetY - rocket.y) * 0.08;

        ctx.beginPath();
        ctx.fillStyle = `hsl(${rocket.hue}, 100%, 60%)`;
        ctx.arc(rocket.x, rocket.y, 3, 0, Math.PI * 2);
        ctx.fill();

        if (Math.abs(rocket.targetY - rocket.y) < 6) {
          explode(rocket.x, rocket.y, rocket.hue);
          fireworks.splice(i, 1);
        }
      }

      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const particle = particles[i];
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.05;
        particle.life -= 1;

        if (particle.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.fillStyle = `hsla(${particle.hue}, 100%, 65%, ${Math.max(particle.life / 100, 0.1)})`;
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      }

      stopFireworksFrame = requestAnimationFrame(render);
    }

    stopFireworksFrame = requestAnimationFrame(render);
  }

  function closeNewYearOverlay() {
    if (!newYearStage || !fireworksCanvas) return;

    newYearStage.classList.add('closing');
    newYearStage.classList.remove('show');
    fireworksCanvas.classList.add('closing');
    fireworksCanvas.classList.remove('show');

    if (closeNewYearModal) {
      closeNewYearModal.classList.remove('visible');
    }

    if (pageShell) {
      pageShell.classList.remove('exploded');
    }

    stopFireworks();
    stopStormLoop();

    setTimeout(() => {
      if (newYearStage) {
        newYearStage.classList.remove('closing');
      }
      if (fireworksCanvas) {
        fireworksCanvas.classList.remove('closing');
      }
    }, 900);
  }

  let hasTriggeredExplosion = false;

  if (closeNewYearModal) {
    closeNewYearModal.addEventListener('click', () => {
      closeNewYearOverlay();
    });
  }

  document.addEventListener(
    'click',
    (event) => {
      if (hasTriggeredExplosion) return;
      hasTriggeredExplosion = true;

      if (explosionPrompt) {
        explosionPrompt.classList.add('hidden');
      }

      if (pageShell) {
        pageShell.classList.add('exploded');
      }

      createBurstParticles(event.clientX, event.clientY);

      setTimeout(() => {
        if (newYearStage) {
          newYearStage.classList.add('show');
        }

        if (fireworksCanvas) {
          fireworksCanvas.classList.add('show');
          startFireworks();
        }
      }, 700);

      overlayTimer = setTimeout(() => {
        if (closeNewYearModal) {
          closeNewYearModal.classList.add('visible');
        }
      }, 5200);

      overlayHideTimer = setTimeout(() => {
        closeNewYearOverlay();
      }, 7000);
    },
    { once: true }
  );
});
