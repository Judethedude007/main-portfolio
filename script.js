// Scroll Reveal Animation using Intersection Observer
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Optional: Stop observing after animation plays
            // observer.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.15
});

// Observe all reveal and stagger elements
document.querySelectorAll('.reveal, .stagger').forEach(el => {
    observer.observe(el);
});

// Form submission handler
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const budget = document.getElementById('budget').value;
        const message = document.getElementById('message').value;
        
        // Simple validation
        if (!name || !email || !budget || !message) {
            alert('Please fill in all fields');
            return;
        }
        
        // Show success message
        alert(`Thank you ${name}! I'll get back to you at ${email} soon.`);
        
        // Reset form
        contactForm.reset();
    });
}

// Smooth navigation for social links
document.querySelectorAll('a[href="#"]').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
    });
});

// ── Hero node-network canvas ─────────────────────────────────────────────
(function () {
    const canvas  = document.getElementById('hero-canvas');
    const section = document.querySelector('.section-hero');
    if (!canvas || !section) return;
    const ctx = canvas.getContext('2d');

    const ORANGE  = '255,107,69';
    const GREEN   = '163,255,0';
    const COUNT   = 68;
    const LINK_D  = 135;
    const MOUSE_R = 150;

    let W, H, cW, cH;
    let mouse = { x: -9999, y: -9999 };
    let nodes = [];
    let running = false;

    function resize() {
        const r = section.getBoundingClientRect();
        cW = r.width;
        cH = r.height;
        W  = canvas.width  = Math.round(cW * devicePixelRatio);
        H  = canvas.height = Math.round(cH * devicePixelRatio);
        ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

        // nodes spawn only in the right 52% so they never cover headings
        const xMin = cW * 0.48;
        nodes = Array.from({ length: COUNT }, () => ({
            x:  xMin + Math.random() * (cW - xMin),
            y:  Math.random() * cH,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            r:  Math.random() * 1.6 + 1.0,
            hue: Math.random() < 0.18 ? GREEN : ORANGE,
            xMin
        }));
    }

    function draw() {
        ctx.clearRect(0, 0, cW, cH);

        nodes.forEach(n => {
            // mouse repulsion
            const dx = n.x - mouse.x;
            const dy = n.y - mouse.y;
            const d  = Math.sqrt(dx * dx + dy * dy);
            if (d < MOUSE_R && d > 0) {
                const f = (MOUSE_R - d) / MOUSE_R * 0.65;
                n.vx += (dx / d) * f;
                n.vy += (dy / d) * f;
            }
            // speed cap + friction
            const spd = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
            if (spd > 1.9) { n.vx = n.vx / spd * 1.9; n.vy = n.vy / spd * 1.9; }
            n.vx *= 0.991; n.vy *= 0.991;
            n.x  += n.vx;  n.y  += n.vy;
            // bounce inside right region
            if (n.x < n.xMin) { n.x = n.xMin; n.vx *= -1; }
            if (n.x > cW)     { n.x = cW;     n.vx *= -1; }
            if (n.y < 0)      { n.y = 0;      n.vy *= -1; }
            if (n.y > cH)     { n.y = cH;     n.vy *= -1; }
        });

        // lines
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const a = nodes[i], b = nodes[j];
                const dx = a.x - b.x, dy = a.y - b.y;
                const d  = Math.sqrt(dx * dx + dy * dy);
                if (d < LINK_D) {
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.strokeStyle = `rgba(${a.hue},${(1 - d / LINK_D) * 0.30})`;
                    ctx.lineWidth = 0.75;
                    ctx.stroke();
                }
            }
        }

        // nodes
        nodes.forEach(n => {
            const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 6);
            g.addColorStop(0, `rgba(${n.hue},0.50)`);
            g.addColorStop(1, `rgba(${n.hue},0)`);
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.r * 6, 0, Math.PI * 2);
            ctx.fillStyle = g;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${n.hue},1)`;
            ctx.fill();
        });

        requestAnimationFrame(draw);
    }

    section.addEventListener('mousemove', e => {
        const r = section.getBoundingClientRect();
        mouse.x = e.clientX - r.left;
        mouse.y = e.clientY - r.top;
    });
    section.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

    // Touch support — lets fingers repel nodes on mobile
    section.addEventListener('touchmove', e => {
        const r = section.getBoundingClientRect();
        const t = e.touches[0];
        mouse.x = t.clientX - r.left;
        mouse.y = t.clientY - r.top;
    }, { passive: true });
    section.addEventListener('touchend', () => { mouse.x = -9999; mouse.y = -9999; });
    window.addEventListener('resize', resize);

    // defer until after first paint so getBoundingClientRect is accurate
    requestAnimationFrame(() => {
        resize();
        if (!running) { running = true; draw(); }
        setTimeout(() => { canvas.style.opacity = '1'; }, 300);
    });
}());


// Initialize animations on page load + all dynamics
document.addEventListener('DOMContentLoaded', function () {

    // ── 1. CUSTOM TRAILING CURSOR ──────────────────────────────────────────
    (function () {
        // Disable custom cursor on touch / mobile devices
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

        const dot  = document.getElementById('cursor-dot');
        const ring = document.getElementById('cursor-ring');
        if (!dot || !ring) return;

        let mx = window.innerWidth  / 2;
        let my = window.innerHeight / 2;
        let rx = mx, ry = my;

        document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
        document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
        document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });

        // hover state on interactive elements
        document.querySelectorAll('a, button, .nav-icon, .social-icon, .arrow-link, .tool-card, .project-row, .tool-icon-item, .tools-more-btn').forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
        });

        function loop() {
            // dot: instant
            dot.style.transform  = `translate(calc(${mx}px - 50%), calc(${my}px - 50%))`;
            // ring: lerp 0.12
            rx += (mx - rx) * 0.12;
            ry += (my - ry) * 0.12;
            ring.style.transform = `translate(calc(${rx}px - 50%), calc(${ry}px - 50%))`;
            requestAnimationFrame(loop);
        }
        loop();
    }());

    // ── 2. MAGNETIC BUTTONS ───────────────────────────────────────────────
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mousemove', e => {
            const r  = btn.getBoundingClientRect();
            const cx = r.left + r.width  / 2;
            const cy = r.top  + r.height / 2;
            const dx = (e.clientX - cx) * 0.38;
            const dy = (e.clientY - cy) * 0.38;
            btn.style.transform = `translate(${dx}px, ${dy}px)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
        });
    });

    // ── 3. STAT COUNTERS ──────────────────────────────────────────────────
    const statEls = document.querySelectorAll('.stat-number[data-count]');
    const countObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el     = entry.target;
            const end    = parseInt(el.dataset.count, 10);
            const suffix = el.dataset.suffix || '';
            const dur    = 1800;
            const start  = performance.now();
            function tick(now) {
                const progress = Math.min((now - start) / dur, 1);
                const eased = 1 - Math.pow(1 - progress, 4);
                el.textContent = Math.floor(eased * end) + suffix;
                if (progress < 1) requestAnimationFrame(tick);
                else el.textContent = end + suffix;
            }
            requestAnimationFrame(tick);
            countObserver.unobserve(el);
        });
    }, { threshold: 0.6 });
    statEls.forEach(el => countObserver.observe(el));

    // ── 4. ACTIVE NAV ON SCROLL ───────────────────────────────────────────
    const sections  = document.querySelectorAll('section[id]');
    const navLinks  = document.querySelectorAll('.nav-icon');
    const navObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(l => l.classList.remove('active'));
                const active = document.querySelector(`.nav-icon[href="#${entry.target.id}"]`);
                if (active) active.classList.add('active');
            }
        });
    }, { threshold: 0.4 });
    sections.forEach(s => navObserver.observe(s));

    // ── 4b. PROFILE CARD SUBTLE PARALLAX ─────────────────────────────────
    const sidebar = document.querySelector('.sticky-sidebar');
    if (sidebar && window.innerWidth > 820) {
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const scrollY = window.scrollY;
                    const shift = Math.sin(scrollY * 0.0015) * 22;
                    sidebar.style.transform = `translateY(${shift}px)`;
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    // ── 5. CHARACTER-SPLIT HERO TEXT ──────────────────────────────────────
    document.querySelectorAll('.hero-main, .hero-ghost').forEach((h, hi) => {
        const text = h.textContent.trim();
        h.textContent = '';
        [...text].forEach((ch, i) => {
            const span = document.createElement('span');
            span.className = 'char';
            span.textContent = ch === ' ' ? '\u00a0' : ch;
            span.style.animationDelay = `${0.38 + hi * 0.15 + i * 0.045}s`;
            h.appendChild(span);
        });
        // trigger after a frame so CSS transition fires
        requestAnimationFrame(() => h.classList.add('chars-ready'));
    });

    // check viewport on load for reveal elements
    document.querySelectorAll('.reveal, .stagger').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) el.classList.add('visible');
    });

    // ── 6. PROJECT MODALS ─────────────────────────────────────────────────
    function openModal(id) {
        const modal = document.getElementById('modal-' + id);
        if (!modal) return;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeAllModals() {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
        document.body.style.overflow = '';
    }

    // single delegated listener on body for all modal interactions
    document.body.addEventListener('click', function (e) {
        // open — clicked inside a project row (but not a real <a> link)
        const row = e.target.closest('.project-row[data-project]');
        if (row && !e.target.closest('a')) {
            openModal(row.dataset.project);
            return;
        }
        // close — clicked the ✕ button
        const closeBtn = e.target.closest('.modal-close[data-modal]');
        if (closeBtn) {
            closeAllModals();
            return;
        }
        // close — clicked the backdrop (the overlay itself)
        if (e.target.classList.contains('modal-overlay')) {
            closeAllModals();
        }
    });

    // Escape key
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeAllModals();
    });

    // ── 7. TOOLS EXPAND TOGGLE ────────────────────────────────────────────
    const toolsBtn      = document.getElementById('tools-more-btn');
    const toolsExpanded = document.getElementById('tools-expanded');
    if (toolsBtn && toolsExpanded) {
        toolsBtn.addEventListener('click', () => {
            const isOpen = toolsExpanded.classList.toggle('open');
            toolsBtn.classList.toggle('open', isOpen);
            toolsBtn.querySelector('.tools-more-label').textContent = isOpen ? 'Show Less' : 'View All Tools';
            toolsBtn.setAttribute('aria-expanded', isOpen);
        });
    }

    // ── 8. CONTACT FORM (FORMSPREE) ───────────────────────────────────────
    const contactForm = document.getElementById('contact-form');
    const formToast   = document.getElementById('form-toast');
    const submitBtn   = document.getElementById('form-submit-btn');
    if (contactForm) {
        contactForm.addEventListener('submit', async e => {
            e.preventDefault();
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            try {
                const res = await fetch(contactForm.action, {
                    method: 'POST',
                    body: new FormData(contactForm),
                    headers: { 'Accept': 'application/json' }
                });
                if (res.ok) {
                    contactForm.reset();
                    submitBtn.textContent = 'Send Message';
                    submitBtn.disabled = false;
                    formToast.classList.add('show');
                    setTimeout(() => formToast.classList.remove('show'), 5000);
                } else {
                    submitBtn.textContent = 'Try Again';
                    submitBtn.disabled = false;
                }
            } catch {
                submitBtn.textContent = 'Try Again';
                submitBtn.disabled = false;
            }
        });
    }

});

