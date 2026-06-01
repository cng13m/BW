const categories = ["All", "Barber", "Nails", "Hair", "Skincare", "Massage"];

const SUPABASE_URL = "https://ymcvloitokyejqgwhjjd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_laKxjcT7H_nI27aB1heRJA_ISO2mCk2";
const supabaseClient = window.supabase?.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

let salons = [
  {
    id: "lumi-barber",
    name: "Lumi Barber Studio",
    category: "Barber",
    city: "Prishtina",
    area: "Bregu i Diellit",
    rating: 4.9,
    reviews: 126,
    verified: true,
    openToday: true,
    responseMinutes: 8,
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80",
    services: [
      { name: "Haircut", price: 8, duration: "30 min" },
      { name: "Beard trim", price: 5, duration: "20 min" },
      { name: "Haircut + beard", price: 12, duration: "45 min" }
    ]
  },
  {
    id: "nora-nails",
    name: "Nora Nails Lounge",
    category: "Nails",
    city: "Prishtina",
    area: "Qendra",
    rating: 4.8,
    reviews: 94,
    verified: true,
    openToday: true,
    responseMinutes: 12,
    image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&q=80",
    services: [
      { name: "Gel nails", price: 18, duration: "60 min" },
      { name: "Manicure", price: 10, duration: "35 min" },
      { name: "Pedicure", price: 14, duration: "45 min" }
    ]
  },
  {
    id: "arba-hair",
    name: "Arba Hair Atelier",
    category: "Hair",
    city: "Prishtina",
    area: "Ulpiana",
    rating: 4.7,
    reviews: 78,
    verified: true,
    openToday: false,
    responseMinutes: 18,
    image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1200&q=80",
    services: [
      { name: "Blow dry", price: 12, duration: "35 min" },
      { name: "Hair coloring", price: 35, duration: "120 min" },
      { name: "Cut and style", price: 18, duration: "60 min" }
    ]
  },
  {
    id: "vera-skin",
    name: "Vera Skin Clinic",
    category: "Skincare",
    city: "Prishtina",
    area: "Dardania",
    rating: 4.9,
    reviews: 141,
    verified: true,
    openToday: true,
    responseMinutes: 20,
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80",
    services: [
      { name: "Deep facial", price: 28, duration: "60 min" },
      { name: "Hydration treatment", price: 35, duration: "75 min" },
      { name: "Skin consultation", price: 15, duration: "30 min" }
    ]
  },
  {
    id: "mira-massage",
    name: "Mira Wellness Massage",
    category: "Massage",
    city: "Prizren",
    area: "Center",
    rating: 4.6,
    reviews: 52,
    verified: false,
    openToday: true,
    responseMinutes: 25,
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80",
    services: [
      { name: "Relax massage", price: 25, duration: "60 min" },
      { name: "Deep tissue", price: 35, duration: "75 min" },
      { name: "Back massage", price: 15, duration: "30 min" }
    ]
  },
  {
    id: "rina-beauty",
    name: "Rina Beauty Room",
    category: "Skincare",
    city: "Peja",
    area: "Karagaq",
    rating: 4.7,
    reviews: 63,
    verified: false,
    openToday: false,
    responseMinutes: 16,
    image: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=1200&q=80",
    services: [
      { name: "Lash lift", price: 18, duration: "50 min" },
      { name: "Brow shaping", price: 7, duration: "20 min" },
      { name: "Makeup", price: 30, duration: "60 min" }
    ]
  }
];

const state = {
  category: "All",
  search: "",
  city: "all",
  sort: "recommended",
  openToday: false,
  verified: false
};

const storage = {
  get(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

const elements = {
  appLayout: document.querySelector(".app-layout"),
  categoryTabs: document.querySelector("#categoryTabs"),
  salonGrid: document.querySelector("#salonGrid"),
  resultCount: document.querySelector("#resultCount"),
  emptyState: document.querySelector("#emptyState"),
  searchInput: document.querySelector("#searchInput"),
  cityFilter: document.querySelector("#cityFilter"),
  sortFilter: document.querySelector("#sortFilter"),
  openTodayFilter: document.querySelector("#openTodayFilter"),
  verifiedFilter: document.querySelector("#verifiedFilter"),
  resetFilters: document.querySelector("#resetFilters"),
  salonCount: document.querySelector("#salonCount"),
  serviceCount: document.querySelector("#serviceCount"),
  profileDialog: document.querySelector("#profileDialog"),
  profileContent: document.querySelector("#profileContent"),
  closeProfile: document.querySelector("#closeProfile"),
  bookingDialog: document.querySelector("#bookingDialog"),
  closeBooking: document.querySelector("#closeBooking"),
  bookingForm: document.querySelector("#bookingForm"),
  bookingTitle: document.querySelector("#bookingTitle"),
  bookingSubtitle: document.querySelector("#bookingSubtitle"),
  requestList: document.querySelector("#requestList"),
  quickSalonForm: document.querySelector("#quickSalonForm"),
  leadList: document.querySelector("#leadList"),
  toast: document.querySelector("#toast")
};

function euro(value) {
  return `${value} EUR`;
}

function normalizeSalon(row, index) {
  const services = Array.isArray(row.services) ? row.services : [];
  const description = `${row.description ?? ""} ${row.name ?? ""}`.toLowerCase();
  const category = description.includes("barber")
    ? "Barber"
    : description.includes("nail")
      ? "Nails"
      : description.includes("skin") || description.includes("lash") || description.includes("brow")
        ? "Skincare"
        : description.includes("massage") || description.includes("spa")
          ? "Massage"
          : "Hair";

  return {
    id: row.id,
    name: row.name,
    category,
    city: row.city,
    area: row.address || "Kosovo",
    rating: 4.7 + ((index % 3) * 0.1),
    reviews: 12 + (index * 8),
    verified: true,
    openToday: true,
    responseMinutes: 10 + (index * 4),
    image: row.image_url || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80",
    phone: row.phone,
    instagram: row.instagram,
    description: row.description,
    services: services.map((service) => ({
      id: service.id,
      name: service.name,
      price: Number(service.price),
      duration: `${service.duration_minutes ?? 30} min`
    }))
  };
}

function minimumPrice(salon) {
  if (!salon.services.length) return 0;
  return Math.min(...salon.services.map((service) => service.price));
}

function serviceNames(salon) {
  return salon.services.map((service) => service.name).join(", ");
}

function renderCategories() {
  elements.categoryTabs.innerHTML = categories.map((category) => `
    <button class="chip ${state.category === category ? "is-active" : ""}" type="button" data-category="${category}">
      ${category}
    </button>
  `).join("");
}

function filterSalons() {
  const query = state.search.trim().toLowerCase();
  let results = salons.filter((salon) => {
    const matchesCategory = state.category === "All" || salon.category === state.category;
    const matchesCity = state.city === "all" || salon.city === state.city;
    const matchesOpen = !state.openToday || salon.openToday;
    const matchesVerified = !state.verified || salon.verified;
    const text = `${salon.name} ${salon.category} ${salon.city} ${salon.area} ${serviceNames(salon)}`.toLowerCase();
    const matchesSearch = !query || text.includes(query);
    return matchesCategory && matchesCity && matchesOpen && matchesVerified && matchesSearch;
  });

  results = results.sort((a, b) => {
    if (state.sort === "rating") return b.rating - a.rating;
    if (state.sort === "price") return minimumPrice(a) - minimumPrice(b);
    if (state.sort === "response") return a.responseMinutes - b.responseMinutes;
    return Number(b.verified) - Number(a.verified) || b.rating - a.rating;
  });

  return results;
}

function renderSalons() {
  const results = filterSalons();
  elements.resultCount.textContent = `${results.length} result${results.length === 1 ? "" : "s"}`;
  elements.emptyState.hidden = results.length !== 0;
  elements.salonGrid.innerHTML = results.map((salon) => `
    <article class="salon-card">
      <div class="salon-media" style="background-image: url('${salon.image}')">
        <div class="badge-row">
          ${salon.verified ? '<span class="badge">Verified</span>' : ""}
          <span class="badge">${salon.openToday ? "Open today" : "Closed today"}</span>
        </div>
      </div>
      <div class="salon-body">
        <div class="salon-title-row">
          <div>
            <h3>${salon.name}</h3>
            <div class="meta-line">${salon.category} &middot; ${salon.area}, ${salon.city}</div>
          </div>
          <div class="rating">&#9733; ${salon.rating}</div>
        </div>
        <div class="meta-line">${salon.services.length ? `From ${euro(minimumPrice(salon))}` : "Services coming soon"} &middot; replies in ${salon.responseMinutes} min</div>
        <div class="service-pills">
          ${salon.services.length ? salon.services.slice(0, 3).map((service) => `<span>${service.name}</span>`).join("") : "<span>No services yet</span>"}
        </div>
        <div class="card-actions">
          <button class="secondary-button" type="button" data-profile="${salon.id}">View profile</button>
          <button class="primary-button" type="button" data-book="${salon.id}">Book</button>
        </div>
      </div>
    </article>
  `).join("");
}

function renderStats() {
  elements.salonCount.textContent = salons.length;
  elements.serviceCount.textContent = salons.reduce((total, salon) => total + salon.services.length, 0);
}

function openProfile(salonId) {
  const salon = salons.find((item) => item.id === salonId);
  if (!salon) return;

  elements.profileContent.innerHTML = `
    <div class="profile-hero" style="background-image: url('${salon.image}')"></div>
    <div class="profile-body">
      <div>
        <p class="kicker">${salon.category}</p>
        <h2>${salon.name}</h2>
        <p class="profile-meta">${salon.area}, ${salon.city} &middot; &#9733; ${salon.rating} from ${salon.reviews} reviews &middot; ${salon.verified ? "Verified" : "New profile"}</p>
      </div>
      <div>
        <h3>Services</h3>
        <div class="service-list">
          ${salon.services.map((service) => `
            <div class="service-row">
              <span>${service.name}<br><small>${service.duration}</small></span>
              <strong>${euro(service.price)}</strong>
            </div>
          `).join("")}
        </div>
      </div>
      <button class="primary-button" type="button" data-book="${salon.id}">Request appointment</button>
    </div>
  `;
  elements.profileDialog.showModal();
}

function openBooking(salonId) {
  const salon = salons.find((item) => item.id === salonId);
  if (!salon) return;

  elements.bookingForm.reset();
  elements.bookingForm.elements.salonId.value = salon.id;
  elements.bookingTitle.textContent = `Book ${salon.name}`;
  elements.bookingSubtitle.textContent = `${salon.area}, ${salon.city} - replies in about ${salon.responseMinutes} minutes`;
  elements.bookingForm.elements.service.innerHTML = salon.services.map((service) => `
    <option value="${service.id || service.name}" data-name="${service.name}">${service.name} - ${euro(service.price)}</option>
  `).join("");

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  elements.bookingForm.elements.date.min = tomorrow.toISOString().slice(0, 10);

  if (!salon.services.length) {
    showToast("Add services for this salon before taking bookings.");
    return;
  }

  if (elements.profileDialog.open) elements.profileDialog.close();
  elements.bookingDialog.showModal();
}

function renderRequests() {
  const requests = storage.get("bwRequests", []);
  if (!requests.length) {
    elements.requestList.innerHTML = '<p class="meta-line">No booking requests yet.</p>';
    return;
  }

  elements.requestList.innerHTML = requests.map((request) => `
    <div class="request-item">
      <strong>${request.customerName} - ${request.service}</strong>
      <small>${request.salonName}</small>
      <small>${request.date} at ${request.time} - ${request.phone}</small>
      ${request.notes ? `<small>${request.notes}</small>` : ""}
    </div>
  `).join("");
}

function renderLeads() {
  const leads = storage.get("bwLeads", []);
  if (!leads.length) {
    elements.leadList.innerHTML = '<p class="meta-line">No salon leads saved yet.</p>';
    return;
  }

  elements.leadList.innerHTML = leads.map((lead) => `
    <div class="request-item">
      <strong>${lead.name}</strong>
      <small>${lead.category} - ${lead.contact}</small>
    </div>
  `).join("");
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  window.setTimeout(() => elements.toast.classList.remove("is-visible"), 2600);
}

function setView(view) {
  elements.appLayout.dataset.currentView = view;
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.view === view);
  });
}

function bindEvents() {
  elements.categoryTabs.addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (!button) return;
    state.category = button.dataset.category;
    renderCategories();
    renderSalons();
  });

  elements.searchInput.addEventListener("input", (event) => {
    state.search = event.target.value;
    renderSalons();
  });

  elements.cityFilter.addEventListener("change", (event) => {
    state.city = event.target.value;
    renderSalons();
  });

  elements.sortFilter.addEventListener("change", (event) => {
    state.sort = event.target.value;
    renderSalons();
  });

  elements.openTodayFilter.addEventListener("change", (event) => {
    state.openToday = event.target.checked;
    renderSalons();
  });

  elements.verifiedFilter.addEventListener("change", (event) => {
    state.verified = event.target.checked;
    renderSalons();
  });

  elements.resetFilters.addEventListener("click", () => {
    state.category = "All";
    state.search = "";
    state.city = "all";
    state.sort = "recommended";
    state.openToday = false;
    state.verified = false;
    elements.searchInput.value = "";
    elements.cityFilter.value = "all";
    elements.sortFilter.value = "recommended";
    elements.openTodayFilter.checked = false;
    elements.verifiedFilter.checked = false;
    renderCategories();
    renderSalons();
  });

  elements.salonGrid.addEventListener("click", (event) => {
    const profileButton = event.target.closest("[data-profile]");
    const bookButton = event.target.closest("[data-book]");
    if (profileButton) openProfile(profileButton.dataset.profile);
    if (bookButton) openBooking(bookButton.dataset.book);
  });

  elements.profileContent.addEventListener("click", (event) => {
    const bookButton = event.target.closest("[data-book]");
    if (bookButton) openBooking(bookButton.dataset.book);
  });

  elements.closeProfile.addEventListener("click", () => elements.profileDialog.close());
  elements.closeBooking.addEventListener("click", () => elements.bookingDialog.close());

  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      setView(button.dataset.view);
      document.querySelector(".app-layout").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  elements.bookingForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(elements.bookingForm).entries());
    const salon = salons.find((item) => item.id === data.salonId);
    const serviceSelect = elements.bookingForm.elements.service;
    const selectedOption = serviceSelect.options[serviceSelect.selectedIndex];
    const serviceName = selectedOption?.dataset.name || data.service;
    const serviceId = data.service?.includes("-") ? data.service : null;

    if (supabaseClient && salon) {
      const { error } = await supabaseClient.from("bookings").insert({
        salon_id: salon.id,
        service_id: serviceId,
        customer_name: data.customerName,
        customer_surname: data.customerSurname,
        customer_phone: data.phone,
        booking_date: data.date,
        booking_time: data.time,
        status: "pending",
        notes: data.notes || null
      });

      if (!error) {
        elements.bookingDialog.close();
        showToast("Booking request sent to Supabase.");
        return;
      }

      console.warn("Supabase booking failed:", error.message);
      showToast("Could not save to Supabase. Saved locally for now.");
    }

    const requests = storage.get("bwRequests", []);
    requests.unshift({
      ...data,
      salonName: salon.name,
      service: serviceName,
      createdAt: new Date().toISOString()
    });
    storage.set("bwRequests", requests);
    elements.bookingDialog.close();
    renderRequests();
    showToast("Booking request saved. Check Admin to see it.");
  });

  elements.quickSalonForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const lead = Object.fromEntries(new FormData(elements.quickSalonForm).entries());
    const leads = storage.get("bwLeads", []);
    leads.unshift({ ...lead, createdAt: new Date().toISOString() });
    storage.set("bwLeads", leads);
    elements.quickSalonForm.reset();
    renderLeads();
    showToast("Salon lead saved.");
  });
}

async function loadSupabaseData() {
  if (!supabaseClient) return;

  const { data, error } = await supabaseClient
    .from("salons")
    .select("*, services(*)")
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("Supabase load failed:", error.message);
    showToast("Using demo data. Check Supabase policies if real salons do not show.");
    return;
  }

  if (data?.length) {
    salons = data.map(normalizeSalon);
  }
}

async function init() {
  await loadSupabaseData();
  renderStats();
  renderCategories();
  renderSalons();
  renderRequests();
  renderLeads();
  setView("browse");
  bindEvents();
}

init();
