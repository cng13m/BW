const supabaseClient = window.bwSupabase;
const toast = document.querySelector("#toast");
const dashboardSalonName = document.querySelector("#dashboardSalonName");
const dashboardTitle = document.querySelector("#dashboardTitle");
const dashboardMeta = document.querySelector("#dashboardMeta");
const serviceForm = document.querySelector("#serviceForm");
const servicesList = document.querySelector("#dashboardServices");
const bookingsList = document.querySelector("#dashboardBookings");
const logoutButton = document.querySelector("#logoutButton");

let currentSalon = null;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.setTimeout(() => toast.classList.remove("is-visible"), 2800);
}

function euro(value) {
  return `${Number(value).toFixed(2)} EUR`;
}

async function loadDashboard() {
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
    return;
  }

  currentSalon = link.salons;
  dashboardSalonName.textContent = currentSalon.name;
  dashboardTitle.textContent = currentSalon.name;
  dashboardMeta.textContent = `${currentSalon.city} - ${currentSalon.address || "Pa adrese"} - statusi: ${currentSalon.status || "pending"}`;

  await Promise.all([loadServices(), loadBookings()]);
}

async function loadServices() {
  const { data, error } = await supabaseClient
    .from("services")
    .select("*")
    .eq("salon_id", currentSalon.id)
    .order("created_at", { ascending: false });

  if (error) {
    servicesList.innerHTML = '<p class="meta-line">Sherbimet nuk u ngarkuan.</p>';
    return;
  }

  if (!data.length) {
    servicesList.innerHTML = '<p class="meta-line">Ende nuk ke shtuar sherbime.</p>';
    return;
  }

  servicesList.innerHTML = data.map((service) => `
    <div class="request-item">
      <strong>${service.name}</strong>
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
    bookingsList.innerHTML = '<p class="meta-line">Kerkesat nuk u ngarkuan.</p>';
    return;
  }

  if (!data.length) {
    bookingsList.innerHTML = '<p class="meta-line">Ende nuk ka kerkesa per rezervim.</p>';
    return;
  }

  bookingsList.innerHTML = data.map((booking) => `
    <div class="request-item">
      <strong>${booking.customer_name} ${booking.customer_surname}</strong>
      <small>${booking.services?.name || "Sherbim"} - ${booking.booking_date} ne ${booking.booking_time}</small>
      <small>${booking.customer_phone} - ${booking.status}</small>
      ${booking.notes ? `<small>${booking.notes}</small>` : ""}
    </div>
  `).join("");
}

serviceForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!currentSalon) return;

  const form = Object.fromEntries(new FormData(serviceForm).entries());
  const { error } = await supabaseClient.from("services").insert({
    salon_id: currentSalon.id,
    name: form.name,
    price: Number(form.price),
    duration_minutes: Number(form.duration)
  });

  if (error) {
    showToast(error.message);
    return;
  }

  serviceForm.reset();
  showToast("Sherbimi u ruajt.");
  await loadServices();
});

logoutButton.addEventListener("click", async () => {
  await supabaseClient.auth.signOut();
  window.location.href = "login.html";
});

loadDashboard();
