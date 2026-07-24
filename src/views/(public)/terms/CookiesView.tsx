import '@/styles/04-components/legal/legal.scss';

import { getTranslations } from 'next-intl/server';
import { CookieIcon } from 'lucide-react';

import { ENV } from '@/config/env';

import LegalHero from '@/components/ui/legal/LegalHero';
import LegalToc from '@/components/ui/legal/LegalToc';
import LegalLayout from '@/components/ui/legal/LegalLayout';
import LegalSection from '@/components/ui/legal/LegalSection';
import LegalHighlight from '@/components/ui/legal/LegalHighlight';
import LegalContactCard from '@/components/ui/legal/LegalContactCard';
import ManageCookiesButton from '@/components/ui/legal/ManageCookiesButton';


type CookieType = { type: string; color: string; canDisable: boolean; purpose: string; examples: string };
type TableRow = { name: string; type: string; duration: string; purpose: string };
type Browser = { label: string; url: string };

/**
 * Página de política de cookies: cabecera, tabla de contenidos y las
 * secciones legales (tipos de cookies, tabla de cookies usadas, gestión
 * por navegador y contacto), con el contenido traducido vía `next-intl`.
 * @returns {Promise<JSX.Element>} La vista de política de cookies renderizada
 */
export default async function CookiesView() {
    const t = await getTranslations('Legal');
    const c = (k: string) => t(`Common.${k}`);
    const p = (k: string) => t(`Cookies.${k}`);
    const ps = (k: string) => t(`Cookies.sections.${k}`);

    const toc = t.raw('Cookies.toc') as Array<{ href: string; label: string }>;
    const cookieTypes = t.raw('Cookies.sections.tipos.items') as CookieType[];
    const tableHeaders = t.raw('Cookies.sections.tabla.headers') as Record<string, string>;
    const tableRows = t.raw('Cookies.sections.tabla.rows') as TableRow[];
    const browsers = t.raw('Cookies.sections.gestion.browsers') as Browser[];

    return (
        <main className="legal">
            <LegalHero
                variant="cookies"
                icon={<CookieIcon size={32} strokeWidth={1.5} aria-hidden="true" />}
                title={p('title')}
                subtitle={p('subtitle')}
                updatedAtLabel={c('updatedAt')}
                updatedDate={p('updatedDate')}
            />

            <LegalLayout
                toc={
                    <LegalToc
                        title={c('toc')}
                        ariaLabel={p('tocAriaLabel')}
                        items={toc}
                    />
                }
            >
                {/* 1. Qué son */}
                <LegalSection id="que-son" title={ps('que_son.title')}>
                    <p className="legal__section__text">{ps('que_son.p1')}</p>
                    <p className="legal__section__text">{ps('que_son.p2')}</p>
                    <LegalHighlight variant="info">
                        <p>{ps('que_son.highlight')}</p>
                    </LegalHighlight>
                </LegalSection>

                {/* 2. Tipos */}
                <LegalSection id="tipos" title={ps('tipos.title')}>
                    <p className="legal__section__text">{ps('tipos.intro')}</p>
                    <div className="legal__cookies-grid">
                        {cookieTypes.map((ct, i) => (
                            <div key={i} className={`legal__cookie-card legal__cookie-card--${ct.color}`}>
                                <div className="legal__cookie-card__header">
                                    <span className="legal__cookie-card__type">{ct.type}</span>
                                    <span className={`legal__cookie-card__badge legal__cookie-card__badge--${ct.canDisable ? 'optional' : 'required'}`}>
                                        {ct.canDisable ? c('optional') : c('required')}
                                    </span>
                                </div>
                                <p className="legal__cookie-card__purpose">{ct.purpose}</p>
                                <p className="legal__cookie-card__examples">
                                    <strong>{c('examples')}</strong> {ct.examples}
                                </p>
                            </div>
                        ))}
                    </div>
                </LegalSection>

                {/* 3. Tabla */}
                <LegalSection id="tabla" title={ps('tabla.title')}>
                    <div className="legal__table-wrap">
                        <table className="legal__table">
                            <thead>
                                <tr>
                                    <th>{tableHeaders.name}</th>
                                    <th>{tableHeaders.type}</th>
                                    <th>{tableHeaders.duration}</th>
                                    <th>{tableHeaders.purpose}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tableRows.map((row, i) => (
                                    <tr key={i}>
                                        <td><code>{row.name}</code></td>
                                        <td>{row.type}</td>
                                        <td>{row.duration}</td>
                                        <td>{row.purpose}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </LegalSection>

                {/* 4. Terceros */}
                <LegalSection id="terceros" title={ps('terceros.title')}>
                    <p className="legal__section__text">{ps('terceros.p1')}</p>
                    <p className="legal__section__text">{ps('terceros.p2')}</p>
                </LegalSection>

                {/* 5. Gestión */}
                <LegalSection id="gestion" title={ps('gestion.title')}>
                    <h3 className="legal__section__subtitle">{ps('gestion.sub1')}</h3>
                    <p className="legal__section__text">{ps('gestion.manageIntro')}</p>
                    <ManageCookiesButton label={ps('gestion.manageBtnLabel')} />
                    <h3 className="legal__section__subtitle">{ps('gestion.sub2')}</h3>
                    <p className="legal__section__text">{ps('gestion.browserIntro')}</p>
                    <div className="legal__browser-list">
                        {browsers.map((b, i) => (
                            <a key={i} href={b.url} target="_blank" rel="noopener noreferrer" className="legal__browser-list__link">
                                {b.label}
                            </a>
                        ))}
                    </div>
                </LegalSection>

                {/* 6. Contacto */}
                <LegalSection id="contacto" title={ps('contacto.title')}>
                    <p className="legal__section__text">{ps('contacto.intro')}</p>
                    <LegalContactCard>
                        <p><strong>{ENV.COMPANY_NAME}</strong></p>
                        <p>
                            {ps('contacto.emailLabel')}{' '}
                            <a href={`mailto:${ENV.COMPANY_PRIVACY_EMAIL}`} className="legal__link">
                                {ENV.COMPANY_PRIVACY_EMAIL}
                            </a>
                        </p>
                    </LegalContactCard>
                </LegalSection>
            </LegalLayout>
        </main>
    );
}
