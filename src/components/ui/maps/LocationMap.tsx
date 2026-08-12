'use client';

import '@/styles/04-components/ui/maps/location-map.scss';

import { useEffect, useState } from 'react';

import dynamic from 'next/dynamic';

import { useTranslations } from 'next-intl';

import { geocodeAddress } from '@/actions/client-portal/geocoding-actions';

import type { LocationMapProps } from '@/types/ui/maps/location-map';
import type { GeocodedAddress } from '@/types/geocoding';

import { ExternalLinkIcon, MapPinIcon } from 'lucide-react';

/*
 * El lienzo se carga solo en el navegador.
 *
 * Leaflet toca `window` **al importarse**, y `'use client'` no evita el render en servidor: marca dónde
 * empieza el cliente, pero Next pinta esos componentes igual para mandar el primer HTML. Con el import
 * estático, el detalle de un servicio contratado respondía 500 antes de enseñar nada. Es el mismo arreglo
 * que la intranet aplica a su `ServiceMap`.
 *
 * No lleva `loading`: el hueco lo cubre este componente, que hasta tener coordenadas dice «buscando la
 * dirección», y el lienzo solo se monta cuando hay algo que enseñar.
 */
const LocationMapCanvas = dynamic(() => import('@/components/ui/maps/LocationMapCanvas'), {
  ssr: false,
});

/**
 * Sitúa una dirección en un mapa con un único punto.
 *
 * Las coordenadas las resuelve la API (`/geocoding`, con caché): el backend guarda direcciones escritas, no
 * coordenadas. Si el servicio no sabe situarla se enseña igualmente la dirección y un enlace para abrirla en
 * Google Maps, que es más útil que un hueco vacío.
 * @param {LocationMapProps} props - Propiedades del componente
 * @returns {JSX.Element | null} El mapa renderizado, o nada si no hay dirección
 */
export default function LocationMap({ address, title, label, className }: LocationMapProps) {
  const t = useTranslations('Common.Map');

  /*
   * Se guarda junto a la dirección que resolvió, no suelto: al cambiar de dirección el resultado anterior
   * deja de valer, y así no hace falta limpiarlo desde el efecto — basta con ignorarlo cuando no
   * corresponde a la dirección actual.
   */
  const [resolved, setResolved] = useState<{
    address: string;
    coords: GeocodedAddress;
  } | null>(null);

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

      {!isLoading && isLocated && (
        <LocationMapCanvas latitude={latitude} longitude={longitude} title={label ?? address} />
      )}

      {!isLoading && !isLocated && <p className="location-map__hint">{t('notFound')}</p>}

      <a className="location-map__link" href={externalUrl} target="_blank" rel="noopener noreferrer">
        {t('openExternal')}
        <ExternalLinkIcon aria-hidden="true" />
      </a>
    </section>
  );
}
