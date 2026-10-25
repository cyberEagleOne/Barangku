import { useEffect, useState, type FormEvent } from "react"

import {
  ArrowRight,
  Search,
  ShieldCheck,
  Wrench,
  Smartphone,
  CheckCircle2,
  Navigation,
  Sparkles,
  Copy,
  Check,
  Clock,
  Gift,
  Tag,
} from "lucide-react"

import { Button, Field, TechnicianCard, ReviewItem } from "./DesignSystem"

import {
  TANGERANG_AREAS,
  getSavedLocation,
  saveLocation,
  requestCurrentPosition,
} from "./locations"

import {
  getFeaturedReviews,
  searchTechnicians,
  type Review,
  type Technician,
} from "./api"

import { PROMOTIONS } from "./promotions"

export default function Home({
  technicians: propTechnicians,

  navigate,
}: {
  technicians?: Technician[]

  navigate: (path: string) => void
}) {
  const [device, setDevice] = useState("")

  const [problem, setProblem] = useState("")

  const [locationText, setLocationText] = useState("")

  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null)

  const [gpsLoading, setGpsLoading] = useState(false)

  const [gpsHelper, setGpsHelper] = useState("")

  const [techs, setTechs] = useState<Technician[]>(propTechnicians ?? [])

  const [reviews, setReviews] = useState<Review[]>([])

  const [loading, setLoading] = useState(!propTechnicians?.length)

  const [error, setError] = useState("")

  const [copiedPromo, setCopiedPromo] = useState<string | null>(null)

  const handleCopyPromo = (code: string) => {
    navigator.clipboard?.writeText(code)
    setCopiedPromo(code)
    setTimeout(() => {
      setCopiedPromo((prev) => (prev === code ? null : prev))
    }, 2500)
  }

  useEffect(() => {
    let isMounted = true

    Promise.all([
      propTechnicians ? Promise.resolve(propTechnicians) : searchTechnicians(),

      getFeaturedReviews(),
    ])

      .then(([tList, rList]) => {
        if (!isMounted) return

        setTechs(tList)

        setReviews(rList)

        setLoading(false)
      })

      .catch(() => {
        if (!isMounted) return

        setError("Ada yang salah. Coba lagi ya.")

        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [propTechnicians])

  useEffect(() => {
    if (
      location.hash === "#cara-kerja" ||
      location.hash.includes("cara-kerja")
    ) {
      const timer = setTimeout(() => {
        document
          .getElementById("cara-kerja")
          ?.scrollIntoView({ behavior: "smooth" })
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [])

  const handleLocationChange = async (val: string) => {
    if (val === "📍 Gunakan Lokasi GPS Saya") {
      setLocationText(val)
      const saved = getSavedLocation()
      if (saved && saved.isGps) {
        setGpsCoords({ lat: saved.lat, lng: saved.lng })
        setGpsHelper("✓ Lokasi GPS aktif (dari riwayat)")
      } else {
        setGpsHelper("Mencari koordinat GPS Anda...")
      }

      setGpsLoading(true)
      try {
        const pos = await requestCurrentPosition()
        setGpsCoords(pos)
        saveLocation({
          name: "Lokasi GPS Saya",
          area: "Sekitar Kamu",
          lat: pos.lat,
          lng: pos.lng,
          isGps: true,
        })
        setGpsHelper("✓ Lokasi GPS aktif didapatkan")
      } catch (err: any) {
        if (!saved || !saved.isGps) {
          setGpsHelper(err.message || "Izin GPS ditolak atau gagal membaca koordinat")
        }
      } finally {
        setGpsLoading(false)
      }
    } else {
      setGpsCoords(null)
      setGpsHelper("")
      setLocationText(val)
      const matched = TANGERANG_AREAS.find((a) => a.name === val)
      if (matched) {
        saveLocation({ ...matched, isGps: false })
      }
    }
  }

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault()

    const params = new URLSearchParams()

    if (device && device !== "Semua perangkat") params.set("perangkat", device)

    if (problem && problem !== "Semua kerusakan")
      params.set("kerusakan", problem)

    if (locationText === "📍 Gunakan Lokasi GPS Saya") {
      let activeCoords = gpsCoords
      if (!activeCoords) {
        const saved = getSavedLocation()
        if (saved && saved.isGps) {
          activeCoords = { lat: saved.lat, lng: saved.lng }
        }
      }

      if (!activeCoords) {
        setGpsLoading(true)
        setGpsHelper("Mencari koordinat GPS...")
        try {
          activeCoords = await requestCurrentPosition()
          setGpsCoords(activeCoords)
          saveLocation({
            name: "Lokasi GPS Saya",
            area: "Sekitar Kamu",
            lat: activeCoords.lat,
            lng: activeCoords.lng,
            isGps: true,
          })
        } catch (err: any) {
          setGpsLoading(false)
          setGpsHelper("Gagal mendeteksi GPS. Silakan pilih lokasi secara manual.")
          alert("Gagal membaca lokasi GPS. Silakan pilih lokasi manual dari daftar.")
          return
        } finally {
          setGpsLoading(false)
        }
      }

      params.set("lokasi", "GPS")
      params.set("lat", String(activeCoords.lat))
      params.set("lng", String(activeCoords.lng))
    } else if (locationText) {
      params.set("lokasi", locationText)
      const matched = TANGERANG_AREAS.find((a) => a.name === locationText)
      if (matched) {
        saveLocation({ ...matched, isGps: false })
      }
    }

    const qs = params.toString()

    navigate(`hasil-pencarian${qs ? `?${qs}` : ""}`)
  }

  if (loading) {
    return (
      <main className="container home-page">
        <p>Memuat...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="container home-page">
        <p>{error}</p>
      </main>
    )
  }

  return (
    <main className="container home-page">
      {/* 1. Hero Section */}
      <section className="home-hero">
        <div className="home-hero-text">
          <div className="hero-pill">
            <span className="hero-pill-dot" />
            <span>Solusi benerin gadget tanpa waswas</span>
          </div>
          <h1>
            Rusak? Benerin dulu,
            <br />
            <span>jangan buang.</span>
          </h1>
          <p className="home-hero-sub">
            Hubungkan barang rusakmu ke tukang servis lokal tepercaya di sekitar
            Tangerang. Transparan, jelas, dan dekat dari rumah.
          </p>
        </div>

        <form className="home-search-panel" onSubmit={handleSearch}>
          <div className="home-search-fields">
            <Field
              label="Jenis perangkat"
              dropdown
              value={device}
              onValueChange={setDevice}
              placeholder="Pilih jenis perangkat"
              options={["Semua perangkat", "Laptop", "HP"]}
            />
            <Field
              label="Kerusakan"
              dropdown
              value={problem}
              onValueChange={setProblem}
              placeholder="Pilih jenis kerusakan"
              options={[
                "Semua kerusakan",

                "Layar pecah / retak",

                "Baterai cepat habis",

                "Mati total",

                "Kena air",

                "Keyboard / tombol rusak",

                "Sistem lambat / instal ulang",

                "Kerusakan lain",
              ]}
            />
            <Field
              label="Lokasi kamu"
              dropdown
              value={locationText}
              onValueChange={handleLocationChange}
              placeholder="Pilih lokasi"
              options={[
                "📍 Gunakan Lokasi GPS Saya",
                ...TANGERANG_AREAS.map((a) => a.name),
              ]}
              helper={gpsHelper || undefined}
            />
          </div>
          <Button type="submit" className="home-search-submit">
            <Search size={20} />
            <span>Cari tukang terdekat</span>
          </Button>
        </form>
      </section>

      {/* 2. Cara Kerja Section */}
      <section id="cara-kerja" className="home-section cara-kerja-section">
        <div className="section-header">
          <div className="eyebrow">
            <span className="eyebrow-line" /> MUDAH & TRANSPARAN
          </div>
          <h2>Cara kerja barangku</h2>
          <p>Tiga langkah gampang sampai barangmu kembali normal.</p>
        </div>
        <div className="steps-grid">
          <article className="step-card">
            <div className="step-num">
              <Smartphone size={22} />
            </div>
            <h3>1. Ceritakan keluhan</h3>
            <p>
              Pilih perangkat dan kerusakan yang kamu alami. Nggak perlu pusing
              istilah teknis, jelaskan saja apa yang terjadi.
            </p>
          </article>
          <article className="step-card">
            <div className="step-num">
              <ShieldCheck size={22} />
            </div>
            <h3>2. Pilih tukang tepercaya</h3>
            <p>
              Bandingkan jarak, perkiraan biaya, dan ulasan tetangga sekitar
              sebelum kamu menentukan pilihan yang pas.
            </p>
          </article>
          <article className="step-card">
            <div className="step-num">
              <CheckCircle2 size={22} />
            </div>
            <h3>3. Beres dan tenang</h3>
            <p>
              Pantau progres perbaikan secara terbuka. Ambil barang setelah
              dicek bareng dan berfungsi normal kembali.
            </p>
          </article>
        </div>
      </section>

      {/* 2.5. Halaman/Bagian Promosi Spesial */}
      <section id="promo-section" className="home-section home-promo-section">
        <div className="section-header promo-header-flex">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line" /> PROMO &amp; HEMAT BARENG
            </div>
            <h2>Promo &amp; Diskon Spesial Servis</h2>
            <p>
              Benerin gadget lebih hemat dengan kupon potongan harga dan voucher
              khusus kawasan Tangerang Raya.
            </p>
          </div>
          <Button
            variant="secondary"
            className="view-all-promo-btn"
            onClick={() => navigate("promo")}
          >
            <span>Semua Promo ({PROMOTIONS.length})</span>
            <ArrowRight size={18} />
          </Button>
        </div>

        <div className="home-promo-grid">
          {PROMOTIONS.filter((p) => p.isFeatured)
            .slice(0, 3)
            .map((promo) => {
              const isCopied = copiedPromo === promo.code

              return (
                <article key={promo.id} className="home-promo-card">
                  <div className="home-promo-card-top">
                    <div className="home-promo-badges">
                      <span className="promo-badge-tag">{promo.categoryLabel}</span>
                      <span className="promo-badge-highlight">{promo.badge}</span>
                    </div>
                    <strong className="home-promo-discount">{promo.discount}</strong>
                    <h3>{promo.title}</h3>
                    <p>{promo.description}</p>
                  </div>

                  <div className="home-promo-separator">
                    <div className="promo-notch notch-left" />
                    <div className="promo-dash" />
                    <div className="promo-notch notch-right" />
                  </div>

                  <div className="home-promo-card-bottom">
                    <div className="home-promo-meta">
                      <Clock size={14} />
                      <span>s/d {promo.validUntil}</span>
                      <span className="promo-meta-dot">•</span>
                      <span>Sisa {promo.remainingQuota} kupon</span>
                    </div>

                    <div className="home-promo-action-row">
                      <div className="home-promo-code">
                        <small>KODE PROMO</small>
                        <code>{promo.code}</code>
                      </div>
                      <button
                        type="button"
                        className={`btn-salin-kode ${isCopied ? "copied" : ""}`}
                        onClick={() => handleCopyPromo(promo.code)}
                        aria-label={`Salin kode promo ${promo.code}`}
                      >
                        {isCopied ? (
                          <>
                            <Check size={15} />
                            <span>Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={15} />
                            <span>Salin</span>
                          </>
                        )}
                      </button>
                    </div>

                    <Button
                      variant="ghost"
                      className="home-promo-use-btn"
                      onClick={() => {
                        handleCopyPromo(promo.code)
                        navigate("hasil-pencarian")
                      }}
                    >
                      <span>Pakai Kupon</span>
                      <ArrowRight size={16} />
                    </Button>
                  </div>
                </article>
              )
            })}
        </div>

        {/* Banner Tambahan Promo */}
        <div className="home-promo-strip">
          <div className="promo-strip-icon">
            <Gift size={22} />
          </div>
          <div className="promo-strip-text">
            <strong>Punya voucher lain atau kartu pelajar?</strong>
            <p>
              Dapatkan potongan biaya servis hingga Rp 50.000 dan gratis jemput-antar
              di BSD, Karawaci, Serpong, dan sekitarnya.
            </p>
          </div>
          <Button variant="ghost" onClick={() => navigate("promo")}>
            Lihat Halaman Promo Lengkap <ArrowRight size={16} />
          </Button>
        </div>
      </section>

      {/* 3. Tukang Pilihan di Dekat Kamu */}
      <section className="home-section featured-techs-section">
        <div className="section-header">
          <div className="eyebrow">
            <span className="eyebrow-line" /> TUKANG PILIHAN
          </div>
          <h2>Tukang pilihan di dekat kamu</h2>
          <p>
            Tukang jujur dengan keahlian teruji dan tempat usaha yang jelas di
            sekitar Tangerang.
          </p>
        </div>
        <div className="home-techs-grid">
          {techs.slice(0, 3).map((tech) => (
            <TechnicianCard
              key={tech.id}
              technician={tech}
              onChoose={() => navigate(`detail/${tech.id}`)}
            />
          ))}
        </div>
        <div className="home-section-action">
          <Button
            variant="secondary"
            onClick={() => navigate("hasil-pencarian")}
          >
            Lihat semua tukang di Tangerang <ArrowRight size={18} />
          </Button>
        </div>
      </section>

      {/* 4. Kata Mereka */}
      <section className="home-section reviews-section">
        <div className="section-header">
          <div className="eyebrow">
            <span className="eyebrow-line" /> CERITA TETANGGA
          </div>
          <h2>Kata mereka</h2>
          <p>
            Cerita asli dari warga yang memilih benerin dulu daripada buru-buru
            beli baru.
          </p>
        </div>
        <div className="home-reviews-grid">
          {reviews.map((rev, idx) => (
            <ReviewItem key={idx} review={rev} />
          ))}
        </div>
      </section>

      {/* 5. CTA Strip untuk Tukang */}
      <section className="home-tech-cta">
        <div className="tech-cta-content">
          <div className="tech-cta-badge">
            <Wrench size={16} />
            <span>UNTUK TUKANG SERVIS</span>
          </div>
          <h2>Kamu tukang servis? Gabung barangku</h2>
          <p>
            Bantu tetangga di sekitarmu dan kembangkan tokomu tanpa biaya
            pendaftaran.
          </p>
        </div>
        <Button
          className="tech-cta-btn"
          onClick={() => navigate("untuk-tukang")}
        >
          Daftar jadi tukang <ArrowRight size={20} />
        </Button>
      </section>
    </main>
  )
}
