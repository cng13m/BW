const supabaseClient = window.bwSupabase;
const toast = document.querySelector("#toast");
const dashboardSalonName = document.querySelector("#dashboardSalonName");
const dashboardTitle = document.querySelector("#dashboardTitle");
const dashboardMeta = document.querySelector("#dashboardMeta");
const salonForm = document.querySelector("#salonForm");
const dashboardName = document.querySelector("#dashboardName");
const dashboardPhone = document.querySelector("#dashboardPhone");
const dashboardInstagram = document.querySelector("#dashboardInstagram");
const dashboardCity = document.querySelector("#dashboardCity");
const dashboardAddress = document.querySelector("#dashboardAddress");
const dashboardImageFile = document.querySelector("#dashboardImageFile");
const dashboardImageUrl = document.querySelector("#dashboardImageUrl");
const dashboardImagePreview = document.querySelector("#dashboardImagePreview");
const dashboardDescription = document.querySelector("#dashboardDescription");
const dashboardLocationButton = document.querySelector("#dashboardLocationButton");
const dashboardMapLink = document.querySelector("#dashboardMapLink");
const serviceForm = document.querySelector("#serviceForm");
const servicesList = document.querySelector("#dashboardServices");
const bookingsList = document.querySelector("#dashboardBookings");
const logoutButton = document.querySelector("#logoutButton");

let currentSalon = null;

const statusLabels = {
  pending: "Ne pritje",
  approved: "Aktiv",
  confirmed: "Konfirmuar",
  rejected: "Refuzuar",
  completed: "Perfunduar",
  cancelled: "Anuluar"
};

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.setTimeout(() => toast.classList.remove("is-visible"), 2800);
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function setButtonLoading(button, isLoading, loadingText) {
  if (!button) return;
  if (isLoading) {
    button.dataset.originalText = button.textContent;
    button.textContent = loadingText;
    button.disabled = true;
    return;
  }
  button.textContent = button.dataset.originalText || button.textContent;
  button.disabled = false;
}

function euro(value) {
  return `${Number(value).toFixed(2)} EUR`;
}

function statusLabel(status) {
  return statusLabels[status] || status || "Ne pritje";
}

function mapUrlForSalon() {
  const query = [
    dashboardName.value.trim() || currentSalon?.name,
    dashboardAddress.value.trim(),
    dashboardCity.value.trim(),
    "Kosovo"
  ].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query || "Kosovo")}`;
}

function updateDashboardMapLink() {
  dashboardMapLink.href = mapUrlForSalon();
}

function updateImagePreview() {
  const imageUrl = dashboardImageUrl.value.trim();
  if (!imageUrl) {
    dashboardImagePreview.style.backgroundImage = "";
    dashboardImagePreview.innerHTML = "<span>Parapamja e fotos</span>";
    return;
  }

  dashboardImagePreview.style.backgroundImage = `url("${imageUrl.replace(/"/g, "%22")}")`;
  dashboardImagePreview.innerHTML = "";
}

function imageExtension(file) {
  return file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
}

async function uploadSalonImage(file, salonId) {
  if (!file || !file.size) return null;

  const path = `${salonId}/cover.${imageExtension(file)}`;
  const { error } = await supabaseClient.storage
    .from("salon-images")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: true
    });

  if (error) throw error;

  const { data } = supabaseClient.storage.from("salon-images").getPublicUrl(path);
  return `${data.publicUrl}?v=${Date.now()}`;
}

function setDashboardCurrentLocation() {
  if (!navigator.geolocation) {
    showToast("Shfletuesi nuk e mbeshtet lokacionin.");
    return;
  }

  dashboardLocationButton.disabled = true;
  dashboardLocationButton.textContent = "Duke kerkuar...";
  navigator.geolocation.getCurrentPosition((position) => {
    const latitude = position.coords.latitude.toFixed(6);
    const longitude = position.coords.longitude.toFixed(6);
    dashboardAddress.value = `Pin: ${latitude}, ${longitude}`;
    updateDashboardMapLink();
    dashboardLocationButton.disabled = false;
    dashboardLocationButton.textContent = "Perdor lokacionin tim";
    showToast("Pini u vendos. Ruaje lokacionin per ta publikuar.");
  }, () => {
    dashboardLocationButton.disabled = false;
    dashboardLocationButton.textContent = "Perdor lokacionin tim";
    showToast("Nuk u mor lokacioni. Lejo qasjen ose shkruaj adresen.");
  }, { enableHighAccuracy: true, timeout: 10000 });
}

async function loadDashboard() {
  if (!supabaseClient) {
    dashboardMeta.textContent = "Supabase nuk eshte gati.";
    servicesList.innerHTML = '<p class="meta-line">Kontrollo konfigurimin e Supabase para se te shtosh sherbime.</p>';
    bookingsList.innerHTML = '<p class="meta-line">Kerkesat shfaqen pasi Supabase te jete lidhur.</p>';
    salonForm.querySelector("button[type='submit']").disabled = true;
    serviceForm.querySelector("button[type='submit']").disabled = true;
    return;
  }

  const { data: sessionData } = await supabaseClient.auth.getSession();
  const user = sessionData.session?.user;

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const { data: link, error: linkError } = await supabaseClient
    .from("salon_users")
    .select("salon_id, salons(*)")
    .eq("user_id", user.id)
    .single();

  if (linkError || !link?.salons) {
    showToast("Nuk u gjet salloni per kete llogari.");
    dashboardMeta.textContent = "Nuk u gjet salloni. Regjistro sallonin ose kycu me llogarine e pronarit.";
    salonForm.querySelector("button[type='submit']").disabled = true;
    serviceForm.querySelector("button[type='submit']").disabled = true;
    return;
  }

  currentSalon = link.salons;
  dashboardSalonName.textContent = currentSalon.name;
  dashboardTitle.textContent = currentSalon.name;
  dashboardMeta.textContent = `${currentSalon.city} - ${currentSalon.address || "Pa adrese"} - statusi: ${statusLabel(currentSalon.status)}`;
  dashboardName.value = currentSalon.name || "";
  dashboardPhone.value = currentSalon.phone || "";
  dashboardInstagram.value = currentSalon.instagram || "";
  dashboardCity.value = currentSalon.city || "";
  dashboardAddress.value = currentSalon.address || "";
  dashboardImageUrl.value = currentSalon.image_url || "";
  dashboardDescription.value = currentSalon.description || "";
  updateDashboardMapLink();
  updateImagePreview();

  await Promise.all([loadServices(), loadBookings()]);
}

async function loadServices() {
  const { data, error } = await supabaseClient
    .from("services")
    .select("*")
    .eq("salon_id", currentSalon.id)
    .order("created_at", { ascending: false });

  if (error) {
    servicesList.innerHTML = '<p class="meta-line">Sherbimet nuk u ngarkuan. Provo rifreskimin e faqes.</p>';
    return;
  }

  if (!data.length) {
    servicesList.innerHTML = '<p class="meta-line">Ende nuk ke shtuar sherbime. Shto sherbimin e pare qe klientet te mund te rezervojne.</p>';
    return;
  }

  servicesList.innerHTML = data.map((service) => `
    <form class="request-item service-edit-form" data-service-id="${escapeHtml(service.id)}">
      <label>
        Sherbimi
        <input required name="name" value="${escapeHtml(service.name)}">
      </label>
      <div class="form-row">
        <label>
          Cmimi EUR
          <input required name="price" type="number" min="0" step="0.5" inputmode="decimal" value="${escapeHtml(service.price)}">
        </label>
        <label>
          Minuta
          <input required name="duration" type="number" min="5" step="5" inputmode="numeric" value="${escapeHtml(service.duration_minutes || 30)}">
        </label>
      </div>
      <div class="booking-actions">
        <button class="mini-button confirm" type="submit">Ruaj</button>
        <button class="mini-button reject" type="button" data-delete-service="${escapeHtml(service.id)}">Fshij</button>
      </div>
    </form>
  `).join("");
}

async function loadBookings() {
  const { data, error } = await supabaseClient
    .from("bookings")
    .select("*, services(name)")
    .eq("salon_id", currentSalon.id)
    .order("created_at", { ascending: false });

  if (error) {
    bookingsList.innerHTML = '<p class="meta-line">Kerkesat nuk u ngarkuan. Kontrollo politikat e Supabase ose provo perseri.</p>';
    return;
  }

  if (!data.length) {
    bookingsList.innerHTML = '<p class="meta-line">Ende nuk ka kerkesa per rezervim. Kur klientet dergojne formularin, ato shfaqen ketu me statusin "Ne pritje".</p>';
    return;
  }

  bookingsList.innerHTML = data.map((booking) => `
    <div class="request-item">
      <div class="request-topline">
        <strong>${escapeHtml(booking.customer_name)} ${escapeHtml(booking.customer_surname)}</strong>
        <span class="status-badge status-${booking.status || "pending"}">${statusLabel(booking.status)}</span>
      </div>
      <small>${escapeHtml(booking.services?.name || "Sherbim")} - ${escapeHtml(booking.booking_date)} ne ${escapeHtml(booking.booking_time)}</small>
      <small>${escapeHtml(booking.customer_phone)}</small>
      ${booking.notes ? `<small>${escapeHtml(booking.notes)}</small>` : ""}
      <div class="booking-actions">
        <button class="mini-button confirm" type="button" data-status="confirmed" data-booking-id="${booking.id}" ${booking.status === "confirmed" || booking.status === "completed" ? "disabled" : ""}>Konfirmo</button>
        <button class="mini-button reject" type="button" data-status="rejected" data-booking-id="${booking.id}" ${booking.status === "rejected" || booking.status === "completed" ? "disabled" : ""}>Refuzo</button>
        <button class="mini-button complete" type="button" data-status="completed" data-booking-id="${booking.id}" ${booking.status !== "confirmed" ? "disabled" : ""}>Perfundo</button>
      </div>
    </div>
  `).join("");
}

async function updateBookingStatus(bookingId, status, button) {
  setButtonLoading(button, true, "...");
  const { error } = await supabaseClient
    .from("bookings")
    .update({ status })
    .eq("id", bookingId)
    .eq("salon_id", currentSalon.id);

  if (error) {
    setButtonLoading(button, false);
    showToast(error.message);
    return;
  }

  showToast(`Rezervimi u perditesua: ${statusLabel(status)}.`);
  await loadBookings();
}

serviceForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!currentSalon) return;
  if (!serviceForm.reportValidity()) return;

  const form = Object.fromEntries(new FormData(serviceForm).entries());
  const submitButton = serviceForm.querySelector("button[type='submit']");
  setButtonLoading(submitButton, true, "Duke u ruajtur...");
  const { error } = await supabaseClient.from("services").insert({
    salon_id: currentSalon.id,
    name: form.name.trim(),
    price: Number(form.price),
    duration_minutes: Number(form.duration)
  });

  if (error) {
    setButtonLoading(submitButton, false);
    showToast(error.message);
    return;
  }

  serviceForm.reset();
  setButtonLoading(submitButton, false);
  showToast("Sherbimi u ruajt.");
  await loadServices();
});

salonForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!currentSalon) return;
  if (!salonForm.reportValidity()) return;

  const form = Object.fromEntries(new FormData(salonForm).entries());
  const imageFile = dashboardImageFile.files[0];
  const submitButton = salonForm.querySelector("button[type='submit']");
  setButtonLoading(submitButton, true, "Duke u ruajtur...");
  let imageUrl = form.imageUrl.trim() || null;

  try {
    if (imageFile) {
      imageUrl = await uploadSalonImage(imageFile, currentSalon.id);
    }
  } catch (error) {
    setButtonLoading(submitButton, false);
    showToast(`Fotoja nuk u ngarkua: ${error.message}`);
    return;
  }

  const { data, error } = await supabaseClient
    .from("salons")
    .update({
      name: form.name.trim(),
      phone: form.phone.trim(),
      instagram: form.instagram.trim() || null,
      city: form.city.trim(),
      address: form.address.trim() || null,
      image_url: imageUrl,
      description: form.description.trim() || null
    })
    .eq("id", currentSalon.id)
    .select()
    .single();

  if (error) {
    setButtonLoading(submitButton, false);
    showToast(error.message);
    return;
  }

  currentSalon = data;
  dashboardSalonName.textContent = currentSalon.name;
  dashboardTitle.textContent = currentSalon.name;
  dashboardMeta.textContent = `${currentSalon.city} - ${currentSalon.address || "Pa adrese"} - statusi: ${statusLabel(currentSalon.status)}`;
  dashboardImageUrl.value = currentSalon.image_url || "";
  dashboardImageFile.value = "";
  updateDashboardMapLink();
  updateImagePreview();
  setButtonLoading(submitButton, false);
  showToast("Profili publik u perditesua.");
});

[dashboardName, dashboardCity, dashboardAddress].forEach((input) => {
  input.addEventListener("input", updateDashboardMapLink);
});

dashboardImageUrl.addEventListener("input", updateImagePreview);
dashboardImageFile.addEventListener("change", () => {
  const file = dashboardImageFile.files[0];
  if (!file) {
    updateImagePreview();
    return;
  }

  dashboardImagePreview.style.backgroundImage = `url("${URL.createObjectURL(file)}")`;
  dashboardImagePreview.innerHTML = "";
});
dashboardLocationButton.addEventListener("click", setDashboardCurrentLocation);

logoutButton.addEventListener("click", async () => {
  await supabaseClient.auth.signOut();
  window.location.href = "login.html";
});

bookingsList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-booking-id]");
  if (!button) return;
  updateBookingStatus(button.dataset.bookingId, button.dataset.status, button);
});

servicesList.addEventListener("submit", async (event) => {
  const formElement = event.target.closest("[data-service-id]");
  if (!formElement) return;
  event.preventDefault();
  if (!currentSalon) return;
  if (!formElement.reportValidity()) return;

  const form = Object.fromEntries(new FormData(formElement).entries());
  const submitButton = formElement.querySelector("button[type='submit']");
  setButtonLoading(submitButton, true, "...");

  const { error } = await supabaseClient
    .from("services")
    .update({
      name: form.name.trim(),
      price: Number(form.price),
      duration_minutes: Number(form.duration)
    })
    .eq("id", formElement.dataset.serviceId)
    .eq("salon_id", currentSalon.id);

  setButtonLoading(submitButton, false);
  if (error) {
    showToast(error.message);
    return;
  }

  showToast("Sherbimi u perditesua.");
  await loadServices();
});

servicesList.addEventListener("click", async (event) => {
  const deleteButton = event.target.closest("[data-delete-service]");
  if (!deleteButton) return;
  if (!currentSalon) return;
  if (!confirm("A je i sigurt qe do ta fshish kete sherbim?")) return;

  setButtonLoading(deleteButton, true, "...");
  const { error } = await supabaseClient
    .from("services")
    .delete()
    .eq("id", deleteButton.dataset.deleteService)
    .eq("salon_id", currentSalon.id);

  if (error) {
    setButtonLoading(deleteButton, false);
    showToast(error.message);
    return;
  }

  showToast("Sherbimi u fshi.");
  await loadServices();
});

loadDashboard();
