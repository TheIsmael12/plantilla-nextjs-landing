'use client';

import {
  BellIcon,
  Building2Icon,
  BriefcaseIcon,
  DoorClosedIcon,
  FileTextIcon,
  KeyRoundIcon,
  ReceiptIcon,
  ScrollTextIcon,
  TriangleAlertIcon,
  UsersIcon,
} from 'lucide-react';

import EmptyState from '@/components/ui/errors/EmptyState';

const ICONS = {
  services: BriefcaseIcon,
  quotes: FileTextIcon,
  invoices: ReceiptIcon,
  communities: Building2Icon,
  residents: UsersIcon,
  units: Building2Icon,
  keyrings: KeyRoundIcon,
  locks: DoorClosedIcon,
  incidents: TriangleAlertIcon,
  accessLog: ScrollTextIcon,
  notifications: BellIcon,
} as const;

interface ClientListEmptyStateProps {
  resource: keyof typeof ICONS;
  title: string;
  description: string;
}

/**
 * Estado vacío de los listados del portal. Envuelto en su propio Client
 * Component porque `EmptyState` es `"use client"` y su prop `icon` es una
 * función: pasarla directamente desde un Server Component falla en
 * serialización. Recibe un `resource` serializable y resuelve aquí el icono.
 * @param {ClientListEmptyStateProps} props - Propiedades del componente
 * @returns {JSX.Element} El estado vacío renderizado
 */
export default function ClientListEmptyState({
  resource,
  title,
  description,
}: ClientListEmptyStateProps) {
  return <EmptyState icon={ICONS[resource]} title={title} description={description} />;
}
