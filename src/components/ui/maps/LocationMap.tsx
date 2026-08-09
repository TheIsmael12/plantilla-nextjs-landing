'use client';

import 'leaflet/dist/leaflet.css';
import '@/styles/04-components/ui/maps/location-map.scss';

import { useEffect, useRef, useState } from 'react';

import { useTranslations } from 'next-intl';

import L from 'leaflet';

import { geocodeAddress } from '@/actions/client-portal/geocoding-actions';

import type { LocationMapProps } from '@/types/ui/maps/location-map';
import type { GeocodedAddress } from '@/types/geocoding';

import { ExternalLinkIcon, MapPinIcon } from 'lucide-react';

/** Zoom al centrar sobre el punto: cercano, para reconocer la calle sin perder el contexto del barrio. */
const POINT_ZOOM = 16;

/** Teselas de OpenStreetMap, sin clave de API. */
const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

/**
 * Sitúa una dirección en un mapa con un único punto.
 *
 * Versión reducida de `ServiceMap` (el mapa del panel, con clustering y zonas por código postal):
 * aquí solo hace falta un marcador, así que se dibuja con Leaflet directo, sin las dependencias
 * de agrupación que ese caso no necesita.
 *
 * Las coordenadas las resuelve la API (`/geocoding`, con caché): el backend guarda direcciones
 * escritas, no coordenadas. Si el servicio no sabe situarla se enseña igualmente la dirección y un
 * enlace para abrirla en Google Maps, que es más útil que un hueco vacío.
 * @param {LocationMapProps} props - Propiedades del componente
 * @returns {JSX.Element | null} El mapa renderizado, o nada si no hay dirección
 */
export default function LocationMap({ address, title, label, className }: LocationMapProps) {
  const t = useTranslations('Common.Map');

  const container = useRef<HTMLDivElement>(null);
  const instance = useRef<L.Map | null>(null);

  /*
   * Se guarda junto a la dirección que resolvió, no suelto: al cambiar de dirección el resultado
   * anterior deja de valer, y así no hace falta limpiarlo desde el efecto — basta con ignorarlo
   * cuando no corresponde a la dirección actual.
   */
  const [resolved, setResolved] = useState<{ address: string; coords: GeocodedAddress } | null>(null);

  useEffect(() => {
    if (!address) return;

    let isCurrent = true;

    geocodeAddress(address).then((response) => {
      if (isCurrent) setResolved({ address, coords: response.data ?? { found: false } });
    });

    return () => {
      isCurrent = false;
    };
  }, [address]);

  const coordinates = resolved?.address === address ? resolved?.coords : undefined;
  const isLoading = address !== undefined && coordinates === undefined;
  const { latitude, longitude } = coordinates ?? {};
  const isLocated = coordinates?.found && latitude !== undefined && longitude !== undefined;

  useEffect(() => {
    if (!container.current || !isLocated) return;

    const map = L.map(container.current, {
      center: [latitude, longitude],
      zoom: POINT_ZOOM,
      attributionControl: false,
      zoomControl: false,
    });
    instance.current = map;

    L.control.zoom({ position: 'topleft', zoomInTitle: t('zoomIn'), zoomOutTitle: t('zoomOut') }).addTo(map);
    L.tileLayer(TILE_URL, { maxZoom: 18 }).addTo(map);

    L.marker([latitude, longitude], {
      icon: L.divIcon({
        html: '<span class="location-map__pin"></span>',
        className: 'location-map__marker',
        iconSize: L.point(32, 32),
        iconAnchor: L.point(16, 32),
      }),
      title: label ?? address,
    }).addTo(map);

    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(container.current);

    return () => {
      observer.disconnect();
      map.remove();
      instance.current = null;
    };
  }, [isLocated, latitude, longitude, label, address, t]);

  if (!address) return null;

  const externalUrl = isLocated
    ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  return (
    <section className={`location-map${className ? ` ${className}` : ''}`}>
      <h3 className="location-map__title">{title ?? t('title')}</h3>

      <p className="location-map__address">
        <MapPinIcon aria-hidden="true" />
        <span>
          {label && <strong className="location-map__label">{label}</strong>}
          <span className="location-map__street">{address}</span>
        </span>
      </p>

      {isLoading && <p className="location-map__hint">{t('locating')}</p>}

      {!isLoading && isLocated && <div ref={container} className="location-map__canvas" />}

      {!isLoading && !isLocated && <p className="location-map__hint">{t('notFound')}</p>}

      <a className="location-map__link" href={externalUrl} target="_blank" rel="noopener noreferrer">
        {t('openExternal')}
        <ExternalLinkIcon aria-hidden="true" />
      </a>
    </section>
  );
}
