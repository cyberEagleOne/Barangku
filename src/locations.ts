export interface LocationArea {
  name: string
  area: string
  lat: number
  lng: number
  isGps?: boolean
}

export const TANGERANG_AREAS: LocationArea[] = [
  { name: "Karawaci, Tangerang", area: "Karawaci", lat: -6.195, lng: 106.615 },
  { name: "Cikokol, Tangerang", area: "Cikokol", lat: -6.185, lng: 106.64 },
  { name: "BSD City, Serpong", area: "BSD City", lat: -6.3015, lng: 106.6535 },
  { name: "Gading Serpong, Tangerang", area: "Gading Serpong", lat: -6.245, lng: 106.628 },
  { name: "Bencongan, Kelapa Dua", area: "Bencongan", lat: -6.215, lng: 106.595 },
  { name: "Kelapa Dua, Tangerang", area: "Kelapa Dua", lat: -6.23, lng: 106.605 },
  { name: "Cibodas, Tangerang", area: "Cibodas", lat: -6.18, lng: 106.585 },
  { name: "Cipondoh, Tangerang", area: "Cipondoh", lat: -6.185, lng: 106.68 },
  { name: "Ciledug, Tangerang", area: "Ciledug", lat: -6.225, lng: 106.71 },
]

export function getSavedLocation(): LocationArea | null {
  try {
    const raw = localStorage.getItem("barangku_saved_location")
    if (raw) {
      const parsed = JSON.parse(raw)
      if (
        parsed &&
        typeof parsed.lat === "number" &&
        typeof parsed.lng === "number" &&
        !isNaN(parsed.lat) &&
        !isNaN(parsed.lng)
      ) {
        return parsed
      }
    }
  } catch {}
  return null
}

export function saveLocation(loc: LocationArea) {
  try {
    localStorage.setItem("barangku_saved_location", JSON.stringify(loc))
  } catch {}
}

export async function requestCurrentPosition(): Promise<{ lat: number; lng: number }> {
  if (typeof window === "undefined" || !navigator.geolocation) {
    throw new Error("Browser kamu belum mendukung pelacakan GPS.")
  }

  const queryPosition = (enableHighAccuracy: boolean, timeout: number) => {
    return new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy,
        timeout,
        maximumAge: 120000,
      })
    })
  }

  try {
    // 1. Try quick standard positioning (WiFi/Network/Cellular) - fast & reliable
    const pos = await queryPosition(false, 6000)
    return { lat: pos.coords.latitude, lng: pos.coords.longitude }
  } catch {
    // 2. Try high accuracy if low accuracy failed
    try {
      const pos = await queryPosition(true, 8000)
      return { lat: pos.coords.latitude, lng: pos.coords.longitude }
    } catch {
      throw new Error(
        "Gagal membaca lokasi GPS. Pastikan izin lokasi browser telah diaktifkan.",
      )
    }
  }
}

