import { useTranslations } from 'next-intl';

import ComplaintsCreateWizard from '@/views/(public)/help/complaints/components/ComplaintsCreateWizard';

import '@/styles/04-components/help/helpBase.scss';
import '@/styles/04-components/help/helpHero.scss';
import '@/styles/04-components/help/complaintWizard.scss';

/**
 * Página del canal de reclamaciones dentro del centro de ayuda: cabecera corta y el asistente
 * por pasos (`ComplaintsCreateWizard`, `POST /public/complaints`).
 *
 * Es la pantalla donde se presenta la reclamación de verdad — la información legal (qué es el
 * canal, quién puede usarlo, garantías) vive aparte en `/complaints-channel`
 * (`ComplaintsChannelView.tsx`), que enlaza aquí desde su sección "Cómo comunicarlo". Misma
 * separación que ya existe entre `Terms`/`Privacy` (texto legal) y las pantallas donde se
 * ejercen esos derechos de verdad.
 * @returns {JSX.Element} La página del canal de reclamaciones renderizada
 */
export default function ComplaintsHelpViewPage() {
  const t = useTranslations('Complaints.wizard');

  return (
    <main className="help">
      <section className="help__hero">
        <div className="help__container help__hero-inner">
          <p className="help__eyebrow">{t('eyebrow')}</p>
          <h1 className="help__title-lg">{t('pageTitle')}</h1>
          <p className="help__text-muted">{t('pageSubtitle')}</p>
        </div>
      </section>

      <div className="help__container complaint-wizard-page">
        <ComplaintsCreateWizard />
      </div>
    </main>
  );
}
