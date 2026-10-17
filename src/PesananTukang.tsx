import { useEffect, useState } from "react"

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock,
  Laptop,
  MessageSquare,
  ShieldCheck,
  Smartphone,
  Wrench,
} from "lucide-react"

import { Badge, Button, Stepper } from "./DesignSystem"

import { repairSteps } from "./Tracking"

import { getOrder, updateOrderStatus, type Order } from "./api"

const TECH_STEPS = [
  "Diterima",
  "Dicek",
  "Diperbaiki",
  "Siap diambil",
  "Selesai",
]

export default function PesananTukang({
  code,

  orders: propOrders,

  onUpdateOrder,

  navigate,
}: {
  code: string

  orders?: Order[]

  onUpdateOrder?: (code: string, updates: Partial<Order>) => void

  navigate: (path: string) => void
}) {
  const [order, setOrder] = useState<Order | null>(
    propOrders?.find((o) => o.code === code) ?? null,
  )

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState("")

  const [actionLoading, setActionLoading] = useState(false)

  const [estimateMin, setEstimateMin] = useState("150000")

  const [estimateMax, setEstimateMax] = useState("350000")

  const [message, setMessage] = useState("")

  const [savedNotice, setSavedNotice] = useState(false)

  useEffect(() => {
    let isMounted = true

    setLoading(true)

    setError("")

    getOrder(code)

      .then((res) => {
        if (!isMounted) return

        setOrder(res)

        if (res) {
          setEstimateMin(
            String(res.estimateMin ?? res.technician.min ?? 150000),
          )

          setEstimateMax(
            String(res.estimateMax ?? res.technician.max ?? 350000),
          )

          setMessage(res.message || "")
        }

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
  }, [code])

  if (loading) {
    return (
      <main className="container pesanan-tukang-page">
        <p>Memuat...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="container pesanan-tukang-page">
        <p>{error}</p>
      </main>
    )
  }

  if (!order) {
    return (
      <main className="container placeholder-page">
        <div className="search-empty">
          <CircleAlert size={48} />
          <h2>Pesanan tidak ditemukan</h2>
          <p>Kode pesanan {code} tidak ada dalam daftar tokomu.</p>
          <Button
            className="tech-button"
            onClick={() => navigate("dashboard-tukang")}
          >
            <ArrowLeft size={20} /> Kembali ke dashboard
          </Button>
        </div>
      </main>
    )
  }

  // Calculate tech step index (0 = Diterima, 1 = Dicek, 2 = Diperbaiki, 3 = Siap diambil, 4 = Selesai)

  // order.status values: 1 = Diterima, 2 = Dicek, 3 = Diperbaiki, 4 = Siap diambil, 5 = Selesai

  const currentStatus = Math.max(1, order.status)

  const techStepIndex = Math.min(4, Math.max(0, currentStatus - 1))

  const showNotice = () => {
    setSavedNotice(true)

    setTimeout(() => setSavedNotice(false), 3000)
  }

  const handleNextStep = async () => {
    if (currentStatus < 5) {
      const nextStatus = currentStatus + 1

      let defaultMsg = message

      const deviceName = order.device || order.details.device

      if (nextStatus === 2) {
        defaultMsg =
          defaultMsg ||
          `${deviceName} sudah kami cek. Perbaikan siap dimulai setelah biaya disetujui.`
      } else if (nextStatus === 3) {
        defaultMsg =
          defaultMsg ||
          `${deviceName} sedang kami perbaiki. Kami akan tes menyeluruh setelah selesai.`
      } else if (nextStatus === 4) {
        defaultMsg =
          defaultMsg ||
          `${deviceName} sudah selesai diperbaiki dan siap diambil di toko.`
      } else if (nextStatus === 5) {
        defaultMsg =
          defaultMsg ||
          `${deviceName} sudah diserahkan ke pelanggan dalam kondisi normal.`
      }

      setActionLoading(true)

      try {
        const updated = await updateOrderStatus(order.code, nextStatus, {
          estimateMin: Number(estimateMin) || order.estimateMin,

          estimateMax: Number(estimateMax) || order.estimateMax,

          message: defaultMsg,
        })

        setOrder(updated)

        setMessage(defaultMsg)

        onUpdateOrder?.(order.code, updated)

        showNotice()
      } catch {
        setError("Ada yang salah. Coba lagi ya.")
      } finally {
        setActionLoading(false)
      }
    }
  }

  const handleSaveInfo = async () => {
    setActionLoading(true)

    try {
      const updated = await updateOrderStatus(order.code, order.status, {
        estimateMin: Number(estimateMin) || order.estimateMin,

        estimateMax: Number(estimateMax) || order.estimateMax,

        message: message,
      })

      setOrder(updated)

      onUpdateOrder?.(order.code, updated)

      showNotice()
    } catch {
      setError("Ada yang salah. Coba lagi ya.")
    } finally {
      setActionLoading(false)
    }
  }

  // Next step label (Only one main primary action per screen)

  let nextActionLabel = ""

  if (currentStatus === 1) nextActionLabel = "Tandai sudah dicek"
  else if (currentStatus === 2) nextActionLabel = "Tandai mulai diperbaiki"
  else if (currentStatus === 3) nextActionLabel = "Tandai siap diambil"
  else if (currentStatus === 4) nextActionLabel = "Tandai pesanan selesai"

  return (
    <main className="container pesanan-tukang-page">
      {/* Header & Back */}
      <div className="tech-order-nav">
        <Button
          variant="ghost"
          className="tech-back-link"
          onClick={() => navigate("dashboard-tukang")}
        >
          <ArrowLeft size={18} /> Kembali ke dashboard
        </Button>
      </div>

      <div className="tech-order-header">
        <div className="tech-order-heading-left">
          <div className="eyebrow">
            <span className="eyebrow-line" /> KELOLA PERBAIKAN TOKO
          </div>
          <h1>Pesanan {order.code}</h1>
          <p className="tech-order-sub">
            Pelanggan:{" "}
            <strong>{(order.customerName || "Pelanggan").split(" ")[0]}</strong>{" "}
            · Tanggal antar: {order.date || order.details.date}
          </p>
        </div>
        <div className="tech-order-badge-wrap">
          <Badge
            type={currentStatus === 5 ? "open" : "busy"}
            label={repairSteps[currentStatus]}
          />
        </div>
      </div>

      {/* Stepper showing the 5 technician steps */}
      <section className="tech-order-stepper-card">
        <span className="stepper-card-title">Kemajuan servis saat ini:</span>
        <Stepper
          steps={TECH_STEPS}
          current={techStepIndex}
          label="Status pengerjaan tukang"
        />
      </section>

      {/* Main Action Banner: Exactly ONE big primary button for the next step */}
      {currentStatus < 5 ? (
        <section className="tech-next-action-card">
          <div className="tech-next-info">
            <span className="next-label">Langkah berikutnya:</span>
            <h2>{nextActionLabel}</h2>
            <p>Klik tombol di bawah jika kamu sudah menyelesaikan tahap ini.</p>
          </div>
          <Button
            className="tech-button tech-btn-next"
            onClick={handleNextStep}
            disabled={actionLoading}
          >
            {actionLoading ? (
              "Memuat..."
            ) : (
              <>
                {nextActionLabel} <ArrowRight size={22} />
              </>
            )}
          </Button>
        </section>
      ) : (
        <section className="tech-completed-banner">
          <CheckCircle2 size={32} />
          <div>
            <strong>Perbaikan sudah selesai</strong>
            <p>
              Barang sudah diserahkan ke pelanggan. Terima kasih telah membantu
              tetangga!
            </p>
          </div>
        </section>
      )}

      {/* Grid: Order Info & Customer Communication */}
      <div className="tech-order-grid">
        {/* Left: Device & Damage Info */}
        <section className="tech-card-section">
          <h2>Informasi barang</h2>
          <div className="tech-info-block">
            <div className="tech-device-badge">
              {(order.device || order.details.device) === "HP" ? (
                <Smartphone size={24} />
              ) : (
                <Laptop size={24} />
              )}
              <div>
                <strong>
                  {order.device || order.details.device} ·{" "}
                  {order.model || order.details.model}
                </strong>
                <span>Kode: {order.code}</span>
              </div>
            </div>

            <div className="tech-damage-box">
              <span className="label">Kerusakan yang dilaporkan:</span>
              <p>{order.damage || order.details.problem}</p>
              {order.photoUrl && (
                <div style={{ marginTop: "12px" }}>
                  <span className="label" style={{ display: "block", marginBottom: "6px" }}>Foto dari pelanggan:</span>
                  <img
                    src={order.photoUrl}
                    alt="Foto kerusakan dari pelanggan"
                    style={{
                      maxHeight: "180px",
                      maxWidth: "100%",
                      borderRadius: "8px",
                      objectFit: "cover",
                      border: "1px solid var(--border)",
                      display: "block",
                    }}
                  />
                  {order.photoName && (
                    <small style={{ display: "block", color: "var(--text-secondary)", marginTop: "4px" }}>
                      {order.photoName}
                    </small>
                  )}
                </div>
              )}
            </div>

            <div className="tech-meta-box">
              <div>
                <span className="label">Nama pelanggan:</span>
                <strong>
                  {(order.customerName || "Pelanggan").split(" ")[0]}
                </strong>
              </div>
              <div>
                <span className="label">Nomor WhatsApp:</span>
                <span>{order.customerPhone || "0812-0000-0000"}</span>
              </div>
              <div>
                <span className="label">Waktu masuk:</span>
                <span>
                  {order.date || order.details.date} pukul{" "}
                  {order.time || order.details.time}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Right: Cost Estimate & Message to Customer */}
        <section className="tech-card-section">
          <h2>Perkiraan biaya & kabar pelanggan</h2>
          <p className="section-desc">
            Data ini akan langsung terlihat oleh pelanggan di halaman pelacakan
            mereka.
          </p>

          <div className="tech-inputs-form">
            <div className="tech-price-inputs">
              <label className="field tech-field">
                <span>Perkiraan terendah (Rp)</span>
                <input
                  type="number"
                  value={estimateMin}
                  onChange={(e) => setEstimateMin(e.target.value)}
                  placeholder="Contoh: 150000"
                />
              </label>

              <label className="field tech-field">
                <span>Perkiraan tertinggi (Rp)</span>
                <input
                  type="number"
                  value={estimateMax}
                  onChange={(e) => setEstimateMax(e.target.value)}
                  placeholder="Contoh: 350000"
                />
              </label>
            </div>

            <label className="field tech-field">
              <span>Kabar buat pelanggan</span>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tulis kabar singkat perkembangan servis buat pelanggan..."
              />
              <small className="help-text">
                Pesan ini akan dibaca pelanggan di bagian 'Kabar dari tukang'.
              </small>
            </label>

            <Button
              variant="secondary"
              className="tech-button"
              onClick={handleSaveInfo}
              disabled={actionLoading}
            >
              {actionLoading ? "Memuat..." : "Simpan perkiraan & kabar"}
            </Button>

            {savedNotice && (
              <p className="tech-saved-indicator" role="status">
                <CheckCircle2 size={16} /> Data perkiraan dan kabar berhasil
                disimpan untuk pelanggan!
              </p>
            )}
          </div>
        </section>
      </div>

      {/* Back Button */}
      <div className="tech-order-bottom">
        <Button
          variant="secondary"
          className="tech-button"
          onClick={() => navigate("dashboard-tukang")}
        >
          <ArrowLeft size={20} /> Kembali ke dashboard
        </Button>
      </div>
    </main>
  )
}
