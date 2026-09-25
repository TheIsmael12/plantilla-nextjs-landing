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
type PurposeRow = { purpose: string; basis: string; retention: string };

/**
 * Página de política de privacidad: cabecera, tabla de contenidos y las once
 * secciones que exigen los artículos 13 y 14 del RGPD —responsable, datos,
 * finalidades con su base legal y su plazo, destinatarios, transferencias,
 * conservación, derechos, menores, cookies, seguridad y contacto—, con el
 * contenido traducido vía `next-intl`.
 *
 * El apartado de finalidades va en **tabla** y no en lista porque el art. 13
 * pide tres cosas a la vez por cada tratamiento (para qué, con qué base y
 * durante cuánto tiempo), y en prosa eso se lee como un bloque en el que no
 * se encuentra nada. Los plazos no son una redacción: salen de la
 * configuración del backend que los aplica de verdad.
 * @returns {Promise<JSX.Element>} La vista de política de privacidad renderizada
 */
export default async function PrivacyView() {
    const t = await getTranslations('Legal');
    const c = (k: string) => t(`Common.${k}`);
    const p = (k: string) => t(`Privacy.${k}`);
    const ps = (k: string) => t(`Privacy.sections.${k}`);

    const toc = t.raw('Privacy.toc') as Array<{ href: string; label: string }>;
    const purposeHeaders = t.raw('Privacy.sections.uso.headers') as Record<string, string>;
    const purposeRows = t.raw('Privacy.sections.uso.rows') as PurposeRow[];

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
                {/* 1. Responsable (art. 13.1.a RGPD) */}
                <LegalSection id="responsable" title={ps('responsable.title')}>
                    <p className="legal__section__text">{ps('responsable.intro')}</p>
                    <LegalContactCard>
                        <p>{ps('responsable.nameLabel')} <strong>{ENV.COMPANY_NAME}</strong></p>
                        {/*
                            NIF y datos registrales solo si los hay: en un entorno sin las variables puestas,
                            la alternativa sería publicar «NIF:» y nada detrás, que engaña más que omitirlo.
                        */}
                        {ENV.COMPANY_CIF && (
                            <p>{ps('responsable.taxIdLabel')} {ENV.COMPANY_CIF}</p>
                        )}
                        {ENV.COMPANY_REGISTRY && (
                            <p>{ps('responsable.registryLabel')} {ENV.COMPANY_REGISTRY}</p>
                        )}
                        <p>{ps('responsable.addressLabel')} {COMPANY_ADDRESS_SHORT}</p>
                        <p>
                            {ps('responsable.emailLabel')}{' '}
                            <a href={`mailto:${ENV.COMPANY_PRIVACY_EMAIL}`} className="legal__link">
                                {ENV.COMPANY_PRIVACY_EMAIL}
                            </a>
                        </p>
                    </LegalContactCard>
                    <LegalHighlight variant="info">
                        <p><strong>{ps('responsable.dpoLabel')}</strong> {ps('responsable.dpo')}</p>
                    </LegalHighlight>
                </LegalSection>

                {/* 2. Recopilación */}
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

                {/* 3. Finalidades, bases legales y plazos (art. 13.1.c, 13.1.d y 13.2.a) */}
                <LegalSection id="uso" title={ps('uso.title')}>
                    <p className="legal__section__text">{ps('uso.intro')}</p>
                    <div className="legal__table-wrap">
                        <table className="legal__table">
                            <thead>
                                <tr>
                                    <th>{purposeHeaders.purpose}</th>
                                    <th>{purposeHeaders.basis}</th>
                                    <th>{purposeHeaders.retention}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {purposeRows.map((row, i) => (
                                    <tr key={i}>
                                        <td>{row.purpose}</td>
                                        <td>{row.basis}</td>
                                        <td>{row.retention}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="legal__section__text">
                        <strong>{ps('uso.obligationLabel')}</strong> {ps('uso.obligation')}
                    </p>
                    <p className="legal__section__text">
                        <strong>{ps('uso.automatedLabel')}</strong> {ps('uso.automated')}
                    </p>
                    <LegalHighlight variant="info">
                        <p><strong>{ps('uso.highlightLabel')}</strong> {ps('uso.highlight')}</p>
                    </LegalHighlight>
                </LegalSection>

                {/* 4. Destinatarios (art. 13.1.e) */}
                <LegalSection id="compartir" title={ps('compartir.title')}>
                    <p className="legal__section__text">{ps('compartir.intro')}</p>
                    <ul className="legal__section__list">
                        {(t.raw('Privacy.sections.compartir.list') as BoldItem[]).map((item, i) => (
                            <li key={i}><strong>{item.strong}</strong>{item.rest}</li>
                        ))}
                    </ul>
                    <p className="legal__section__text">{ps('compartir.outro')}</p>
                </LegalSection>

                {/* 5. Transferencias internacionales (art. 13.1.f) */}
                <LegalSection id="transferencias" title={ps('transferencias.title')}>
                    <p className="legal__section__text">{ps('transferencias.intro')}</p>
                    <ul className="legal__section__list">
                        {(t.raw('Privacy.sections.transferencias.list') as BoldItem[]).map((item, i) => (
                            <li key={i}><strong>{item.strong}</strong>{item.rest}</li>
                        ))}
                    </ul>
                    <p className="legal__section__text">{ps('transferencias.outro')}</p>
                </LegalSection>

                {/* 6. Conservación */}
                <LegalSection id="retencion" title={ps('retencion.title')}>
                    <p className="legal__section__text">{ps('retencion.p1')}</p>
                    <p className="legal__section__text">{ps('retencion.p2')}</p>
                </LegalSection>

                {/* 7. Derechos (art. 13.2.b, 13.2.c y 13.2.d) */}
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
                        </a>{' '}
                        {ps('derechos.outroEnd')}
                    </p>
                    <p className="legal__section__text">
                        <strong>{ps('derechos.deadlineLabel')}</strong> {ps('derechos.deadline')}
                    </p>
                    <LegalHighlight variant="warning">
                        <p>
                            <strong>{ps('derechos.complaintLabel')}</strong> {ps('derechos.complaint')}{' '}
                            <a
                                href={ps('derechos.complaintLinkUrl')}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="legal__link"
                            >
                                {ps('derechos.complaintLinkLabel')}
                            </a>
                        </p>
                    </LegalHighlight>
                </LegalSection>

                {/* 8. Menores (art. 8 RGPD / art. 7 LOPDGDD) */}
                <LegalSection id="menores" title={ps('menores.title')}>
                    <p className="legal__section__text">{ps('menores.p1')}</p>
                    <p className="legal__section__text">{ps('menores.p2')}</p>
                </LegalSection>

                {/* 9. Cookies */}
                <LegalSection id="cookies" title={ps('cookies.title')}>
                    <p className="legal__section__text">
                        {ps('cookies.text')}{' '}
                        <Link href="/cookies-policy" className="legal__link">{ps('cookies.linkLabel')}</Link>{' '}
                        {ps('cookies.textAfter')}
                    </p>
                </LegalSection>

                {/* 10. Seguridad (art. 32) y notificación de brechas (art. 33) */}
                <LegalSection id="seguridad" title={ps('seguridad.title')}>
                    <p className="legal__section__text">{ps('seguridad.intro')}</p>
                    <ul className="legal__section__list">
                        {(t.raw('Privacy.sections.seguridad.list') as string[]).map((item, i) => (
                            <li key={i}>{item}</li>
                        ))}
                    </ul>
                    <p className="legal__section__text">
                        <strong>{ps('seguridad.breachLabel')}</strong> {ps('seguridad.breach')}
                    </p>
                    <p className="legal__section__text">
                        {ps('seguridad.outro')}{' '}
                        <a href={`mailto:${ENV.COMPANY_SECURITY_EMAIL}`} className="legal__link">
                            {ENV.COMPANY_SECURITY_EMAIL}
                        </a>.
                    </p>
                </LegalSection>

                {/* 11. Contacto */}
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
