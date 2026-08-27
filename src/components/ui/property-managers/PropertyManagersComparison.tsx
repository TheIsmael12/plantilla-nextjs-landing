import { useTranslations } from 'next-intl';

import '@/styles/04-components/services/servicesBase.scss';
import '@/styles/04-components/property-managers/propertyManagers.scss';

interface ComparisonRow {
  topic: string;
  multiple: string;
  imora: string;
}

/**
 * Comparativa entre repartir los servicios de la cartera en varios proveedores y llevarlos con uno solo.
 *
 * Va en tabla de verdad, con `<th scope>` en la fila y en la columna, y no en dos listas enfrentadas: la
 * comparación es de celda contra celda —qué pasa con *este* asunto en un caso y en el otro— y un lector de
 * pantalla que recorre dos listas independientes pierde exactamente esa relación. El precio es tener que
 * dejarla desplazarse en horizontal en móvil, que es lo que hace `managers__comparison-scroll`.
 * @returns {JSX.Element} La comparativa renderizada
 */
export default function PropertyManagersComparison() {
  const t = useTranslations('ForPropertyManagers.comparison');
  const rows = t.raw('rows') as ComparisonRow[];

  return (
    <section className="managers__comparison">
      <div className="services__container">
        <div className="managers__comparison-header">
          <p className="services__eyebrow">{t('eyebrow')}</p>
          <h2 className="services__title-lg">{t('title')}</h2>
          <p className="managers__comparison-subtitle">{t('subtitle')}</p>
        </div>

        <div className="managers__comparison-scroll">
          <table className="managers__comparison-table">
            <thead>
              <tr>
                <th scope="col">{t('columnTopic')}</th>
                <th scope="col">{t('columnMultiple')}</th>
                <th scope="col" className="managers__comparison-th--imora">
                  {t('columnImora')}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.topic}>
                  <th scope="row">{row.topic}</th>
                  <td>{row.multiple}</td>
                  <td className="managers__comparison-td--imora">{row.imora}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
