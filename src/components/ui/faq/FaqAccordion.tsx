import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';

import '@/styles/04-components/help/helpBase.scss';
import '@/styles/04-components/faq/faqAccordion.scss';

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqCategory {
  title: string;
  items: Record<string, FaqItem>;
}

/**
 * Lista de preguntas frecuentes, organizada por temas (servicios,
 * cobertura y horarios, presupuestos, empresa y garantías). Cada pregunta
 * es un `<details>` nativo (accesible y sin JS propio) que se expande para
 * mostrar la respuesta.
 * @returns {JSX.Element} Las preguntas frecuentes, agrupadas por categoría
 */
export default function FaqAccordion() {
  const t = useTranslations('Faq');
  const categories = t.raw('categories') as Record<string, FaqCategory>;

  return (
    <section className="faq__accordion">
      <div className="help__container">
        {Object.entries(categories).map(([categoryKey, category]) => (
          <div className="faq__category" key={categoryKey}>
            <h2 className="faq__category-title">{category.title}</h2>

            <ul className="faq__list">
              {Object.entries(category.items).map(([itemKey, item]) => (
                <li key={itemKey}>
                  <details className="faq__item">
                    <summary className="faq__item-question">
                      {item.question}
                      <Plus className="faq__item-icon" aria-hidden="true" />
                    </summary>
                    <p className="faq__item-answer">{item.answer}</p>
                  </details>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
