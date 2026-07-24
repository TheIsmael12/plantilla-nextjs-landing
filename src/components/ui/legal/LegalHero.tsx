import type { ReactNode } from 'react';
import { CalendarIcon } from 'lucide-react';

type LegalVariant = 'privacy' | 'terms' | 'cookies' | 'complaints';

type Props = {
    variant: LegalVariant;
    icon: ReactNode;
    title: string;
    subtitle: string;
    updatedAtLabel: string;
    updatedDate: string;
};

/**
 * Cabecera de las páginas legales (privacidad, términos, cookies): título,
 * subtítulo, icono según la variante y la fecha de última actualización.
 * @param {Props} props Variante de la página y contenido de la cabecera
 * @returns {JSX.Element} La cabecera legal renderizada
 */
export default function LegalHero({
    variant,
    icon,
    title,
    subtitle,
    updatedAtLabel,
    updatedDate,
}: Props) {
    return (
        <section className={`legal__hero legal__hero--${variant}`}>
            <div className="legal__hero__orb legal__hero__orb--1" />
            <div className="legal__hero__orb legal__hero__orb--2" />

            <div className="legal__hero__inner">
                <div className={`legal__hero__icon legal__hero__icon--${variant}`}>
                    {icon}
                </div>
                <h1 className="legal__hero__title">{title}</h1>
                <p className="legal__hero__subtitle">{subtitle}</p>
                <div className="legal__hero__meta">
                    <CalendarIcon size={14} aria-hidden="true" />
                    {updatedAtLabel}
                    <span className="legal__hero__meta__item">{updatedDate}</span>
                </div>
            </div>
        </section>
    );
}
