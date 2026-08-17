import { useTranslations } from 'next-intl';
import { Mail, Phone, ShieldAlert, type LucideIcon } from 'lucide-react';

import { ENV } from '@/config/env';

import '@/styles/04-components/help/helpBase.scss';
import '@/styles/04-components/support/supportChannels.scss';

type ChannelKey = 'email' | 'phone' | 'emergency';

interface Channel {
  key: ChannelKey;
  icon: LucideIcon;
  href: string;
  value: string;
}

const CHANNELS: Channel[] = [
  {
    key: 'email',
    icon: Mail,
    href: `mailto:${ENV.COMPANY_SUPPORT_EMAIL}`,
    value: ENV.COMPANY_SUPPORT_EMAIL,
  },
  {
    key: 'phone',
    icon: Phone,
    href: `tel:${ENV.COMPANY_PHONE.replace(/\s/g, '')}`,
    value: ENV.COMPANY_PHONE,
  },
  {
    key: 'emergency',
    icon: ShieldAlert,
    href: `tel:${ENV.COMPANY_EMERGENCY_PHONE.replace(/\s/g, '')}`,
    value: ENV.COMPANY_EMERGENCY_PHONE,
  },
];

/**
 * Canales de contacto de soporte: correo específico de soporte, el teléfono
 * general (horario de oficina) y el de urgencias 24h — dos números
 * distintos, `ENV.COMPANY_PHONE`/`ENV.COMPANY_EMERGENCY_PHONE`, mismo
 * criterio que `ContactMapSection.tsx`. Antes reutilizaban el mismo número a
 * propósito (`COMPANY_PHONE` en ambas tarjetas); corregido porque el 900 es
 * el que la empresa usa de verdad como línea de urgencias.
 * @returns {JSX.Element} Los canales de soporte renderizados
 */
export default function SupportChannels() {
  const t = useTranslations('Support.channels');

  return (
    <section className="support__channels">
      <div className="help__container">
        <div className="support__channels-header">
          <h2 className="help__title-lg">{t('title')}</h2>
          <p className="help__text-muted">{t('subtitle')}</p>
        </div>

        <ul className="support__channels-grid">
          {CHANNELS.map(({ key, icon: Icon, href, value }) => (
            <li className="support__channel-card" key={key}>
              <span className="support__channel-icon">
                <Icon size={22} />
              </span>
              <h3>{t(`${key}.title`)}</h3>
              <p className="support__channel-description">{t(`${key}.description`)}</p>
              <a href={href} className="support__channel-link">
                {value}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
