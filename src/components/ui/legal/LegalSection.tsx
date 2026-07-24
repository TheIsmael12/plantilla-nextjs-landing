import type { ReactNode } from 'react';

type Props = {
    id: string;
    title: string;
    children: ReactNode;
};

/**
 * Sección con ancla de una página legal, referenciada desde la tabla de
 * contenidos ({@link LegalToc}).
 * @param {Props} props Identificador del ancla, título y contenido de la sección
 * @returns {JSX.Element} La sección legal renderizada
 */
export default function LegalSection({ id, title, children }: Props) {
    return (
        <section
            id={id}
            className="legal__section"
            style={{ scrollMarginTop: '6rem' }}
            tabIndex={-1}
        >
            <h2 className="legal__section__title">{title}</h2>
            {children}
        </section>
    );
}
