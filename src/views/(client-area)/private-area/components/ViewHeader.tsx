'use client';

import type { ReactNode } from 'react';

import { useTranslations } from 'next-intl';

import { ArrowLeftIcon } from 'lucide-react';

import { Link, type AnyHref } from '@/i18n/navigation';

interface ViewHeaderProps {
  title: string;
  /** La frase que dice de qué va la pantalla; se omite en las que no la necesitan. */
  description?: string;
  /** La acción principal (abrir, crear, importar). Va a la derecha del título, siempre. */
  actions?: ReactNode;
  /**
   * Listado al que vuelve esta pantalla, si es un detalle. El texto lo compone la cabecera con el nombre de
   * esa ruta, igual que el `returnPath` del `TitleComponent` de la intranet.
   */
  returnPath?: string;
}

/**
 * La cabecera de una pantalla del área de cliente: título, explicación, acción principal y, en un detalle, la
 * vuelta a su listado.
 *
 * Existe para que las pantallas del área privada tengan **la misma** cabecera. Antes cada una traía su propio
 * marcado y sus propias clases —`client-list__header`, `client-area-page__title`, `community-layout__header`,
 * `dashboard__title`—, cuatro maneras de escribir lo mismo, y el resultado era que el título salía de un
 * tamaño en facturas y de otro en comunidades, y que la acción principal aparecía a veces arriba a la derecha
 * y a veces debajo del subtítulo.
 *
 * El `h1` lo pone esta cabecera, así que ninguna vista escribe el suyo: es lo que garantiza que cada página
 * tenga exactamente un encabezado de primer nivel.
 *
 * La vuelta va **dentro** de la cabecera y debajo del título, no como un enlace suelto encima: es donde la
 * pone la intranet, y suelto se colaba entre las migas de pan y el título, con las tres cosas diciendo lo
 * mismo en tres líneas seguidas.
 * @param {ViewHeaderProps} props - Título, explicación, acción principal y vuelta al listado
 * @returns {JSX.Element} La cabecera de la vista
 */
export default function ViewHeader({
  title,
  description,
  actions,
  returnPath,
}: ViewHeaderProps) {
  const t = useTranslations('Navigation.TitleComponent');
  const tRoutes = useTranslations('Navigation.Routes');

  return (
    <header className="view-header">
      <div className="view-header__text">
        <h1 className="view-header__title">{title}</h1>
        {description && <p className="view-header__description">{description}</p>}

        {returnPath && (
          <Link href={returnPath as AnyHref} className="view-header__return">
            <ArrowLeftIcon aria-hidden="true" />
            {t('back')} {tRoutes(returnPath).toLowerCase()}
          </Link>
        )}
      </div>

      {actions && <div className="view-actions">{actions}</div>}
    </header>
  );
}
