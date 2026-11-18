/* ===== Larache Costa Apartamentos — site behaviour ===== */

document.addEventListener("DOMContentLoaded", () => {

  /* ----- i18n helpers ----- */
  function currentLang() {
    return document.documentElement.getAttribute("lang") || "es";
  }

  function t(key) {
    const entry = translations[key];
    if (!entry) return key;
    return entry[currentLang()] || entry.es;
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  /* ----- Mobile nav toggle ----- */
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ----- Calendar tabs (Disponibilidad) ----- */
  const calTabs = document.querySelectorAll(".calendar-tabs .menu-tab");
  const calPanels = document.querySelectorAll("#disponibilidad .menu-panel");

  function activateCalendarTab(target) {
    calTabs.forEach((tb) => tb.classList.toggle("active", tb.getAttribute("data-cal-target") === target));
    calPanels.forEach((panel) => panel.classList.toggle("active", panel.id === target));
  }

  calTabs.forEach((tab) => {
    tab.addEventListener("click", () => activateCalendarTab(tab.getAttribute("data-cal-target")));
  });

  /* ----- FAQ accordion ----- */
  document.querySelectorAll(".faq-question").forEach((question) => {
    question.addEventListener("click", () => {
      const answer = question.nextElementSibling;
      const isOpen = question.getAttribute("aria-expanded") === "true";

      document.querySelectorAll(".faq-question").forEach((q) => {
        q.setAttribute("aria-expanded", "false");
        q.nextElementSibling.style.maxHeight = null;
      });

      if (!isOpen) {
        question.setAttribute("aria-expanded", "true");
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  });

  /* ----- Apartment gallery: thumbnails swap main photo ----- */
  document.querySelectorAll(".apt-thumb").forEach((thumb) => {
    thumb.addEventListener("click", () => {
      const card = thumb.closest(".apt-card");
      if (!card) return;
      const mainPh = card.querySelector(".apt-photo-main");
      const mainImg = mainPh.querySelector(".apt-main-img");
      const name = thumb.getAttribute("data-name");
      const full = thumb.getAttribute("data-full");

      mainPh.setAttribute("data-name", name);
      mainPh.classList.remove("img-missing");
      mainImg.src = full;

      card.querySelectorAll(".apt-thumb").forEach((b) => b.classList.remove("active"));
      thumb.classList.add("active");
    });
  });

  /* ----- Apartment gallery: fullscreen photo viewer (Booking-style) ----- */
  const aptLightbox = document.getElementById("aptLightbox");
  const aptLightboxImage = document.getElementById("aptLightboxImage");
  const aptLightboxCounter = document.getElementById("aptLightboxCounter");
  const aptLightboxClose = document.getElementById("aptLightboxClose");
  const aptLightboxPrev = document.getElementById("aptLightboxPrev");
  const aptLightboxNext = document.getElementById("aptLightboxNext");

  let lightboxPhotos = [];
  let lightboxIndex = 0;
  let lightboxTriggerEl = null;
  let lightboxTouchStartX = null;

  function getCardPhotos(card) {
    return Array.from(card.querySelectorAll(".apt-thumb")).map((thumb) => ({
      full: thumb.getAttribute("data-full"),
      alt: (thumb.querySelector("img") && thumb.querySelector("img").getAttribute("alt")) || ""
    }));
  }

  function getActiveThumbIndex(card) {
    const thumbs = Array.from(card.querySelectorAll(".apt-thumb"));
    const idx = thumbs.findIndex((th) => th.classList.contains("active"));
    return idx >= 0 ? idx : 0;
  }

  function renderLightboxSlide() {
    const photo = lightboxPhotos[lightboxIndex];
    if (!photo || !aptLightbox) return;
    aptLightboxImage.src = photo.full;
    aptLightboxImage.alt = photo.alt;
    aptLightboxCounter.textContent = `${lightboxIndex + 1} / ${lightboxPhotos.length}`;
  }

  function openLightbox(photos, startIndex, triggerEl) {
    if (!aptLightbox || !photos.length) return;
    lightboxPhotos = photos;
    lightboxIndex = startIndex || 0;
    lightboxTriggerEl = triggerEl || document.activeElement;
    renderLightboxSlide();
    aptLightbox.hidden = false;
    document.body.style.overflow = "hidden";
    aptLightboxClose.focus();
  }

  function closeLightbox() {
    if (!aptLightbox || aptLightbox.hidden) return;
    aptLightbox.hidden = true;
    aptLightboxImage.src = "";
    document.body.style.overflow = "";
    if (lightboxTriggerEl && typeof lightboxTriggerEl.focus === "function") {
      lightboxTriggerEl.focus();
    }
  }

  function showPrevSlide() {
    if (!lightboxPhotos.length) return;
    lightboxIndex = (lightboxIndex - 1 + lightboxPhotos.length) % lightboxPhotos.length;
    renderLightboxSlide();
  }

  function showNextSlide() {
    if (!lightboxPhotos.length) return;
    lightboxIndex = (lightboxIndex + 1) % lightboxPhotos.length;
    renderLightboxSlide();
  }

  function openGalleryFromCard(card, startIndex, triggerEl) {
    const photos = getCardPhotos(card);
    openLightbox(photos, startIndex, triggerEl);
  }

  document.querySelectorAll(".apt-photo-main").forEach((mainPh) => {
    const card = mainPh.closest(".apt-card");
    if (!card) return;

    mainPh.addEventListener("click", (e) => {
      if (e.target.closest(".apt-view-all-btn")) return;
      openGalleryFromCard(card, getActiveThumbIndex(card), mainPh);
    });

    mainPh.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        openGalleryFromCard(card, getActiveThumbIndex(card), mainPh);
      }
    });

    const viewAllBtn = mainPh.querySelector(".apt-view-all-btn");
    if (viewAllBtn) {
      viewAllBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        openGalleryFromCard(card, getActiveThumbIndex(card), viewAllBtn);
      });
    }
  });

  if (aptLightboxClose) aptLightboxClose.addEventListener("click", closeLightbox);
  if (aptLightboxPrev) aptLightboxPrev.addEventListener("click", showPrevSlide);
  if (aptLightboxNext) aptLightboxNext.addEventListener("click", showNextSlide);

  if (aptLightbox) {
    aptLightbox.addEventListener("click", (e) => {
      if (e.target === aptLightbox || e.target.classList.contains("apt-lightbox-stage")) {
        closeLightbox();
      }
    });

    aptLightbox.addEventListener(
      "touchstart",
      (e) => {
        lightboxTouchStartX = e.changedTouches[0].clientX;
      },
      { passive: true }
    );

    aptLightbox.addEventListener(
      "touchend",
      (e) => {
        if (lightboxTouchStartX === null) return;
        const dx = e.changedTouches[0].clientX - lightboxTouchStartX;
        if (Math.abs(dx) > 40) {
          if (dx < 0) showNextSlide();
          else showPrevSlide();
        }
        lightboxTouchStartX = null;
      },
      { passive: true }
    );
  }

  document.addEventListener("keydown", (e) => {
    if (!aptLightbox || aptLightbox.hidden) return;

    if (e.key === "Escape") {
      closeLightbox();
      return;
    }
    if (e.key === "ArrowLeft") {
      showPrevSlide();
      return;
    }
    if (e.key === "ArrowRight") {
      showNextSlide();
      return;
    }
    if (e.key === "Tab") {
      const focusable = [aptLightboxClose, aptLightboxPrev, aptLightboxNext];
      const currentIdx = focusable.indexOf(document.activeElement);
      e.preventDefault();
      let nextIdx;
      if (e.shiftKey) {
        nextIdx = currentIdx <= 0 ? focusable.length - 1 : currentIdx - 1;
      } else {
        nextIdx = currentIdx === -1 || currentIdx === focusable.length - 1 ? 0 : currentIdx + 1;
      }
      focusable[nextIdx].focus();
    }
  });

  function applyGalleryTexts() {
    document.querySelectorAll(".apt-photo-main").forEach((mainPh) => {
      mainPh.setAttribute("aria-label", t("gallery.open_label"));
    });
    document.querySelectorAll(".apt-view-all-btn").forEach((btn) => {
      const count = btn.getAttribute("data-count") || "0";
      btn.textContent = t("gallery.view_all").replace("{count}", count);
    });
    if (aptLightboxClose) aptLightboxClose.setAttribute("aria-label", t("gallery.close"));
    if (aptLightboxPrev) aptLightboxPrev.setAttribute("aria-label", t("gallery.prev"));
    if (aptLightboxNext) aptLightboxNext.setAttribute("aria-label", t("gallery.next"));
    if (aptLightbox) aptLightbox.setAttribute("aria-label", t("gallery.dialog_label"));
  }

  applyGalleryTexts();

  /* ======================================================
     APARTMENTS DATA
  ====================================================== */
  const APARTMENTS = {
    a1: { nameKey: "apt.a1.name", capacity: 2, price: 70, cleaning: 40, seed: 101 },
    a2: { nameKey: "apt.a2.name", capacity: 4, price: 110, cleaning: 50, seed: 202 },
    a3: { nameKey: "apt.a3.name", capacity: 6, price: 165, cleaning: 60, seed: 303 }
  };

  /* Deterministic, fixed-seed "occupied" demo data: depends only on the
     calendar date and the apartment, never on when the page is loaded. */
  function hash32(n) {
    n = n ^ 2654435761;
    n = Math.imul(n ^ (n >>> 16), 2246822519);
    n = Math.imul(n ^ (n >>> 13), 3266489917);
    n = n ^ (n >>> 16);
    return n >>> 0;
  }

  function dayIndex(date) {
    return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
  }

  function isSeedOccupied(aptId, date) {
    const apt = APARTMENTS[aptId];
    const blockLen = 4;
    const blockIdx = Math.floor(dayIndex(date) / blockLen);
    const h = hash32(blockIdx * 2654435761 + apt.seed);
    return (h % 1000) < 320;
  }

  /* Bookings made during this visit (demo only, not persisted). */
  const extraBookedRanges = { a1: [], a2: [], a3: [] };

  function isOccupied(aptId, date) {
    if (isSeedOccupied(aptId, date)) return true;
    return extraBookedRanges[aptId].some((r) => date >= r.start && date < r.end);
  }

  function startOfDay(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function isPastDay(date) {
    return startOfDay(date) < startOfDay(new Date());
  }

  function isRangeFree(aptId, start, end) {
    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
      if (isOccupied(aptId, d)) return false;
    }
    return true;
  }

  function diffNights(start, end) {
    return Math.round((startOfDay(end) - startOfDay(start)) / 86400000);
  }

  function pad(n) { return String(n).padStart(2, "0"); }

  function isoDate(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  function parseIsoDate(str) {
    if (!str) return null;
    const [y, m, d] = str.split("-").map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  }

  function formatLongDate(date) {
    const locale = currentLang() === "es" ? "es-ES" : "en-GB";
    return date.toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });
  }

  /* ======================================================
     AVAILABILITY CALENDARS
  ====================================================== */
  const calendarState = {
    a1: { monthOffset: 0, checkin: null, checkout: null },
    a2: { monthOffset: 0, checkin: null, checkout: null },
    a3: { monthOffset: 0, checkin: null, checkout: null }
  };

  const calendarWidgets = {};

  function buildCalendarSkeleton(aptId, container) {
    container.innerHTML = `
      <div class="calendar-nav">
        <button type="button" class="calendar-nav-btn" data-dir="-1" aria-label="${escapeHtml(t("cal.prev"))}">&lsaquo;</button>
        <button type="button" class="calendar-nav-btn" data-dir="1" aria-label="${escapeHtml(t("cal.next"))}">&rsaquo;</button>
      </div>
      <div class="calendar-months">
        <div class="calendar-month" data-month="0"></div>
        <div class="calendar-month" data-month="1"></div>
      </div>
      <div class="calendar-legend">
        <span><span class="legend-dot available"></span>${escapeHtml(t("cal.legend.available"))}</span>
        <span><span class="legend-dot occupied"></span>${escapeHtml(t("cal.legend.occupied"))}</span>
        <span><span class="legend-dot selected"></span>${escapeHtml(t("cal.legend.selected"))}</span>
      </div>
      <p class="calendar-hint" aria-live="polite"></p>
    `;

    container.querySelectorAll(".calendar-nav-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const dir = parseInt(btn.getAttribute("data-dir"), 10);
        const state = calendarState[aptId];
        const next = state.monthOffset + dir;
        if (next < 0) return;
        state.monthOffset = next;
        renderCalendar(aptId);
      });
    });

    calendarWidgets[aptId] = container;
  }

  function buildMonthCells(year, month) {
    const first = new Date(year, month, 1);
    const startIndex = (first.getDay() + 6) % 7; // Monday-first
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startIndex; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    return cells;
  }

  function setHint(aptId, message) {
    const widget = calendarWidgets[aptId];
    const hint = widget && widget.querySelector(".calendar-hint");
    if (hint) hint.textContent = message;
  }

  function renderCalendar(aptId) {
    const widget = calendarWidgets[aptId];
    if (!widget) return;
    const state = calendarState[aptId];
    const today = new Date();
    const base = new Date(today.getFullYear(), today.getMonth() + state.monthOffset, 1);

    const weekdayKeys = ["cal.wd.mon", "cal.wd.tue", "cal.wd.wed", "cal.wd.thu", "cal.wd.fri", "cal.wd.sat", "cal.wd.sun"];

    widget.querySelector('[data-dir="-1"]').disabled = state.monthOffset <= 0;

    for (let m = 0; m < 2; m++) {
      const monthDate = new Date(base.getFullYear(), base.getMonth() + m, 1);
      const monthEl = widget.querySelector(`.calendar-month[data-month="${m}"]`);
      const locale = currentLang() === "es" ? "es-ES" : "en-GB";
      const title = monthDate.toLocaleDateString(locale, { month: "long", year: "numeric" });

      const cells = buildMonthCells(monthDate.getFullYear(), monthDate.getMonth());

      let html = `<h4 class="calendar-month-title">${escapeHtml(title)}</h4>`;
      html += `<div class="calendar-weekdays">${weekdayKeys.map((k) => `<span>${escapeHtml(t(k))}</span>`).join("")}</div>`;
      html += `<div class="calendar-days">`;

      cells.forEach((date) => {
        if (!date) {
          html += `<span class="calendar-day empty"></span>`;
          return;
        }
        const classes = ["calendar-day"];
        const past = isPastDay(date);
        const occupied = isOccupied(aptId, date);
        const isToday = startOfDay(date).getTime() === startOfDay(today).getTime();
        const isStart = state.checkin && startOfDay(date).getTime() === startOfDay(state.checkin).getTime();
        const isEnd = state.checkout && startOfDay(date).getTime() === startOfDay(state.checkout).getTime();
        const inRange = state.checkin && state.checkout && date > state.checkin && date < state.checkout;

        if (past) classes.push("past");
        if (occupied && !past) classes.push("occupied");
        if (isToday) classes.push("today");
        if (isStart) classes.push("selected-start");
        if (isEnd) classes.push("selected-end");
        if (inRange) classes.push("in-range");

        const disabled = past || occupied;
        const label = formatLongDate(date);

        html += `<button type="button" class="${classes.join(" ")}" data-date="${isoDate(date)}" ${disabled ? "disabled" : ""} aria-label="${escapeHtml(label)}"${(isStart || isEnd) ? ' aria-pressed="true"' : ""}>${date.getDate()}</button>`;
      });

      html += `</div>`;
      monthEl.innerHTML = html;

      monthEl.querySelectorAll(".calendar-day:not(.empty):not(.past):not(.occupied)").forEach((btn) => {
        btn.addEventListener("click", () => onCalendarDayClick(aptId, parseIsoDate(btn.getAttribute("data-date"))));
      });
    }
  }

  function onCalendarDayClick(aptId, date) {
    const state = calendarState[aptId];

    if (!state.checkin || state.checkout) {
      state.checkin = date;
      state.checkout = null;
      setHint(aptId, t("cal.hint.pick_checkout"));
    } else if (date <= state.checkin) {
      state.checkin = date;
      state.checkout = null;
      setHint(aptId, t("cal.hint.pick_checkout"));
    } else if (!isRangeFree(aptId, state.checkin, date)) {
      setHint(aptId, t("cal.hint.blocked"));
      state.checkin = date;
      state.checkout = null;
    } else if (diffNights(state.checkin, date) < 2) {
      setHint(aptId, t("cal.hint.min_nights"));
    } else {
      state.checkout = date;
      setHint(aptId, t("cal.hint.selected"));
      fillBookingForm(aptId, state.checkin, state.checkout);
    }

    renderCalendar(aptId);
  }

  function resetCalendarSelection(aptId) {
    calendarState[aptId].checkin = null;
    calendarState[aptId].checkout = null;
    setHint(aptId, "");
    renderCalendar(aptId);
  }

  document.querySelectorAll(".calendar-widget").forEach((container) => {
    const aptId = container.getAttribute("data-apt-id");
    buildCalendarSkeleton(aptId, container);
    setHint(aptId, t("cal.hint.pick_checkin"));
    renderCalendar(aptId);
  });

  function renderAllCalendars() {
    Object.keys(calendarWidgets).forEach((aptId) => renderCalendar(aptId));
  }

  /* ======================================================
     BOOKING WIZARD
  ====================================================== */
  const form = document.getElementById("reservationForm");
  const aptSelect = document.getElementById("resApt");
  const checkinInput = document.getElementById("resCheckin");
  const checkoutInput = document.getElementById("resCheckout");
  const guestsInput = document.getElementById("resGuests");
  const progressSteps = document.querySelectorAll(".progress-step");
  const step1 = document.getElementById("wizardStep1");
  const step2 = document.getElementById("wizardStep2");
  const step3 = document.getElementById("wizardStep3");

  if (checkinInput) checkinInput.min = isoDate(new Date());

  function fillBookingForm(aptId, checkin, checkout) {
    aptSelect.value = aptId;
    checkinInput.value = isoDate(checkin);
    checkoutInput.value = isoDate(checkout);
    updateGuestsLimit();
    recalcPrice();

    setTimeout(() => {
      document.getElementById("reservas").scrollIntoView({ behavior: "smooth", block: "start" });
    }, 250);
  }

  function updateGuestsLimit() {
    const apt = APARTMENTS[aptSelect.value];
    guestsInput.max = apt.capacity;
    if (Number(guestsInput.value) > apt.capacity || !guestsInput.value) {
      guestsInput.value = apt.capacity;
    }
  }

  function recalcPrice() {
    const apt = APARTMENTS[aptSelect.value];
    const checkin = parseIsoDate(checkinInput.value);
    const checkout = parseIsoDate(checkoutInput.value);

    const nightsEl = document.getElementById("priceNights");
    const weekendEl = document.getElementById("priceWeekend");
    const cleaningEl = document.getElementById("priceCleaning");
    const totalEl = document.getElementById("priceTotal");

    if (!checkin || !checkout || checkout <= checkin) {
      nightsEl.textContent = "—";
      weekendEl.textContent = "—";
      cleaningEl.textContent = `${apt.cleaning.toFixed(2)} €`;
      totalEl.textContent = "—";
      return null;
    }

    const nights = diffNights(checkin, checkout);
    let nightsTotal = 0;
    let weekendSurcharge = 0;

    for (let d = new Date(checkin); d < checkout; d.setDate(d.getDate() + 1)) {
      const dow = d.getDay();
      const isWeekendNight = dow === 5 || dow === 6; // Friday & Saturday
      if (isWeekendNight) {
        nightsTotal += apt.price * 1.15;
        weekendSurcharge += apt.price * 0.15;
      } else {
        nightsTotal += apt.price;
      }
    }

    const total = nightsTotal + apt.cleaning;

    nightsEl.textContent = `${nights} ${nights === 1 ? t("reserve.price.night") : t("reserve.price.nights_unit")} (${nightsTotal.toFixed(2)} €)`;
    weekendEl.textContent = weekendSurcharge > 0 ? `+${weekendSurcharge.toFixed(2)} €` : t("reserve.price.none");
    cleaningEl.textContent = `${apt.cleaning.toFixed(2)} €`;
    totalEl.textContent = `${total.toFixed(2)} €`;

    return { nights, nightsTotal, weekendSurcharge, cleaning: apt.cleaning, total };
  }

  function setGroupInvalid(inputEl, invalid, errorKey) {
    const group = inputEl.closest(".form-group");
    if (!group) return;
    if (errorKey) {
      const span = group.querySelector(".field-error");
      if (span) {
        span.setAttribute("data-i18n", errorKey);
        span.textContent = t(errorKey);
      }
    }
    group.classList.toggle("invalid", invalid);
  }

  function validateStep1() {
    let valid = true;

    const checkin = parseIsoDate(checkinInput.value);
    const checkout = parseIsoDate(checkoutInput.value);
    const apt = APARTMENTS[aptSelect.value];

    if (!checkin || isPastDay(checkin)) {
      setGroupInvalid(checkinInput, true, "reserve.error.checkin");
      valid = false;
    } else {
      setGroupInvalid(checkinInput, false);
    }

    if (!checkin || !checkout) {
      setGroupInvalid(checkoutInput, true, "reserve.error.checkout");
      valid = false;
    } else if (checkout <= checkin) {
      setGroupInvalid(checkoutInput, true, "reserve.error.checkout");
      valid = false;
    } else if (diffNights(checkin, checkout) < 2) {
      setGroupInvalid(checkoutInput, true, "reserve.error.checkout_min");
      valid = false;
    } else if (!isRangeFree(aptSelect.value, checkin, checkout)) {
      setGroupInvalid(checkoutInput, true, "reserve.error.checkout_blocked");
      valid = false;
    } else {
      setGroupInvalid(checkoutInput, false);
    }

    const guests = Number(guestsInput.value);
    if (!guests || guests < 1 || guests > apt.capacity) {
      setGroupInvalid(guestsInput, true, "reserve.error.guests");
      valid = false;
    } else {
      setGroupInvalid(guestsInput, false);
    }

    return valid;
  }

  function goToStep(n) {
    [step1, step2, step3].forEach((s) => s && s.classList.remove("active"));
    if (n === 1) { step1.classList.add("active"); form.hidden = false; step3.hidden = true; }
    if (n === 2) { step2.classList.add("active"); form.hidden = false; step3.hidden = true; }
    if (n === 3) { form.hidden = true; step3.hidden = false; step3.classList.add("active"); }

    progressSteps.forEach((el) => {
      const stepNum = Number(el.getAttribute("data-step"));
      el.classList.toggle("active", stepNum === n);
      el.classList.toggle("done", stepNum < n);
    });
  }

  if (aptSelect) {
    aptSelect.addEventListener("change", () => {
      updateGuestsLimit();
      recalcPrice();
    });
  }
  if (checkinInput) {
    checkinInput.addEventListener("change", () => {
      if (checkinInput.value) {
        checkoutInput.min = isoDate(new Date(parseIsoDate(checkinInput.value).getTime() + 2 * 86400000));
      }
      recalcPrice();
    });
  }
  if (checkoutInput) checkoutInput.addEventListener("change", recalcPrice);
  if (guestsInput) guestsInput.addEventListener("change", recalcPrice);

  const toStep2Btn = document.getElementById("toStep2");
  const toStep1Btn = document.getElementById("toStep1");

  if (toStep2Btn) {
    toStep2Btn.addEventListener("click", () => {
      if (validateStep1()) goToStep(2);
    });
  }
  if (toStep1Btn) {
    toStep1Btn.addEventListener("click", () => goToStep(1));
  }

  function validateField(field) {
    const group = field.closest(".form-group");
    const valid = field.checkValidity();
    group.classList.toggle("invalid", !valid);
    return valid;
  }

  function generateBookingCode() {
    const n = Math.floor(1000 + Math.random() * 9000);
    return `LC-${n}`;
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const step2Fields = step2.querySelectorAll("input[required], select[required], textarea[required]");
      let allValid = true;
      step2Fields.forEach((field) => {
        if (!validateField(field)) allValid = false;
      });

      if (!allValid) {
        const firstInvalid = step2.querySelector(".form-group.invalid input, .form-group.invalid select");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      const data = new FormData(form);
      const aptId = data.get("apartment");
      const apt = APARTMENTS[aptId];
      const checkin = parseIsoDate(data.get("checkin"));
      const checkout = parseIsoDate(data.get("checkout"));
      const pricing = recalcPrice();

      extraBookedRanges[aptId].push({ start: startOfDay(checkin), end: startOfDay(checkout) });
      renderAllCalendars();

      const code = generateBookingCode();
      document.getElementById("confirmationCode").textContent = code;

      const summary = document.getElementById("confirmationSummary");
      summary.innerHTML = `
        <dt>${escapeHtml(t("reserve.summary.apartment"))}</dt><dd>${escapeHtml(t(apt.nameKey))}</dd>
        <dt>${escapeHtml(t("reserve.summary.checkin"))}</dt><dd>${escapeHtml(formatLongDate(checkin))}</dd>
        <dt>${escapeHtml(t("reserve.summary.checkout"))}</dt><dd>${escapeHtml(formatLongDate(checkout))}</dd>
        <dt>${escapeHtml(t("reserve.summary.guests"))}</dt><dd>${escapeHtml(data.get("guests"))}</dd>
        <dt>${escapeHtml(t("reserve.summary.total"))}</dt><dd>${pricing ? pricing.total.toFixed(2) + " €" : "—"}</dd>
        <dt>${escapeHtml(t("reserve.summary.name"))}</dt><dd>${escapeHtml(data.get("name"))}</dd>
        <dt>${escapeHtml(t("reserve.summary.email"))}</dt><dd>${escapeHtml(data.get("email"))}</dd>
      `;

      goToStep(3);
      document.getElementById("reservas").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  const newReservationBtn = document.getElementById("newReservationBtn");
  if (newReservationBtn) {
    newReservationBtn.addEventListener("click", () => {
      form.reset();
      form.querySelectorAll(".form-group").forEach((g) => g.classList.remove("invalid"));
      updateGuestsLimit();
      recalcPrice();
      goToStep(1);
      document.getElementById("reservas").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  /* ----- "Ver disponibilidad" / "Reservar este apartamento" buttons ----- */
  document.querySelectorAll(".btn-availability").forEach((btn) => {
    btn.addEventListener("click", () => {
      const aptId = btn.getAttribute("data-apt");
      activateCalendarTab(`cal-${aptId}`);
      document.getElementById("disponibilidad").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  document.querySelectorAll(".btn-book-apt").forEach((btn) => {
    btn.addEventListener("click", () => {
      const aptId = btn.getAttribute("data-apt");
      aptSelect.value = aptId;
      updateGuestsLimit();
      recalcPrice();
      goToStep(1);
      document.getElementById("reservas").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  /* Initial state */
  updateGuestsLimit();
  recalcPrice();

  /* ----- Re-render dynamic text (calendars, price summary, gallery) on language change ----- */
  document.addEventListener("langchange", () => {
    document.querySelectorAll(".calendar-widget").forEach((container) => {
      const aptId = container.getAttribute("data-apt-id");
      buildCalendarSkeleton(aptId, container);
      renderCalendar(aptId);
    });
    recalcPrice();
    applyGalleryTexts();
  });

  /* ----- Footer year ----- */
  const yearEl = document.getElementById("currentYear");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

});
