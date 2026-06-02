const supabaseClient = window.bwSupabase;
const signupForm = document.querySelector("#signupForm");
const toast = document.querySelector("#toast");
const addressInput = document.querySelector("#addressInput");
const cityInput = signupForm.elements.city;
const salonNameInput = signupForm.elements.salonName;
const useLocationButton = document.querySelector("#useLocationButton");
const previewMapLink = document.querySelector("#previewMapLink");

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.setTimeout(() => toast.classList.remove("is-visible"), 2800);
}

function setSubmitState(isLoading) {
  const submitButton = signupForm.querySelector("button[type='submit']");
  submitButton.disabled = isLoading;
  submitButton.textContent = isLoading ? "Duke u krijuar..." : "Krijo llogarine";
}

function friendlyAuthMessage(message) {
  if (!message) return "Nuk u krijua llogaria. Provo perseri.";
  if (message.toLowerCase().includes("already")) return "Ky email eshte regjistruar. Provo te kycesh.";
  if (message.toLowerCase().includes("password")) return "Fjalekalimi duhet te kete te pakten 6 karaktere.";
  return message;
}

function mapUrlForLocation() {
  const address = addressInput.value.trim();
  const city = cityInput.value.trim();
  const salonName = salonNameInput.value.trim();
  const query = [salonName, address, city, "Kosovo"].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query || "Kosovo")}`;
}

function updateMapLink() {
  previewMapLink.href = mapUrlForLocation();
}

function setCurrentLocation() {
  if (!navigator.geolocation) {
    showToast("Shfletuesi nuk e mbeshtet lokacionin.");
    return;
  }

  useLocationButton.disabled = true;
  useLocationButton.textContent = "Duke kerkuar...";
  navigator.geolocation.getCurrentPosition((position) => {
    const latitude = position.coords.latitude.toFixed(6);
    const longitude = position.coords.longitude.toFixed(6);
    addressInput.value = `Pin: ${latitude}, ${longitude}`;
    updateMapLink();
    useLocationButton.disabled = false;
    useLocationButton.textContent = "Perdor lokacionin tim";
    showToast("Pini u ruajt ne fushe. Kontrolloje ne harte.");
  }, () => {
    useLocationButton.disabled = false;
    useLocationButton.textContent = "Perdor lokacionin tim";
    showToast("Nuk u mor lokacioni. Lejo qasjen ose shkruaj adresen.");
  }, { enableHighAccuracy: true, timeout: 10000 });
}

[addressInput, cityInput, salonNameInput].forEach((input) => {
  input.addEventListener("input", updateMapLink);
});

useLocationButton.addEventListener("click", setCurrentLocation);
updateMapLink();

signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!signupForm.reportValidity()) return;
  if (!supabaseClient) {
    showToast("Supabase nuk eshte gati. Kontrollo konfigurimin dhe provo perseri.");
    return;
  }

  const form = Object.fromEntries(new FormData(signupForm).entries());
  form.email = form.email.trim().toLowerCase();
  form.city = form.city.trim();
  form.phone = form.phone.trim();
  form.imageUrl = form.imageUrl.trim();
  setSubmitState(true);

  const { data: authData, error: authError } = await supabaseClient.auth.signUp({
    email: form.email,
    password: form.password
  });

  if (authError || !authData.user) {
    setSubmitState(false);
    showToast(friendlyAuthMessage(authError?.message));
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
      image_url: form.imageUrl || null,
      description: form.description || null,
      status: "pending"
    })
    .select()
    .single();

  if (salonError || !salon) {
    setSubmitState(false);
    showToast(salonError?.message || "Llogaria u krijua, por salloni nuk u ruajt.");
    return;
  }

  const { error: linkError } = await supabaseClient.from("salon_users").insert({
    user_id: authData.user.id,
    salon_id: salon.id,
    role: "owner"
  });

  if (linkError) {
    setSubmitState(false);
    showToast(linkError.message);
    return;
  }

  window.location.href = "dashboard.html";
});
