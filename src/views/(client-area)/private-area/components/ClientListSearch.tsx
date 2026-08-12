'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { SearchIcon } from 'lucide-react';

import { usePathname, useRouter } from '@/i18n/navigation';

import Input from '@/components/ui/inputs/Input';

import '@/styles/04-components/client-area/client-list.scss';

const DEBOUNCE_MS = 400;

interface ClientListSearchProps {
  placeholder?: string;
  paramName?: string;
  pageParamName?: string;
}

/**
 * Buscador de texto libre de los listados del portal: navega a la misma ruta
 * con `?q=...` actualizado tras una pausa de escritura (evita disparar una
 * navegación por cada tecla), preserva el resto de filtros activos y siempre
 * vuelve a la página 1. Mismo patrón de resolución de segmento dinámico que
 * `StatusFilter`: `usePathname()` de next-intl devuelve la plantilla canónica
 * sin resolver en rutas con `[serviceId]`, así que hay que sustituirlo con
 * `useParams()` antes de navegar.
 *
 * `pageParamName` existe para las pantallas con dos tablas paginables a la vez
 * (p. ej. vecinos e invitaciones): cada buscador debe reiniciar solo la página
 * de su propia tabla, no la de la otra.
 * @param {ClientListSearchProps} props - Propiedades del componente
 * @returns {JSX.Element} El campo de búsqueda renderizado
 */
export default function ClientListSearch({
  placeholder,
  paramName = 'q',
  pageParamName = 'page',
}: ClientListSearchProps) {
  const t = useTranslations('Views.ClientArea.Common');

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const routeParams = useParams<Record<string, string | string[] | undefined>>();
  const router = useRouter();

  const [value, setValue] = useState(searchParams.get(paramName) ?? '');
  const isFirstRender = useRef(true);

  // Sincroniza `value` cuando la URL cambia por fuera del propio componente
  // (navegación atrás/adelante, otro filtro que resetea `q`). Mismo patrón
  // de supresión ya usado en `Navbar.tsx` para un caso estructuralmente
  // idéntico: efecto que reacciona a un cambio de navegación y sincroniza
  // estado local.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValue(searchParams.get(paramName) ?? '');
  }, [searchParams, paramName]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete(pageParamName);

      const trimmed = value.trim();
      if (trimmed) {
        params.set(paramName, trimmed);
      } else {
        params.delete(paramName);
      }

      const resolvedPathname = pathname.replace(/\[(.+?)\]/g, (match, name: string) => {
        const paramValue = routeParams[name];
        return typeof paramValue === 'string' ? paramValue : match;
      });

      const query = params.toString();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- `pathname` ya viene tipado por next-intl; solo se añade la query string.
      router.replace((query ? `${resolvedPathname}?${query}` : resolvedPathname) as any, {
        scroll: false,
      });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reaccionar a `value` es la única dependencia deliberada; el resto son estables entre renders.
  }, [value]);

  return (
    <div className="client-list__search">
      <Input
        id={`client-list-search-${paramName}`}
        name={`search-${paramName}`}
        type="search"
        ariaLabel={t('search')}
        placeholder={placeholder ?? t('searchPlaceholder')}
        noTranslate
        icon={SearchIcon}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="input__md"
      />
    </div>
  );
}
