import { useEffect, useRef, useState } from "react"

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Star,
  Wrench,
  X,
  ChevronDown,
} from "lucide-react"

import { Badge, Button, ReviewItem, rupiah } from "./DesignSystem"

import {
  addTechnicianReview,
  getTechnician,
  getTechnicianReviews,
  type Review,
  type Technician,
} from "./api"

function getPrices(t: Technician) {
  const laptop = [
    ["Servis laptop mati total", t.min, t.max],

    ["Ganti baterai laptop", 250000, 650000],

    ["Pasang ulang sistem", 100000, 200000],

    ["Ganti papan ketik laptop", 200000, 450000],

    ["Bersihkan laptop & ganti pasta pendingin", 100000, 200000],
  ]

  const hp = [
    ["Ganti layar HP", 250000, 900000],

    ["Ganti baterai HP", 150000, 350000],

    ["Perbaikan konektor pengisian HP", 100000, 250000],

    ["Servis HP mati total", t.min, t.max],
  ]

  return [
    ...(t.devices.includes("HP") ? hp : []),
    ...(t.devices.includes("Laptop") ? laptop : []),
  ] as [string, number, number][]
}

export default function TechnicianDetail({
  technician: propTechnician,

  id,

  navigate,
}: {
  technician?: Technician

  id?: number

  navigate: (path: string) => void
}) {
  const [tech, setTech] = useState<Technician | null>(propTechnician ?? null)

  const [reviews, setReviews] = useState<Review[]>([])

  const [loading, setLoading] = useState(!propTechnician && !!id)

  const [error, setError] = useState("")

  const [expanded, setExpanded] = useState(false)

  const [isReviewOpen, setIsReviewOpen] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewName, setReviewName] = useState("")
  const [reviewService, setReviewService] = useState("")
  const [reviewComment, setReviewComment] = useState("")
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewSuccess, setReviewSuccess] = useState(false)

  const dialog = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    let isMounted = true

    const targetId = id ?? propTechnician?.id

    if (!targetId) return

    setLoading(!tech)

    setError("")

    Promise.all([
      propTechnician
        ? Promise.resolve(propTechnician)
        : getTechnician(targetId),

      getTechnicianReviews(targetId),
    ])

      .then(([tRes, rRes]) => {
        if (!isMounted) return

        setTech(tRes)

        setReviews(rRes)

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
  }, [id, propTechnician])

  if (loading) {
    return (
      <main className="container detail-page">
        <p>Memuat...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="container detail-page">
        <p>{error}</p>
      </main>
    )
  }

  const t = tech

  if (!t)
    return (
      <main className="container placeholder-page">
        <h1>Tukang belum ditemukan.</h1>
        <p>Coba pilih tukang dari hasil pencarian ya.</p>
        <Button onClick={() => navigate("hasil-pencarian")}>
          <ArrowLeft size={18} /> Kembali ke pencarian
        </Button>
      </main>
    )

  const book = () => navigate(`pesan/${t.id}`)

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewName.trim() || !reviewComment.trim()) return
    setReviewSubmitting(true)
    try {
      const added = await addTechnicianReview(t.id, {
        rating: reviewRating,
        name: reviewName.trim(),
        service: reviewService.trim() || (t.devices[0] === "HP" ? "Servis HP" : "Servis Laptop"),
        text: reviewComment.trim(),
      })
      setReviews((prev) => [added, ...prev])
      setTech((prev) => {
        if (!prev) return prev
        const prevRating = parseFloat(prev.rating) || 5.0
        const newTotal = (prev.reviews || 0) + 1
        const newRating = (
          (prevRating * (prev.reviews || 0) + reviewRating) /
          newTotal
        ).toFixed(1)
        return {
          ...prev,
          reviews: newTotal,
          rating: newRating,
        }
      })
      setReviewSuccess(true)
      setTimeout(() => {
        setIsReviewOpen(false)
        setReviewSuccess(false)
        setReviewName("")
        setReviewComment("")
        setReviewRating(5)
      }, 1200)
    } catch {
      alert("Gagal menambahkan ulasan. Silakan coba lagi.")
    } finally {
      setReviewSubmitting(false)
    }
  }

  return (
    <main className="container detail-page">
      <div className="breadcrumb">
        <a href="#beranda">Beranda</a>
        <span>/</span>
        <a href="#hasil-pencarian">Hasil pencarian</a>
        <span>/</span>
        <span>{t.name}</span>
      </div>
      <div className="detail-photo">
        <img
          src={
            t.photo ??
            "https://images.unsplash.com/photo-1580835916901-40770720c505?auto=format&fit=crop&w=1600&q=85"
          }
          alt={`Contoh tempat kerja ${t.name}`}
        />
        <div className="detail-photo-label">
          <Wrench size={16} /> Tempat barang kamu dibenerin
        </div>
        <span className="detail-photo-note">Foto ilustrasi</span>
      </div>
      <header className="detail-heading">
        <div>
          <div className="detail-heading-badges">
            {t.verified && <Badge />}
            <Badge type={t.status} />
          </div>
          <h1>{t.name}</h1>
          <p className="detail-specialty">
            Servis {t.devices.join(" & ")} · Tukang lokal di {t.area}
          </p>
          <div className="detail-rating">
            <Star size={18} fill="currentColor" />
            <strong>{t.rating}</strong>
            <Button
              variant="ghost"
              onClick={() =>
                document
                  .getElementById("ulasan-tukang")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              {t.reviews} ulasan pelanggan
            </Button>
            <span className="rating-divider" />
            <MapPin size={16} />
            <span>{t.distance.toLocaleString("id-ID")} km dari kamu</span>
          </div>
        </div>
        <div className="detail-location">
          <p>
            <MapPin size={19} />
            <span>
              {t.address ?? `${t.area}, Tangerang`}
              <small>Alamat contoh untuk prototipe</small>
            </span>
          </p>
          <p>
            <Clock size={19} />
            <span>
              Senin–Sabtu, 09.00–18.00
              <small>
                {t.status === "open"
                  ? "Buka sekarang · Tutup pukul 18.00"
                  : t.status === "busy"
                    ? "Sedang sibuk · Tanya antrean dulu ya"
                    : "Tutup sekarang · Buka lagi pukul 09.00"}
              </small>
            </span>
          </p>
        </div>
      </header>
      <div className="detail-layout">
        <div className="detail-content">
          <section className="detail-section">
            <div className="detail-section-title">
              <Wrench size={20} />
              <h2>Tentang tukang ini</h2>
            </div>
            <p>
              {t.name} bantu benerin {t.devices.join(" dan ")} kamu di {t.area}.
              Mulai dari pengecekan sampai ganti komponen, kerusakannya
              dijelasin pakai bahasa yang gampang dimengerti. Biaya dibicarakan
              dulu sebelum dikerjakan, jadi kamu bisa memutuskan dengan tenang.
            </p>
            <div className="detail-promises">
              <span>
                <Check size={16} /> Biaya disepakati dulu
              </span>
              <span>
                <Check size={16} /> Barang dites sebelum diambil
              </span>
            </div>
          </section>
          <section className="detail-section">
            <div className="detail-section-title">
              <h2>Perkiraan biaya</h2>
              <span className="service-tag">{t.devices.join(" & ")}</span>
            </div>
            <p className="detail-section-subtitle">
              Biar kamu punya gambaran sebelum datang.
            </p>
            <div
              className="price-table-wrap"
              tabIndex={0}
              aria-label="Tabel perkiraan biaya servis"
            >
              <table className="price-table">
                <thead>
                  <tr>
                    <th scope="col">Jenis servis</th>
                    <th scope="col">Perkiraan biaya</th>
                  </tr>
                </thead>
                <tbody>
                  {getPrices(t).map(([service, min, max]) => (
                    <tr key={service}>
                      <th scope="row">{service}</th>
                      <td>
                        {rupiah(min)} – {rupiah(max)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="price-explanation">
              <ShieldCheck size={18} />
              <p>
                Biaya bisa beda tergantung tipe perangkat dan kerusakannya.{" "}
                <strong>Tukang akan konfirmasi ke kamu sebelum mulai.</strong>
              </p>
            </div>
          </section>
          <section id="ulasan-tukang" className="detail-section detail-reviews">
            <div className="detail-section-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <h2>Ulasan pelanggan</h2>
                <span className="detail-review-score">
                  <Star size={17} fill="currentColor" />
                  <strong>{t.rating}</strong>
                  <span>({t.reviews} ulasan)</span>
                </span>
              </div>
              <Button
                variant="secondary"
                style={{ fontSize: "13px", height: "38px", padding: "0 14px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                onClick={() => setIsReviewOpen(true)}
              >
                <Star size={15} /> Tulis ulasan
              </Button>
            </div>
            <p className="detail-section-subtitle">
              Cerita dari orang yang sudah pernah servis di sini.
            </p>
            <div className="detail-review-list">
              {reviews.slice(0, expanded ? reviews.length : 4).map((review) => (
                <ReviewItem key={review.name} review={review} />
              ))}
            </div>
            {expanded && (
              <p className="review-sample-note" role="status">
                Semua 6 contoh ulasan sudah ditampilkan. Jumlah ulasan toko
                adalah data contoh.
              </p>
            )}
            <Button
              variant="ghost"
              className="all-reviews-button"
              aria-expanded={expanded}
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? "Tampilkan lebih sedikit" : "Lihat semua ulasan"}
              <ChevronDown size={18} className={expanded ? "rotate-180" : ""} />
            </Button>
          </section>
        </div>
        <aside className="booking-sidebar">
          <div className="booking-card">
            <div className="eyebrow">BENERIN DULU, YUK.</div>
            <p className="booking-price-label">Perkiraan biaya servis</p>
            <strong className="booking-price">
              {rupiah(t.min)} –<br />
              {rupiah(t.max)}
            </strong>
            <p className="booking-price-note">
              Biaya akhir setelah perangkat dicek.
            </p>
            <div className="booking-status">
              <Badge type={t.status} />
              <span>
                {t.status === "open"
                  ? "Siap terima barang kamu"
                  : t.status === "busy"
                    ? "Ada antrean, tanya dulu ya"
                    : "Bisa pesan untuk saat toko buka"}
              </span>
            </div>
            <Button className="w-full" onClick={book}>
              Pesan servis <ArrowRight size={18} />
            </Button>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => {
                dialog.current?.showModal()
              }}
            >
              <MessageCircle size={18} /> Hubungi tukang
            </Button>
            <div className="booking-assurance">
              <ShieldCheck size={18} />
              <p>
                Nggak perlu bayar sekarang.
                <br />
                Sepakati biaya dengan tukang dulu.
              </p>
            </div>
          </div>
          <p className="sidebar-note">
            Kamu tetap punya pilihan.
            <br />
            Kalau belum cocok, <a href="#hasil-pencarian">cari tukang lain.</a>
          </p>
        </aside>
      </div>
      <div className="mobile-booking-bar">
        <div>
          <small>Perkiraan mulai</small>
          <strong>{rupiah(t.min)}</strong>
        </div>
        <Button onClick={book}>
          Pesan servis <ArrowRight size={18} />
        </Button>
      </div>
      <dialog ref={dialog} className="contact-dialog">
        <div className="contact-heading">
          <h2>Hubungi {t.name}</h2>
          <Button
            variant="ghost"
            autoFocus
            aria-label="Tutup kontak"
            onClick={() => dialog.current?.close()}
          >
            <X size={20} />
          </Button>
        </div>
        <p className="small-text">
          Tanyakan langsung ke toko melalui WhatsApp resmi untuk jadwal servis atau estimasi komponen.
        </p>

        <div style={{ margin: "20px 0", padding: "16px", background: "var(--primary-tint)", borderRadius: "12px", border: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <MessageCircle size={20} color="var(--primary)" />
            <strong style={{ fontSize: "14px", color: "var(--primary-dark)" }}>WhatsApp Resmi Toko</strong>
          </div>
          <div style={{ fontSize: "16px", fontWeight: "700", marginBottom: "14px" }}>
            {t.phone || "0812-9876-5431"}
          </div>
          <Button
            className="w-full"
            onClick={() => {
              const raw = t.phone || "081298765431"
              const waNum = raw.replace(/^0/, "62").replace(/[^0-9]/g, "")
              window.open(
                `https://wa.me/${waNum}?text=${encodeURIComponent(`Halo ${t.name}, saya ingin tanya servis perangkat di toko Anda.`)}`,
                "_blank",
                "noopener,noreferrer",
              )
            }}
          >
            <MessageCircle size={18} /> Chat WhatsApp Langsung <ArrowRight size={18} />
          </Button>
        </div>
      </dialog>

      {isReviewOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
          onClick={() => setIsReviewOpen(false)}
        >
          <div
            style={{
              background: "var(--surface)",
              borderRadius: "16px",
              padding: "24px",
              maxWidth: "500px",
              width: "100%",
              boxShadow: "var(--shadow)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "700" }}>Tulis Ulasan untuk {t.name}</h2>
              <Button variant="ghost" onClick={() => setIsReviewOpen(false)} aria-label="Tutup">
                <X size={20} />
              </Button>
            </div>

            {reviewSuccess ? (
              <div style={{ padding: "24px", textAlign: "center", color: "var(--success)" }}>
                <Check size={36} style={{ margin: "0 auto 12px" }} />
                <strong style={{ display: "block", fontSize: "18px" }}>Ulasan berhasil dikirim!</strong>
                <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>
                  Rating toko dan daftar ulasan telah diperbarui secara otomatis.
                </p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "8px" }}>
                    Beri Bintang
                  </label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: "4px",
                          color: star <= reviewRating ? "var(--accent)" : "var(--border)",
                          transition: "transform 0.15s ease",
                        }}
                      >
                        <Star size={28} fill={star <= reviewRating ? "currentColor" : "none"} />
                      </button>
                    ))}
                    <span style={{ alignSelf: "center", fontSize: "14px", fontWeight: "700", marginLeft: "8px", color: "var(--primary)" }}>
                      {reviewRating} dari 5
                    </span>
                  </div>
                </div>

                <label className="field">
                  <span>Nama kamu</span>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Budi Santoso"
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                  />
                </label>

                <label className="field">
                  <span>Jenis servis / perbaikan</span>
                  <input
                    type="text"
                    placeholder={`Contoh: Ganti baterai ${t.devices[0]}`}
                    value={reviewService}
                    onChange={(e) => setReviewService(e.target.value)}
                  />
                </label>

                <label className="field">
                  <span>Pengalaman servis kamu</span>
                  <textarea
                    required
                    rows={4}
                    placeholder="Ceritakan ketepatan waktu, kualitas pengerjaan, dan keramahan tukang..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                  />
                </label>

                <Button type="submit" className="w-full" disabled={reviewSubmitting}>
                  {reviewSubmitting ? "Mengirim ulasan..." : "Kirim Ulasan Sekarang"}
                </Button>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
