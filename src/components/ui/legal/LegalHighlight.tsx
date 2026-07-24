import type { ReactNode } from 'react';

type Props = {
    variant: 'info' | 'warning';
    children: ReactNode;
};

/**
 * Recuadro destacado dentro de una página legal para resaltar avisos
 * informativos o de advertencia.
 * @param {Props} props Variante visual y contenido del recuadro
 * @returns {JSX.Element} El recuadro destacado renderizado
 */
export default function LegalHighlight({ variant, children }: Props) {
    return (
        <div className={`legal__highlight legal__highlight--${variant}`}>
            {children}
        </div>
    );
}
