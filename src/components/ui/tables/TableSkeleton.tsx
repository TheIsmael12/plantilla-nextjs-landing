import "@/styles/04-components/ui/tables/table.scss";

import Skeleton from "@/components/ui/loaders/Skeleton";

import type { TableSkeletonProps } from "@/types/ui/tables/table";

/**
 * Placeholder de carga con la misma estructura visual que {@link Table}
 * (barra de herramientas, cabecera y filas), pensado para los `fallback` de
 * `Suspense` de las vistas de listado (p. ej. `UsersViewSkeleton`) mientras
 * `use()` resuelve la promesa de datos, en vez de un simple bloque
 * rectangular sin relación con la forma real de la tabla.
 * Puramente decorativo: se marca con `aria-hidden="true"` en la raíz para que
 * los lectores de pantalla lo ignoren por completo (sus celdas no tienen
 * ningún texto real, solo bloques de {@link Skeleton}), igual que hace
 * `Skeleton` con cada uno de sus bloques; el estado de carga real debe
 * anunciarse aparte (p. ej. un `aria-live` en el contenedor de la vista).
 * @param {TableSkeletonProps} props - Propiedades del esqueleto
 * @returns {JSX.Element} El esqueleto de tabla renderizado
 */
export default function TableSkeleton({
  rows = 5,
  columns = 4,
  showToolbar = true,
}: TableSkeletonProps) {
  return (
    <div className="table__container" aria-hidden="true">
      {showToolbar && (
        <div className="table__toolbar">
          <div className="table__toolbar__left">
            <Skeleton
              className="table__search"
              variant="rectangular"
              height="2.25rem"
            />
          </div>
        </div>
      )}

      <div className="table__scroll">
        <table className="table">
          <thead className="table__head">
            <tr>
              {Array.from({ length: columns }, (_, index) => (
                <th key={index}>
                  <Skeleton variant="text" width="60%" />
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {Array.from({ length: rows }, (_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: columns }, (_, columnIndex) => (
                  <td key={columnIndex}>
                    <Skeleton variant="text" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
