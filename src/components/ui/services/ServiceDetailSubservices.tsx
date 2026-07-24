import Image from 'next/image';
import { useTranslations } from 'next-intl';
import {
  AppWindow,
  Brush,
  CalendarClock,
  Camera,
  Droplet,
  Flower2,
  Hammer,
  KeyRound,
  Leaf,
  LifeBuoy,
  Package,
  PackageCheck,
  RefreshCcw,
  ScanLine,
  Siren,
  Trees,
  UserCheck,
  Warehouse,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react';

import type { ServiceSlug } from '@/config/routing';

import '@/styles/04-components/services/servicesBase.scss';
import '@/styles/04-components/services/serviceDetailSubservices.scss';

// Los iconos de `Services.items.<slug>.subservices` se guardan como texto
// en el JSON de traducciones (no se pueden serializar componentes); este
// mapa los resuelve al icono real de lucide-react.
const ICONS: Record<string, LucideIcon> = {
  UserCheck,
  ScanLine,
  Package,
  RefreshCcw,
  Camera,
  KeyRound,
  Wrench,
  Siren,
  Droplet,
  Brush,
  LifeBuoy,
  CalendarClock,
  AppWindow,
  Trees,
  PackageCheck,
  Zap,
  Hammer,
  Warehouse,
  Flower2,
  Leaf,
};

interface Subservice {
  icon: string;
  title: string;
  image: string;
  description: string;
}

interface ServiceDetailSubservicesProps {
  slug: ServiceSlug;
}

/**
 * Qué compone este servicio, en detalle: cada sub-servicio real con su
 * propia foto y una explicación específica (normativa o parámetros reales
 * cuando aplica), en filas que alternan foto y texto para dar espacio de
 * verdad a cada uno en vez de comprimirlos en tarjetas pequeñas.
 * @param {ServiceDetailSubservicesProps} props El slug del servicio a mostrar
 * @returns {JSX.Element} El detalle de sub-servicios renderizado
 */
export default function ServiceDetailSubservices({ slug }: ServiceDetailSubservicesProps) {
  const t = useTranslations('Services.detail');
  const itemT = useTranslations(`Services.items.${slug}`);
  const serviceTitle = itemT('title');
  const subservices = itemT.raw('subservices') as Subservice[];

  return (
    <section className="services__subservices">
      <div className="services__container">
        <div className="services__subservices-header">
          <p className="services__eyebrow">{t('subservicesEyebrow')}</p>
          <h2 className="services__title-lg">{t('subservicesTitle')}</h2>
        </div>

        <div className="services__subservices-list">
          {subservices.map((sub, index) => {
            const Icon = ICONS[sub.icon];
            return (
              <article
                className={`services__subservice ${index % 2 === 1 ? 'services__subservice--reverse' : ''}`}
                key={sub.title}
              >
                <div className="services__subservice-media">
                  <Image
                    src={sub.image}
                    alt={`${sub.title} — ${serviceTitle}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 42vw"
                    className="services__subservice-image"
                  />
                </div>

                <div className="services__subservice-body">
                  <span className="services__subservice-icon">
                    <Icon size={20} />
                  </span>
                  <h3>{sub.title}</h3>
                  <p>{sub.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
