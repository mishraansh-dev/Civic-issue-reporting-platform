import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import '../../utils/leafletSetup'

/** Helper: re-center map when lat/lon props change */
function RecenterMap({ lat, lon }) {
  const map = useMap()
  useEffect(() => {
    map.setView([lat, lon], 15)
  }, [lat, lon, map])
  return null
}

/**
 * LocationMapPreview — small interactive Leaflet map used in the wizard.
 * Shows a draggable marker at the detected coordinates.
 * Dragging the marker calls onDrag(lat, lon).
 */
export default function LocationMapPreview({ lat, lon, onDrag }) {
  if (!lat || !lon) return null

  return (
    <div
      className="rounded-xl overflow-hidden border border-white/10 mt-3"
      style={{ height: 200 }}
    >
      <MapContainer
        center={[lat, lon]}
        zoom={15}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%', background: '#0d1117' }}
        zoomControl={true}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <RecenterMap lat={lat} lon={lon} />
        <DraggableMarker lat={lat} lon={lon} onDrag={onDrag} />
      </MapContainer>
    </div>
  )
}

function DraggableMarker({ lat, lon, onDrag }) {
  const markerRef = useRef(null)

  return (
    <Marker
      position={[lat, lon]}
      draggable
      ref={markerRef}
      eventHandlers={{
        dragend: () => {
          const marker = markerRef.current
          if (marker) {
            const { lat: newLat, lng: newLon } = marker.getLatLng()
            onDrag?.(newLat, newLon)
          }
        },
      }}
    />
  )
}
