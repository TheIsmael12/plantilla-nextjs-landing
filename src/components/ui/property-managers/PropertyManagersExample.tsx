import { useTranslations } from 'next-intl';
import { Info } from 'lucide-react';

import '@/styles/04-components/services/servicesBase.scss';
import '@/styles/04-components/property-managers/propertyManagers.scss';

interface PortfolioEntry {
  label: string;
  detail: string;
}

interface ReportField {
  label: string;
  value: string;
}

/**
 * Ejemplo de cómo se gestiona una cartera: el reparto de servicios, el mes visto desde el despacho del
 * administrador, y el formato del parte de incidencia que recibe.
 *
 * El aviso de que es un ejemplo se pinta en la página, no se deja en un comentario del código. Imora
 * todavía no tiene cartera, y una tabla con doce comunidades y cifras concretas se lee como un dato real
 * de la empresa salvo que diga lo contrario donde se lee. Es la diferencia entre enseñar cómo funciona el
 * servicio e inventarse un caso de éxito.
 * @returns {JSX.Element} El ejemplo de cartera y de parte renderizado
 */
export default function PropertyManagersExample() {
  const t = useTranslations('ForPropertyManagers.example');
  const portfolio = t.raw('portfolio') as PortfolioEntry[];
  const month = t.raw('month') as string[];
  const reportFields = t.raw('report.fields') as ReportField[];

  return (
    <section className="managers__example">
      <div className="services__container">
        <div className="managers__example-header">
          <p className="services__eyebrow">{t('eyebrow')}</p>
          <h2 className="services__title-lg">{t('title')}</h2>
          <p className="managers__note">
            <Info className="managers__note-icon" aria-hidden="true" />
            {t('disclaimer')}
          </p>
        </div>

        <div className="managers__example-grid">
          <div className="managers__card">
            <h3 className="managers__card-title">{t('portfolioTitle')}</h3>
            <dl className="managers__portfolio">
              {portfolio.map((entry) => (
                <div className="managers__portfolio-row" key={entry.label}>
                  <dt className="managers__portfolio-label">{entry.label}</dt>
                  <dd className="managers__portfolio-detail">{entry.detail}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="managers__card">
            <h3 className="managers__card-title">{t('monthTitle')}</h3>
            <ul className="managers__month">
              {month.map((entry) => (
                <li className="managers__month-item" key={entry}>
                  {entry}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="managers__report-block">
          <h3 className="managers__card-title">{t('reportTitle')}</h3>
          <p className="managers__note">
            <Info className="managers__note-icon" aria-hidden="true" />
            {t('reportDisclaimer')}
          </p>

          <article className="managers__report" aria-label={t('report.heading')}>
            <header className="managers__report-head">
              <span className="managers__report-heading">{t('report.heading')}</span>
              <span className="managers__report-ref">{t('report.reference')}</span>
            </header>
            <dl className="managers__report-fields">
              {reportFields.map((field) => (
                <div className="managers__report-row" key={field.label}>
                  <dt className="managers__report-label">{field.label}</dt>
                  <dd className="managers__report-value">{field.value}</dd>
                </div>
              ))}
            </dl>
          </article>
        </div>
      </div>
    </section>
  );
}
