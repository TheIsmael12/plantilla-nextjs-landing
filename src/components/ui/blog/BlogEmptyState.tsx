'use client';

import { useTranslations } from 'next-intl';
import { FileText } from 'lucide-react';

import EmptyState from '@/components/ui/errors/EmptyState';

/**
 * Estado vacío del listado de blog (sin resultados para el filtro activo).
 * Envuelto en su propio Client Component porque `EmptyState` es `"use
 * client"` y su prop `icon` es una función (un componente de `lucide-react`):
 * pasarla directamente desde `BlogViewPage`, que es un Server Component,
 * falla en serialización ("Functions cannot be passed directly to Client
 * Components"). Resolviendo aquí dentro el icono y las traducciones, el
 * padre solo necesita renderizar este componente sin argumentos no serializables.
 * @returns {JSX.Element} El estado vacío del blog renderizado
 */
export default function BlogEmptyState() {
  const t = useTranslations('Blog.empty');

  return <EmptyState icon={FileText} title={t('title')} description={t('description')} />;
}
