/* Everwood Construction — shared site script */
(function () {
  "use strict";

  /* Active nav link. Header/footer markup is identical on every page;
     aria-current is set here from the current filename. */
  var page = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".main-nav a, .drawer nav a, .site-footer nav a").forEach(function (a) {
    var href = a.getAttribute("href");
    if (href === page) {
      a.setAttribute("aria-current", "page");
    }
  });

  /* Mobile drawer: toggle, focus trap, Escape, close on link click. */
  var drawer = document.getElementById("drawer");
  var toggle = document.querySelector(".nav-toggle");
  var closeBtn = document.querySelector(".drawer-close");

  function openDrawer() {
    drawer.classList.add("open");
    toggle.setAttribute("aria-expanded", "true");
    closeBtn.focus();
    document.addEventListener("keydown", onDrawerKeydown);
    document.addEventListener("click", onOutsideClick);
  }

  function closeDrawer() {
    drawer.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    document.removeEventListener("keydown", onDrawerKeydown);
    document.removeEventListener("click", onOutsideClick);
    toggle.focus();
  }

  /* Tapping the blurred page area left of the open drawer closes it. */
  function onOutsideClick(e) {
    if (!drawer.contains(e.target) && !toggle.contains(e.target)) {
      closeDrawer();
    }
  }

  function onDrawerKeydown(e) {
    if (e.key === "Escape") {
      closeDrawer();
      return;
    }
    if (e.key !== "Tab") { return; }
    var focusables = drawer.querySelectorAll("a, button");
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  if (drawer && toggle && closeBtn) {
    toggle.addEventListener("click", openDrawer);
    closeBtn.addEventListener("click", closeDrawer);
    drawer.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeDrawer);
    });
  }

  /* Smooth scroll for same-page anchors only. */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var target = document.querySelector(a.getAttribute("href"));
      if (!target) { return; }
      e.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    });
  });

  /* Fade-up on scroll — the single animation, skipped under reduced motion. */
  if (!reduceMotion && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll(".fade-up").forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll(".fade-up").forEach(function (el) { el.classList.add("visible"); });
  }

  /* Quote form: inline validation, localStorage, confirmation swap. */
  var form = document.getElementById("quote-form");
  if (!form) { return; }

  function setError(field, message) {
    var wrap = field.closest(".form-field");
    var error = wrap.querySelector(".error");
    if (message) {
      wrap.classList.add("invalid");
      error.textContent = message;
      field.setAttribute("aria-invalid", "true");
    } else {
      wrap.classList.remove("invalid");
      error.textContent = "";
      field.removeAttribute("aria-invalid");
    }
  }

  function validateField(field) {
    var value = field.value.trim();
    if (!value) {
      setError(field, "This field is required.");
      return false;
    }
    if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError(field, "Enter a valid email address, like name@example.com.");
      return false;
    }
    if (field.type === "tel" && value.replace(/\D/g, "").length < 10) {
      setError(field, "Enter a phone number with area code.");
      return false;
    }
    setError(field, null);
    return true;
  }

  var fields = form.querySelectorAll("input, select, textarea");

  fields.forEach(function (field) {
    field.addEventListener("blur", function () { validateField(field); });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var valid = true;
    var firstInvalid = null;
    fields.forEach(function (field) {
      if (!validateField(field) && !firstInvalid) {
        firstInvalid = field;
        valid = false;
      } else if (field.closest(".form-field").classList.contains("invalid")) {
        valid = false;
      }
    });
    if (!valid) {
      if (firstInvalid) { firstInvalid.focus(); }
      return;
    }

    var data = {
      name: form.name.value.trim(),
      phone: form.phone.value.trim(),
      email: form.email.value.trim(),
      service: form.service.value,
      details: form.details.value.trim(),
      submitted: new Date().toISOString()
    };
    try {
      localStorage.setItem("everwood-quote-request", JSON.stringify(data));
    } catch (err) { /* storage unavailable; confirmation still shows */ }

    var confirmation = document.createElement("div");
    confirmation.className = "form-confirmation";
    confirmation.setAttribute("role", "status");
    confirmation.innerHTML =
      "<h3>Request received</h3>" +
      "<p>Thanks, " + data.name.replace(/[<>&]/g, "") + ". We got your request. " +
      "Dan or a project lead will call you to set up a free on-site estimate. " +
      "You will have a written quote within 3 business days of the visit.</p>" +
      "<p>Need us sooner? Call <a href=\"tel:+15552148890\">(555) 214-8890</a>, Mon–Fri 7am–5pm.</p>";
    form.replaceWith(confirmation);
    confirmation.querySelector("h3").setAttribute("tabindex", "-1");
    confirmation.querySelector("h3").focus();
  });
})();
