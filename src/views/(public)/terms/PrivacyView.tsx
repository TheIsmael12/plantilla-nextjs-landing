import { getTranslations } from 'next-intl/server';
import { ShieldIcon } from 'lucide-react';

import { Link } from '@/i18n/navigation';
import { ENV } from '@/config/env';
import { COMPANY_ADDRESS_SHORT } from '@/utils/companyAddressUtils';

import LegalHero from '@/components/ui/legal/LegalHero';
import LegalToc from '@/components/ui/legal/LegalToc';
import LegalLayout from '@/components/ui/legal/LegalLayout';
import LegalSection from '@/components/ui/legal/LegalSection';
import LegalHighlight from '@/components/ui/legal/LegalHighlight';
import LegalContactCard from '@/components/ui/legal/LegalContactCard';

import '@/styles/04-components/legal/legal.scss';

type BoldItem = { strong: string; rest: string };

/**
 * Página de política de privacidad: cabecera, tabla de contenidos y las
 * secciones legales (recopilación, uso, derechos, retención...), con el
 * contenido traducido vía `next-intl`.
 * @returns {Promise<JSX.Element>} La vista de política de privacidad renderizada
 */
export default async function PrivacyView() {
    const t = await getTranslations('Legal');
    const c = (k: string) => t(`Common.${k}`);
    const p = (k: string) => t(`Privacy.${k}`);
    const ps = (k: string) => t(`Privacy.sections.${k}`);

    const toc = t.raw('Privacy.toc') as Array<{ href: string; label: string }>;

    return (
        <main className="legal">
            <LegalHero
                variant="privacy"
                icon={<ShieldIcon size={32} strokeWidth={1.5} aria-hidden="true" />}
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
                {/* 1. Recopilación */}
                <LegalSection id="recopilacion" title={ps('recopilacion.title')}>
                    <p className="legal__section__text">{ps('recopilacion.intro')}</p>
                    <h3 className="legal__section__subtitle">{ps('recopilacion.sub1')}</h3>
                    <ul className="legal__section__list">
                        {(t.raw('Privacy.sections.recopilacion.list1') as BoldItem[]).map((item, i) => (
                            <li key={i}><strong>{item.strong}</strong>{item.rest}</li>
                        ))}
                    </ul>
                    <h3 className="legal__section__subtitle">{ps('recopilacion.sub2')}</h3>
                    <ul className="legal__section__list">
                        {(t.raw('Privacy.sections.recopilacion.list2') as BoldItem[]).map((item, i) => (
                            <li key={i}><strong>{item.strong}</strong>{item.rest}</li>
                        ))}
                    </ul>
                </LegalSection>

                {/* 2. Uso */}
                <LegalSection id="uso" title={ps('uso.title')}>
                    <p className="legal__section__text">{ps('uso.intro')}</p>
                    <ul className="legal__section__list">
                        {(t.raw('Privacy.sections.uso.list') as string[]).map((item, i) => (
                            <li key={i}>{item}</li>
                        ))}
                    </ul>
                    <LegalHighlight variant="info">
                        <p><strong>{ps('uso.highlightLabel')}</strong> {ps('uso.highlight')}</p>
                    </LegalHighlight>
                </LegalSection>

                {/* 3. Compartir */}
                <LegalSection id="compartir" title={ps('compartir.title')}>
                    <p className="legal__section__text">{ps('compartir.intro')}</p>
                    <ul className="legal__section__list">
                        {(t.raw('Privacy.sections.compartir.list') as BoldItem[]).map((item, i) => (
                            <li key={i}><strong>{item.strong}</strong>{item.rest}</li>
                        ))}
                    </ul>
                </LegalSection>

                {/* 4. Cookies */}
                <LegalSection id="cookies" title={ps('cookies.title')}>
                    <p className="legal__section__text">
                        {ps('cookies.text')}{' '}
                        <Link href="/cookies-policy" className="legal__link">{ps('cookies.linkLabel')}</Link>{' '}
                        {ps('cookies.textAfter')}
                    </p>
                </LegalSection>

                {/* 5. Seguridad */}
                <LegalSection id="seguridad" title={ps('seguridad.title')}>
                    <p className="legal__section__text">{ps('seguridad.intro')}</p>
                    <ul className="legal__section__list">
                        {(t.raw('Privacy.sections.seguridad.list') as string[]).map((item, i) => (
                            <li key={i}>{item}</li>
                        ))}
                    </ul>
                    <p className="legal__section__text">
                        {ps('seguridad.outro')}{' '}
                        <a href={`mailto:${ENV.COMPANY_SECURITY_EMAIL}`} className="legal__link">
                            {ENV.COMPANY_SECURITY_EMAIL}
                        </a>.
                    </p>
                </LegalSection>

                {/* 6. Derechos */}
                <LegalSection id="derechos" title={ps('derechos.title')}>
                    <p className="legal__section__text">{ps('derechos.intro')}</p>
                    <ul className="legal__section__list">
                        {(t.raw('Privacy.sections.derechos.list') as BoldItem[]).map((item, i) => (
                            <li key={i}><strong>{item.strong}</strong>{item.rest}</li>
                        ))}
                    </ul>
                    <p className="legal__section__text">
                        {ps('derechos.outro')}{' '}
                        <a href={`mailto:${ENV.COMPANY_PRIVACY_EMAIL}`} className="legal__link">
                            {ENV.COMPANY_PRIVACY_EMAIL}
                        </a>. {ps('derechos.outroEnd')}
                    </p>
                </LegalSection>

                {/* 7. Retención */}
                <LegalSection id="retencion" title={ps('retencion.title')}>
                    <p className="legal__section__text">{ps('retencion.p1')}</p>
                    <p className="legal__section__text">{ps('retencion.p2')}</p>
                </LegalSection>

                {/* 8. Transferencias */}
                <LegalSection id="transferencias" title={ps('transferencias.title')}>
                    <p className="legal__section__text">{ps('transferencias.p1')}</p>
                </LegalSection>

                {/* 9. Contacto */}
                <LegalSection id="contacto" title={ps('contacto.title')}>
                    <p className="legal__section__text">{ps('contacto.intro')}</p>
                    <LegalContactCard>
                        <p><strong>{ps('contacto.dpo')}</strong></p>
                        <p>
                            {ps('contacto.emailLabel')}{' '}
                            <a href={`mailto:${ENV.COMPANY_PRIVACY_EMAIL}`} className="legal__link">
                                {ENV.COMPANY_PRIVACY_EMAIL}
                            </a>
                        </p>
                        <p>{ps('contacto.addressLabel')} {COMPANY_ADDRESS_SHORT}</p>
                    </LegalContactCard>
                </LegalSection>
            </LegalLayout>
        </main>
    );
}
