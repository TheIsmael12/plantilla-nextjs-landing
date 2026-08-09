'use client';

import '@/styles/04-components/ui/lists/list.scss';

import type { ListItemProps } from '@/types/ui/lists/list';

/**
 * Fila estándar de {@link List}: icono opcional, título con insignia de
 * estado, subtítulo, contenido libre y acciones a la derecha. Una vista solo
 * escribe su propio `renderItem` cuando necesita una forma realmente
 * distinta.
 *
 * Con `onClick`, el cuerpo del elemento (todo salvo las acciones) se
 * renderiza como `<button>` para que la fila navegable sea alcanzable por
 * teclado; las acciones quedan fuera de él porque un botón no puede anidar
 * otros controles.
 * @param {ListItemProps} props - Propiedades del elemento
 * @returns {JSX.Element} El elemento de lista renderizado
 */
export default function ListItem({
  title,
  subtitle,
  badge,
  icon: Icon,
  children,
  actions,
  onClick,
  className,
}: ListItemProps) {
  const content = (
    <>
      {Icon && <Icon className="list__item__icon" aria-hidden="true" />}

      <div className="list__item__info">
        {/* `span` y no `p`: `badge` es un `Badge`, que ya renderiza su propio
            `<p>`, y un párrafo no puede anidar otro (error de hidratación). */}
        <span className="list__item__title">
          {title}
          {badge}
        </span>
        {subtitle && <p className="list__item__subtitle">{subtitle}</p>}
        {children}
      </div>
    </>
  );

  return (
    <div
      className={`list__item${onClick ? ' list__item--clickable' : ''}${
        className ? ` ${className}` : ''
      }`}
    >
      {onClick ? (
        <button type="button" className="list__item__body" onClick={onClick}>
          {content}
        </button>
      ) : (
        <div className="list__item__body">{content}</div>
      )}

      {actions && <div className="list__item__actions">{actions}</div>}
    </div>
  );
}
