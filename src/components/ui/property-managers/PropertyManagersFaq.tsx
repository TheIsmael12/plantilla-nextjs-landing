import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';

import '@/styles/04-components/services/servicesBase.scss';
import '@/styles/04-components/services/serviceDetailFaq.scss';

interface FaqItem {
  question: string;
  answer: string;
}

/**
 * Preguntas frecuentes propias de un administrador de fincas (facturación por cartera,
 * contrato marco, incidencias entre varias comunidades, alta de una finca nueva) — distintas
 * de las de `Faq.categories` (dirigidas a un presidente de comunidad o a un particular), con
 * su propio `FAQPage` schema. Mismo patrón que `ZoneFaq.tsx`/`ServiceDetailFaq.tsx`, reutiliza
 * sus mismas clases `services__faq-*`.
 * @returns {JSX.Element} Las preguntas frecuentes de administradores de fincas renderizadas
 */
export default function PropertyManagersFaq() {
  const t = useTranslations('ForPropertyManagers');
  const faq = t.raw('faq') as FaqItem[];

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
