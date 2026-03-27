(function () {
  const THEME_KEY = "flowspace-theme";
  const TIMELINE_KEY = "flowspace-timeline";

  const root = document.documentElement;
  const themeToggle = document.querySelector(".theme-toggle");
  const footerThemeLabel = document.getElementById("footer-theme-label");
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");
  const heroButtons = document.querySelectorAll("[data-scroll-target]");
  const boardButtons = document.querySelectorAll("[data-demo]");
  const timelineList = document.getElementById("timeline-list");
  const focusForm = document.getElementById("focus-form");
  const contactForm = document.getElementById("contact-form");
  const contactStatus = document.getElementById("contact-status");

  /* THEME */

  function applyTheme(theme) {
    const value = theme === "light" ? "light" : "dark";
    root.setAttribute("data-theme", value);
    localStorage.setItem(THEME_KEY, value);
    if (footerThemeLabel) {
      footerThemeLabel.textContent = value === "light" ? "clair" : "sombre";
    }
  }

  function initTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark") {
      applyTheme(stored);
    } else {
      const prefersLight = window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: light)").matches;
      applyTheme(prefersLight ? "light" : "dark");
    }
  }

  /* NAV MOBILE */

  function toggleNav() {
    if (!navLinks || !navToggle) return;
    const isOpen = navLinks.classList.toggle("nav-links--open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  }

  function closeNav() {
    if (!navLinks || !navToggle) return;
    navLinks.classList.remove("nav-links--open");
    navToggle.setAttribute("aria-expanded", "false");
  }

  /* SMOOTH SCROLL BUTTONS */

  function handleScrollButtonClick(event) {
    const targetSelector = event.currentTarget.getAttribute("data-scroll-target");
    if (!targetSelector) return;
    const target = document.querySelector(targetSelector);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* TIMELINE STORAGE */

  function loadTimeline() {
    try {
      const raw = localStorage.getItem(TIMELINE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed;
    } catch {
      return [];
    }
  }

  function saveTimeline(items) {
    try {
      localStorage.setItem(TIMELINE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }

  function renderTimelineItem(item) {
    const wrapper = document.createElement("article");
    wrapper.className = "timeline-item";

    const title = document.createElement("div");
    title.className = "timeline-title";
    title.textContent = item.title;

    const meta = document.createElement("div");
    meta.className = "timeline-meta";
    meta.textContent = item.day;

    const pill = document.createElement("span");
    pill.className = "timeline-pill";
    pill.dataset.priority = String(item.priority);
    pill.textContent =
      item.priority === 1 ? "Calme" :
      item.priority === 3 ? "Urgent" :
      "Normal";

    wrapper.appendChild(title);
    wrapper.appendChild(meta);
    wrapper.appendChild(pill);

    return wrapper;
  }

  function renderTimeline(items) {
    if (!timelineList) return;
    timelineList.innerHTML = "";
    if (!items.length) {
      const empty = document.createElement("p");
      empty.textContent = "Aucun focus pour le moment. Ajoute ton premier à droite.";
      empty.style.fontSize = "0.9rem";
      empty.style.color = "var(--text-muted)";
      timelineList.appendChild(empty);
      return;
    }
    items.forEach(function (item) {
      const node = renderTimelineItem(item);
      timelineList.appendChild(node);
    });
  }

  /* FORM HELPERS */

  function setFieldError(fieldElement, message) {
    const errorSpan = fieldElement.querySelector(".field-error");
    if (errorSpan) {
      errorSpan.textContent = message || "";
    }
  }

  function validateRequired(fieldElement, input) {
    if (!input.value.trim()) {
      setFieldError(fieldElement, "Ce champ est requis.");
      return false;
    }
    setFieldError(fieldElement, "");
    return true;
  }

  function validateEmail(fieldElement, input) {
    const value = input.value.trim();
    if (!value) {
      setFieldError(fieldElement, "Ce champ est requis.");
      return false;
    }
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!pattern.test(value)) {
      setFieldError(fieldElement, "Adresse email invalide.");
      return false;
    }
    setFieldError(fieldElement, "");
    return true;
  }

  function validateMinLength(fieldElement, input, min) {
    const value = input.value.trim();
    if (value.length < min) {
      setFieldError(fieldElement, "Minimum " + min + " caractères.");
      return false;
    }
    setFieldError(fieldElement, "");
    return true;
  }

  /* INIT */

  document.addEventListener("DOMContentLoaded", function () {
    initTheme();

    if (themeToggle) {
      themeToggle.addEventListener("click", function () {
        const current = root.getAttribute("data-theme") === "light" ? "light" : "dark";
        applyTheme(current === "light" ? "dark" : "light");
      });
    }

    if (navToggle) {
      navToggle.addEventListener("click", toggleNav);
    }

    if (navLinks) {
      navLinks.addEventListener("click", function (event) {
        const target = event.target;
        if (target instanceof HTMLAnchorElement && target.getAttribute("href") && target.getAttribute("href").startsWith("#")) {
          closeNav();
        }
      });
    }

    heroButtons.forEach(function (btn) {
      btn.addEventListener("click", handleScrollButtonClick);
    });

    /* DEMO: DUPLICATION DE TABLEAU -> AJOUT DANS TIMELINE */

    boardButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        const type = btn.getAttribute("data-demo");
        const items = loadTimeline();
        const now = new Date();
        const base = {
          day: "Cette semaine",
          priority: 2
        };

        if (type === "inspiration") {
          items.push({
            title: "Session d’inspiration UI",
            day: base.day,
            priority: 1
          });
        } else if (type === "projects") {
          items.push({
            title: "Sprint projets en cours",
            day: base.day,
            priority: 3
          });
        } else if (type === "backlog") {
          items.push({
            title: "Tri du backlog créatif",
            day: base.day,
            priority: 2
          });
        } else {
          items.push({
            title: "Nouveau focus " + now.toLocaleTimeString(),
            day: base.day,
            priority: 2
          });
        }

        saveTimeline(items);
        renderTimeline(items);
      });
    });

    /* TIMELINE INIT */

    const initialTimeline = loadTimeline();
    renderTimeline(initialTimeline);

    if (focusForm) {
      focusForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const titleField = focusForm.querySelector('label.field:nth-of-type(1)');
        const dayField = focusForm.querySelector('label.field:nth-of-type(2)');

        if (!titleField || !dayField) return;

        const titleInput = titleField.querySelector("input");
        const daySelect = dayField.querySelector("select");
        const priorityInput = focusForm.querySelector('input[name="priority"]');

        if (!titleInput || !daySelect || !priorityInput) return;

        let valid = true;
        if (!validateRequired(titleField, titleInput)) valid = false;
        if (!validateRequired(dayField, daySelect)) valid = false;

        if (!valid) return;

        const items = loadTimeline();
        items.push({
          title: titleInput.value.trim(),
          day: daySelect.value,
          priority: Number(priorityInput.value) || 2
        });

        saveTimeline(items);
        renderTimeline(items);

        focusForm.reset();
        priorityInput.value = "2";
      });
    }

    /* CONTACT FORM */

    if (contactForm && contactStatus) {
      contactForm.addEventListener("submit", function (event) {
        event.preventDefault();

        contactStatus.textContent = "";
        contactStatus.classList.remove("form-status--success", "form-status--error");

        const nameField = contactForm.querySelector('label.field:nth-of-type(1)');
        const emailField = contactForm.querySelector('label.field:nth-of-type(2)');
        const messageField = contactForm.querySelector('label.field:nth-of-type(3)');

        if (!nameField || !emailField || !messageField) return;

        const nameInput = nameField.querySelector("input");
        const emailInput = emailField.querySelector("input");
        const messageInput = messageField.querySelector("textarea");

        if (!nameInput || !emailInput || !messageInput) return;

        let valid = true;
        if (!validateRequired(nameField, nameInput)) valid = false;
        if (!validateEmail(emailField, emailInput)) valid = false;
        if (!validateMinLength(messageField, messageInput, 10)) valid = false;

        if (!valid) {
          contactStatus.textContent = "Merci de corriger les champs en rouge.";
          contactStatus.classList.add("form-status--error");
          return;
        }

        setTimeout(function () {
          contactStatus.textContent = "Message simulé comme envoyé. Tu peux brancher un backend réel ici.";
          contactStatus.classList.add("form-status--success");
          contactForm.reset();
        }, 250);
      });
    }

    /* SIMPLE COUNTER ANIMATION */

    const counters = document.querySelectorAll("[data-counter]");
    counters.forEach(function (el) {
      const target = Number(el.getAttribute("data-counter") || "0");
      if (!target || target <= 0) return;

      let current = 0;
      const steps = 24;
      const increment = target / steps;
      let frame = 0;

      function tick() {
        frame += 1;
        current += increment;
        if (frame >= steps) {
          el.textContent = String(target);
          return;
        }
        el.textContent = String(Math.round(current));
        requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
    });
  });
})();
