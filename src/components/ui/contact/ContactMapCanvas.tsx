'use client';

import 'leaflet/dist/leaflet.css';
import '@/styles/04-components/contact/contactMapCanvas.scss';

import { useEffect, useRef } from 'react';

import L from 'leaflet';

/** Zoom al centrar sobre la sede: cercano, para reconocer la calle sin perder el contexto del
 *  barrio — mismo criterio que `LocationMapCanvas.tsx` (área de cliente). */
const POINT_ZOOM = 15;

/** Teselas de CARTO "Voyager": mismo tileset que el mapa de zonas de cobertura
 *  (`ServiceDetailZonesCanvas.tsx`) — gris claro, calles bien marcadas, sin nombres de
 *  comercios/POIs. Gratis, sin API key, con atribución obligatoria. */
const TILE_URL = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
const TILE_SUBDOMAINS = 'abcd';
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

export interface ContactMapCanvasProps {
  latitude: number;
  longitude: number;
  title: string;
}

/**
 * El lienzo del mapa de contacto: lo único que toca Leaflet.
 *
 * Sustituye al `<iframe>` de Google Maps embed que tenía antes `ContactMapSection.tsx` — mismo
 * criterio visual que se pidió para el mapa de zonas de cobertura de la ficha de servicio
 * (`ServiceDetailZonesCanvas.tsx`), aplicado aquí también. Separado del componente que lo usa
 * por el mismo motivo que el resto de canvases de Leaflet del proyecto: toca `window` al
 * importarse, así que se carga con `next/dynamic({ ssr: false })` desde quien lo usa.
 * @param {ContactMapCanvasProps} props - Coordenadas de la sede y texto del marcador
 * @returns {JSX.Element} El contenedor del mapa
 */
export default function ContactMapCanvas({ latitude, longitude, title }: ContactMapCanvasProps) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    const map = L.map(container.current, {
      center: [latitude, longitude],
      zoom: POINT_ZOOM,
      zoomControl: false,
      scrollWheelZoom: false,
    });

    L.control.zoom({ position: 'topleft' }).addTo(map);
    L.control.attribution({ prefix: false }).addAttribution(TILE_ATTRIBUTION).addTo(map);
    L.tileLayer(TILE_URL, { subdomains: TILE_SUBDOMAINS, maxZoom: 18 }).addTo(map);

    const marker = L.marker([latitude, longitude], {
      title,
      icon: L.divIcon({
        html: '<span class="contact__map-pin"></span>',
        className: 'contact__map-marker',
        iconSize: L.point(28, 28),
        iconAnchor: L.point(14, 14),
      }),
    }).addTo(map);

    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(container.current);

    return () => {
      observer.disconnect();
      marker.remove();
      map.remove();
    };
  }, [latitude, longitude, title]);

  return <div ref={container} className="contact__map-canvas" />;
}
