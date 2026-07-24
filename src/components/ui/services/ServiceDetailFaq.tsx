import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';

import type { ServiceSlug } from '@/config/routing';

import '@/styles/04-components/services/servicesBase.scss';
import '@/styles/04-components/services/serviceDetailFaq.scss';

interface FaqItem {
  question: string;
  answer: string;
}

interface ServiceDetailFaqProps {
  slug: ServiceSlug;
}

/**
 * Preguntas frecuentes específicas de este servicio (precio, flexibilidad
 * de contratación, urgencias...), en un `<details>` nativo accesible. Se
 * acompaña de datos estructurados `FAQPage` (JSON-LD) para que los
 * motores de búsqueda puedan mostrar la respuesta directamente.
 * @param {ServiceDetailFaqProps} props El slug del servicio a mostrar
 * @returns {JSX.Element} Las preguntas frecuentes del servicio renderizadas
 */
export default function ServiceDetailFaq({ slug }: ServiceDetailFaqProps) {
  const t = useTranslations('Services.detail');
  const itemT = useTranslations(`Services.items.${slug}`);
  const faq = itemT.raw('faq') as FaqItem[];

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
        <h2 className="services__title-lg services__faq-title">{t('faqTitle')}</h2>

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
