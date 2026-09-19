// Freebie popup (_includes/freebie-modal.html). Auto-opens once per page view
// when [data-freebie-trigger] scrolls off the top, unless the visitor closed it
// or signed up within the last 30 days. [data-open-freebie] opens it on demand.
(function () {
  var modal = document.getElementById("freebie-modal");
  if (!modal || typeof modal.showModal !== "function") return;

  var STORAGE_KEY = "freebieModalSnoozedUntil";
  var SNOOZE_MS = 30 * 24 * 60 * 60 * 1000;

  function isSnoozed() {
    try {
      return Number(localStorage.getItem(STORAGE_KEY)) > Date.now();
    } catch (e) {
      return false;
    }
  }

  function snooze() {
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now() + SNOOZE_MS));
    } catch (e) {}
  }

  function open() {
    if (!modal.open) modal.showModal();
  }

  modal.addEventListener("close", snooze);

  // Close on the X or on a click on the backdrop (outside the panel).
  modal.addEventListener("click", function (event) {
    if (event.target === modal || event.target.closest("[data-close-freebie]")) {
      modal.close();
    }
  });

  // EmailOctopus injects the form after load; delegate so we catch it.
  modal.addEventListener("submit", snooze, true);

  document.addEventListener("click", function (event) {
    var opener = event.target.closest("[data-open-freebie]");
    if (!opener) return;
    event.preventDefault();
    open();
  });

  var trigger = document.querySelector("[data-freebie-trigger]");
  if (!trigger || isSnoozed() || !("IntersectionObserver" in window)) return;

  var observer = new IntersectionObserver(function (entries) {
    var entry = entries[0];
    if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
      observer.disconnect();
      if (!isSnoozed()) open();
    }
  });
  observer.observe(trigger);
})();
