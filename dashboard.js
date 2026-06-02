const supabaseClient = window.bwSupabase;
const toast = document.querySelector("#toast");
const dashboardSalonName = document.querySelector("#dashboardSalonName");
const dashboardTitle = document.querySelector("#dashboardTitle");
const dashboardMeta = document.querySelector("#dashboardMeta");
const locationForm = document.querySelector("#locationForm");
const dashboardCity = document.querySelector("#dashboardCity");
const dashboardAddress = document.querySelector("#dashboardAddress");
const dashboardImageUrl = document.querySelector("#dashboardImageUrl");
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
    currentSalon?.name,
    dashboardAddress.value.trim(),
    dashboardCity.value.trim(),
    "Kosovo"
  ].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query || "Kosovo")}`;
}

function updateDashboardMapLink() {
  dashboardMapLink.href = mapUrlForSalon();
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
    serviceForm.querySelector("button[type='submit']").disabled = true;
    return;
  }

  currentSalon = link.salons;
  dashboardSalonName.textContent = currentSalon.name;
  dashboardTitle.textContent = currentSalon.name;
  dashboardMeta.textContent = `${currentSalon.city} - ${currentSalon.address || "Pa adrese"} - statusi: ${statusLabel(currentSalon.status)}`;
  dashboardCity.value = currentSalon.city || "";
  dashboardAddress.value = currentSalon.address || "";
  dashboardImageUrl.value = currentSalon.image_url || "";
  updateDashboardMapLink();

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
    <div class="request-item">
      <strong>${escapeHtml(service.name)}</strong>
      <small>${euro(service.price)} - ${service.duration_minutes || 30} min</small>
    </div>
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

locationForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!currentSalon) return;
  if (!locationForm.reportValidity()) return;

  const form = Object.fromEntries(new FormData(locationForm).entries());
  const submitButton = locationForm.querySelector("button[type='submit']");
  setButtonLoading(submitButton, true, "Duke u ruajtur...");

  const { data, error } = await supabaseClient
    .from("salons")
    .update({
      city: form.city.trim(),
      address: form.address.trim() || null,
      image_url: form.imageUrl.trim() || null
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
  dashboardMeta.textContent = `${currentSalon.city} - ${currentSalon.address || "Pa adrese"} - statusi: ${statusLabel(currentSalon.status)}`;
  updateDashboardMapLink();
  setButtonLoading(submitButton, false);
  showToast("Lokacioni dhe fotoja u perditesuan.");
});

[dashboardCity, dashboardAddress].forEach((input) => {
  input.addEventListener("input", updateDashboardMapLink);
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

loadDashboard();
