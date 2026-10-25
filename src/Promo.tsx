import { useState } from "react"
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  Gift,
  HelpCircle,
  Percent,
  Search,
  ShieldCheck,
  Sparkles,
  Tag,
  Truck,
  Wrench,
} from "lucide-react"
import { Button, Chip } from "./DesignSystem"
import { PROMOTIONS, type PromoVoucher } from "./promotions"

export default function Promo({
  navigate,
}: {
  navigate: (path: string) => void
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [expandedTerms, setExpandedTerms] = useState<Record<string, boolean>>({})

  const handleCopy = (code: string) => {
    navigator.clipboard?.writeText(code)
    setCopiedCode(code)
    setTimeout(() => {
      setCopiedCode((prev) => (prev === code ? null : prev))
    }, 2500)
  }

  const toggleTerms = (id: string) => {
    setExpandedTerms((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const filteredPromos =
    selectedCategory === "all"
      ? PROMOTIONS
      : PROMOTIONS.filter((p) => p.category === selectedCategory)

  return (
    <main className="container promo-page">
      {/* 1. Header Hero Banner */}
      <section className="promo-hero-card">
        <div className="promo-hero-content">
          <div className="promo-pill">
            <Sparkles size={16} />
            <span>PENAWARAN SPESIAL TANGERANG</span>
          </div>
          <h1>
            Kumpulan Promo &amp; Voucher
            <br />
            <span>Hemat Servis Barangku</span>
          </h1>
          <p className="promo-hero-desc">
            Benerin barang elektronik nggak perlu bikin kantong jebol. Manfaatkan
            berbagai voucher potongan harga jasa, cashback sparepart, hingga gratis
            jemput-antar perangkat se-Tangerang Raya.
          </p>
          <div className="promo-hero-actions">
            <Button onClick={() => navigate("hasil-pencarian")}>
              <Search size={18} />
              <span>Cari Tukang Servis</span>
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                document
                  .getElementById("cara-pakai-promo")
                  ?.scrollIntoView({ behavior: "smooth" })
              }}
            >
              <HelpCircle size={18} />
              <span>Cara Pakai Kode</span>
            </Button>
          </div>
        </div>

        <div className="promo-hero-visual" aria-hidden="true">
          <div className="promo-floating-badge badge-1">
            <Percent size={20} />
            <div>
              <strong>Diskon s/d 25%</strong>
              <small>Hemat servis perdana</small>
            </div>
          </div>
          <div className="promo-floating-badge badge-2">
            <Truck size={20} />
            <div>
              <strong>Gratis Jemput</strong>
              <small>Area Tangerang Raya</small>
            </div>
          </div>
          <div className="promo-floating-badge badge-3">
            <ShieldCheck size={20} />
            <div>
              <strong>Garansi Servis</strong>
              <small>Aman &amp; tepercaya</small>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Filter Kategori Voucher */}
      <section className="promo-filter-section">
        <div className="promo-filter-header">
          <div>
            <h2>Voucher Aktif Hari Ini</h2>
            <p>Pilih dan salin kode kupon sebelum melakukan pemesanan servis.</p>
          </div>
          <span className="promo-counter-badge">
            {filteredPromos.length} Kupon Tersedia
          </span>
        </div>

        <div className="chips promo-chips">
          <Chip
            label="Semua Promo"
            selected={selectedCategory === "all"}
            onClick={() => setSelectedCategory("all")}
          />
          <Chip
            label="Servis Perdana"
            selected={selectedCategory === "servis"}
            onClick={() => setSelectedCategory("servis")}
          />
          <Chip
            label="Gratis Jemput-Antar"
            selected={selectedCategory === "delivery"}
            onClick={() => setSelectedCategory("delivery")}
          />
          <Chip
            label="LCD &amp; Sparepart"
            selected={selectedCategory === "sparepart"}
            onClick={() => setSelectedCategory("sparepart")}
          />
          <Chip
            label="Pelajar &amp; Mahasiswa"
            selected={selectedCategory === "pelajar"}
            onClick={() => setSelectedCategory("pelajar")}
          />
        </div>
      </section>

      {/* 3. Grid Daftar Voucher */}
      <section className="promo-grid">
        {filteredPromos.map((promo) => {
          const isCopied = copiedCode === promo.code
          const isExpanded = !!expandedTerms[promo.id]

          return (
            <article key={promo.id} className="promo-ticket-card">
              <div className="ticket-top">
                <div className="ticket-badge-row">
                  <span className="promo-type-badge">{promo.categoryLabel}</span>
                  <span className="promo-popular-badge">{promo.badge}</span>
                </div>

                <div className="ticket-discount">
                  <strong>{promo.discount}</strong>
                  <h3>{promo.title}</h3>
                </div>

                <p className="ticket-desc">{promo.description}</p>
              </div>

              {/* Garis Potong Tiket */}
              <div className="ticket-separator">
                <div className="ticket-notch notch-left" />
                <div className="ticket-dash" />
                <div className="ticket-notch notch-right" />
              </div>

              <div className="ticket-bottom">
                <div className="ticket-meta-info">
                  <div className="meta-item">
                    <Clock size={14} />
                    <span>Berlaku s/d {promo.validUntil}</span>
                  </div>
                  <div className="meta-item quota-item">
                    <span>Sisa kuota: <strong>{promo.remainingQuota} kupon</strong></span>
                  </div>
                </div>

                <div className="ticket-code-box">
                  <div className="ticket-code-text">
                    <small>KODE PROMO</small>
                    <code>{promo.code}</code>
                  </div>
                  <button
                    type="button"
                    className={`btn-copy-code ${isCopied ? "copied" : ""}`}
                    onClick={() => handleCopy(promo.code)}
                    aria-label={`Salin kode promo ${promo.code}`}
                  >
                    {isCopied ? (
                      <>
                        <Check size={16} />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        <span>Salin</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Syarat & Ketentuan Dropdown */}
                <div className="ticket-terms-wrap">
                  <button
                    type="button"
                    className="btn-toggle-terms"
                    onClick={() => toggleTerms(promo.id)}
                    aria-expanded={isExpanded}
                  >
                    <span>Syarat &amp; Ketentuan</span>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                  {isExpanded && (
                    <ul className="ticket-terms-list">
                      {promo.terms.map((term, index) => (
                        <li key={index}>{term}</li>
                      ))}
                    </ul>
                  )}
                </div>

                <Button
                  className="ticket-use-btn"
                  onClick={() => {
                    handleCopy(promo.code)
                    navigate("hasil-pencarian")
                  }}
                >
                  <span>Pakai Kupon Sekarang</span>
                  <ArrowRight size={16} />
                </Button>
              </div>
            </article>
          )
        })}
      </section>

      {/* 4. Cara Pakai Promo Section */}
      <section id="cara-pakai-promo" className="promo-steps-section">
        <div className="section-header text-center">
          <div className="eyebrow justify-center">
            <span className="eyebrow-line" /> PANDUAN PENGGUNAAN
          </div>
          <h2>Cara Menggunakan Kode Promo</h2>
          <p>
            Mudah dan praktis dalam tiga langkah sebelum teknisi mulai melakukan
            perbaikan.
          </p>
        </div>

        <div className="promo-steps-grid">
          <div className="promo-step-card">
            <div className="promo-step-number">1</div>
            <div className="promo-step-icon">
              <Tag size={24} />
            </div>
            <h3>Salin Kode Kupon</h3>
            <p>
              Pilih promo yang sesuai dengan kebutuhan servis gadget kamu, lalu
              klik tombol <strong>Salin</strong> pada kartu kupon di atas.
            </p>
          </div>

          <div className="promo-step-card">
            <div className="promo-step-number">2</div>
            <div className="promo-step-icon">
              <Search size={24} />
            </div>
            <h3>Pilih Tukang Servis</h3>
            <p>
              Cari teknisi terdekat di wilayah Tangerang, bandingkan jarak,
              perkiraan biaya pengerjaan, dan ulasan tetangga.
            </p>
          </div>

          <div className="promo-step-card">
            <div className="promo-step-number">3</div>
            <div className="promo-step-icon">
              <Wrench size={24} />
            </div>
            <h3>Klaim &amp; Dapatkan Potongan</h3>
            <p>
              Tuliskan kode promo pada kolom catatan pemesanan atau tunjukkan saat
              serah terima unit ke teknisi toko.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Reassurance Banner */}
      <section className="promo-cta-box">
        <div className="promo-cta-text">
          <div className="promo-cta-badge">
            <Gift size={16} />
            <span>HEMAT LEBIH BANYAK</span>
          </div>
          <h2>Gadget Rusak Jangan Dibiarkan Terlalu Lama</h2>
          <p>
            Makin cepat diperbaiki, makin terhindar dari kerusakan parah yang
            berbiaya tinggi. Manfaatkan promo aktif sekarang juga!
          </p>
        </div>
        <Button onClick={() => navigate("hasil-pencarian")}>
          <span>Cari Tukang Servis Tangerang</span>
          <ArrowRight size={18} />
        </Button>
      </section>
    </main>
  )
}
