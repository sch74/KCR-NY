(() => {
  "use strict";

  const sandbox = document.querySelector("#sandbox");
  const sections = [...sandbox.querySelectorAll("[data-page]")];

  async function enterService() {
    const pageLoaded = document.readyState === "complete"
      ? Promise.resolve()
      : new Promise((resolve) => window.addEventListener("load", resolve, { once: true }));

    const minimumDisplayTime = new Promise((resolve) => {
      requestAnimationFrame(() => setTimeout(resolve, 1500));
    });

    await Promise.all([minimumDisplayTime, pageLoaded]);
    window.scrollTo(0, 0);
    document.documentElement.classList.remove("is-entering");
  }

  enterService();

  function showSection(name) {
    for (const section of sections) {
      section.hidden = section.dataset.page !== name;
    }
  }

  sandbox.addEventListener("shell:section", (event) => showSection(event.detail.section));
  showSection(sandbox.dataset.section);

  const toggle = document.querySelector(".holiday-toggle");
  const holidayElements = document.querySelectorAll("[data-holiday]");
  const standardElements = document.querySelectorAll("[data-standard]");

  toggle.addEventListener("click", () => {
    const holidayEnabled = toggle.getAttribute("aria-checked") === "false";
    toggle.setAttribute("aria-checked", String(holidayEnabled));
    document.body.classList.toggle("is-standard", !holidayEnabled);
    for (const element of holidayElements) element.hidden = !holidayEnabled;
    for (const element of standardElements) element.hidden = holidayEnabled;
  });

  let activeFeedback;
  let feedbackTimer;

  function showFeedback(button, message) {
    clearTimeout(feedbackTimer);
    if (activeFeedback) activeFeedback.textContent = "";
    const feedback = button.nextElementSibling;
    activeFeedback = feedback;
    feedback.textContent = message;
    feedbackTimer = setTimeout(() => {
      feedback.textContent = "";
      activeFeedback = null;
    }, 1800);
  }

  for (const button of sandbox.querySelectorAll("[data-copy]")) {
    button.addEventListener("click", async () => {
      const address = document.getElementById(button.dataset.copy);
      try {
        await navigator.clipboard.writeText(address.innerText);
        showFeedback(button, "Адрес скопирован");
      } catch {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(address);
        selection.removeAllRanges();
        selection.addRange(range);
        showFeedback(button, "Адрес выделен. Скопируйте его");
      }
    });
  }
})();
