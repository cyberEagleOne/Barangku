import { useEffect, useState } from "react"

import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  ShieldCheck,
  List,
  Navigation,
  ChevronDown,
  Inbox,
  X,
  Check,
} from "lucide-react"

import MapLeaflet from "./MapLeaflet"

import DesignSystem, {
  Button,
  Chip,
  Navbar,
  Footer,
  TechnicianCard,
  rupiah,
  type Technician,
} from "./DesignSystem"

import TechnicianDetail from "./TechnicianDetail"

import Tracking from "./Tracking"

import Booking from "./Booking"

import Auth, {
  ForgotPassword,
  isProtectedRoute,
  isTechnicianRoute,
  safeReturnRoute,
} from "./Auth"

import {
  getCurrentUser,
  logout as apiLogout,
  searchTechnicians,
  type User,
} from "./api"

import MyOrders from "./MyOrders"

import Home from "./Home"

import UntukTukang from "./UntukTukang"

import DaftarTukang from "./DaftarTukang"

import DashboardTukang from "./DashboardTukang"

import PesananTukang from "./PesananTukang"

import {
  TANGERANG_AREAS,
  type LocationArea,
  getSavedLocation,
  saveLocation,
  requestCurrentPosition,
} from "./locations"

export { TANGERANG_AREAS, type LocationArea }

const filters = ["Semua", "Laptop", "HP", "Terverifikasi", "Buka sekarang"]

function go(path: string) {
  location.hash = path
  window.scrollTo({ top: 0, behavior: "instant" })
}

function SearchResults() {
  const [chosenFilters, setFilters] = useState<string[]>(() => {
    const device = new URLSearchParams(location.hash.split("?")[1]).get(
      "perangkat",
    )

    return device === "Laptop" || device === "HP" ? [device] : []
  })

  const [selectedArea, setSelectedArea] = useState<LocationArea>(() => {
    const params = new URLSearchParams(location.hash.split("?")[1])
    const lokasiParam = params.get("lokasi")
    const latParam = params.get("lat")
    const lngParam = params.get("lng")

    if (latParam && lngParam) {
      const lat = parseFloat(latParam)
      const lng = parseFloat(lngParam)
      if (!isNaN(lat) && !isNaN(lng)) {
        return {
          name: "Lokasi GPS Saya",
          area: "Sekitar Kamu",
          lat,
          lng,
          isGps: true,
        }
      }
    }

    const saved = getSavedLocation()

    if (lokasiParam) {
      if (lokasiParam.toLowerCase() === "gps") {
        if (saved && saved.isGps) {
          return saved
        }
        return {
          name: "Lokasi GPS Saya",
          area: "Sekitar Kamu",
          lat: -6.1783,
          lng: 106.6319,
          isGps: true,
        }
      }
      const match = TANGERANG_AREAS.find(
        (a) =>
          a.area.toLowerCase() === lokasiParam.toLowerCase() ||
          a.name.toLowerCase().includes(lokasiParam.toLowerCase()) ||
          lokasiParam.toLowerCase().includes(a.area.toLowerCase()),
      )
      if (match) return { ...match, isGps: false }
    }

    if (saved) return saved
    return { ...TANGERANG_AREAS[0], isGps: false }
  })

  const updateUrlLocation = (loc: LocationArea, isGps: boolean) => {
    const hash = location.hash || "#hasil-pencarian"
    const [path, query = ""] = hash.split("?")
    const searchParams = new URLSearchParams(query)

    if (isGps) {
      searchParams.set("lokasi", "GPS")
      searchParams.set("lat", String(loc.lat))
      searchParams.set("lng", String(loc.lng))
    } else {
      searchParams.set("lokasi", loc.name)
      searchParams.delete("lat")
      searchParams.delete("lng")
    }

    const newHash = `${path}?${searchParams.toString()}`
    window.history.replaceState(null, "", newHash)
  }

  useEffect(() => {
    const handleHashSync = () => {
      const params = new URLSearchParams(location.hash.split("?")[1] || "")
      const latParam = params.get("lat")
      const lngParam = params.get("lng")
      const lokasiParam = params.get("lokasi")

      if (latParam && lngParam) {
        const lat = parseFloat(latParam)
        const lng = parseFloat(lngParam)
        if (!isNaN(lat) && !isNaN(lng)) {
          setSelectedArea({
            name: "Lokasi GPS Saya",
            area: "Sekitar Kamu",
            lat,
            lng,
            isGps: true,
          })
          return
        }
      }

      if (lokasiParam) {
        if (lokasiParam.toLowerCase() === "gps") {
          const saved = getSavedLocation()
          if (saved && saved.isGps) {
            setSelectedArea(saved)
            return
          }
        }
        const match = TANGERANG_AREAS.find(
          (a) =>
            a.area.toLowerCase() === lokasiParam.toLowerCase() ||
            a.name.toLowerCase().includes(lokasiParam.toLowerCase()) ||
            lokasiParam.toLowerCase().includes(a.area.toLowerCase()),
        )
        if (match) {
          setSelectedArea({ ...match, isGps: false })
          return
        }
      }
    }

    window.addEventListener("hashchange", handleHashSync)
    return () => window.removeEventListener("hashchange", handleHashSync)
  }, [])

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
  const [useGpsLoading, setUseGpsLoading] = useState(false)

  const [sort, setSort] = useState("distance")

  const [selected, setSelected] = useState<number | null>(null)

  const [showMap, setShowMap] = useState(false)

  const [techList, setTechList] = useState<Technician[]>([])

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState("")

  useEffect(() => {
    let isMounted = true

    setLoading(true)

    setError("")

    searchTechnicians({
      filters: chosenFilters,
      sort,
      userLat: selectedArea.lat,
      userLng: selectedArea.lng,
    })
      .then((res) => {
        if (!isMounted) return

        setTechList(res)
        setSelected(res[0]?.id ?? null)

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
  }, [chosenFilters, sort, selectedArea])

  if (loading) {
    return (
      <main className="container results-page">
        <p>Memuat...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="container results-page">
        <p>{error}</p>
      </main>
    )
  }

  const visible = techList

  const current = visible.find((t) => t.id === selected)

  const toggle = (label: string) => {
    const next =
      label === "Semua"
        ? []
        : chosenFilters.includes(label)
          ? chosenFilters.filter((f) => f !== label)
          : [...chosenFilters, label]

    setFilters(next)
    setSelected(null)
  }

  const selectPin = (id: number) => {
    setSelected(id)

    const card = document.getElementById(`technician-${id}`)

    const list = document.querySelector(".results-list")

    if (card && list && window.innerWidth > 600)
      list.scrollTo({
        top: (card as HTMLElement).offsetTop - (list as HTMLElement).offsetTop,
        behavior: "smooth",
      })
  }

  const handleUseCurrentLocation = async () => {
    setUseGpsLoading(true)
    try {
      const coords = await requestCurrentPosition()
      const gpsArea: LocationArea = {
        name: "Lokasi GPS Saya",
        area: "Sekitar Kamu",
        lat: coords.lat,
        lng: coords.lng,
        isGps: true,
      }
      saveLocation(gpsArea)
      setSelectedArea(gpsArea)
      updateUrlLocation(gpsArea, true)
      setIsLocationModalOpen(false)
    } catch (err: any) {
      alert(
        err.message ||
          "Gagal membaca lokasi GPS. Pastikan izin lokasi browser telah diaktifkan.",
      )
    } finally {
      setUseGpsLoading(false)
    }
  }

  const handleSelectArea = (loc: LocationArea) => {
    const chosen: LocationArea = { ...loc, isGps: false }
    saveLocation(chosen)
    setSelectedArea(chosen)
    updateUrlLocation(chosen, false)
    setIsLocationModalOpen(false)
  }

  return (
    <main className="container results-page">
      <div className="breadcrumb">
        <a href="#beranda">Beranda</a>
        <span>/</span>
        <span>Hasil pencarian</span>
      </div>
      <div className="results-title">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-line" /> TUKANG LOKAL, BARANG KEMBALI
            NORMAL
          </div>
          <h1>
            Tukang tepercaya, <span>dekat kamu.</span>
          </h1>
          <p>Bandingkan dulu. Pilih yang pas buat barang dan kantong kamu.</p>
        </div>
        <div
          className="location-pill"
          style={{ cursor: "pointer" }}
          onClick={() => setIsLocationModalOpen(true)}
          role="button"
          tabIndex={0}
          aria-label="Ubah lokasi pencarian"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setIsLocationModalOpen(true)
          }}
        >
          <MapPin size={20} />
          <div>
            <small>Lokasi pencarian kamu</small>
            <strong>{selectedArea.name}</strong>
          </div>
          <Button
            variant="ghost"
            aria-label="Ubah lokasi pencarian"
            onClick={(e) => {
              e.stopPropagation()
              setIsLocationModalOpen(true)
            }}
          >
            <ChevronDown size={18} />
          </Button>
        </div>
      </div>

      {isLocationModalOpen && (
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
          onClick={() => setIsLocationModalOpen(false)}
        >
          <div
            style={{
              background: "var(--surface)",
              borderRadius: "16px",
              padding: "24px",
              maxWidth: "480px",
              width: "100%",
              maxHeight: "85vh",
              overflowY: "auto",
              boxShadow: "var(--shadow)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "700" }}>Pilih Lokasi Kamu</h2>
              <Button variant="ghost" onClick={() => setIsLocationModalOpen(false)} aria-label="Tutup">
                <X size={20} />
              </Button>
            </div>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "20px" }}>
              Pilih kecamatan di Tangerang atau gunakan GPS langsung untuk mengurutkan tukang terdekat secara akurat.
            </p>

            {/* GPS Option Card */}
            {(() => {
              const isGpsActive = Boolean(
                selectedArea.isGps ||
                  selectedArea.name === "Lokasi GPS Saya" ||
                  selectedArea.area === "Sekitar Kamu",
              )

              return (
                <div style={{ marginBottom: "20px" }}>
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "var(--text-secondary)",
                      marginBottom: "8px",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                    }}
                  >
                    Lokasi GPS Otomatis
                  </div>
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={useGpsLoading}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      border: `1.5px solid ${isGpsActive ? "var(--primary)" : "var(--border)"}`,
                      background: isGpsActive ? "var(--primary-tint)" : "var(--surface)",
                      color: isGpsActive ? "var(--primary-dark)" : "var(--text)",
                      cursor: useGpsLoading ? "wait" : "pointer",
                      textAlign: "left",
                      fontWeight: isGpsActive ? "600" : "500",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "8px",
                          background: isGpsActive ? "var(--primary)" : "var(--surface-sunken)",
                          color: isGpsActive ? "#fff" : "var(--primary)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Navigation
                          size={18}
                          style={useGpsLoading ? { animation: "spin 1s linear infinite" } : undefined}
                        />
                      </div>
                      <div>
                        <div style={{ fontWeight: isGpsActive ? "700" : "600", fontSize: "15px" }}>
                          Gunakan Lokasi GPS Saya
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: isGpsActive ? "var(--primary-dark)" : "var(--text-secondary)",
                            marginTop: "2px",
                          }}
                        >
                          {useGpsLoading
                            ? "Sedang membaca koordinat GPS..."
                            : isGpsActive
                              ? "Aktif — Menggunakan posisi kamu saat ini"
                              : "Deteksi otomatis posisi perangkat kamu"}
                        </div>
                      </div>
                    </div>
                    {isGpsActive ? (
                      <Check size={18} color="var(--primary)" />
                    ) : (
                      <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--primary)" }}>
                        Pilih
                      </span>
                    )}
                  </button>
                </div>
              )
            })()}

            <div
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: "var(--text-secondary)",
                marginBottom: "8px",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              Kecamatan & Area Tangerang
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {TANGERANG_AREAS.map((loc) => {
                const isGpsActive = Boolean(
                  selectedArea.isGps ||
                    selectedArea.name === "Lokasi GPS Saya" ||
                    selectedArea.area === "Sekitar Kamu",
                )
                const isSelected = !isGpsActive && selectedArea.area === loc.area
                return (
                  <button
                    key={loc.area}
                    type="button"
                    onClick={() => handleSelectArea(loc)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      border: `1.5px solid ${isSelected ? "var(--primary)" : "var(--border)"}`,
                      background: isSelected ? "var(--primary-tint)" : "var(--surface)",
                      color: isSelected ? "var(--primary-dark)" : "var(--text)",
                      cursor: "pointer",
                      textAlign: "left",
                      fontWeight: isSelected ? "600" : "500",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "8px",
                          background: isSelected ? "var(--primary)" : "var(--surface-sunken)",
                          color: isSelected ? "#fff" : "var(--text-secondary)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <MapPin size={18} />
                      </div>
                      <span>{loc.name}</span>
                    </div>
                    {isSelected && <Check size={18} color="var(--primary)" />}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <div className="results-toolbar">
        <div className="chips">
          {filters.map((label) => (
            <Chip
              key={label}
              label={label}
              selected={
                label === "Semua"
                  ? !chosenFilters.length
                  : chosenFilters.includes(label)
              }
              onClick={() => toggle(label)}
            />
          ))}
        </div>
        <label className="sort-field">
          <span>Urutkan:</span>
          <select
            aria-label="Urutkan hasil pencarian"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="distance">Terdekat</option>
            <option value="rating">Nilai tertinggi</option>
            <option value="price">Biaya terendah</option>
          </select>
          <ChevronDown size={16} />
        </label>
      </div>
      <div className="results-caption">
        <p aria-live="polite">
          <strong>{visible.length} tukang</strong> di sekitar {selectedArea.area}{" "}
          <span>· Dalam jangkauan pencarian</span>
        </p>
        <span>
          <ShieldCheck size={16} /> Pilih dengan tenang, servis dengan jelas.
        </span>
        <Button
          variant="secondary"
          className="map-toggle"
          onClick={() => setShowMap(!showMap)}
        >
          {showMap ? <List size={18} /> : <MapPin size={18} />}
          {showMap ? "Lihat daftar" : "Lihat peta"}
        </Button>
      </div>
      {!visible.length ? (
        <div className="search-empty">
          <Inbox size={40} />
          <h2>Belum ada tukang yang cocok.</h2>
          <p>
            Belum ada tukang di sekitar sini dengan pilihan kamu.
            <br />
            Coba kurangi filter pencarian ya.
          </p>
          <Button
            onClick={() => {
              setFilters([])
              setSelected(null)
            }}
          >
            Tampilkan semua tukang <ArrowRight size={18} />
          </Button>
        </div>
      ) : (
        <div className={`results-layout ${showMap ? "show-map" : ""}`}>
          <div className="results-list" aria-label="Daftar tukang">
            {visible.map((t, index) => (
              <TechnicianCard
                key={t.id}
                technician={t}
                rank={index + 1}
                selected={selected === t.id}
                onSelect={() => setSelected(t.id)}
                onChoose={() => go(`detail/${t.id}`)}
              />
            ))}
            <div className="list-end">
              <ShieldCheck size={16} />
              Semua tukang di sekitar kamu sudah ditampilkan.
            </div>
          </div>
          <div
            className="search-map"
            aria-label="Peta lokasi tukang di Tangerang"
          >
            <div className="map-top-label" style={{ display: "flex", gap: "12px", alignItems: "center", zIndex: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <MapPin size={16} /> Sekitar {selectedArea.area}
              </div>
            </div>

            <div style={{ width: "100%", height: "100%", position: "relative" }}>
              <MapLeaflet
                technicians={visible}
                selectedId={selected}
                onSelect={(id) => selectPin(id)}
                userLat={selectedArea.lat}
                userLng={selectedArea.lng}
                userLocationName={selectedArea.name}
              />
            </div>

            {current && (
              <div className="map-selected-info" style={{ zIndex: 10 }}>
                <div className="map-selected-icon" style={{ fontWeight: "800", fontSize: "16px" }}>
                  #{visible.findIndex((t) => t.id === current.id) + 1}
                </div>
                <div>
                  <strong>{current.name}</strong>
                  <p>
                    {current.area} · {current.distance.toLocaleString("id-ID")}{" "}
                    km dari kamu
                  </p>
                  <span>Mulai {rupiah(current.min)}</span>
                </div>
                <Button
                  variant="ghost"
                  aria-label={`Lihat detail ${current.name}`}
                  onClick={() => go(`detail/${current.id}`)}
                >
                  <ArrowRight size={22} />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="results-reassurance">
        <ShieldCheck size={20} />
        <p>
          Barang kamu berharga.{" "}
          <strong>Kenali tukangnya dulu sebelum pesan servis.</strong>
        </p>
        <a href="#sistem-desain">
          Tentang barangku <ArrowRight size={16} />
        </a>
      </div>
    </main>
  )
}

export default function App() {
  const [route, setRoute] = useState(
    location.hash.slice(1) || "hasil-pencarian",
  )

  const [notice, setNotice] = useState("")

  const [user, setUser] = useState<User | null>(null)

  const [userLoading, setUserLoading] = useState(true)

  const [userError, setUserError] = useState("")

  useEffect(() => {
    getCurrentUser()

      .then((u) => {
        setUser(u)

        setUserLoading(false)
      })

      .catch(() => {
        setUserError("Ada yang salah. Coba lagi ya.")

        setUserLoading(false)
      })
  }, [])

  useEffect(() => {
    const update = () => {
      setRoute(location.hash.slice(1) || "hasil-pencarian")
      window.scrollTo(0, 0)
    }
    window.addEventListener("hashchange", update)
    return () => window.removeEventListener("hashchange", update)
  }, [])

  const blocked = !userLoading && !user && isProtectedRoute(route)

  useEffect(() => {
    if (blocked) location.replace(`#masuk?next=${encodeURIComponent(route)}`)
  }, [blocked, route])

  const [page, query = ""] = route.split("?")

  const params = new URLSearchParams(query)

  const next = blocked ? route : (params.get("next") ?? undefined)

  const login = (account: User, destination: string) => {
    setUser(account)
    go(destination)
  }

  const logout = async () => {
    try {
      await apiLogout()

      setUser(null)

      setNotice("Kamu sudah keluar dari akun.")

      go("beranda")
    } catch {
      setNotice("Ada yang salah. Coba lagi ya.")
    }
  }

  let content

  if (userLoading && isProtectedRoute(page)) {
    content = (
      <main className="container placeholder-page">
        <p>Memuat...</p>
      </main>
    )
  } else if (userError && isProtectedRoute(page)) {
    content = (
      <main className="container placeholder-page">
        <p>{userError}</p>
      </main>
    )
  } else if (blocked || page === "masuk" || page === "daftar")
    content = user ? (
      <main className="container placeholder-page">
        <h1>Kamu sudah masuk.</h1>
        <p style={{ marginTop: "8px" }}>
          Sedang masuk sebagai <strong>{user.name}</strong> ({user.email || user.contact}).
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "24px", flexWrap: "wrap" }}>
          <Button onClick={() => go(safeReturnRoute(next ?? null))}>
            Lanjut ke {user.role === "tukang" ? "Dashboard" : "Cara Kerja"} <ArrowRight size={18} />
          </Button>
          <Button variant="secondary" onClick={logout}>
            Keluar / Ganti Akun
          </Button>
        </div>
      </main>
    ) : (
      <Auth
        key={`${page}-${next ?? ""}`}
        mode={page === "daftar" ? "daftar" : "masuk"}
        next={next}
        protectedInfo={!!next}
        onLogin={login}
        navigate={go}
      />
    )
  else if (user && user.role !== "tukang" && isTechnicianRoute(page))
    content = (
      <main className="container placeholder-page">
        <div className="eyebrow">
          <span className="eyebrow-line" /> KHUSUS TUKANG
        </div>
        <h1>Halaman ini khusus tukang.</h1>
        <p>
          Akun kamu terdaftar sebagai pelanggan. Silakan kembali ke Beranda atau
          masuk dengan akun tukang servis.
        </p>
        <Button onClick={() => go("beranda")}>
          Kembali ke Beranda <ArrowRight size={18} />
        </Button>
      </main>
    )
  else if (page === "lupa-sandi")
    content = <ForgotPassword key={route} next={next} />
  else if (page === "pesanan-saya")
    content = (
      <MyOrders
        key={user?.id || user?.contact || "guest"}
        user={user}
        fresh={!!user?.fresh}
        navigate={go}
      />
    )
  else if (page === "profil")
    content = (
      <main className="container placeholder-page profile-page">
        <h1>Profil kamu</h1>
        <div className="order-summary">
          <h2>{user?.name}</h2>
          <p>{user?.contact}</p>
          <p className="small-text">
            {user?.role === "tukang" ? "Tukang servis" : "Pelanggan"}
          </p>
          <Button variant="secondary" onClick={logout}>
            Keluar
          </Button>
        </div>
      </main>
    )
  else if (page === "untuk-tukang") content = <UntukTukang navigate={go} />
  else if (page === "daftar-tukang")
    content = <DaftarTukang user={user} onLogin={login} navigate={go} />
  else if (page === "dashboard-tukang")
    content = <DashboardTukang navigate={go} />
  else if (page.startsWith("pesanan-tukang/")) {
    const code = page.split("/")[1]

    content = <PesananTukang key={route} code={code} navigate={go} />
  } else if (page === "beranda" || page === "cara-kerja")
    content = <Home navigate={go} />
  else if (page.startsWith("detail/"))
    content = (
      <TechnicianDetail
        key={route}
        id={Number(page.split("/")[1])}
        navigate={go}
      />
    )
  else if (page.startsWith("pesan/"))
    content = (
      <Booking
        key={route}
        id={Number(page.split("/")[1])}
        user={user}
        navigate={go}
      />
    )
  else if (page.startsWith("lacak/"))
    content = <Tracking key={route} code={page.split("/")[1]} navigate={go} />
  else content = <SearchResults />

  if (route === "sistem-desain") return <DesignSystem />

  const routeClass = blocked
    ? ""
    : page.startsWith("detail/")
      ? "detail-route"
      : page.startsWith("pesan/")
        ? "booking-route"
        : page.startsWith("lacak/")
          ? "tracking-route"
          : ""

  return (
    <div className={routeClass}>
      <Navbar user={user} onLogout={logout} />
      {content}
      <Footer
        onLink={(label) =>
          label === "Cari tukang"
            ? go("hasil-pencarian")
            : label === "Cara kerja"
              ? (go("beranda"),
                setTimeout(
                  () =>
                    document
                      .getElementById("cara-kerja")
                      ?.scrollIntoView({ behavior: "smooth" }),
                  120,
                ))
              : label === "Jadi tukang"
                ? go("untuk-tukang")
                : setNotice(
                    "Halaman ini belum tersedia. Kamu bisa mencoba pencarian dulu ya.",
                  )
        }
      />
      {notice && (
        <div className="toast" role="status">
          <span>{notice}</span>
          <Button
            variant="ghost"
            aria-label="Tutup pemberitahuan"
            onClick={() => setNotice("")}
          >
            <X size={18} />
          </Button>
        </div>
      )}
    </div>
  )
}
