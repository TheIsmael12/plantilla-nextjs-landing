import { redirect } from '@/i18n/navigation';

import type { AnyHref } from '@/i18n/navigation';

interface CommunityHomePageProps {
  params: Promise<{ locale: string; serviceId: string }>;
}

/**
 * Página de `/private-area/communities/[serviceId]`: redirige a vecinos, que
 * es la sección con la que se empieza a trabajar en una comunidad. Se prefiere
 * redirigir a inventar un resumen que duplicaría lo que ya muestran las
 * tarjetas del selector.
 * @param {CommunityHomePageProps} props - Comunidad activa y locale
 * @returns {Promise<never>} Nunca retorna: siempre redirige
 */
export default async function CommunityHomePage({ params }: CommunityHomePageProps) {
  const { locale, serviceId } = await params;

  redirect({
    href: `/private-area/communities/${serviceId}/residents` as AnyHref,
    locale,
  });
}
