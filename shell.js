(() => {
  "use strict";

  const sandbox = document.querySelector("#sandbox");
  const header = document.querySelector(".shell-header");
  const sectionLinks = [...header.querySelectorAll(".shell-navigation a")];

  // Прототипы могут слушать эти события на #sandbox или document.
  function emit(type, detail) {
    sandbox.dispatchEvent(new CustomEvent(`shell:${type}`, { bubbles: true, detail }));
  }

  function updateSection() {
    const hash = window.location.hash || "#documents";
    const currentLink = sectionLinks.find((link) => link.hash === hash);
    if (!currentLink) return;

    sectionLinks.forEach((link) => link.removeAttribute("aria-current"));
    currentLink.setAttribute("aria-current", "page");

    const { section } = currentLink.dataset;
    if (sandbox.dataset.section !== section) {
      sandbox.dataset.section = section;
      emit("section", { section });
    }
  }

  window.addEventListener("hashchange", updateSection);
  updateSection();

  const searchForm = header.querySelector(".shell-search");
  const searchInput = searchForm.querySelector("input");
  const clearButton = searchForm.querySelector(".shell-search-clear");
  const searchError = searchForm.querySelector("#search-error");

  function updateSearch(isInvalid = false) {
    const hasValue = searchInput.value !== "";
    searchForm.classList.toggle("has-value", hasValue);
    searchForm.classList.toggle("has-error", isInvalid);
    clearButton.hidden = !hasValue && !isInvalid;
    searchError.hidden = !isInvalid;

    if (isInvalid) {
      searchInput.setAttribute("aria-invalid", "true");
      searchInput.setAttribute("aria-describedby", searchError.id);
    } else {
      searchInput.removeAttribute("aria-invalid");
      searchInput.removeAttribute("aria-describedby");
    }
  }

  function clearSearch() {
    searchInput.value = "";
    searchInput.focus();
    updateSearch();
  }

  searchInput.addEventListener("input", () => updateSearch());
  clearButton.addEventListener("click", clearSearch);
  searchInput.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || clearButton.hidden) return;
    event.preventDefault();
    clearSearch();
  });

  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = searchInput.value.trim();
    const isInvalid = [...query].length < 2;
    updateSearch(isInvalid);
    if (isInvalid) return;
    emit("search", { query });
  });

  let openMenu;

  function closeMenu(restoreFocus = false) {
    if (!openMenu) return;
    const { trigger, panel } = openMenu;
    openMenu = undefined;
    panel.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
    if (restoreFocus) trigger.focus();
  }

  function showMenu(menu) {
    closeMenu();
    openMenu = menu;
    menu.trigger.setAttribute("aria-expanded", "true");
    menu.panel.hidden = false;
  }

  for (const trigger of header.querySelectorAll("[data-shell-menu]")) {
    const panel = document.getElementById(trigger.getAttribute("aria-controls"));
    const menu = { trigger, panel };
    const options = [...panel.querySelectorAll("button")];

    trigger.addEventListener("click", () => {
      if (openMenu === menu) closeMenu();
      else showMenu(menu);
    });

    trigger.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
      event.preventDefault();
      showMenu(menu);
      options.at(event.key === "ArrowDown" ? 0 : -1).focus();
    });

    panel.addEventListener("keydown", (event) => {
      const current = options.indexOf(event.target);
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      options[(current + step + options.length) % options.length].focus();
    });
  }

  function closeOutsideMenu(event) {
    if (openMenu && !openMenu.trigger.parentElement.contains(event.target)) closeMenu();
  }

  document.addEventListener("pointerdown", closeOutsideMenu);
  document.addEventListener("focusin", closeOutsideMenu);
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !openMenu) return;
    event.preventDefault();
    closeMenu(true);
  });

  const organizationOptions = header.querySelector("#organization-options");

  organizationOptions.addEventListener("click", (event) => {
    if (event.target.closest("[data-organization]")) closeMenu(true);
  });

  header.addEventListener("click", (event) => {
    const button = event.target.closest("[data-shell-action]");
    if (!button) return;
    closeMenu(true);
    emit("action", { action: button.dataset.shellAction });
  });
})();
