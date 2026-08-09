import { getTranslations } from 'next-intl/server';

import {
  KEY_MATRIX_STATE_GLYPHS,
  KEY_MATRIX_STATE_MODIFIERS,
} from '@/utils/communityFormatUtils';

import type { KeyMatrix, KeyMatrixCellState } from '@/types/client-portal/community';

import '@/styles/04-components/client-area/community-key-matrix.scss';

const STATES: KeyMatrixCellState[] = [
  'GRANTED',
  'PENDING',
  'EXPIRED',
  'OUT_OF_SCHEDULE',
  'NONE',
];

interface KeyMatrixGridProps {
  matrix: KeyMatrix;
}

/**
 * Rejilla vecino×puerta: filas de vecinos, columnas de puertas y una celda por
 * cruce con su estado. Es la pantalla que responde a "quién tiene llave del
 * garaje" en vez de a "qué credenciales existen", así que se lee de un vistazo
 * y no requiere abrir nada. Server Component: es solo lectura.
 * @param {KeyMatrixGridProps} props - Matriz ya resuelta en servidor
 * @returns {Promise<JSX.Element>} La matriz de llaves renderizada
 */
export default async function KeyMatrixGrid({ matrix }: KeyMatrixGridProps) {
  const t = await getTranslations('Views.ClientArea.Communities');

  if (matrix.rows.length === 0 || matrix.locks.length === 0) {
    return <p className="community-empty">{t('Keyrings.MatrixSection.empty')}</p>;
  }

  return (
    <>
      <div className="key-matrix__scroll">
        <table className="key-matrix">
          <thead>
            <tr>
              <th className="key-matrix__resident-header">
                {t('Keyrings.MatrixSection.residentColumn')}
              </th>
              {matrix.locks.map((lock) => (
                <th key={lock.id}>
                  <span className="key-matrix__lock-name">
                    {lock.name}
                    {lock.isMainAccess && <span>{t('Locks.mainAccess')}</span>}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.rows.map((row) => (
              <tr key={row.membershipId}>
                <th scope="row" className="key-matrix__resident">
                  <span className="key-matrix__resident-name">{row.residentName}</span>
                  {row.communityUnitCode && (
                    <span className="key-matrix__resident-unit">{row.communityUnitCode}</span>
                  )}
                </th>

                {matrix.locks.map((lock) => {
                  const cell = row.cells.find((item) => item.lockId === lock.id);
                  const state = cell?.state ?? 'NONE';

                  return (
                    <td key={lock.id} className="key-matrix__cell">
                      <span
                        className={`key-matrix__state key-matrix__state--${KEY_MATRIX_STATE_MODIFIERS[state]}`}
                        title={t(`MatrixState.${state}`)}
                      >
                        <span aria-hidden="true">{KEY_MATRIX_STATE_GLYPHS[state]}</span>
                        <span className="sr-only">{t(`MatrixState.${state}`)}</span>
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="key-matrix__legend">
        <span>{t('Keyrings.MatrixSection.legend')}:</span>
        {STATES.map((state) => (
          <span key={state} className="key-matrix__legend-item">
            <span
              className={`key-matrix__state key-matrix__state--${KEY_MATRIX_STATE_MODIFIERS[state]}`}
              aria-hidden="true"
            >
              {KEY_MATRIX_STATE_GLYPHS[state]}
            </span>
            {t(`MatrixState.${state}`)}
          </span>
        ))}
      </div>
    </>
  );
}
