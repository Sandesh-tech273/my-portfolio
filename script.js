/* ════════════════════════════════════
   SANDESH PORTFOLIO — script.js
   ════════════════════════════════════ */

document.addEventListener("DOMContentLoaded", () => {

    /* ── 1. CUSTOM CURSOR ─────────────── */
    const dot  = document.querySelector(".cursor-dot");
    const ring = document.querySelector(".cursor-ring");

    if (dot && ring && window.matchMedia("(pointer: fine)").matches) {
        let mx = -100, my = -100, rx = -100, ry = -100;

        document.addEventListener("mousemove", e => {
            mx = e.clientX; my = e.clientY;
            dot.style.left = mx + "px";
            dot.style.top  = my + "px";
        });

        (function animRing() {
            rx += (mx - rx) * 0.14;
            ry += (my - ry) * 0.14;
            ring.style.left = rx + "px";
            ring.style.top  = ry + "px";
            requestAnimationFrame(animRing);
        })();

        document.querySelectorAll("a, button, .skill-card, .project-card").forEach(el => {
            el.addEventListener("mouseenter", () => {
                ring.style.width  = "50px";
                ring.style.height = "50px";
                ring.style.background = "rgba(99,210,190,0.1)";
            });
            el.addEventListener("mouseleave", () => {
                ring.style.width  = "30px";
                ring.style.height = "30px";
                ring.style.background = "transparent";
            });
        });
    } else {
        if (dot)  dot.style.display  = "none";
        if (ring) ring.style.display = "none";
    }

    /* ── 2. SCROLL REVEAL ─────────────── */
    const revealObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                revealObs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -36px 0px" });

    document.querySelectorAll(".reveal").forEach(el => revealObs.observe(el));

    /* ── 3. TYPED HERO TEXT ─────────────── */
    const typedEl = document.getElementById("typed-word");
    if (typedEl) {
        const words = ["experiences", "products", "interfaces", "solutions"];
        let wi = 0, ci = words[0].length, deleting = false;
        const typeSpeed = 82, deleteSpeed = 42, pauseMs = 2000;

        // Start already showing first word
        typedEl.textContent = words[0];

        function tick() {
            const word = words[wi];
            if (!deleting && ci === word.length) {
                setTimeout(() => { deleting = true; tick(); }, pauseMs);
                return;
            }
            if (deleting) {
                ci--;
                typedEl.textContent = word.slice(0, ci);
                if (ci === 0) {
                    deleting = false;
                    wi = (wi + 1) % words.length;
                }
            } else {
                ci++;
                typedEl.textContent = words[wi].slice(0, ci);
            }
            setTimeout(tick, deleting ? deleteSpeed : typeSpeed);
        }
        setTimeout(tick, pauseMs);
    }

    /* ── 4. NAVBAR SCROLL ────────────────── */
    const topbar = document.getElementById("topbar");
    window.addEventListener("scroll", () => {
        topbar.classList.toggle("scrolled", window.scrollY > 50);
    }, { passive: true });

    /* ── 5. ACTIVE NAV LINK ──────────────── */
    const sections = document.querySelectorAll("section[id]");
    const navLinks  = document.querySelectorAll("[data-nav]");

    new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(a => a.classList.remove("active"));
                const active = document.querySelector(`[data-nav][href="#${entry.target.id}"]`);
                if (active) active.classList.add("active");
            }
        });
    }, { rootMargin: "-38% 0px -55% 0px" }).observe
    // observe all sections
    sections.forEach(s =>
        new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    navLinks.forEach(a => a.classList.remove("active"));
                    const link = document.querySelector(`[data-nav][href="#${e.target.id}"]`);
                    if (link) link.classList.add("active");
                }
            });
        }, { rootMargin: "-38% 0px -55% 0px" }).observe(s)
    );

    /* ── 6. CONTACT FORM ─────────────────── */
    const form = document.getElementById("contactForm");
    if (form) {
        form.addEventListener("submit", e => {
            e.preventDefault();
            const btn  = form.querySelector(".submit-btn");
            const text = btn.querySelector(".submit-text");
            const icon = btn.querySelector(".submit-icon");

            btn.style.background = "#4ade80";
            text.textContent = "Sent!";
            icon.innerHTML = `<path d="M3 8l4 4 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
            btn.disabled = true;

            setTimeout(() => {
                btn.style.background = "";
                text.textContent = "Send Message";
                icon.innerHTML = `<path d="M3 8.5h11M10 4.5l4 4-4 4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>`;
                btn.disabled = false;
                form.reset();
            }, 3000);
        });
    }

    /* ── 7. SMOOTH ANCHOR SCROLL ─────────── */
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener("click", e => {
            const target = document.querySelector(a.getAttribute("href"));
            if (target) { e.preventDefault(); target.scrollIntoView({ behavior: "smooth" }); }
        });
    });

});
