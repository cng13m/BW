const supabaseClient = window.bwSupabase;
const loginForm = document.querySelector("#loginForm");
const toast = document.querySelector("#toast");

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.setTimeout(() => toast.classList.remove("is-visible"), 2800);
}

function setSubmitState(isLoading) {
  const submitButton = loginForm.querySelector("button[type='submit']");
  submitButton.disabled = isLoading;
  submitButton.textContent = isLoading ? "Duke u kycur..." : "Kycu";
}

function friendlyLoginMessage(message) {
  if (!message) return "Nuk u krye kycja. Provo perseri.";
  if (message.toLowerCase().includes("invalid")) return "Emaili ose fjalekalimi nuk eshte i sakte.";
  if (message.toLowerCase().includes("confirm")) return "Kontrollo emailin dhe konfirmo llogarine para kycjes.";
  return message;
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!loginForm.reportValidity()) return;
  if (!supabaseClient) {
    showToast("Supabase nuk eshte gati. Kontrollo konfigurimin dhe provo perseri.");
    return;
  }

  const form = Object.fromEntries(new FormData(loginForm).entries());
  form.email = form.email.trim().toLowerCase();
  setSubmitState(true);

  const { error } = await supabaseClient.auth.signInWithPassword({
    email: form.email,
    password: form.password
  });

  if (error) {
    setSubmitState(false);
    showToast(friendlyLoginMessage(error.message));
    return;
  }

  window.location.href = "dashboard.html";
});
