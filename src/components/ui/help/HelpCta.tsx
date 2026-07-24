import { Link, type AnyHref } from '@/i18n/navigation';

import '@/styles/04-components/help/helpBase.scss';
import '@/styles/04-components/help/helpCta.scss';

interface HelpCtaProps {
  eyebrow: string;
  title: string;
  buttonLabel: string;
  href: AnyHref;
}

/**
 * Banda de cierre compartida por las páginas de ayuda (Soporte, Preguntas
 * frecuentes): un mensaje corto y un único botón hacia el siguiente paso
 * más útil para quien no encontró lo que buscaba.
 * @param {HelpCtaProps} props Copia y destino del botón
 * @returns {JSX.Element} La banda de cierre renderizada
 */
export default function HelpCta({ eyebrow, title, buttonLabel, href }: HelpCtaProps) {
  return (
    <section className="help__cta">
      <div className="help__container help__cta-inner">
        <p className="help__cta-eyebrow">{eyebrow}</p>
        <h2 className="help__cta-title">{title}</h2>
        <Link href={href} className="help__btn help__btn--accent">
          {buttonLabel}
        </Link>
      </div>
    </section>
  );
}
