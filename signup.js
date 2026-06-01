const supabaseClient = window.bwSupabase;
const signupForm = document.querySelector("#signupForm");
const toast = document.querySelector("#toast");

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.setTimeout(() => toast.classList.remove("is-visible"), 2800);
}

signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = Object.fromEntries(new FormData(signupForm).entries());
  const submitButton = signupForm.querySelector("button[type='submit']");
  submitButton.disabled = true;
  submitButton.textContent = "Duke u krijuar...";

  const { data: authData, error: authError } = await supabaseClient.auth.signUp({
    email: form.email,
    password: form.password
  });

  if (authError || !authData.user) {
    submitButton.disabled = false;
    submitButton.textContent = "Krijo llogarine";
    showToast(authError?.message || "Nuk u krijua llogaria.");
    return;
  }

  const { data: salon, error: salonError } = await supabaseClient
    .from("salons")
    .insert({
      name: form.salonName,
      owner_name: form.ownerName,
      email: form.email,
      city: form.city,
      address: form.address || null,
      phone: form.phone,
      instagram: form.instagram || null,
      description: form.description || null,
      status: "pending"
    })
    .select()
    .single();

  if (salonError || !salon) {
    submitButton.disabled = false;
    submitButton.textContent = "Krijo llogarine";
    showToast(salonError?.message || "Llogaria u krijua, por salloni nuk u ruajt.");
    return;
  }

  const { error: linkError } = await supabaseClient.from("salon_users").insert({
    user_id: authData.user.id,
    salon_id: salon.id,
    role: "owner"
  });

  if (linkError) {
    submitButton.disabled = false;
    submitButton.textContent = "Krijo llogarine";
    showToast(linkError.message);
    return;
  }

  window.location.href = "dashboard.html";
});
