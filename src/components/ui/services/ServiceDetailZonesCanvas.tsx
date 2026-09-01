'use client';

import 'leaflet/dist/leaflet.css';

import { useEffect, useRef } from 'react';

import { useRouter } from '@/i18n/navigation';

import L from 'leaflet';

import type { ZoneData } from '@/config/zones';

/** Zoom mínimo del encuadre inicial: sin este suelo, `fitBounds` a veces elegía un zoom tan
 *  abierto (10) que llegaba a mostrarse Alcalá de Henares o Fuenlabrada — mucho más área de la
 *  necesaria para solo 6 zonas cercanas, y con los puntos de la corona noroeste (Majadahonda,
 *  Las Rozas, Boadilla, Pozuelo) tan próximos entre sí en pantalla que sus tooltips se pisaban
 *  sin importar cuánto creciera el lienzo en altura. Un zoom más cercano separa los puntos. */
const MIN_ZOOM = 11;

/** Teselas de CARTO "Voyager": gris claro, calles bien marcadas, sin la carga de POIs/nombres
 *  de comercios de un mapa estilo Google Maps clásico — el tileset oscuro (Dark Matter) se
 *  probó antes y resultó "demasiado negro" para el usuario, incluso aclarado con un filtro
 *  CSS. Gratis, sin API key, con atribución obligatoria (ver `attributionControl` más abajo). */
const TILE_URL = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
const TILE_SUBDOMAINS = 'abcd';
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

/** Dirección del tooltip de cada zona, elegida a mano: 4 de las 6 (Majadahonda, Las Rozas,
 *  Boadilla, Pozuelo) están muy juntas en la corona noroeste — con todos los tooltips por
 *  defecto hacia arriba (comportamiento estándar de Leaflet) se solapaban entre sí sin
 *  importar el zoom o la altura del mapa. Repartirlos en direcciones distintas los separa sin
 *  necesitar detección de colisión genérica para un caso de solo 6 puntos fijos. Pozuelo
 *  quedaba hacia la derecha pegado al pin/etiqueta de Madrid — a la izquierda no choca con
 *  nada. */
const TOOLTIP_DIRECTION: Partial<Record<string, L.Direction>> = {
  majadahonda: 'left',
  'las-rozas': 'top',
  'pozuelo-de-alarcon': 'left',
  'boadilla-del-monte': 'bottom',
};
const DEFAULT_TOOLTIP_DIRECTION: L.Direction = 'top';

/**
 * Props de {@link ServiceDetailZonesCanvas}: las zonas que se pintan y cómo se llaman.
 * @interface ServiceDetailZonesCanvasProps
 */
export interface ServiceDetailZonesCanvasProps {
  zones: ZoneData[];
  zoneNames: Record<string, string>;
  onZoneSelect: (slug: string) => void;
  ariaLabel: string;
}

/**
 * El lienzo del mini-mapa de zonas destacadas: lo único que toca Leaflet.
 *
 * Separado de {@link ServiceDetailZones} por el mismo motivo que
 * {@link import('@/components/ui/maps/LocationMapCanvas').default}: Leaflet toca `window` al
 * importarse, así que este módulo se carga con `next/dynamic({ ssr: false })` desde quien lo
 * usa — importarlo directamente hacía responder 500 antes de pintar nada.
 * @param {ServiceDetailZonesCanvasProps} props - Zonas a marcar, sus nombres ya traducidos, y el callback de navegación al hacer click en un marcador
 * @returns {JSX.Element} El contenedor del mapa
 */
export default function ServiceDetailZonesCanvas({
  zones,
  zoneNames,
  onZoneSelect,
  ariaLabel,
}: ServiceDetailZonesCanvasProps) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    const bounds = L.latLngBounds(zones.map((zone) => [zone.latitude, zone.longitude]));

    const map = L.map(container.current, {
      attributionControl: true,
      zoomControl: false,
      scrollWheelZoom: false,
    }).fitBounds(bounds, { padding: [32, 32] });

    if (map.getZoom() < MIN_ZOOM) map.setZoom(MIN_ZOOM);

    L.control.zoom({ position: 'topleft' }).addTo(map);
    L.control.attribution({ prefix: false }).addAttribution(TILE_ATTRIBUTION).addTo(map);
    L.tileLayer(TILE_URL, { subdomains: TILE_SUBDOMAINS, maxZoom: 18 }).addTo(map);

    const markers = zones.map((zone) => {
      const isCapital = zone.slug === 'madrid';
      const marker = L.marker([zone.latitude, zone.longitude], {
        title: zoneNames[zone.slug],
        icon: L.divIcon({
          html: `<span class="services__zones-pin${isCapital ? ' services__zones-pin--capital' : ''}"></span>`,
          className: 'services__zones-marker',
          iconSize: isCapital ? L.point(26, 26) : L.point(18, 18),
          iconAnchor: isCapital ? L.point(13, 13) : L.point(9, 9),
        }),
      });

      const direction = TOOLTIP_DIRECTION[zone.slug] ?? DEFAULT_TOOLTIP_DIRECTION;
      const pinRadius = isCapital ? 14 : 10;
      const offset: [number, number] =
        direction === 'left'
          ? [-pinRadius, 0]
          : direction === 'right'
            ? [pinRadius, 0]
            : direction === 'bottom'
              ? [0, pinRadius]
              : [0, -pinRadius];

      marker.bindTooltip(zoneNames[zone.slug], {
        permanent: true,
        direction,
        offset,
        className: 'services__zones-tooltip',
      });

      marker.on('click', () => onZoneSelect(zone.slug));
      marker.addTo(map);
      return marker;
    });

    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(container.current);

    return () => {
      observer.disconnect();
      markers.forEach((marker) => marker.remove());
      map.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `zones`/`zoneNames` son estáticos por servicio (no cambian tras el montaje inicial), y reconstruir el mapa en cada re-render perdería el zoom/paneo del usuario.
  }, []);

  // Leaflet pone `tabindex="0"` en este contenedor para que el mapa reciba foco de teclado
  // (zoom/paneo con flechas), pero sin `role`/`aria-label` propios queda en el orden de
  // tabulación como un elemento sin nombre ni función reconocibles para un lector de pantalla
  // (WCAG 4.1.2). `role="application"` es la convención para un widget interactivo complejo
  // como un mapa, que no encaja en ningún rol semántico más simple.
  return <div ref={container} className="services__zones-canvas" role="application" aria-label={ariaLabel} />;
}
