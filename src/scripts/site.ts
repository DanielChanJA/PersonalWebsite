const header = document.querySelector<HTMLElement>(".site-header");
const nav = document.querySelector<HTMLElement>(".site-nav");
const toggle = document.querySelector<HTMLButtonElement>(".nav-toggle");
const navLinks = document.querySelectorAll<HTMLAnchorElement>('.site-nav a[href*="#"]');
const sections = document.querySelectorAll<HTMLElement>("main > section[id]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function getHashTarget(): HTMLElement | null {
  if (!window.location.hash) return null;

  try {
    return document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
  } catch {
    return null;
  }
}

function revealHashTarget(): void {
  const target = getHashTarget();
  if (!target) return;

  if (target.matches(".reveal")) target.classList.add("visible");
  target.querySelectorAll<HTMLElement>(".reveal").forEach((element) => {
    element.classList.add("visible");
  });
}

function setMenu(open: boolean): void {
  if (!nav || !toggle || !header) return;

  nav.classList.toggle("open", open);
  header.classList.toggle("menu-visible", open);
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  const label = toggle.querySelector<HTMLElement>(".sr-only");
  if (label) label.textContent = open ? "Close navigation" : "Open navigation";
  document.body.classList.toggle("nav-open", open);
}

function updateHeader(): void {
  header?.classList.toggle("scrolled", window.scrollY > 24);
}

revealHashTarget();
window.addEventListener("hashchange", revealHashTarget);

toggle?.addEventListener("click", () => {
  setMenu(toggle.getAttribute("aria-expanded") !== "true");
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenu(false);
});

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

if ("IntersectionObserver" in window && !reduceMotion) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -45px" });

  document.querySelectorAll<HTMLElement>(".reveal").forEach((element) => {
    revealObserver.observe(element);
  });

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        link.classList.toggle("active", link.hash === `#${entry.target.id}`);
      });
    });
  }, { rootMargin: "-35% 0px -55%", threshold: 0 });

  sections.forEach((section) => sectionObserver.observe(section));
} else {
  document.querySelectorAll<HTMLElement>(".reveal").forEach((element) => {
    element.classList.add("visible");
  });
}

// Opt in to enhanced-only CSS only after every behavior has initialized.
document.documentElement.classList.add("js");
