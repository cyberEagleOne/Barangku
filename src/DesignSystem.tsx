import {
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ChangeEvent,
  type ReactNode,
} from "react"

import {
  ArrowUpRight,
  ArrowRight,
  Check,
  ChevronDown,
  Menu,
  X,
  ShieldCheck,
  Star,
  MapPin,
  Laptop,
  Smartphone,
  Wrench,
  CircleAlert,
  Search,
  CheckCheck,
  Palette,
  Type,
  MousePointer2,
  LayoutGrid,
  Navigation,
  MessageSquare,
  SlidersHorizontal,
  Inbox,
} from "lucide-react"

import type { User } from "./api"

export type DemoUser = User

const sections = [
  "Fondasi",
  "Tombol & formulir",
  "Kartu & penanda",
  "Alur & navigasi",
  "Untuk tukang",
]

const ids = ["fondasi", "formulir", "kartu", "alur", "tukang"]

export function Button({
  variant = "primary",
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost"
}) {
  return (
    <button className={`button ${variant} ${className}`} {...props}>
      {children}
    </button>
  )
}

export function Badge({
  type = "verified",
  label,
}: {
  type?: "verified" | "open" | "busy" | "closed"
  label?: string
}) {
  return (
    <span className={`badge ${type}`}>
      {type === "verified" ? (
        <ShieldCheck size={14} />
      ) : (
        <span className="dot" />
      )}
      {label ??
        {
          verified: "Terverifikasi",
          open: "Buka",
          busy: "Sibuk",
          closed: "Tutup",
        }[type]}
    </span>
  )
}

export function Field({
  label,
  helper,
  error,
  focus,
  dropdown,
  placeholder,
  value,
  onValueChange,
  options = ["Laptop", "HP"],
  type = "text",
  multiline,
  required,
  min,
  max,
  name,
  suffix,
  autoComplete,
}: {
  label: string
  helper?: string
  error?: string
  focus?: boolean
  dropdown?: boolean
  placeholder?: string
  value?: string
  onValueChange?: (value: string) => void
  options?: string[]
  type?: string
  multiline?: boolean
  required?: boolean
  min?: string
  max?: string
  name?: string
  suffix?: ReactNode
  autoComplete?: string
}) {
  const id = useId()

  const control = {
    id,
    name,
    "aria-invalid": !!error,
    "aria-describedby": helper || error ? `${id}-help` : undefined,
    required,
    className: `${error ? "invalid" : ""} ${focus ? "focused" : ""}`,
    ...(value !== undefined ? { value } : {}),
    onChange: (
      event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    ) => onValueChange?.(event.target.value),
  }

  return (
    <label className="field" htmlFor={id}>
      <span>
        {label}
        {required && <span className="required-mark"> *</span>}
      </span>
      {dropdown ? (
        <div className="select-wrap">
          <select
            {...control}
            {...(value === undefined ? { defaultValue: "" } : {})}
          >
            <option value="" disabled>
              {placeholder ?? "Pilih jenis perangkat"}
            </option>
            {options.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          <ChevronDown size={18} />
        </div>
      ) : multiline ? (
        <textarea {...control} placeholder={placeholder} rows={4} />
      ) : (
        <div className={`input-wrap ${suffix ? "with-suffix" : ""}`}>
          <input
            {...control}
            autoComplete={autoComplete}
            type={type}
            min={min}
            max={max}
            placeholder={
              placeholder ??
              (type === "text" ? "Contoh: ASUS VivoBook 14" : undefined)
            }
          />
          {suffix}
        </div>
      )}
      {(helper || error) && (
        <small id={`${id}-help`} className={error ? "error-text" : ""}>
          {error && <CircleAlert size={14} />}
          {error ?? helper}
        </small>
      )}
    </label>
  )
}

function Section({
  id,
  number,
  title,
  subtitle,
  icon,
  children,
}: {
  id: string
  number: string
  title: string
  subtitle: string
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <section id={id} className="ds-section">
      <div className="section-heading">
        <div className="section-icon">{icon}</div>
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <span className="section-number">{number}</span>
      </div>
      {children}
    </section>
  )
}

function Panel({
  title,
  children,
  className = "",
}: {
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`panel ${className}`}>
      <h3 className="panel-title">{title}</h3>
      {children}
    </div>
  )
}

export function Stepper({
  steps,
  current,
  label = "Langkah pemesanan",
}: {
  steps: string[]
  current: number
  label?: string
}) {
  return (
    <>
      <div className="stepper" aria-label={label}>
        {steps.map((step, i) => (
          <div
            key={step}
            aria-current={i === current ? "step" : undefined}
            className={`step ${
              i < current ? "done" : i === current ? "current" : ""
            }`}
          >
            <span className="step-circle">
              {i < current ? (
                <Check size={17} aria-label="Sudah selesai" />
              ) : (
                i + 1
              )}
            </span>
            <span>{step}</span>
          </div>
        ))}
      </div>
      <div className="compact-stepper">
        <strong>
          Langkah {current + 1} dari {steps.length}: {steps[current]}
        </strong>
        <progress
          aria-label={`Langkah ${current + 1} dari ${steps.length}`}
          value={current + 1}
          max={steps.length}
        />
      </div>
    </>
  )
}

export type Technician = {
  id: number
  name: string
  area: string
  devices: string[]
  rating: string
  reviews: number
  distance: number
  min: number
  max: number
  status: "open" | "busy" | "closed"
  verified: boolean
  photo?: string
}

export const defaultTechnician: Technician = {
  id: 1,
  name: "Mas Dedi Servis",
  area: "Karawaci",
  devices: ["Laptop", "HP"],
  rating: "4,8",
  reviews: 128,
  distance: 1.2,
  min: 150000,
  max: 450000,
  status: "open",
  verified: true,
}

export const rupiah = (value: number) => `Rp ${value.toLocaleString("id-ID")}`

export function TechnicianInfo({
  technician: t,
  verification = false,
}: {
  technician: Technician
  verification?: boolean
}) {
  return (
    <div className="summary-shop">
      <div className="summary-shop-icon">
        <Wrench size={24} />
      </div>
      <div>
        <strong>{t.name}</strong>
        <p>
          <MapPin size={14} /> {t.area}, Tangerang
        </p>
        {verification && t.verified && <Badge />}
      </div>
      {!verification && <Badge type={t.status} />}
    </div>
  )
}

export type Review = {
  name: string
  date: string
  rating: number
  text: string
  service: string
}

export const defaultReview: Review = {
  name: "Rina Ayu",
  date: "2 minggu lalu",
  rating: 5,
  text: "Laptop yang tadinya mati total akhirnya nyala lagi. Mas Dedi jelasin kerusakannya dengan sabar, biayanya juga sesuai perkiraan. Makasih ya!",
  service: "Servis laptop",
}

export function ReviewItem({ review = defaultReview }: { review?: Review }) {
  return (
    <article className="review-item">
      <div className="review-heading">
        <div className="avatar">
          {review.name
            .split(" ")
            .slice(0, 2)
            .map((n) => n[0])
            .join("")}
        </div>
        <div>
          <strong>{review.name}</strong>
          <small>{review.date}</small>
        </div>
        <div
          className="review-stars"
          aria-label={`${review.rating} dari 5 bintang`}
        >
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              size={14}
              fill={i < review.rating ? "currentColor" : "none"}
            />
          ))}
        </div>
      </div>
      <p className="review-copy">“{review.text}”</p>
      <span className="service-tag">
        {review.service.toLowerCase().includes("hp") ? (
          <Smartphone size={14} />
        ) : (
          <Laptop size={14} />
        )}
        {review.service}
      </span>
    </article>
  )
}

export function Chip({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      aria-pressed={selected}
      className={`chip ${selected ? "selected" : ""}`}
      onClick={onClick}
    >
      {selected && <Check size={16} />}
      {label === "Laptop" && <Laptop size={16} />}
      {label === "HP" && <Smartphone size={16} />}
      {label}
    </button>
  )
}

export function TechnicianCard({
  technician = defaultTechnician,
  rank,
  selected: controlled,
  onSelect,
  onChoose,
}: {
  technician?: Technician
  rank?: number
  selected?: boolean
  onSelect?: () => void
  onChoose?: () => void
}) {
  const [localSelected, setSelected] = useState(false)

  const selected = controlled ?? localSelected

  const select = () => (onSelect ? onSelect() : setSelected(!selected))

  return (
    <article
      id={`technician-${technician.id}`}
      className={`tech-card ${selected ? "selected" : ""}`}
      onClick={onSelect}
    >
      <button
        className="shop-photo card-select"
        onClick={(e) => {
          e.stopPropagation()
          select()
        }}
        aria-label={`Tandai lokasi ${technician.name}`}
        aria-pressed={selected}
      >
        <img
          src={
            technician.photo ??
            "https://images.unsplash.com/photo-1580835916901-40770720c505?auto=format&fit=crop&w=800&q=80"
          }
          alt={`Tempat kerja ${technician.name}`}
        />
        {rank !== undefined && (
          <span
            style={{
              position: "absolute",
              top: "12px",
              left: "12px",
              background: selected ? "var(--accent)" : "var(--primary)",
              color: selected ? "var(--primary-dark)" : "#ffffff",
              fontWeight: "800",
              fontSize: "13px",
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.35)",
              border: "2px solid #ffffff",
              zIndex: 2,
            }}
          >
            {rank}
          </span>
        )}
        <span className="photo-badge">
          <Badge type={technician.status} />
        </span>
      </button>
      <div className="tech-body">
        <h3>{technician.name}</h3>
        <p className="small-text">
          {technician.devices.join(" & ")} · {technician.area}, Tangerang
        </p>
        {technician.verified && (
          <div className="card-verification">
            <Badge />
          </div>
        )}
        <div className="tech-meta">
          <span>
            <Star size={16} /> <strong>{technician.rating}</strong>{" "}
            <span>({technician.reviews} ulasan)</span>
          </span>
          <span>
            <MapPin size={16} /> {technician.distance.toLocaleString("id-ID")}{" "}
            km
          </span>
        </div>
        <div className="price">
          <span>Perkiraan biaya</span>
          <strong>
            {rupiah(technician.min)} – {rupiah(technician.max)}
          </strong>
        </div>
        <Button
          variant={selected && !onChoose ? "secondary" : "primary"}
          onClick={(e) => {
            e.stopPropagation()
            onChoose ? onChoose() : select()
          }}
        >
          {selected && !onChoose ? (
            <>
              <Check size={18} /> Dipilih
            </>
          ) : (
            <>
              Pilih <ArrowRight size={18} />
            </>
          )}
        </Button>
      </div>
    </article>
  )
}

export function Footer({ onLink }: { onLink: (label: string) => void }) {
  return (
    <footer>
      <div className="container footer-grid">
        <div className="footer-brand">
          <img src="/logo-barangku.png" alt="Logo asli Barangku" />
          <p>
            Rusak? Benerin dulu,
            <br />
            jangan buang.
          </p>
        </div>
        {[
          ["Jelajahi", "Cari tukang", "Promo & Diskon", "Cara kerja", "Jadi tukang"],
          [
            "Bantuan",
            "Pertanyaan umum",
            "Panduan perbaikan",
            "Syarat & ketentuan",
          ],
          ["Hubungi kami", "Halo, barangku", "Tangerang, Indonesia"],
        ].map(([title, ...links]) => (
          <div key={title}>
            <strong>{title}</strong>
            {links.map((link) => (
              <button key={link} onClick={() => onLink(link)}>
                {link}
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className="container copyright">
        <span>© 2026 Barangku. Dari Tangerang buat semua orang.</span>
        <span>Dibikin dengan niat baik.</span>
      </div>
    </footer>
  )
}

export function Navbar({
  user,
  onLogout,
}: {
  user?: User | null
  onLogout?: () => void | Promise<void>
}) {
  const [open, setOpen] = useState(false)

  const [accountOpen, setAccountOpen] = useState(false)

  const accountRef = useRef<HTMLDivElement>(null)

  const close = () => {
    setOpen(false)
    setAccountOpen(false)
  }

  useEffect(() => {
    const pointer = (event: PointerEvent) => {
      if (!accountRef.current?.contains(event.target as Node))
        setAccountOpen(false)
    }

    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAccountOpen(false)
        setOpen(false)
      }
    }

    document.addEventListener("pointerdown", pointer)
    document.addEventListener("keydown", escape)

    window.addEventListener("hashchange", close)

    return () => {
      document.removeEventListener("pointerdown", pointer)
      document.removeEventListener("keydown", escape)
      window.removeEventListener("hashchange", close)
    }
  }, [])

  const navigate = (path: string) => {
    location.hash = path
    close()
  }

  const onCaraKerja = (e: React.MouseEvent) => {
    e.preventDefault()

    close()

    const currentRoute = location.hash.replace(/^#/, "").split("?")[0]

    if (currentRoute === "beranda") {
      document
        .getElementById("cara-kerja")
        ?.scrollIntoView({ behavior: "smooth" })
    } else {
      location.hash = "beranda"

      setTimeout(() => {
        document
          .getElementById("cara-kerja")
          ?.scrollIntoView({ behavior: "smooth" })
      }, 120)
    }
  }

  return (
    <header className="site-header product-header">
      <div className="container navbar-demo">
        <a href="#beranda" aria-label="Ke beranda barangku">
          <img src="/logo-barangku.png" alt="Logo asli Barangku" />
        </a>
        <nav
          className={`demo-links ${open ? "expanded" : ""}`}
          aria-label="Navigasi utama"
        >
          <a href="#cara-kerja" onClick={onCaraKerja}>
            Cara Kerja
          </a>
          <a href="#promo" onClick={close} className="nav-promo-link">
            Promo
            <span className="nav-promo-tag">Diskon</span>
          </a>
          <a href="#untuk-tukang" onClick={close}>
            Untuk Tukang
          </a>
          {user ? (
            <>
              {user.role === "tukang" ? (
                <a href="#dashboard-tukang" onClick={close}>
                  Pesanan masuk
                </a>
              ) : (
                <a href="#pesanan-saya" onClick={close}>
                  Pesanan saya
                </a>
              )}
              <div className="account-control" ref={accountRef}>
                <Button
                  variant="ghost"
                  className="account-avatar"
                  aria-label={`Buka menu akun ${user.name}`}
                  aria-expanded={accountOpen}
                  aria-controls="account-options"
                  onClick={() => setAccountOpen(!accountOpen)}
                >
                  {user.name
                    .split(/\s+/)
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </Button>
                {accountOpen && (
                  <div id="account-options" className="account-menu">
                    <strong>{user.name}</strong>
                    {user.role === "tukang" ? (
                      <>
                        <Button
                          variant="ghost"
                          onClick={() => navigate("dashboard-tukang")}
                        >
                          Pesanan masuk
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            close()
                            onLogout?.()
                          }}
                        >
                          Keluar
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          onClick={() => navigate("pesanan-saya")}
                        >
                          Pesanan saya
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => navigate("profil")}
                        >
                          Profil
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            close()
                            onLogout?.()
                          }}
                        >
                          Keluar
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
              <div className="mobile-account-links">
                {user.role === "tukang" ? (
                  <Button
                    variant="ghost"
                    onClick={() => navigate("dashboard-tukang")}
                  >
                    Pesanan masuk
                  </Button>
                ) : (
                  <Button variant="ghost" onClick={() => navigate("profil")}>
                    Profil
                  </Button>
                )}
                <Button
                  variant="ghost"
                  onClick={() => {
                    close()
                    onLogout?.()
                  }}
                >
                  Keluar
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button variant="secondary" onClick={() => navigate("masuk")}>
                Masuk
              </Button>
              <Button onClick={() => navigate("daftar")}>Daftar</Button>
            </>
          )}
        </nav>
        <Button
          className="demo-hamburger"
          variant="ghost"
          aria-label={open ? "Tutup menu" : "Buka menu"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </Button>
      </div>
    </header>
  )
}

function DesignSystemShowcase() {
  const [active, setActive] = useState(0)

  const [menu, setMenu] = useState(false)

  const [chips, setChips] = useState(["Semua"])

  const [status, setStatus] = useState("Buka")

  const [pin, setPin] = useState(1)

  const [notice, setNotice] = useState("")

  const navigate = (i: number) => {
    setActive(i)
    setMenu(false)
    document
      .getElementById(ids[i])
      ?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <div>
      <header className="site-header">
        <div className="container header-inner">
          <a href="#" className="brand" aria-label="Barangku, kembali ke atas">
            <img src="/logo-barangku.png" alt="Logo asli Barangku" />
            <span className="brand-divider" />
            <span>Sistem desain</span>
          </a>
          <div className="header-right">
            <span className="version">
              <span className="dot" /> Versi 1.0
            </span>
            <a href="#formulir" className="header-link">
              Jelajahi komponen <ArrowUpRight size={17} />
            </a>
          </div>
          <Button
            variant="ghost"
            className="menu-button"
            aria-label={menu ? "Tutup menu" : "Buka menu"}
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </Button>
        </div>
      </header>
      <main className="container">
        <div className="intro">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line" /> DARI TANGERANG, BUAT SEMUA ORANG
            </div>
            <h1>
              Hal kecil, <span>dibikin konsisten.</span>
            </h1>
            <p>
              Fondasi tampilan barangku. Sederhana, hangat, dan bisa diandalkan.
              <br className="desktop-break" /> Biar kamu nyaman dari cari tukang
              sampai barang kembali beres.
            </p>
          </div>
          <div className="intro-stamp">
            <Wrench size={23} />
            <span>
              Dirancang untuk
              <br />
              <strong>dipakai semua orang.</strong>
            </span>
          </div>
        </div>
        <nav
          className={`section-nav ${menu ? "mobile-open" : ""}`}
          aria-label="Bagian sistem desain"
        >
          {sections.map((s, i) => (
            <button
              key={s}
              onClick={() => navigate(i)}
              className={active === i ? "active" : ""}
            >
              <span className="nav-index">0{i + 1}</span>
              {s}
            </button>
          ))}
        </nav>
        <Section
          id="fondasi"
          number="01"
          title="Fondasi yang bikin familiar"
          subtitle="Warna, huruf, dan detail kecil yang menyatukan semuanya."
          icon={<Palette size={21} />}
        >
          <div className="foundation-grid">
            <Panel title="Warna utama" className="color-panel">
              <div className="primary-swatch">
                <span>Hijau barangku</span>
                <strong>#1F6F5C</strong>
                <Wrench size={40} />
              </div>
              <div className="swatch-row">
                {[
                  ["Gelap", "#14493D", "primary-dark"],
                  ["Lembut", "#E3F1EC", "primary-tint"],
                  ["Aksen", "#F2A33A", "accent"],
                ].map(([name, hex, token]) => (
                  <div className="swatch" key={token}>
                    <div className={`swatch-color swatch-${token}`} />
                    <strong>{name}</strong>
                    <small>{hex}</small>
                  </div>
                ))}
              </div>
              <p className="token-note">
                Hijau untuk aksi. Aksen untuk satu sorotan saja.
              </p>
            </Panel>
            <Panel title="Tipografi" className="type-panel">
              <div className="font-label">
                PLUS JAKARTA SANS <span>Judul · Tebal</span>
              </div>
              <div className="type-sample">
                Rusak? Benerin dulu,
                <br />
                jangan buang.
              </div>
              <div className="type-scale">
                <span>
                  H1 <strong>44 / 28</strong>
                </span>
                <span>
                  H2 <strong>32 / 22</strong>
                </span>
                <span>
                  H3 <strong>24 / 18</strong>
                </span>
              </div>
              <div className="body-font">
                <div className="font-label">
                  INTER <span>Isi & antarmuka</span>
                </div>
                <p>Tukang tepercaya, dekat dari kamu.</p>
                <div className="small-text">
                  Isi 16 · Kecil 14 · Keterangan 12
                </div>
              </div>
            </Panel>
            <Panel title="Warna pendukung" className="support-panel">
              <div className="support-list">
                {[
                  ["Latar", "#FAFAF7", "background"],
                  ["Permukaan", "#FFFFFF", "surface"],
                  ["Teks utama", "#1C2321", "text"],
                  ["Teks pendukung", "#5B6762", "text-secondary"],
                  ["Garis", "#E2E6E3", "border"],
                ].map(([name, hex, token]) => (
                  <div key={token}>
                    <i className={`support-${token}`} />
                    <span>{name}</span>
                    <small>{hex}</small>
                  </div>
                ))}
              </div>
              <div className="semantic-row">
                <span>
                  <i className="success-dot" />
                  Berhasil
                </span>
                <span>
                  <i className="warning-dot" />
                  Perhatian
                </span>
                <span>
                  <i className="error-dot" />
                  Kesalahan
                </span>
                <span>
                  <i className="info-dot" />
                  Informasi
                </span>
              </div>
            </Panel>
          </div>
          <div className="principles">
            <div>
              <LayoutGrid size={20} />
              <span>
                <strong>Ruang yang lega</strong>
                <small>Kelipatan 8 · Lebar maks. 1120</small>
              </span>
            </div>
            <div>
              <MousePointer2 size={20} />
              <span>
                <strong>Nyaman disentuh</strong>
                <small>Tombol 48 · Untuk tukang 64</small>
              </span>
            </div>
            <div>
              <SlidersHorizontal size={20} />
              <span>
                <strong>Lembut, bukan ramai</strong>
                <small>Sudut 12–16 · Satu bayangan</small>
              </span>
            </div>
            <div>
              <CheckCheck size={20} />
              <span>
                <strong>Jelas untuk semua</strong>
                <small>Ikon + teks · Fokus terlihat</small>
              </span>
            </div>
          </div>
        </Section>
        <Section
          id="formulir"
          number="02"
          title="Aksi yang nggak bikin bingung"
          subtitle="Label jelas, tombol mudah ditekan, dan arahan saat kamu butuh."
          icon={<MousePointer2 size={21} />}
        >
          <div className="two-cols">
            <Panel title="Tombol">
              <div className="button-table">
                <div className="state-labels">
                  <span>Jenis</span>
                  <span>Normal</span>
                  <span>Disorot</span>
                  <span>Nonaktif</span>
                </div>
                {(["primary", "secondary", "ghost"] as const).map((v, i) => (
                  <div className="button-example" key={v}>
                    <span>{["Utama", "Sekunder", "Tanpa isian"][i]}</span>
                    <Button
                      variant={v}
                      onClick={() => setNotice("Tombol berhasil kamu tekan.")}
                    >
                      Lanjut <ArrowRight size={16} />
                    </Button>
                    <Button
                      variant={v}
                      className="hover-demo"
                      onClick={() =>
                        setNotice("Ini contoh tombol saat disorot.")
                      }
                    >
                      Lanjut <ArrowRight size={16} />
                    </Button>
                    <Button variant={v} disabled>
                      Lanjut <ArrowRight size={16} />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="info-note">
                <MousePointer2 size={16} />
                Coba arahkan kursor atau tekan tombolnya.
              </div>
            </Panel>
            <Panel title="Isian & pilihan">
              <div className="fields-grid">
                <Field
                  label="Merek / tipe"
                  helper="Tulis tipe perangkat kamu."
                />
                <Field label="Jenis perangkat" dropdown />
                <Field
                  label="Sedang diisi"
                  helper="Garis hijau saat isian aktif."
                  focus
                  placeholder="ASUS VivoBook 14"
                />
                <Field
                  label="Merek / tipe"
                  error="Isi merek atau tipe perangkat kamu."
                  placeholder="Belum diisi"
                />
              </div>
            </Panel>
          </div>
          <Panel title="Pilihan cepat" className="chip-panel">
            <div className="chips">
              {["Semua", "Laptop", "HP", "Terverifikasi", "Buka sekarang"].map(
                (label) => (
                  <Chip
                    key={label}
                    label={label}
                    selected={chips.includes(label)}
                    onClick={() =>
                      setChips((prev) =>
                        prev.includes(label)
                          ? prev.filter((x) => x !== label)
                          : [...prev, label],
                      )
                    }
                  />
                ),
              )}
            </div>
            <span className="small-text">
              Bisa pilih lebih dari satu. Coba tekan pilihannya.
            </span>
          </Panel>
        </Section>
        <Section
          id="kartu"
          number="03"
          title="Kenalan sebelum mempercayakan"
          subtitle="Informasi penting, terbaca sekilas. Nggak ada yang disembunyikan."
          icon={<LayoutGrid size={21} />}
        >
          <div className="cards-grid">
            <div>
              <div className="example-label">KARTU TUKANG · COBA PILIH</div>
              <TechnicianCard />
            </div>
            <div className="stack">
              <Panel title="Penanda kepercayaan & status">
                <div className="badge-examples">
                  <Badge />
                  <Badge type="open" />
                  <Badge type="busy" />
                  <Badge type="closed" />
                </div>
                <p className="small-text">
                  Warna membantu. Ikon dan tulisan memperjelas.
                </p>
              </Panel>
              <Panel title="Ulasan pelanggan">
                <ReviewItem />
              </Panel>
            </div>
            <div className="stack">
              <Panel title="Penanda lokasi">
                <div className="map-demo">
                  <span className="map-road one" />
                  <span className="map-road two" />
                  <span className="map-label">KARAWACI</span>
                  {[0, 1].map((p) => (
                    <button
                      key={p}
                      aria-label={`Pilih lokasi tukang ${p + 1}`}
                      aria-pressed={pin === p}
                      className={`map-pin pin-${p} ${
                        pin === p ? "chosen" : ""
                      }`}
                      onClick={() => setPin(p)}
                    >
                      <MapPin size={24} />
                    </button>
                  ))}
                </div>
                <div className="map-key">
                  <span>Biasa</span>
                  <span>Dipilih · lebih besar</span>
                </div>
              </Panel>
              <Panel title="Saat belum ada hasil">
                <div className="empty-state">
                  <Inbox size={28} />
                  <strong>Belum ada tukang di sini.</strong>
                  <p>Coba perluas jarak pencarian ya.</p>
                  <Button
                    variant="secondary"
                    onClick={() =>
                      setNotice("Jarak pencarian diperluas menjadi 10 km.")
                    }
                  >
                    <Search size={16} /> Perluas pencarian
                  </Button>
                </div>
              </Panel>
            </div>
          </div>
        </Section>
        <Section
          id="alur"
          number="04"
          title="Selalu tahu, sudah sampai mana"
          subtitle="Setiap langkah terasa jelas, dari pemesanan sampai selesai."
          icon={<Navigation size={21} />}
        >
          <Panel title="Langkah pemesanan">
            <Stepper
              steps={["Pilih tukang", "Isi detail", "Cek ulang", "Selesai"]}
              current={1}
            />
          </Panel>
          <Panel title="Perjalanan perbaikan" className="mt-6">
            <Stepper
              steps={[
                "Dipesan",
                "Diterima",
                "Dicek",
                "Diperbaiki",
                "Siap diambil",
                "Selesai",
              ]}
              current={2}
            />
          </Panel>
          <Panel title="Navigasi atas" className="mt-6">
            <Navbar />
          </Panel>
        </Section>
        <Section
          id="tukang"
          number="05"
          title="Besar, sederhana, langsung beres"
          subtitle="Untuk tukang servis: lebih sedikit pilihan, lebih gampang dipakai."
          icon={<Wrench size={21} />}
        >
          <Panel title="Status toko kamu">
            <div className="status-buttons">
              {["Buka", "Sibuk", "Tutup"].map((s) => (
                <button
                  key={s}
                  aria-pressed={status === s}
                  className={`status-button status-${s.toLowerCase()} ${
                    status === s ? "selected" : ""
                  }`}
                  onClick={() => setStatus(s)}
                >
                  {status === s ? (
                    <Check size={26} />
                  ) : (
                    <span className="dot" />
                  )}
                  {s}
                </button>
              ))}
            </div>
            <p className="small-text status-helper">
              {status === "Buka"
                ? "Toko kamu buka. Pelanggan bisa pesan servis sekarang."
                : status === "Sibuk"
                  ? "Toko kamu sedang sibuk. Pelanggan akan melihat status ini."
                  : "Toko kamu tutup. Buka lagi saat kamu siap menerima pesanan."}
            </p>
          </Panel>
          <div className="two-cols mt-6">
            <Panel title="Satu aksi utama">
              <p className="mb-6 text-secondary">
                Sudah selesai mengecek perangkatnya?
              </p>
              <Button
                className="tech-button w-full"
                onClick={() =>
                  setNotice("Status perbaikan diubah menjadi Diperbaiki.")
                }
              >
                <Wrench size={22} /> Mulai perbaikan <ArrowRight size={22} />
              </Button>
            </Panel>
            <Panel title="Pesan kesalahan">
              <div className="error-alert">
                <CircleAlert size={23} />
                <div>
                  <strong>Perkiraan biaya belum diisi.</strong>
                  <p>Tulis biayanya dulu, biar pelanggan tahu.</p>
                </div>
              </div>
              <Field label="Perkiraan biaya" placeholder="Contoh: Rp 250.000" />
            </Panel>
          </div>
        </Section>
        <div className="closing">
          <ShieldCheck size={24} />
          <div>
            <strong>Satu fondasi, untuk setiap perjalanan.</strong>
            <p>Komponen ini akan dipakai di semua layar barangku.</p>
          </div>
          <a href="#fondasi">
            Kembali ke atas <ArrowUpRight size={17} />
          </a>
        </div>
      </main>
      <Footer
        onLink={() =>
          setNotice(
            "Halaman ini akan tersedia setelah sistem desain disetujui.",
          )
        }
      />
      {notice && (
        <div className="toast" role="status">
          <Check size={20} />
          <span>{notice}</span>
          <button
            onClick={() => setNotice("")}
            aria-label="Tutup pemberitahuan"
          >
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  )
}

export default DesignSystemShowcase
