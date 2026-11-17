const menuButton = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

if (menuButton && navLinks) {
  menuButton.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("is-open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("is-open");
      menuButton.setAttribute("aria-expanded", "false");
    });
  });
}

const heroStage = document.querySelector(".hero-stage");
const heroParallax = document.querySelector(".hero-parallax");
const pointerMotion = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");

if (heroStage && heroParallax && pointerMotion.matches) {
  let animationFrame = 0;

  heroStage.addEventListener("pointermove", (event) => {
    if (animationFrame) cancelAnimationFrame(animationFrame);
    animationFrame = requestAnimationFrame(() => {
      const bounds = heroStage.getBoundingClientRect();
      const horizontalPosition = (event.clientX - bounds.left) / bounds.width - 0.5;
      const verticalPosition = (event.clientY - bounds.top) / bounds.height - 0.5;

      heroParallax.style.setProperty("--pointer-tilt-x", `${verticalPosition * -8}deg`);
      heroParallax.style.setProperty("--pointer-tilt-y", `${horizontalPosition * 8}deg`);
      animationFrame = 0;
    });
  });

  heroStage.addEventListener("pointerleave", () => {
    heroParallax.style.setProperty("--pointer-tilt-x", "0deg");
    heroParallax.style.setProperty("--pointer-tilt-y", "0deg");
  });
}

const catalogFilters = document.querySelectorAll(".catalog-filter");
const catalogItems = document.querySelectorAll(".catalog-item");
const catalogSearch = document.querySelector(".catalog-search");
const catalogSearchInput = document.querySelector("#catalog-search-input");
const catalogSearchClear = document.querySelector(".catalog-search-clear");
const catalogEmpty = document.querySelector(".catalog-empty");
let activeCatalogFilter = "all";

function updateCatalog() {
  const query = catalogSearchInput?.value.trim().toLocaleLowerCase() ?? "";
  let visibleItems = 0;

  catalogItems.forEach((item) => {
    const matchesCategory = activeCatalogFilter === "all" || item.dataset.category === activeCatalogFilter;
    const searchableText = `${item.dataset.search ?? ""} ${item.textContent}`.toLocaleLowerCase();
    const matchesSearch = !query || searchableText.includes(query);
    item.hidden = !matchesCategory || !matchesSearch;
    if (!item.hidden) visibleItems += 1;
  });

  if (catalogEmpty) catalogEmpty.hidden = visibleItems > 0;
  if (catalogSearchClear) catalogSearchClear.hidden = !query;
}

catalogFilters.forEach((filterButton) => {
  filterButton.addEventListener("click", () => {
    activeCatalogFilter = filterButton.dataset.filter ?? "all";
    catalogFilters.forEach((button) => {
      const isSelected = button === filterButton;
      button.classList.toggle("is-active", isSelected);
      button.setAttribute("aria-pressed", String(isSelected));
    });
    updateCatalog();
  });
});

catalogSearch?.addEventListener("submit", (event) => event.preventDefault());
catalogSearchInput?.addEventListener("input", updateCatalog);
catalogSearchClear?.addEventListener("click", () => {
  catalogSearchInput.value = "";
  updateCatalog();
  catalogSearchInput.focus();
});

const photoViewer = document.querySelector(".photo-viewer");
const viewerImage = document.querySelector(".viewer-image");
const viewerCaption = document.querySelector(".viewer-caption");
const viewerClose = document.querySelector(".viewer-close");

if (photoViewer && viewerImage && viewerCaption && viewerClose) {
  document.querySelectorAll("[data-lightbox]").forEach((photoButton) => {
    photoButton.addEventListener("click", () => {
      const alternateImage = photoButton.querySelector(".catalog-hover-image");
      const isAlternateVisible = alternateImage && (
        window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 601px)").matches &&
        (photoButton.matches(":hover") || photoButton.matches(":focus-visible"))
      );
      const image = isAlternateVisible
        ? alternateImage
        : photoButton.querySelector(":scope > img:not(.catalog-hover-image)");
      if (!image) throw new Error("Photo viewer buttons must contain an image.");

      viewerImage.src = image.currentSrc || image.src;
      viewerImage.alt = image.alt;
      viewerCaption.textContent = isAlternateVisible
        ? image.alt
        : photoButton.dataset.caption || image.alt;
      photoViewer.showModal();
      viewerClose.focus();
    });
  });

  viewerClose.addEventListener("click", () => photoViewer.close());
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && photoViewer.open) {
      event.preventDefault();
      photoViewer.close();
    }
  });
  photoViewer.addEventListener("click", (event) => {
    if (event.target === photoViewer) photoViewer.close();
  });
  photoViewer.addEventListener("close", () => {
    viewerImage.removeAttribute("src");
    viewerImage.alt = "";
    viewerCaption.textContent = "";
  });
}

// Reveal portfolio and session content as it enters the viewport.
const revealItems = document.querySelectorAll(".project-card, .session-card, .section-heading");
revealItems.forEach((item) => item.classList.add("reveal"));

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}
