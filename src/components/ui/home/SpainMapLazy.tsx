'use client';

import dynamic from 'next/dynamic';

// `SpainMap` es ~75KB de SVG inline: renderizarlo en servidor lo mete en el
// HTML de toda visita aunque esté debajo del fold. `next/dynamic` con
// `ssr: false` solo se permite desde un Client Component (de ahí este
// wrapper), y así lo convierte en un chunk aparte que se pide solo en el
// cliente en vez de ir en cada respuesta HTML.
const SpainMap = dynamic(() => import('./SpainMap'), {
  ssr: false,
});

/**
 * Envoltorio cliente que difiere la carga de {@link SpainMap} hasta después
 * de la hidratación inicial.
 * @returns {JSX.Element} El mapa de España renderizado
 */
export default function SpainMapLazy() {
  return <SpainMap />;
}
