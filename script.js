function initSlider(root) {
  const track = root.querySelector(".slider__track");
  if (!track) return;

  const btnPrev = root.querySelector(".slider__arrow--left");
  const btnNext = root.querySelector(".slider__arrow--right");
  const isMobileOnly = root.dataset.mode === "mobile";
  const GAP = 18;
  let cardWidth = 0;

  const slides = () => Array.from(track.children);
  const visibleSlides = () => slides().filter((slide) => !slide.hidden);

  function clearLayout() {
    slides().forEach((slide) => {
      slide.style.flex = "";
      slide.style.marginRight = "";
    });
  }

  function updateLayout() {
    const width = root.getBoundingClientRect().width;
    const mobile = window.innerWidth <= 768;

    if (isMobileOnly && !mobile) {
      clearLayout();
      return;
    }

    const perView = isMobileOnly ? 1 : width < 600 ? 1 : width < 900 ? 3 : 4;
    cardWidth = (width - (perView - 1) * GAP) / perView;

    slides().forEach((slide) => {
      if (slide.hidden) {
        slide.style.flex = "0 0 0px";
        slide.style.marginRight = "0";
        return;
      }
      slide.style.flex = `0 0 ${cardWidth}px`;
      slide.style.marginRight = `${GAP}px`;
    });
  }

  function slideBy(direction) {
    const step = isMobileOnly ? track.clientWidth : cardWidth * 2;
    track.scrollBy({ left: direction * step, behavior: "smooth" });
  }

  btnPrev?.addEventListener("click", () => slideBy(-1));
  btnNext?.addEventListener("click", () => slideBy(1));
  window.addEventListener("resize", updateLayout);
  updateLayout();
}

function initEventsDates() {
  const monthSelect = document.querySelector(".events__month-select");
  const yearSelect = document.querySelector(".events__year-select");
  const list = document.querySelector(".events__dates-list");
  const btnPrev = document.querySelector(".events__dates-prev");
  const btnNext = document.querySelector(".events__dates-next");
  if (!monthSelect || !yearSelect || !list || !btnPrev || !btnNext) return;

  let currentIndex = 0;
  let datesInView = [];
  const WEEKDAYS = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];

  function buildDates(year, month) {
    const result = [];
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      result.push({ day: String(day).padStart(2, "0"), weekday: WEEKDAYS[d.getDay()] });
    }
    return result;
  }

  function renderDates() {
    const year = Number(yearSelect.value);
    const month = Number(monthSelect.value);
    datesInView = buildDates(year, month);
    list.innerHTML = "";
    datesInView.forEach((date, i) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "date-card" + (i === currentIndex ? " date-card--active" : "");
      card.innerHTML = `<span class="date-card__day">${date.day}</span><span class="date-card__weekday">${date.weekday}</span>`;
      card.onclick = () => {
        currentIndex = i;
        updateActive();
        scrollActiveIntoView();
      };
      list.appendChild(card);
    });
    updateActive();
    scrollActiveIntoView(false);
  }

  function updateActive() {
    list.querySelectorAll(".date-card").forEach((c, i) => c.classList.toggle("date-card--active", i === currentIndex));
  }

  function scrollActiveIntoView(smooth = true) {
    const active = list.querySelector(".date-card--active");
    if (active) active.scrollIntoView({ behavior: smooth ? "smooth" : "auto", inline: "center", block: "nearest" });
  }

  btnPrev.onclick = () => {
    if (!datesInView.length) return;
    currentIndex = currentIndex === 0 ? datesInView.length - 1 : currentIndex - 1;
    updateActive();
    scrollActiveIntoView();
  };
  btnNext.onclick = () => {
    if (!datesInView.length) return;
    currentIndex = currentIndex === datesInView.length - 1 ? 0 : currentIndex + 1;
    updateActive();
    scrollActiveIntoView();
  };
  monthSelect.addEventListener("change", () => { currentIndex = 0; renderDates(); });
  yearSelect.addEventListener("change", () => { currentIndex = 0; renderDates(); });
  renderDates();
}

function initEventsFilter() {
  const typeSelect = document.querySelector('select[name="event-type"]');
  const track = document.querySelector(".slider--events .slider__track");
  const cards = Array.from(document.querySelectorAll(".slider--events .event-card"));
  if (!typeSelect || !track || !cards.length) return;

  function applyFilter() {
    const selectedType = typeSelect.value;
    cards.forEach((card) => {
      const cardType = card.dataset.type || "all";
      card.hidden = selectedType !== "all" && cardType !== selectedType;
    });
    track.scrollTo({ left: 0, behavior: "smooth" });
    window.dispatchEvent(new Event("resize"));
  }

  typeSelect.addEventListener("change", applyFilter);
  applyFilter();
}

function initMobileMenu() {
  const menuBtn = document.querySelector(".menu-btn");
  const nav = document.querySelector(".site-nav");
  const mask = document.querySelector(".menu-mask");
  if (!menuBtn || !nav || !mask) return;

  function closeMenu() {
    menuBtn.classList.remove("is-open");
    nav.classList.remove("is-open");
    mask.classList.remove("is-open");
    document.body.classList.remove("no-scroll");
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.setAttribute("aria-label", "Открыть меню");
  }

  function openMenu() {
    menuBtn.classList.add("is-open");
    nav.classList.add("is-open");
    mask.classList.add("is-open");
    document.body.classList.add("no-scroll");
    menuBtn.setAttribute("aria-expanded", "true");
    menuBtn.setAttribute("aria-label", "Закрыть меню");
  }

  menuBtn.onclick = () => (nav.classList.contains("is-open") ? closeMenu() : openMenu());
  mask.addEventListener("click", closeMenu);
  nav.querySelectorAll(".site-nav__link").forEach((link) => link.addEventListener("click", closeMenu));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) closeMenu();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".slider").forEach(initSlider);
  initEventsDates();
  initEventsFilter();
  initMobileMenu();
});
