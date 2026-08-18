import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';

import type { ZoneSlug } from '@/config/zones';

import '@/styles/04-components/services/servicesBase.scss';
import '@/styles/04-components/services/serviceDetailFaq.scss';

interface FaqItem {
  question: string;
  answer: string;
}

interface ZoneFaqProps {
  slug: ZoneSlug;
}

/**
 * Preguntas frecuentes específicas de una zona (2 por municipio, derivadas del perfil de
 * vivienda predominante en su corona metropolitana), con `FAQPage` schema — mismo patrón que
 * `ServiceDetailFaq.tsx`, reutilizando sus mismas clases `services__faq-*`.
 * @param {ZoneFaqProps} props - El slug de la zona a mostrar
 * @returns {JSX.Element} Las preguntas frecuentes de la zona renderizadas
 */
export default function ZoneFaq({ slug }: ZoneFaqProps) {
  const t = useTranslations(`Zones.items.${slug}`);
  const tZones = useTranslations('Zones');
  const faq = t.raw('faq') as FaqItem[];
  const zoneName = t('name');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <section className="services__faq">
      <div className="services__container">
        <h2 className="services__title-lg services__faq-title">{tZones('faqTitle', { zone: zoneName })}</h2>

        <ul className="services__faq-list">
          {faq.map((item) => (
            <li key={item.question}>
              <details className="services__faq-item">
                <summary className="services__faq-question">
                  {item.question}
                  <Plus className="services__faq-icon" aria-hidden="true" />
                </summary>
                <p className="services__faq-answer">{item.answer}</p>
              </details>
            </li>
          ))}
        </ul>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </section>
  );
}
