import type { ReactNode } from 'react';

type Props = {
    children: ReactNode;
};

/**
 * Tarjeta destacada para los datos de contacto dentro de una página legal.
 * @param {Props} props Contenido a mostrar dentro de la tarjeta
 * @returns {JSX.Element} La tarjeta de contacto renderizada
 */
export default function LegalContactCard({ children }: Props) {
    return (
        <div className="legal__contact-card">
            {children}
        </div>
    );
}
