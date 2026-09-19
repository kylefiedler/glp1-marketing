// Submit Formspree forms in place and send the visitor to our own thanks page
// (form[data-thanks]) instead of Formspree's generic one. Without JS the form
// still posts normally and Formspree shows its default confirmation.
document.querySelectorAll("form[data-thanks]").forEach(function (form) {
  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var button = form.querySelector('[type="submit"]');
    var label = button.textContent;
    var error = form.querySelector(".form-error");

    button.disabled = true;
    button.textContent = "Sending…";
    if (error) error.remove();

    fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" }
    })
      .then(function (response) {
        if (!response.ok) throw new Error(response.status);
        window.location.href = form.dataset.thanks;
      })
      .catch(function () {
        button.disabled = false;
        button.textContent = label;
        error = document.createElement("p");
        error.className = "form-error";
        error.setAttribute("role", "alert");
        error.textContent = "Sorry, that didn’t go through. Please try again.";
        form.appendChild(error);
      });
  });
});
