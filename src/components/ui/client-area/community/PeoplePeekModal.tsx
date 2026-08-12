'use client';

import { useEffect, useRef, useState } from 'react';

import { useTranslations } from 'next-intl';

import { UserIcon } from 'lucide-react';

import Badge from '@/components/ui/buttons/Badge';
import ModalComponent from '@/components/ui/modals/ModalComponent';

import type { BadgeVariant } from '@/types/ui/buttons/badge';
import type { FetchResponse } from '@/types/responses';

import '@/styles/04-components/client-area/people-peek.scss';

/**
 * Una persona de la lista, ya normalizada por quien abre el modal.
 * @interface PeekedPerson
 * @property {string} id - Clave de la fila
 * @property {string} name - Lo que se lee primero: el nombre, o lo que haga de nombre
 * @property {string} [detail] - Segunda línea: correo, unidad, tipo de llave...
 * @property {string} [badgeText] - Etiqueta de estado o de rol, si la fila tiene una
 * @property {BadgeVariant} [badgeVariant] - Color de esa etiqueta
 */
export interface PeekedPerson {
  id: string;
  name: string;
  detail?: string;
  badgeText?: string;
  badgeVariant?: BadgeVariant;
}

interface PeoplePeekModalProps {
  title: string;
  /** Qué se está mirando (el código de la unidad, el nombre del llavero); va bajo el título. */
  subtitle?: string;
  /** Carga las personas. Se llama una vez al abrir. */
  load: () => Promise<FetchResponse<PeekedPerson[]>>;
  emptyMessage: string;
  onClose: () => void;
}

/**
 * Modal de solo lectura para ver **quién** hay detrás de una fila: los vecinos de una unidad, los titulares
 * de un llavero.
 *
 * Es un modal y no una página propia porque la pregunta es de paso: se está mirando el listado de unidades,
 * surge la duda de quién vive en el 3.ºB, se mira y se sigue. Mandar a otra pantalla obligaría a volver y a
 * recuperar la página y el orden en que se estaba.
 *
 * Carga al abrir y no con la tabla: son datos que casi nunca se piden —una consulta por fila que nadie
 * abriría— y traerlos con el listado sería multiplicar por diez las consultas de una pantalla que va bien.
 * @param {PeoplePeekModalProps} props - Título, cargador de personas y cierre
 * @returns {JSX.Element} El modal con la lista de personas
 */
export default function PeoplePeekModal({
  title,
  subtitle,
  load,
  emptyMessage,
  onClose,
}: PeoplePeekModalProps) {
  const tCommon = useTranslations('Views.ClientArea.Common');

  const [people, setPeople] = useState<PeekedPerson[] | null>(null);

  /*
   * El cargador, en una ref, y la carga una sola vez al montar.
   *
   * `load` casi siempre llega como una lambda nueva en cada render del padre; con `load` en las dependencias,
   * cualquier cambio de estado de la pantalla de detrás volvía a pedir la lista, y con ella el parpadeo de
   * «Cargando…». Quien abra el modal para otra fila debe darle una `key` distinta, y así se monta de nuevo y
   * vuelve a cargar, que es cuando de verdad hay que hacerlo.
   */
  const loadRef = useRef(load);

  // La asignación va en su propio efecto y no en el cuerpo del render: escribir una ref durante el render
  // es lo que prohíbe `react-hooks`, y este efecto se declara antes, así que corre antes que la carga.
  useEffect(() => {
    loadRef.current = load;
  }, [load]);

  useEffect(() => {
    let isCurrent = true;

    void (async () => {
      const response = await loadRef.current();
      // Sin esto, cerrar el modal antes de que llegue la respuesta escribe estado en un componente muerto.
      if (isCurrent) setPeople(response.data ?? []);
    })();

    return () => {
      isCurrent = false;
    };
  }, []);

  return (
    <ModalComponent title={title} isOpen onClose={onClose} onCancel={onClose} cancelText="close">
      <div className="people-peek">
        {subtitle && <p className="people-peek__subtitle">{subtitle}</p>}

        {people === null ? (
          <p className="people-peek__empty">{tCommon('loading')}</p>
        ) : people.length === 0 ? (
          <p className="people-peek__empty">{emptyMessage}</p>
        ) : (
          <ul className="people-peek__list">
            {people.map((person) => (
              <li key={person.id} className="people-peek__item">
                <span className="people-peek__avatar">
                  <UserIcon aria-hidden="true" />
                </span>

                <span className="people-peek__text">
                  <span className="people-peek__name">{person.name}</span>
                  {person.detail && <span className="people-peek__detail">{person.detail}</span>}
                </span>

                {person.badgeText && (
                  <Badge variant={person.badgeVariant ?? 'neutral'} text={person.badgeText} />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </ModalComponent>
  );
}
