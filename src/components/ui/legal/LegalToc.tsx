type TocItem = {
    href: string;
    label: string;
};

type Props = {
    title: string;
    ariaLabel: string;
    items: TocItem[];
};

/**
 * Tabla de contenidos de una página legal, con enlaces a cada
 * {@link LegalSection} del documento.
 * @param {Props} props Título, etiqueta accesible y elementos del índice
 * @returns {JSX.Element} La tabla de contenidos renderizada
 */
export default function LegalToc({ title, ariaLabel, items }: Props) {
    return (
        <aside className="legal__toc">
            <p className="legal__toc__title">{title}</p>
            <nav aria-label={ariaLabel}>
                <ol className="legal__toc__list">
                    {items.map((item) => (
                        <li key={item.href}>
                            <a href={item.href} className="legal__toc__link">
                                {item.label}
                            </a>
                        </li>
                    ))}
                </ol>
            </nav>
        </aside>
    );
}
