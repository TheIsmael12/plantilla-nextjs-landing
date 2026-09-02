'use client';

import 'leaflet/dist/leaflet.css';

import { useEffect, useRef } from 'react';

import { useTranslations } from 'next-intl';

import {
  MAP_TILE_ATTRIBUTION,
  MAP_TILE_MAX_ZOOM,
  MAP_TILE_URL,
} from '@/config/mapTiles';

import L from 'leaflet';

/** Zoom al centrar sobre el punto: cercano, para reconocer la calle sin perder el contexto del barrio. */
const POINT_ZOOM = 16;

/**
 * Props de {@link LocationMapCanvas}.
 * @interface LocationMapCanvasProps
 * @property {number} latitude - Latitud del punto
 * @property {number} longitude - Longitud del punto
 * @property {string} title - Texto del marcador, para quien lo recorre con el ratón
 */
export interface LocationMapCanvasProps {
  latitude: number;
  longitude: number;
  title: string;
}

/**
 * El lienzo del mapa: lo único que toca Leaflet.
 *
 * Está separado de {@link LocationMap} **porque Leaflet toca `window` al importarse**, y `'use client'` no
 * evita el render en servidor: marca dónde empieza el cliente, pero Next pinta esos componentes igual para
 * mandar el primer HTML. Con Leaflet importado en el mismo módulo que la ficha, el detalle de un servicio
 * contratado respondía **500 antes de pintar nada** — el mismo fallo que tenía la intranet, resuelto igual:
 * el módulo con Leaflet se carga con `ssr: false` desde el componente que lo usa.
 *
 * Que sea un componente aparte y no un `import()` dentro de un efecto tiene además una ventaja: el mapa se
 * monta y se desmonta con React, así que el `map.remove()` de la limpieza está donde se le espera.
 * @param {LocationMapCanvasProps} props - Coordenadas y texto del marcador
 * @returns {JSX.Element} El contenedor del mapa
 */
export default function LocationMapCanvas({
  latitude,
  longitude,
  title,
}: LocationMapCanvasProps) {
  const t = useTranslations('Common.Map');

  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    const map = L.map(container.current, {
      center: [latitude, longitude],
      zoom: POINT_ZOOM,
      attributionControl: false,
      zoomControl: false,
    });

    L.control
      .zoom({ position: 'topleft', zoomInTitle: t('zoomIn'), zoomOutTitle: t('zoomOut') })
      .addTo(map);
    L.tileLayer(MAP_TILE_URL, { maxZoom: MAP_TILE_MAX_ZOOM }).addTo(map);

    L.marker([latitude, longitude], {
      icon: L.divIcon({
        html: '<span class="location-map__pin"></span>',
        className: 'location-map__marker',
        iconSize: L.point(32, 32),
        iconAnchor: L.point(16, 32),
      }),
      title,
    }).addTo(map);

    /*
     * El mapa no se redibuja solo al cambiar de tamaño su contenedor, y aquí cambia: la ficha lo mete en una
     * columna que se reparte con el resto del detalle. Sin esto, al ensanchar la ventana quedaba media
     * tesela gris.
     */
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(container.current);

    return () => {
      observer.disconnect();
      map.remove();
    };
  }, [latitude, longitude, title, t]);

  return <div ref={container} className="location-map__canvas" />;
}
