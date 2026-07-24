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
    href: `tel:${ENV.COMPANY_PHONE.replace(/\s/g, '')}`,
    value: ENV.COMPANY_PHONE,
  },
];

/**
 * Canales de contacto de soporte: correo específico de soporte y el
 * teléfono de la empresa, presentado tanto para consultas en horario de
 * oficina como para las urgencias 24 horas (mismo número, según
 * `ENV.COMPANY_SCHEDULE`).
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
