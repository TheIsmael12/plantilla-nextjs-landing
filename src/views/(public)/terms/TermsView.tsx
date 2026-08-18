import { getTranslations } from 'next-intl/server';
import { ScrollTextIcon } from 'lucide-react';

import { Link } from '@/i18n/navigation';
import { ENV } from '@/config/env';

import LegalHero from '@/components/ui/legal/LegalHero';
import LegalToc from '@/components/ui/legal/LegalToc';
import LegalLayout from '@/components/ui/legal/LegalLayout';
import LegalSection from '@/components/ui/legal/LegalSection';
import LegalHighlight from '@/components/ui/legal/LegalHighlight';
import LegalContactCard from '@/components/ui/legal/LegalContactCard';

import '@/styles/04-components/legal/legal.scss';

type BoldItem = { strong: string; rest: string };

/**
 * Página de términos y condiciones: cabecera, tabla de contenidos y las
 * secciones legales (servicios, cuenta, pagos, garantías...), con el
 * contenido traducido vía `next-intl`.
 * @returns {Promise<JSX.Element>} La vista de términos y condiciones renderizada
 */
export default async function TermsView() {
    const t = await getTranslations('Legal');
    const c = (k: string) => t(`Common.${k}`);
    const p = (k: string) => t(`Terms.${k}`);
    const ps = (k: string) => t(`Terms.sections.${k}`);

    const toc = t.raw('Terms.toc') as Array<{ href: string; label: string }>;

    return (
        <main className="legal">
            <LegalHero
                variant="terms"
                icon={<ScrollTextIcon size={32} strokeWidth={1.5} aria-hidden="true" />}
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
                {/* 1. Aceptación */}
                <LegalSection id="aceptacion" title={ps('aceptacion.title')}>
                    <p className="legal__section__text">{ps('aceptacion.p1')}</p>
                    <p className="legal__section__text">{ps('aceptacion.p2')}</p>
                </LegalSection>

                {/* 2. Servicios */}
                <LegalSection id="servicios" title={ps('servicios.title')}>
                    <p className="legal__section__text">{ps('servicios.intro')}</p>
                    <ul className="legal__section__list">
                        {(t.raw('Terms.sections.servicios.list') as BoldItem[]).map((item, i) => (
                            <li key={i}><strong>{item.strong}</strong>{item.rest}</li>
                        ))}
                    </ul>
                    <p className="legal__section__text">{ps('servicios.outro')}</p>
                </LegalSection>

                {/* 3. Cuenta */}
                <LegalSection id="cuenta" title={ps('cuenta.title')}>
                    <h3 className="legal__section__subtitle">{ps('cuenta.sub1')}</h3>
                    <ul className="legal__section__list">
                        {(t.raw('Terms.sections.cuenta.list1') as string[]).map((item, i) => (
                            <li key={i}>{item}</li>
                        ))}
                    </ul>
                    <h3 className="legal__section__subtitle">{ps('cuenta.sub2')}</h3>
                    <p className="legal__section__text">{ps('cuenta.securityText')}</p>
                </LegalSection>

                {/* 4. Uso aceptable */}
                <LegalSection id="uso-aceptable" title={ps('uso_aceptable.title')}>
                    <p className="legal__section__text">{ps('uso_aceptable.intro')}</p>
                    <ul className="legal__section__list">
                        {(t.raw('Terms.sections.uso_aceptable.list') as string[]).map((item, i) => (
                            <li key={i}>{item}</li>
                        ))}
                    </ul>
                    <LegalHighlight variant="warning">
                        <p>{ps('uso_aceptable.warning')}</p>
                    </LegalHighlight>
                </LegalSection>

                {/* 5. Propiedad intelectual */}
                <LegalSection id="propiedad" title={ps('propiedad.title')}>
                    <h3 className="legal__section__subtitle">{ps('propiedad.sub1')}</h3>
                    <p className="legal__section__text">{ps('propiedad.p1')}</p>
                    <h3 className="legal__section__subtitle">{ps('propiedad.sub2')}</h3>
                    <p className="legal__section__text">{ps('propiedad.p2')}</p>
                    <h3 className="legal__section__subtitle">{ps('propiedad.sub3')}</h3>
                    <p className="legal__section__text">{ps('propiedad.p3')}</p>
                </LegalSection>

                {/* 6. Facturación */}
                <LegalSection id="pagos" title={ps('pagos.title')}>
                    <ul className="legal__section__list">
                        {(t.raw('Terms.sections.pagos.list') as string[]).map((item, i) => (
                            <li key={i}>{item}</li>
                        ))}
                    </ul>
                </LegalSection>

                {/* 7. Privacidad */}
                <LegalSection id="privacidad" title={ps('privacidad.title')}>
                    <p className="legal__section__text">
                        {ps('privacidad.text')}{' '}
                        <Link href="/privacy-policy" className="legal__link">{ps('privacidad.linkLabel')}</Link>{' '}
                        {ps('privacidad.textAfter')}
                    </p>
                </LegalSection>

                {/* 8. Garantías */}
                <LegalSection id="garantias" title={ps('garantias.title')}>
                    <p className="legal__section__text">{ps('garantias.intro')}</p>
                    <ul className="legal__section__list">
                        {(t.raw('Terms.sections.garantias.list') as string[]).map((item, i) => (
                            <li key={i}>{item}</li>
                        ))}
                    </ul>
                </LegalSection>

                {/* 9. Terminación */}
                <LegalSection id="terminacion" title={ps('terminacion.title')}>
                    <p className="legal__section__text">{ps('terminacion.p1')}</p>
                    <p className="legal__section__text">{ps('terminacion.p2')}</p>
                    <p className="legal__section__text">{ps('terminacion.p3')}</p>
                </LegalSection>

                {/* 10. Ley aplicable */}
                <LegalSection id="ley" title={ps('ley.title')}>
                    <p className="legal__section__text">{ps('ley.p1')}</p>
                    <p className="legal__section__text">{ps('ley.p2')}</p>
                </LegalSection>

                {/* 11. Contacto */}
                <LegalSection id="contacto" title={ps('contacto.title')}>
                    <p className="legal__section__text">{ps('contacto.intro')}</p>
                    <LegalContactCard>
                        <p><strong>{ENV.COMPANY_NAME}</strong></p>
                        <p>{ps('contacto.cifLabel')} {ENV.COMPANY_CIF}</p>
                        <p>
                            {ps('contacto.emailLabel')}{' '}
                            <a href={`mailto:${ENV.COMPANY_LEGAL_EMAIL}`} className="legal__link">
                                {ENV.COMPANY_LEGAL_EMAIL}
                            </a>
                        </p>
                        <p>{ps('contacto.addressLabel')} {ENV.COMPANY_ADDRESS}, {ENV.COMPANY_CITY}</p>
                    </LegalContactCard>
                </LegalSection>
            </LegalLayout>
        </main>
    );
}
