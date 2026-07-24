import { useTranslations } from 'next-intl';
import { Clock, Users, MapPin, type LucideIcon } from 'lucide-react';

import '@/styles/04-components/services/servicesBase.scss';
import '@/styles/04-components/services/serviceDetailTrust.scss';

type HighlightKey = 'response' | 'team' | 'office';

const HIGHLIGHTS: { key: HighlightKey; icon: LucideIcon }[] = [
  { key: 'response', icon: Clock },
  { key: 'team', icon: Users },
  { key: 'office', icon: MapPin },
];

/**
 * Los mismos tres datos de confianza que respaldan la página de contacto
 * (tiempo de respuesta, trato directo, sede única), en una tarjeta propia
 * con icono, valor y etiqueta apilados, para no repetir el contenido en
 * cada ficha de servicio.
 * @returns {JSX.Element} La franja de confianza renderizada
 */
export default function ServiceDetailTrust() {
  const t = useTranslations('Contact.trust');

  return (
    <section className="services__trust">
      <div className="services__container">
        <div className="services__trust-card">
          {HIGHLIGHTS.map(({ key, icon: Icon }) => (
            <div className="services__trust-item" key={key}>
              <span className="services__trust-icon">
                <Icon size={20} />
              </span>
              <dl>
                <dt>{t(`${key}.value`)}</dt>
                <dd>{t(`${key}.label`)}</dd>
              </dl>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
