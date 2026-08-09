import '@/styles/04-components/ui/lists/list.scss';

import Skeleton from '@/components/ui/loaders/Skeleton';

import type { ListSkeletonProps } from '@/types/ui/lists/list';

/**
 * Placeholder de carga con la misma estructura visual que {@link List}
 * (barra de herramientas y filas), puramente decorativo (`aria-hidden`),
 * igual que `TableSkeleton`.
 * @param {ListSkeletonProps} props - Propiedades del esqueleto
 * @returns {JSX.Element} El esqueleto de listado renderizado
 */
export default function ListSkeleton({ items = 5, showToolbar = true }: ListSkeletonProps) {
  return (
    <div className="list__container" aria-hidden="true">
      {showToolbar && (
        <div className="list__toolbar">
          <div className="list__toolbar__left">
            <Skeleton className="list__search" variant="rectangular" height="2.25rem" />
          </div>
        </div>
      )}

      <ul className="list">
        {Array.from({ length: items }, (_, index) => (
          <li key={index} className="list__row">
            <div className="list__item">
              <div className="list__item__body">
                <div className="list__item__info">
                  <Skeleton variant="text" width="14rem" />
                  <Skeleton variant="text" width="8rem" />
                </div>
              </div>
              <div className="list__item__actions">
                <Skeleton variant="rectangular" width="2rem" height="2rem" />
                <Skeleton variant="rectangular" width="2rem" height="2rem" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
