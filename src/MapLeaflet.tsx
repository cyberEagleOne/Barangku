import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { Technician } from "./api"

interface MapLeafletProps {
  technicians: Technician[]
  selectedId: number | null
  onSelect: (id: number) => void
  userLat: number
  userLng: number
  userLocationName: string
}

export default function MapLeaflet({
  technicians,
  selectedId,
  onSelect,
  userLat,
  userLng,
  userLocationName,
}: MapLeafletProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<{ [key: number]: L.Marker }>({})
  const userMarkerRef = useRef<L.Marker | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Initialize map
    const map = L.map(containerRef.current, {
      center: [userLat, userLng],
      zoom: 13,
      zoomControl: true,
      attributionControl: false,
    })

    // OpenStreetMap Tile Layer (Free, fast, no API key required)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
    }).addTo(map)

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Update center when user location changes
  useEffect(() => {
    if (!mapRef.current) return
    mapRef.current.flyTo([userLat, userLng], 13, { duration: 1 })

    // User location marker
    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLat, userLng])
    } else {
      const userIcon = L.divIcon({
        className: "custom-user-marker",
        html: `
          <div style="position:relative; width:24px; height:24px;">
            <div style="position:absolute; width:24px; height:24px; border-radius:50%; background:rgba(31,111,92,0.25); animation:pulse 2s infinite;"></div>
            <div style="position:absolute; top:4px; left:4px; width:16px; height:16px; border-radius:50%; background:#1F6F5C; border:3px solid #ffffff; box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })

      const marker = L.marker([userLat, userLng], { icon: userIcon })
        .addTo(mapRef.current)
        .bindPopup(`<strong>Kamu di sini</strong><br/><small>${userLocationName}</small>`)
      userMarkerRef.current = marker
    }
  }, [userLat, userLng, userLocationName])

  // Update technician markers
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    // Remove old markers
    Object.values(markersRef.current).forEach((m) => m.remove())
    markersRef.current = {}

    // Add new markers
    technicians.forEach((t, index) => {
      const lat = t.latitude || -6.1950
      const lng = t.longitude || 106.6150
      const isSelected = selectedId === t.id
      const rank = index + 1

      const icon = L.divIcon({
        className: "custom-tech-pin",
        html: `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: ${isSelected ? "38px" : "32px"};
            height: ${isSelected ? "38px" : "32px"};
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            background: ${isSelected ? "#F2A33A" : "#1F6F5C"};
            color: ${isSelected ? "#14493D" : "#ffffff"};
            font-weight: 800;
            font-size: 14px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            border: 2px solid #ffffff;
            cursor: pointer;
            transition: all 0.2s ease;
          ">
            <span style="transform: rotate(45deg); font-family: sans-serif;">${rank}</span>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      })

      const marker = L.marker([lat, lng], { icon })
        .addTo(map)
        .bindPopup(`
            <div style="font-size: 11px; font-weight: 700; color: #F2A33A; margin-bottom: 2px;">
              ${rank === 1 ? "★ #1 PALING DEKAT DARI KAMU" : `URUTAN #${rank} (${t.distance.toLocaleString("id-ID")} km)`}
            </div>
            <strong style="color: #1F6F5C; font-size: 14px;">${t.name}</strong><br/>
            <span>${t.area} · ${t.distance.toLocaleString("id-ID")} km</span><br/>
            <span style="color: #F2A33A; font-weight: 600;">⭐ ${t.rating} (${t.reviews})</span>
          </div>
        `)
        .on("click", () => {
          onSelect(t.id)
        })

      markersRef.current[t.id] = marker

      if (isSelected) {
        marker.openPopup()
      }
    })
  }, [technicians, selectedId, onSelect])

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        minHeight: "420px",
        borderRadius: "16px",
        overflow: "hidden",
        zIndex: 1,
      }}
    />
  )
}
