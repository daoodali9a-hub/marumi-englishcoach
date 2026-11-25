(function () {
  const header = document.querySelector(".site-header");
  const toggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("nav");
  const form = document.getElementById("inquiry-form");
  const thanks = document.getElementById("thanks");
  const alertBox = document.getElementById("form-alert");
  const submitBtn = document.getElementById("submit-btn");
  const year = document.getElementById("year");

  const titles = {
    en: "Maruni English Coach | English lessons for children",
    ja: "Maruni English Coach | 子どもの英語レッスン"
  };
  const descriptions = {
    en: "Maruni English Coach offers calm English lessons for children ages 4–12. Small groups and one-to-one. Send a trial inquiry.",
    ja: "Maruni English Coach は、4歳から12歳のための少人数・マンツーマンの英語レッスンです。オンライン中心。体験レッスンのお問い合わせを受け付けています。"
  };
  const alerts = {
    missingEmail: {
      en: "This form is not delivering yet. Add Maruni’s email in config.js, then try again.",
      ja: "まだ届く設定になっていません。config.js にメールアドレスを入れてから、もう一度送ってください。"
    },
    failed: {
      en: "The message could not be sent. Please try again in a moment.",
      ja: "送信できませんでした。しばらくしてから、もう一度お試しください。"
    },
    sending: { en: "Sending…", ja: "送信中…" },
    send: { en: "Send inquiry", ja: "問い合わせを送る" }
  };

  function lang() {
    return document.documentElement.lang === "en" ? "en" : "ja";
  }

  function t(dict) {
    return dict[lang()];
  }

  function applyLang(next) {
    document.documentElement.lang = next;
    document.title = titles[next];
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", descriptions[next]);
    document.querySelectorAll("[data-ph-en]").forEach(function (el) {
      el.placeholder = el.getAttribute(next === "ja" ? "data-ph-ja" : "data-ph-en");
    });
    document.querySelectorAll("option[data-en]").forEach(function (opt) {
      opt.textContent = opt.getAttribute(next === "ja" ? "data-ja" : "data-en");
    });
    document.querySelectorAll(".lang-btn").forEach(function (btn) {
      btn.setAttribute("aria-pressed", btn.getAttribute("data-set-lang") === next ? "true" : "false");
    });
    try { localStorage.setItem("maruni-lang", next); } catch (e) {}
    if (!submitBtn.disabled) {
      submitBtn.querySelector(".t-en").textContent = alerts.send.en;
      submitBtn.querySelector(".t-ja").textContent = alerts.send.ja;
    }
  }

  function coachEmail() {
    const raw = window.MARUNI_CONFIG && window.MARUNI_CONFIG.email ? String(window.MARUNI_CONFIG.email) : "";
    return raw.trim();
  }

  function emailReady() {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(coachEmail());
  }

  function refreshSetup() {
    const bar = document.getElementById("setup");
    if (bar) bar.hidden = emailReady();
  }

  applyLang(lang());
  refreshSetup();
  if (year) year.textContent = String(new Date().getFullYear());

  document.querySelectorAll(".lang-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      applyLang(btn.getAttribute("data-set-lang"));
    });
  });

  function setNav(open) {
    document.body.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  }

  toggle.addEventListener("click", function () {
    setNav(!document.body.classList.contains("nav-open"));
  });
  nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () { setNav(false); });
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") setNav(false);
  });

  const onScroll = function () {
    header.classList.toggle("scrolled", window.scrollY > 4);
    const links = nav.querySelectorAll('a[href^="#"]');
    let current = "";
    links.forEach(function (link) {
      const id = link.getAttribute("href").slice(1);
      const section = document.getElementById(id);
      if (!section) return;
      if (section.getBoundingClientRect().top < 140) current = id;
    });
    links.forEach(function (link) {
      const on = link.getAttribute("href") === "#" + current;
      if (on) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  document.querySelectorAll(".acc button").forEach(function (button) {
    button.addEventListener("click", function () {
      const panel = document.getElementById(button.getAttribute("aria-controls"));
      const open = button.getAttribute("aria-expanded") === "true";
      document.querySelectorAll(".acc button").forEach(function (other) {
        other.setAttribute("aria-expanded", "false");
        const otherPanel = document.getElementById(other.getAttribute("aria-controls"));
        if (otherPanel) otherPanel.hidden = true;
      });
      button.setAttribute("aria-expanded", open ? "false" : "true");
      panel.hidden = open;
    });
  });

  function showAlert(message) {
    alertBox.hidden = false;
    alertBox.textContent = message;
  }

  function clearErrors() {
    alertBox.hidden = true;
    form.querySelectorAll(".field").forEach(function (field) {
      field.classList.remove("bad");
      const err = field.querySelector(".err");
      if (err) err.hidden = true;
    });
  }

  function validate() {
    clearErrors();
    let ok = true;
    let first = null;
    form.querySelectorAll("input, select, textarea").forEach(function (el) {
      if (el.name === "_honey" || el.type === "hidden") return;
      const field = el.closest(".field");
      if (!el.checkValidity()) {
        ok = false;
        field.classList.add("bad");
        const err = field.querySelector(".err");
        if (err) err.hidden = false;
        if (!first) first = el;
      }
    });
    if (first) first.focus();
    return ok;
  }

  function showThanks() {
    form.hidden = true;
    thanks.hidden = false;
    thanks.focus ? thanks.setAttribute("tabindex", "-1") : null;
    thanks.focus();
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (!validate()) return;
    if (form._honey && form._honey.value) {
      showThanks();
      return;
    }
    if (!emailReady()) {
      showAlert(t(alerts.missingEmail));
      return;
    }

    const originalEn = submitBtn.querySelector(".t-en").textContent;
    const originalJa = submitBtn.querySelector(".t-ja").textContent;
    submitBtn.disabled = true;
    submitBtn.querySelector(".t-en").textContent = alerts.sending.en;
    submitBtn.querySelector(".t-ja").textContent = alerts.sending.ja;

    const data = new FormData(form);
    data.append("_subject", "New inquiry — Maruni English Coach");
    data.append("_template", "table");
    data.append("_captcha", "false");
    data.delete("consent");

    try {
      const res = await fetch("https://formsubmit.co/ajax/" + encodeURIComponent(coachEmail()), {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data
      });
      const json = await res.json().catch(function () { return {}; });
      if (!res.ok || json.success === false || json.success === "false") {
        throw new Error("send failed");
      }
      form.reset();
      showThanks();
    } catch (err) {
      showAlert(t(alerts.failed));
      submitBtn.disabled = false;
      submitBtn.querySelector(".t-en").textContent = originalEn;
      submitBtn.querySelector(".t-ja").textContent = originalJa;
    }
  });

  document.getElementById("another").addEventListener("click", function () {
    thanks.hidden = true;
    form.hidden = false;
    submitBtn.disabled = false;
    clearErrors();
    document.getElementById("parent-name").focus();
  });

  if (new URLSearchParams(location.search).get("thanks") === "1") showThanks();
})();
