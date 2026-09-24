import { getTranslations } from 'next-intl/server';
import { MegaphoneIcon } from 'lucide-react';

import { ENV } from '@/config/env';
import { Link } from '@/i18n/navigation';
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
 * Página del canal de reclamaciones: cabecera, tabla de contenidos y las
 * secciones que explican qué es, quién puede usarlo, qué se puede
 * comunicar, cómo hacerlo y las garantías del canal, con el contenido
 * traducido vía `next-intl`. Reutiliza el mismo sistema de componentes
 * legales que privacidad, términos y cookies.
 *
 * Es información, no el formulario en sí: para presentarla de verdad hay un
 * asistente por pasos en `/help/complaints` (`ComplaintsCreateWizard.tsx`),
 * enlazado desde la sección "Cómo comunicarlo" — mismo criterio que separa
 * `Terms`/`Privacy` (texto legal) de las pantallas donde se ejercen esos
 * derechos de verdad.
 * @returns {Promise<JSX.Element>} La vista del canal de reclamaciones renderizada
 */
export default async function ComplaintsChannelView() {
    const t = await getTranslations('Legal');
    const c = (k: string) => t(`Common.${k}`);
    const p = (k: string) => t(`Complaints.${k}`);
    const ps = (k: string) => t(`Complaints.sections.${k}`);

    const toc = t.raw('Complaints.toc') as Array<{ href: string; label: string }>;

    return (
        <main className="legal">
            <LegalHero
                variant="complaints"
                icon={<MegaphoneIcon size={32} strokeWidth={1.5} aria-hidden="true" />}
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
                <LegalSection id="que-es" title={ps('queEs.title')}>
                    <p className="legal__section__text">{ps('queEs.intro')}</p>
                    <p className="legal__section__text">{ps('queEs.p2')}</p>
                </LegalSection>

                <LegalSection id="quien-puede-usarlo" title={ps('quienPuedeUsarlo.title')}>
                    <p className="legal__section__text">{ps('quienPuedeUsarlo.intro')}</p>
                    <ul className="legal__section__list">
                        {(t.raw('Complaints.sections.quienPuedeUsarlo.list') as BoldItem[]).map((item, i) => (
                            <li key={i}><strong>{item.strong}</strong>{item.rest}</li>
                        ))}
                    </ul>
                </LegalSection>

                <LegalSection id="que-comunicar" title={ps('queComunicar.title')}>
                    <p className="legal__section__text">{ps('queComunicar.intro')}</p>
                    <ul className="legal__section__list">
                        {(t.raw('Complaints.sections.queComunicar.list') as BoldItem[]).map((item, i) => (
                            <li key={i}><strong>{item.strong}</strong>{item.rest}</li>
                        ))}
                    </ul>
                </LegalSection>

                <LegalSection id="como-comunicar" title={ps('comoComunicar.title')}>
                    <p className="legal__section__text">{ps('comoComunicar.intro')}</p>
                    <Link href="/help/complaints" className="legal__btn legal__btn--primary">
                        {ps('comoComunicar.formButton')}
                    </Link>
                    {/*
                        La vía verbal no es un extra: el art. 7.1 de la Ley 2/2023 obliga a que el canal
                        la admita, y el 7.2 a dar una reunión presencial dentro de los siete días
                        siguientes si el informante la pide. Un canal que solo acepta un formulario no
                        cumple, por bien hecho que esté el formulario.
                    */}
                    <p className="legal__section__text">
                        <strong>{ps('comoComunicar.verbalLabel')}</strong> {ps('comoComunicar.verbal')}
                    </p>
                    <LegalHighlight variant="warning">
                        <p><strong>{ps('comoComunicar.highlightLabel')}</strong> {ps('comoComunicar.highlight')}</p>
                    </LegalHighlight>
                </LegalSection>

                <LegalSection id="garantias" title={ps('garantias.title')}>
                    <p className="legal__section__text">{ps('garantias.intro')}</p>
                    <ul className="legal__section__list">
                        {(t.raw('Complaints.sections.garantias.list') as BoldItem[]).map((item, i) => (
                            <li key={i}><strong>{item.strong}</strong>{item.rest}</li>
                        ))}
                    </ul>
                </LegalSection>

                {/*
                    El canal externo va en su propia sección y no en una nota al pie: la Ley 2/2023 no
                    exige solo tenerlo, exige informar de que existe y de que no hay que agotar el
                    interno antes de acudir a él.
                */}
                <LegalSection id="canal-externo" title={ps('canalExterno.title')}>
                    <p className="legal__section__text">{ps('canalExterno.intro')}</p>
                    <ul className="legal__section__list">
                        {(t.raw('Complaints.sections.canalExterno.list') as BoldItem[]).map((item, i) => (
                            <li key={i}><strong>{item.strong}</strong>{item.rest}</li>
                        ))}
                    </ul>
                    <p className="legal__section__text">{ps('canalExterno.outro')}</p>
                </LegalSection>

                <LegalSection id="datos" title={ps('datos.title')}>
                    <p className="legal__section__text">{ps('datos.intro')}</p>
                    <ul className="legal__section__list">
                        {(t.raw('Complaints.sections.datos.list') as BoldItem[]).map((item, i) => (
                            <li key={i}><strong>{item.strong}</strong>{item.rest}</li>
                        ))}
                    </ul>
                </LegalSection>

                <LegalSection id="contacto" title={ps('contacto.title')}>
                    <p className="legal__section__text">{ps('contacto.intro')}</p>
                    <LegalContactCard>
                        <p><strong>{ps('contacto.responsible')}</strong></p>
                        <p>
                            {ps('contacto.emailLabel')}{' '}
                            <a href={`mailto:${ENV.COMPANY_LEGAL_EMAIL}`} className="legal__link">
                                {ENV.COMPANY_LEGAL_EMAIL}
                            </a>
                        </p>
                        <p>{ps('contacto.addressLabel')} {COMPANY_ADDRESS_SHORT}</p>
                    </LegalContactCard>
                </LegalSection>
            </LegalLayout>
        </main>
    );
}
