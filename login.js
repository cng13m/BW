const supabaseClient = window.bwSupabase;
const loginForm = document.querySelector("#loginForm");
const toast = document.querySelector("#toast");

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.setTimeout(() => toast.classList.remove("is-visible"), 2800);
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = Object.fromEntries(new FormData(loginForm).entries());
  const submitButton = loginForm.querySelector("button[type='submit']");
  submitButton.disabled = true;
  submitButton.textContent = "Duke u kycur...";

  const { error } = await supabaseClient.auth.signInWithPassword({
    email: form.email,
    password: form.password
  });

  if (error) {
    submitButton.disabled = false;
    submitButton.textContent = "Kycu";
    showToast(error.message);
    return;
  }

  window.location.href = "dashboard.html";
});
