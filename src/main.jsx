import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { createClient } from "@supabase/supabase-js";
import "../styles.css";

const SUPABASE_URL = "https://ymcvloitokyejqgwhjjd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_laKxjcT7H_nI27aB1heRJA_ISO2mCk2";
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const categories = ["All", "Barber", "Nails", "Hair", "Skincare", "Massage"];
const categoryLabels = {
  All: "Te gjitha",
  Barber: "Berber",
  Nails: "Thonj",
  Hair: "Floke",
  Skincare: "Kujdes fytyre",
  Massage: "Masazh"
};

const kosovoCities = [
  "Decan", "Dragash", "Drenas", "Ferizaj", "Fushe Kosova", "Gjakova", "Gjilan",
  "Gracanica", "Hani i Elezit", "Istog", "Junik", "Kacanik", "Kamenica", "Klina",
  "Kllokot", "Leposaviq", "Lipjan", "Malisheva", "Mamusha", "Mitrovica",
  "Mitrovica e Veriut", "Novoberda", "Obiliq", "Partesh", "Peja", "Podujeva",
  "Prishtina", "Prizren", "Rahovec", "Ranillug", "Shterpca", "Shtime",
  "Skenderaj", "Suhareka", "Viti", "Vushtrri", "Zubin Potok", "Zvecan"
];

const demoSalons = [
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
      { name: "Prerje flokesh", price: 8, duration: "30 min" },
      { name: "Rregullim mjekre", price: 5, duration: "20 min" },
      { name: "Prerje + mjekerr", price: 12, duration: "45 min" }
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
      { name: "Thonj gel", price: 18, duration: "60 min" },
      { name: "Manikyr", price: 10, duration: "35 min" },
      { name: "Pedikyr", price: 14, duration: "45 min" }
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
      { name: "Fenirim", price: 12, duration: "35 min" },
      { name: "Ngjyrosje flokesh", price: 35, duration: "120 min" },
      { name: "Prerje dhe stilim", price: 18, duration: "60 min" }
    ]
  }
];

const statusLabels = {
  pending: "Ne pritje",
  approved: "Aktiv",
  confirmed: "Konfirmuar",
  rejected: "Refuzuar",
  completed: "Perfunduar",
  cancelled: "Anuluar"
};

const serviceCards = [
  {
    category: "Hair",
    title: "Floke",
    text: "Prerje, ngjyrosje, fenirim",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=82"
  },
  {
    category: "Skincare",
    title: "Kujdes fytyre",
    text: "Facial, pastrim, trajtime",
    image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=82"
  },
  {
    category: "Massage",
    title: "Masazh",
    text: "Relaksim dhe terapi",
    image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=900&q=82"
  },
  {
    category: "Barber",
    title: "Berber",
    text: "Prerje, mjekerr, stilim",
    image: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=900&q=82"
  },
  {
    category: "Nails",
    title: "Thonj",
    text: "Manikyr, pedikyr, gel",
    image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=900&q=82"
  }
];

const benefitCards = [
  ["Cilesi", "Sallone te zgjedhura dhe trajtime te kujdesshme."],
  ["Eksperte", "Profesioniste me vleresime dhe sherbime te qarta."],
  ["Sigurt", "Kerkesa rezervimi pa telefonata te gjata."],
  ["Praktike", "Gjej vendet e preferuara dhe rezervo me shpejt."]
];

function euro(value) {
  return `${Number(value || 0).toFixed(Number(value) % 1 ? 2 : 0)} EUR`;
}

function minimumPrice(salon) {
  return salon.services?.length ? Math.min(...salon.services.map((service) => Number(service.price || 0))) : 0;
}

function serviceNames(salon) {
  return salon.services?.map((service) => service.name).join(", ") || "";
}

function statusLabel(status) {
  return statusLabels[status] || status || "Ne pritje";
}

function googleMapsUrl(salon) {
  const pin = String(salon.area || salon.address || "").match(/pin:\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/i);
  if (pin) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${pin[1]},${pin[2]}`)}`;
  }
  const location = [salon.name, salon.area || salon.address, salon.city, "Kosovo"].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location || "Kosovo")}`;
}

function storedRequests() {
  try {
    return JSON.parse(localStorage.getItem("bwRequests")) || [];
  } catch {
    return [];
  }
}

function storeFallbackRequest(request) {
  const requests = storedRequests();
  requests.unshift(request);
  localStorage.setItem("bwRequests", JSON.stringify(requests));
}

function classifySalon(row) {
  const description = `${row.description ?? ""} ${row.name ?? ""}`.toLowerCase();
  if (description.includes("barber") || description.includes("berber")) return "Barber";
  if (description.includes("nail") || description.includes("thonj")) return "Nails";
  if (description.includes("skin") || description.includes("lekure") || description.includes("fytyre") || description.includes("lash") || description.includes("qerpik") || description.includes("vetull")) return "Skincare";
  if (description.includes("massage") || description.includes("masazh") || description.includes("spa")) return "Massage";
  return "Hair";
}

function normalizeSalon(row, index) {
  const services = Array.isArray(row.services) ? row.services : [];
  return {
    id: row.id,
    name: row.name,
    category: classifySalon(row),
    city: row.city,
    area: row.address || "Kosovo",
    rating: 4.7 + ((index % 3) * 0.1),
    reviews: 12 + (index * 8),
    verified: row.status !== "pending",
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

function imageExtension(file) {
  return file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
}

async function uploadSalonImage(file, salonId) {
  if (!file?.size) return null;
  const path = `${salonId}/cover.${imageExtension(file)}`;
  const { error } = await supabaseClient.storage.from("salon-images").upload(path, file, {
    cacheControl: "3600",
    upsert: true
  });
  if (error) throw error;
  const { data } = supabaseClient.storage.from("salon-images").getPublicUrl(path);
  return `${data.publicUrl}?v=${Date.now()}`;
}

function Toast({ message }) {
  return <div className={`toast ${message ? "is-visible" : ""}`} role="status" aria-live="polite">{message}</div>;
}

function useToast() {
  const [message, setMessage] = useState("");
  const showToast = (nextMessage) => {
    setMessage(nextMessage);
    window.setTimeout(() => setMessage(""), 2800);
  };
  return [message, showToast];
}

function Header({ context = "Rezervime bukurie", dashboardName }) {
  const isHome = context === "Rezervime bukurie";
  return (
    <header className="topbar">
      <a className="brand" href="index.html" aria-label="Faqja kryesore Bukuri">
        <span className="brand-mark">B</span>
        <span>
          <strong>BUKURI</strong>
          <small>{dashboardName || context}</small>
        </span>
      </a>
      <nav className="nav-actions" aria-label="Navigimi kryesor">
        {isHome ? (
          <>
            <a className="nav-link desktop-link" href="#services">Sherbime</a>
            <a className="nav-link desktop-link" href="#salons-title">Sallone</a>
            <a className="nav-link desktop-link" href="signup.html">Per sallone</a>
            <a className="nav-link desktop-link" href="login.html">Kycu</a>
            <a className="primary-button nav-cta" href="#booking">Rezervo</a>
          </>
        ) : (
          <>
            <a className="nav-link desktop-link" href="index.html">Sallone</a>
            <a className="nav-link desktop-link" href="dashboard.html">Paneli</a>
            <a className="primary-button nav-cta" href="signup.html">Per sallone</a>
          </>
        )}
      </nav>
    </header>
  );
}

function HomePage() {
  const [toast, showToast] = useToast();
  const [salons, setSalons] = useState(demoSalons);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [bookingSalon, setBookingSalon] = useState(null);
  const [loadingBooking, setLoadingBooking] = useState(false);
  const [filters, setFilters] = useState({
    category: "All",
    search: "",
    city: "all",
    sort: "recommended",
    openToday: false,
    verified: false
  });

  useEffect(() => {
    async function loadSupabaseData() {
      const { data, error } = await supabaseClient
        .from("salons")
        .select("*, services(*)")
        .order("created_at", { ascending: false });
      if (error) {
        showToast("Po perdoren te dhena demo. Kontrollo Supabase nese sallonet reale nuk shfaqen.");
        return;
      }
      if (data?.length) setSalons(data.map(normalizeSalon));
    }
    loadSupabaseData();
  }, []);

  const results = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    return salons
      .filter((salon) => {
        const text = `${salon.name} ${salon.category} ${salon.city} ${salon.area} ${serviceNames(salon)}`.toLowerCase();
        return (filters.category === "All" || salon.category === filters.category)
          && (filters.city === "all" || salon.city?.toLowerCase() === filters.city.toLowerCase())
          && (!filters.openToday || salon.openToday)
          && (!filters.verified || salon.verified)
          && (!query || text.includes(query));
      })
      .sort((a, b) => {
        if (filters.sort === "rating") return b.rating - a.rating;
        if (filters.sort === "price") return minimumPrice(a) - minimumPrice(b);
        if (filters.sort === "reviews") return b.reviews - a.reviews;
        if (filters.sort === "response") return a.responseMinutes - b.responseMinutes;
        return Number(b.verified) - Number(a.verified) || b.rating - a.rating;
      });
  }, [filters, salons]);

  const setFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }));
  const resetFilters = () => setFilters({ category: "All", search: "", city: "all", sort: "recommended", openToday: false, verified: false });

  async function submitBooking(event) {
    event.preventDefault();
    const form = Object.fromEntries(new FormData(event.currentTarget).entries());
    const salon = bookingSalon;
    const service = salon.services.find((item) => String(item.id || item.name) === form.service);
    setLoadingBooking(true);
    const { error } = await supabaseClient.from("bookings").insert({
      salon_id: salon.id,
      service_id: service?.id || null,
      customer_name: form.customerName,
      customer_surname: form.customerSurname,
      customer_phone: form.phone,
      booking_date: form.date,
      booking_time: form.time,
      status: "pending",
      notes: form.notes || null
    });
    setLoadingBooking(false);
    if (error) {
      storeFallbackRequest({
        id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`,
        ...form,
        salonName: salon.name,
        service: service?.name || form.service,
        status: "pending",
        createdAt: new Date().toISOString()
      });
      setBookingSalon(null);
      showToast("Kerkesa u ruajt lokalisht. Supabase nuk e pranoi rezervimin.");
      return;
    }
    setBookingSalon(null);
    showToast("Kerkesa per rezervim u dergua.");
  }

  return (
    <>
      <Header context="Rezervime bukurie" />
      <main id="top" className="home-page">
        <section className="hero-shell" aria-labelledby="page-title">
          <div className="hero-copy">
            <p className="kicker">Bukuri. Besim. Ti.</p>
            <h1 id="page-title">Kujdesi per veten fillon ketu.</h1>
            <p>Rezervo sallone bukurie dhe mireqenieje ne Kosove me cmime te qarta, lokacion ne harte dhe kerkese te shpejte per termin.</p>
            <div className="hero-actions">
              <a className="primary-button" href="#booking">Rezervo termin</a>
              <a className="story-button" href="#services" aria-label="Shiko sherbimet"><span>▶</span> Shiko sherbimet</a>
            </div>
          </div>
        </section>

        <section id="booking" className="booking-strip" aria-label="Kerko termin">
          <label>
            <span>Zgjidh sherbimin</span>
            <select value={filters.category} onChange={(event) => setFilter("category", event.target.value)}>
              {categories.map((category) => <option key={category} value={category}>{categoryLabels[category]}</option>)}
            </select>
          </label>
          <label>
            <span>Zgjidh qytetin</span>
            <select value={filters.city} onChange={(event) => setFilter("city", event.target.value)}>
              <option value="all">Te gjitha qytetet</option>
              {kosovoCities.map((city) => <option key={city} value={city}>{city}</option>)}
            </select>
          </label>
          <label>
            <span>Kerko sallon</span>
            <input type="search" value={filters.search} onChange={(event) => setFilter("search", event.target.value)} placeholder="Sallon, sherbim, lagje" />
          </label>
          <button className="dark-button" type="button" onClick={() => document.getElementById("salons-title")?.scrollIntoView({ behavior: "smooth" })}>Kerko termin</button>
        </section>

        <section id="services" className="services-section" aria-labelledby="services-title">
          <p className="kicker">Sherbimet</p>
          <h2 id="services-title">Bukuri, ne menyren tende.</h2>
          <p className="section-copy">Zgjidh kategorine dhe shiko sallonet qe mund te te presin per trajtimin e radhes.</p>
          <div className="service-card-row">
            {serviceCards.map((service) => (
              <button className={`service-card ${filters.category === service.category ? "is-active" : ""}`} key={service.category} type="button" onClick={() => setFilter("category", service.category)}>
                <span className="service-image" style={{ backgroundImage: `url("${service.image}")` }} />
                <span className="service-icon">✦</span>
                <strong>{service.title}</strong>
                <small>{service.text}</small>
                <em>Shiko me shume</em>
              </button>
            ))}
          </div>
        </section>

        <section className="offer-band" aria-label="Oferta">
          <div className="offer-image" />
          <div>
            <p className="kicker">Oferta e momentit</p>
            <h2>Kujdesu per veten sot</h2>
            <p>Filtro sallonet dhe dergo kerkesen tende ne me pak se nje minute.</p>
            <a className="primary-button" href="#booking">Kerko termin</a>
          </div>
          <div className="offer-seal"><strong>20%</strong><span>zbritje</span></div>
        </section>

        <section className="benefit-row" aria-label="Pse Bukuri">
          {benefitCards.map(([title, text]) => (
            <div key={title}>
              <span>◇</span>
              <strong>{title}</strong>
              <small>{text}</small>
            </div>
          ))}
        </section>

        <section className="browse-view" aria-labelledby="salons-title">
          <div className="section-heading">
            <div>
              <p className="kicker">Sallonet</p>
              <h2 id="salons-title">Sallonet e disponueshme</h2>
            </div>
            <span className="result-count">{results.length} rezultate</span>
          </div>
          <div className="browse-tools">
            <div className="category-tabs" aria-label="Kategorite e sherbimeve">
              {categories.map((category) => (
                <button key={category} className={`chip ${filters.category === category ? "is-active" : ""}`} type="button" onClick={() => setFilter("category", category)}>
                  {categoryLabels[category]}
                </button>
              ))}
            </div>
            <label>Rendit
              <select value={filters.sort} onChange={(event) => setFilter("sort", event.target.value)}>
                <option value="recommended">Te rekomanduara</option>
                <option value="price">Me te lirat</option>
                <option value="rating">Me shume yje</option>
                <option value="reviews">Me shume vleresime</option>
                <option value="response">Pergjigja me e shpejte</option>
              </select>
            </label>
            <label className="toggle-row"><input type="checkbox" checked={filters.openToday} onChange={(event) => setFilter("openToday", event.target.checked)} /><span>Hapur sot</span></label>
            <label className="toggle-row"><input type="checkbox" checked={filters.verified} onChange={(event) => setFilter("verified", event.target.checked)} /><span>Vetem te verifikuara</span></label>
            <button className="text-button" type="button" onClick={resetFilters}>Pastro</button>
          </div>
          <div className="salon-grid">
            {results.map((salon) => <SalonCard key={salon.id} salon={salon} onProfile={setSelectedProfile} onBook={setBookingSalon} />)}
          </div>
          {!results.length && <p className="empty-state">Nuk u gjet asnje sallon. Provo nje qytet, kerkim ose kategori tjeter.</p>}
        </section>

        <footer className="site-footer">
          <div className="footer-brand">
            <strong>BUKURI</strong>
            <span>Rezervime bukurie ne Kosove.</span>
          </div>
          <div>
            <strong>Linke te shpejta</strong>
            <a href="#services">Sherbimet</a>
            <a href="signup.html">Regjistro sallonin</a>
            <a href="dashboard.html">Paneli</a>
          </div>
          <div>
            <strong>Platforma</strong>
            <span>{salons.length} sallone</span>
            <span>{salons.reduce((total, salon) => total + salon.services.length, 0)} sherbime</span>
            <span>Kerkese ne 1 min</span>
          </div>
          <div>
            <strong>Kontakt</strong>
            <span>hello@bukuri.app</span>
            <span>Prishtine, Kosove</span>
          </div>
        </footer>
      </main>

      {selectedProfile && <ProfileModal salon={selectedProfile} onClose={() => setSelectedProfile(null)} onBook={(salon) => { setSelectedProfile(null); setBookingSalon(salon); }} />}
      {bookingSalon && <BookingModal salon={bookingSalon} loading={loadingBooking} onClose={() => setBookingSalon(null)} onSubmit={submitBooking} />}
      <Toast message={toast} />
    </>
  );

}

function SalonCard({ salon, onProfile, onBook }) {
  return (
    <article className="salon-card">
      <div className="salon-media" style={{ backgroundImage: `url("${salon.image}")` }}>
        <div className="badge-row">
          {salon.verified && <span className="badge">Verifikuar</span>}
          <span className="badge">{salon.openToday ? "Hapur sot" : "Mbyllur sot"}</span>
        </div>
      </div>
      <div className="salon-body">
        <div className="salon-card-kicker">{categoryLabels[salon.category] || salon.category} studio</div>
        <div className="salon-title-row">
          <div>
            <h3>{salon.name}</h3>
            <div className="location-line">{salon.area}, {salon.city}</div>
          </div>
          <div className="rating"><span>★</span> {salon.rating.toFixed(1)}</div>
        </div>
        <div className="salon-facts">
          <span><small>Prej</small>{salon.services.length ? euro(minimumPrice(salon)) : "Se shpejti"}</span>
          <span><small>Pergjigje</small>{salon.responseMinutes} min</span>
        </div>
        <div className="service-pills">
          {salon.services.length ? salon.services.slice(0, 3).map((service) => <span key={service.id || service.name}>{service.name}</span>) : <span>Ende pa sherbime</span>}
        </div>
        <div className="card-actions">
          <button className="secondary-button" type="button" onClick={() => onProfile(salon)}>Shiko profilin</button>
          <a className="secondary-button" href={googleMapsUrl(salon)} target="_blank" rel="noopener noreferrer">Harta</a>
          <button className="primary-button" type="button" onClick={() => onBook(salon)} disabled={!salon.services.length}>Rezervo</button>
        </div>
      </div>
    </article>
  );
}

function Modal({ children, onClose, className }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className={className} role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
        <button className="close-button" type="button" onClick={onClose} aria-label="Mbyll">x</button>
        {children}
      </section>
    </div>
  );
}

function ProfileModal({ salon, onClose, onBook }) {
  return (
    <Modal className="profile-dialog" onClose={onClose}>
      <div className="profile-hero" style={{ backgroundImage: `url("${salon.image}")` }} />
      <div className="profile-body">
        <div>
          <p className="kicker">{categoryLabels[salon.category] || salon.category}</p>
          <h2>{salon.name}</h2>
          <p className="profile-meta">{salon.area}, {salon.city} - {salon.rating.toFixed(1)} nga {salon.reviews} vleresime - {salon.verified ? "Verifikuar" : "Profil i ri"}</p>
          {salon.description && <p className="meta-line">{salon.description}</p>}
        </div>
        <div>
          <h3>Sherbimet</h3>
          <div className="service-list">
            {salon.services.map((service) => (
              <div className="service-row" key={service.id || service.name}>
                <span>{service.name}<br /><small>{service.duration}</small></span>
                <strong>{euro(service.price)}</strong>
              </div>
            ))}
          </div>
        </div>
        <div className="card-actions profile-actions">
          <a className="secondary-button" href={googleMapsUrl(salon)} target="_blank" rel="noopener noreferrer">Shiko ne harte</a>
          {salon.instagram && <a className="secondary-button" href={`https://instagram.com/${salon.instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer">Instagram</a>}
          <button className="primary-button" type="button" onClick={() => onBook(salon)}>Kerko termin</button>
        </div>
      </div>
    </Modal>
  );
}

function BookingModal({ salon, loading, onClose, onSubmit }) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return (
    <Modal className="booking-dialog" onClose={onClose}>
      <form className="booking-form" onSubmit={onSubmit}>
        <div>
          <p className="kicker">Kerkese rezervimi</p>
          <h2>Rezervo te {salon.name}</h2>
          <p>{salon.area}, {salon.city} - pergjigjet per rreth {salon.responseMinutes} minuta</p>
        </div>
        <label>Emri<input required name="customerName" autoComplete="given-name" placeholder="Emri" /></label>
        <label>Mbiemri<input required name="customerSurname" autoComplete="family-name" placeholder="Mbiemri" /></label>
        <label>Numri i telefonit<input required name="phone" type="tel" autoComplete="tel" inputMode="tel" minLength="7" placeholder="+383 44 000 000" /></label>
        <label>Sherbimi
          <select required name="service">
            {salon.services.map((service) => <option key={service.id || service.name} value={service.id || service.name}>{service.name} - {euro(service.price)}</option>)}
          </select>
        </label>
        <div className="form-row">
          <label>Data<input required name="date" type="date" min={tomorrow.toISOString().slice(0, 10)} /></label>
          <label>Ora<input required name="time" type="time" /></label>
        </div>
        <label>Shenime<textarea name="notes" rows="3" placeholder="Opsionale" /></label>
        <button className="primary-button" type="submit" disabled={loading}>{loading ? "Duke u derguar..." : "Dergo kerkesen"}</button>
      </form>
    </Modal>
  );
}

function SignupPage() {
  const [toast, showToast] = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ ownerName: "", email: "", password: "", salonName: "", city: "", phone: "", address: "", instagram: "", imageUrl: "", description: "" });
  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const mapUrl = googleMapsUrl({ name: form.salonName, area: form.address, city: form.city });

  function setCurrentLocation() {
    if (!navigator.geolocation) {
      showToast("Shfletuesi nuk e mbeshtet lokacionin.");
      return;
    }
    navigator.geolocation.getCurrentPosition((position) => {
      setField("address", `Pin: ${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`);
      showToast("Pini u ruajt ne fushe. Kontrolloje ne harte.");
    }, () => showToast("Nuk u mor lokacioni. Lejo qasjen ose shkruaj adresen."), { enableHighAccuracy: true, timeout: 10000 });
  }

  async function submitSignup(event) {
    event.preventDefault();
    const imageFile = event.currentTarget.elements.imageFile.files[0];
    setLoading(true);
    const email = form.email.trim().toLowerCase();
    const { data: authData, error: authError } = await supabaseClient.auth.signUp({ email, password: form.password });
    if (authError || !authData.user) {
      setLoading(false);
      showToast(authError?.message || "Nuk u krijua llogaria.");
      return;
    }
    const { data: salon, error: salonError } = await supabaseClient.from("salons").insert({
      name: form.salonName.trim(),
      owner_name: form.ownerName.trim(),
      email,
      city: form.city.trim(),
      address: form.address.trim() || null,
      phone: form.phone.trim(),
      instagram: form.instagram.trim() || null,
      image_url: form.imageUrl.trim() || null,
      description: form.description.trim() || null,
      status: "pending"
    }).select().single();
    if (salonError || !salon) {
      setLoading(false);
      showToast(salonError?.message || "Llogaria u krijua, por salloni nuk u ruajt.");
      return;
    }
    try {
      if (imageFile) {
        const imageUrl = await uploadSalonImage(imageFile, salon.id);
        await supabaseClient.from("salons").update({ image_url: imageUrl }).eq("id", salon.id);
      }
    } catch (error) {
      setLoading(false);
      showToast(`Llogaria u krijua, por fotoja nuk u ngarkua: ${error.message}`);
      return;
    }
    const { error: linkError } = await supabaseClient.from("salon_users").insert({ user_id: authData.user.id, salon_id: salon.id, role: "owner" });
    setLoading(false);
    if (linkError) {
      showToast(linkError.message);
      return;
    }
    window.location.href = "dashboard.html";
  }

  return (
    <>
      <Header context="Per sallone" />
      <main className="auth-page">
        <section className="auth-copy">
          <p className="kicker">Per pronare sallonesh</p>
          <h1>Hap profilin e sallonit tend.</h1>
          <p>Regjistrohu, shto sherbimet dhe prano kerkesa per termine nga klientet ne Kosove.</p>
        </section>
        <form className="auth-card" onSubmit={submitSignup}>
          <h2>Regjistro sallonin</h2>
          <label>Emri i pronarit<input required value={form.ownerName} onChange={(event) => setField("ownerName", event.target.value)} autoComplete="name" placeholder="Emri dhe mbiemri" /></label>
          <label>Email<input required value={form.email} onChange={(event) => setField("email", event.target.value)} type="email" autoComplete="email" placeholder="email@salloni.com" /></label>
          <label>Fjalekalimi<input required value={form.password} onChange={(event) => setField("password", event.target.value)} type="password" autoComplete="new-password" minLength="6" placeholder="Minimum 6 karaktere" /></label>
          <p className="form-note">Perdor nje email qe mund ta hapesh, sepse mund te kerkohet konfirmim nga Supabase.</p>
          <label>Emri i sallonit<input required value={form.salonName} onChange={(event) => setField("salonName", event.target.value)} placeholder="Emri i sallonit" /></label>
          <div className="form-row">
            <label>Qyteti<input required value={form.city} onChange={(event) => setField("city", event.target.value)} placeholder="Prishtina" /></label>
            <label>Telefoni<input required value={form.phone} onChange={(event) => setField("phone", event.target.value)} type="tel" autoComplete="tel" inputMode="tel" minLength="7" placeholder="+383..." /></label>
          </div>
          <label>Adresa<input value={form.address} onChange={(event) => setField("address", event.target.value)} placeholder="Lagjja, rruga ose perdor pinin" /></label>
          <div className="map-tools">
            <button className="secondary-button" type="button" onClick={setCurrentLocation}>Perdor lokacionin tim</button>
            <a className="secondary-button" href={mapUrl} target="_blank" rel="noopener noreferrer">Kontrollo ne harte</a>
          </div>
          <p className="form-note">Mund te shkruash adresen ose te ruash pinin aktual. Klientet do ta hapin lokacionin ne Google Maps.</p>
          <label>Instagram<input value={form.instagram} onChange={(event) => setField("instagram", event.target.value)} placeholder="@salloni" /></label>
          <label>Foto e sallonit<input name="imageFile" type="file" accept="image/*" /></label>
          <p className="form-note">Lejohet vetem nje foto kryesore. Per me shume foto, klientet mund te shohin Instagramin.</p>
          <label>Ose link i fotos<input value={form.imageUrl} onChange={(event) => setField("imageUrl", event.target.value)} type="url" placeholder="https://..." /></label>
          <label>Pershkrimi<textarea value={form.description} onChange={(event) => setField("description", event.target.value)} rows="3" placeholder="P.sh. Sallon flokesh per femra ne Prishtine" /></label>
          <button className="primary-button" type="submit" disabled={loading}>{loading ? "Duke u krijuar..." : "Krijo llogarine"}</button>
        </form>
      </main>
      <Toast message={toast} />
    </>
  );
}

function LoginPage() {
  const [toast, showToast] = useToast();
  const [loading, setLoading] = useState(false);
  async function submitLogin(event) {
    event.preventDefault();
    const form = Object.fromEntries(new FormData(event.currentTarget).entries());
    setLoading(true);
    const { error } = await supabaseClient.auth.signInWithPassword({ email: form.email.trim().toLowerCase(), password: form.password });
    setLoading(false);
    if (error) {
      showToast(error.message.toLowerCase().includes("invalid") ? "Emaili ose fjalekalimi nuk eshte i sakte." : error.message);
      return;
    }
    window.location.href = "dashboard.html";
  }
  return (
    <>
      <Header context="Kycu" />
      <main className="auth-page compact-auth">
        <section className="auth-copy">
          <p className="kicker">Paneli</p>
          <h1>Kycu ne sallonin tend.</h1>
          <p>Menaxho profilin publik, sherbimet dhe kerkesat per rezervim.</p>
        </section>
        <form className="auth-card" onSubmit={submitLogin}>
          <h2>Kycu</h2>
          <label>Email<input required name="email" type="email" autoComplete="email" placeholder="email@salloni.com" /></label>
          <label>Fjalekalimi<input required name="password" type="password" autoComplete="current-password" placeholder="Fjalekalimi" /></label>
          <button className="primary-button" type="submit" disabled={loading}>{loading ? "Duke u kycur..." : "Kycu"}</button>
          <p className="form-note">Nuk ke llogari? <a href="signup.html">Regjistro sallonin</a>.</p>
        </form>
      </main>
      <Toast message={toast} />
    </>
  );
}

function DashboardPage() {
  const [toast, showToast] = useToast();
  const [salon, setSalon] = useState(null);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [profileLoading, setProfileLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const profileFormRef = useRef(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    const { data: sessionData } = await supabaseClient.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) {
      window.location.href = "login.html";
      return;
    }
    const { data: link, error } = await supabaseClient.from("salon_users").select("salon_id, salons(*)").eq("user_id", user.id).single();
    if (error || !link?.salons) {
      showToast("Nuk u gjet salloni per kete llogari.");
      return;
    }
    setSalon(link.salons);
    setPreviewUrl(link.salons.image_url || "");
    await Promise.all([loadServices(link.salons.id), loadBookings(link.salons.id)]);
  }

  async function loadServices(salonId = salon?.id) {
    if (!salonId) return;
    const { data, error } = await supabaseClient.from("services").select("*").eq("salon_id", salonId).order("created_at", { ascending: false });
    if (error) showToast(error.message);
    else setServices(data || []);
  }

  async function loadBookings(salonId = salon?.id) {
    if (!salonId) return;
    const { data, error } = await supabaseClient.from("bookings").select("*, services(name)").eq("salon_id", salonId).order("created_at", { ascending: false });
    if (error) showToast(error.message);
    else setBookings(data || []);
  }

  function setCurrentLocation() {
    if (!navigator.geolocation) {
      showToast("Shfletuesi nuk e mbeshtet lokacionin.");
      return;
    }
    navigator.geolocation.getCurrentPosition((position) => {
      profileFormRef.current.elements.address.value = `Pin: ${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;
      showToast("Pini u vendos. Ruaje lokacionin per ta publikuar.");
    }, () => showToast("Nuk u mor lokacioni. Lejo qasjen ose shkruaj adresen."), { enableHighAccuracy: true, timeout: 10000 });
  }

  async function submitProfile(event) {
    event.preventDefault();
    if (!salon) return;
    const formElement = event.currentTarget;
    const form = Object.fromEntries(new FormData(formElement).entries());
    const imageFile = formElement.elements.imageFile.files[0];
    setProfileLoading(true);
    let imageUrl = form.imageUrl.trim() || null;
    try {
      if (imageFile) imageUrl = await uploadSalonImage(imageFile, salon.id);
    } catch (error) {
      setProfileLoading(false);
      showToast(`Fotoja nuk u ngarkua: ${error.message}`);
      return;
    }
    const { data, error } = await supabaseClient.from("salons").update({
      name: form.name.trim(),
      phone: form.phone.trim(),
      instagram: form.instagram.trim() || null,
      city: form.city.trim(),
      address: form.address.trim() || null,
      image_url: imageUrl,
      description: form.description.trim() || null
    }).eq("id", salon.id).select().single();
    setProfileLoading(false);
    if (error) {
      showToast(error.message);
      return;
    }
    setSalon(data);
    setPreviewUrl(data.image_url || "");
    formElement.elements.imageFile.value = "";
    showToast("Profili publik u perditesua.");
  }

  async function submitService(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = Object.fromEntries(new FormData(formElement).entries());
    const { error } = await supabaseClient.from("services").insert({
      salon_id: salon.id,
      name: form.name.trim(),
      price: Number(form.price),
      duration_minutes: Number(form.duration)
    });
    if (error) {
      showToast(error.message);
      return;
    }
    formElement.reset();
    showToast("Sherbimi u ruajt.");
    loadServices();
  }

  async function updateService(event, serviceId) {
    event.preventDefault();
    const form = Object.fromEntries(new FormData(event.currentTarget).entries());
    const { error } = await supabaseClient.from("services").update({
      name: form.name.trim(),
      price: Number(form.price),
      duration_minutes: Number(form.duration)
    }).eq("id", serviceId).eq("salon_id", salon.id);
    if (error) showToast(error.message);
    else {
      showToast("Sherbimi u perditesua.");
      loadServices();
    }
  }

  async function deleteService(serviceId) {
    if (!window.confirm("A je i sigurt qe do ta fshish kete sherbim?")) return;
    const { error } = await supabaseClient.from("services").delete().eq("id", serviceId).eq("salon_id", salon.id);
    if (error) showToast(error.message);
    else {
      showToast("Sherbimi u fshi.");
      loadServices();
    }
  }

  async function updateBookingStatus(bookingId, status) {
    const { error } = await supabaseClient.from("bookings").update({ status }).eq("id", bookingId).eq("salon_id", salon.id);
    if (error) showToast(error.message);
    else {
      showToast(`Rezervimi u perditesua: ${statusLabel(status)}.`);
      loadBookings();
    }
  }

  async function logout() {
    await supabaseClient.auth.signOut();
    window.location.href = "login.html";
  }

  function dashboardMapUrl() {
    if (!salon) return "https://www.google.com/maps";
    return googleMapsUrl({
      name: profileFormRef.current?.elements.name.value || salon.name,
      area: profileFormRef.current?.elements.address.value || salon.address,
      city: profileFormRef.current?.elements.city.value || salon.city
    });
  }

  return (
    <>
      <header className="topbar">
        <a className="brand" href="index.html" aria-label="Faqja kryesore Bukuri">
          <span className="brand-mark">B</span>
          <span><strong>Bukuri</strong><small>{salon?.name || "Paneli"}</small></span>
        </a>
        <nav className="nav-actions" aria-label="Navigimi kryesor">
          <a className="secondary-button nav-link" href="index.html">Sallonet</a>
          <a className="secondary-button nav-link" href="signup.html">Regjistro sallon</a>
          <button className="icon-button" type="button" onClick={logout} aria-label="Dil" title="Dil">x</button>
        </nav>
      </header>
      <main className="dashboard-page">
        <section className="section-heading dashboard-head">
          <div>
            <p className="kicker">Salloni</p>
            <h1>{salon?.name || "Paneli"}</h1>
            <p className="meta-line">{salon ? `${salon.city} - ${salon.address || "Pa adrese"} - statusi: ${statusLabel(salon.status)}` : "Duke u ngarkuar..."}</p>
          </div>
        </section>
        {salon && (
          <section className="admin-grid dashboard-grid">
            <form className="admin-card salon-profile-card" ref={profileFormRef} onSubmit={submitProfile}>
              <h3>Profili publik</h3>
              <p className="form-note">Perditeso emrin, kontaktin, foton, tekstin, sherbimet dhe lokacionin qe klientet shohin ne faqe.</p>
              <label>Emri i sallonit<input required name="name" defaultValue={salon.name || ""} placeholder="Emri i sallonit" /></label>
              <div className="form-row">
                <label>Telefoni<input required name="phone" defaultValue={salon.phone || ""} type="tel" inputMode="tel" placeholder="+383..." /></label>
                <label>Instagram<input name="instagram" defaultValue={salon.instagram || ""} placeholder="@salloni" /></label>
              </div>
              <label>Qyteti<input required name="city" defaultValue={salon.city || ""} placeholder="Prishtina" /></label>
              <label>Adresa ose pini<input name="address" defaultValue={salon.address || ""} placeholder="Lagjja, rruga ose pin koordinatash" /></label>
              <label>Ngarko foto publike<input name="imageFile" type="file" accept="image/*" onChange={(event) => {
                const file = event.target.files[0];
                if (file) setPreviewUrl(URL.createObjectURL(file));
              }} /></label>
              <p className="form-note">Lejohet vetem nje foto kryesore. Nese ngarkon foto te re, ajo zevendeson te vjetren. Per galeri perdor Instagramin.</p>
              <label>Ose link i fotos<input name="imageUrl" type="url" defaultValue={salon.image_url || ""} placeholder="https://..." onInput={(event) => setPreviewUrl(event.currentTarget.value)} /></label>
              <div className="image-preview" style={previewUrl ? { backgroundImage: `url("${previewUrl}")` } : undefined}>{!previewUrl && <span>Parapamja e fotos</span>}</div>
              <label>Pershkrimi publik<textarea name="description" defaultValue={salon.description || ""} rows="4" placeholder="P.sh. Sallon premium per floke, ngjyrosje dhe stilim ne Prishtine." /></label>
              <div className="map-tools">
                <button className="secondary-button" type="button" onClick={setCurrentLocation}>Perdor lokacionin tim</button>
                <a className="secondary-button" href={dashboardMapUrl()} onClick={(event) => { event.currentTarget.href = dashboardMapUrl(); }} target="_blank" rel="noopener noreferrer">Kontrollo ne harte</a>
              </div>
              <button className="primary-button" type="submit" disabled={profileLoading}>{profileLoading ? "Duke u ruajtur..." : "Ruaj profilin"}</button>
            </form>

            <form className="admin-card" onSubmit={submitService}>
              <h3>Shto sherbim</h3>
              <p className="form-note">Sherbimet shfaqen ne profilin publik dhe perdoren ne formularin e rezervimit.</p>
              <label>Emri i sherbimit<input required name="name" placeholder="Ngjyrosje flokesh" /></label>
              <div className="form-row">
                <label>Cmimi EUR<input required name="price" type="number" min="0" step="0.5" inputMode="decimal" placeholder="35" /></label>
                <label>Minuta<input required name="duration" type="number" min="5" step="5" inputMode="numeric" placeholder="60" /></label>
              </div>
              <button className="primary-button" type="submit">Ruaj sherbimin</button>
            </form>

            <div className="admin-card">
              <h3>Menaxho sherbimet</h3>
              <div className="request-list">
                {services.length ? services.map((service) => (
                  <form className="request-item service-edit-form" key={service.id} onSubmit={(event) => updateService(event, service.id)}>
                    <label>Sherbimi<input required name="name" defaultValue={service.name} /></label>
                    <div className="form-row">
                      <label>Cmimi EUR<input required name="price" type="number" min="0" step="0.5" inputMode="decimal" defaultValue={service.price} /></label>
                      <label>Minuta<input required name="duration" type="number" min="5" step="5" inputMode="numeric" defaultValue={service.duration_minutes || 30} /></label>
                    </div>
                    <div className="booking-actions">
                      <button className="mini-button confirm" type="submit">Ruaj</button>
                      <button className="mini-button reject" type="button" onClick={() => deleteService(service.id)}>Fshij</button>
                    </div>
                  </form>
                )) : <p className="meta-line">Ende nuk ke shtuar sherbime.</p>}
              </div>
            </div>

            <div className="admin-card">
              <h3>Kerkesat per rezervim</h3>
              <div className="request-list">
                {bookings.length ? bookings.map((booking) => (
                  <div className="request-item" key={booking.id}>
                    <div className="request-topline">
                      <strong>{booking.customer_name} {booking.customer_surname}</strong>
                      <span className={`status-badge status-${booking.status || "pending"}`}>{statusLabel(booking.status)}</span>
                    </div>
                    <small>{booking.services?.name || "Sherbim"} - {booking.booking_date} ne {booking.booking_time}</small>
                    <small>{booking.customer_phone}</small>
                    {booking.notes && <small>{booking.notes}</small>}
                    <div className="booking-actions">
                      <button className="mini-button confirm" type="button" onClick={() => updateBookingStatus(booking.id, "confirmed")} disabled={booking.status === "confirmed" || booking.status === "completed"}>Konfirmo</button>
                      <button className="mini-button reject" type="button" onClick={() => updateBookingStatus(booking.id, "rejected")} disabled={booking.status === "rejected" || booking.status === "completed"}>Refuzo</button>
                      <button className="mini-button complete" type="button" onClick={() => updateBookingStatus(booking.id, "completed")} disabled={booking.status !== "confirmed"}>Perfundo</button>
                    </div>
                  </div>
                )) : <p className="meta-line">Ende nuk ka kerkesa per rezervim.</p>}
              </div>
            </div>
          </section>
        )}
      </main>
      <Toast message={toast} />
    </>
  );
}

function App() {
  const page = document.body.dataset.page || "home";
  if (page === "signup") return <SignupPage />;
  if (page === "login") return <LoginPage />;
  if (page === "dashboard") return <DashboardPage />;
  return <HomePage />;
}

createRoot(document.getElementById("root")).render(<App />);
