import type { ReactNode } from 'react';

type Props = {
    toc: ReactNode;
    children: ReactNode;
};

/**
 * Layout de dos columnas para páginas legales: tabla de contenidos a un
 * lado y el cuerpo del documento al otro.
 * @param {Props} props Tabla de contenidos y cuerpo del documento
 * @returns {JSX.Element} El layout legal renderizado
 */
export default function LegalLayout({ toc, children }: Props) {
    return (
        <div className="legal__layout">
            {toc}
            <article className="legal__body">
                {children}
            </article>
        </div>
    );
}
