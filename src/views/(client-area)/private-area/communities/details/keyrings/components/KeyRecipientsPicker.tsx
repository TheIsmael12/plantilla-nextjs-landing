'use client';

import { useMemo, useState } from 'react';

import { useTranslations } from 'next-intl';

import { CheckIcon, KeyRoundIcon, MailIcon, SearchIcon } from 'lucide-react';

import Badge from '@/components/ui/buttons/Badge';
import Input from '@/components/ui/inputs/Input';

import { matchesSearch } from '@/utils/searchTextUtils';

import '@/styles/04-components/client-area/community-key-picker.scss';

/**
 * Una persona a la que se le pueden dar llaves.
 *
 * Los dos mundos —quien ya aceptó la invitación y quien no— viajan en la misma forma a propósito: en la
 * pantalla son la misma lista, porque quien reparte no sabe ni tiene por qué saber quién ha abierto ya el
 * correo. Lo que cambia es qué se hace con cada uno, y de eso se encarga la API: al vecino se le emiten las
 * llaves ahora, y a la invitación se le planifica el llavero para el día que entre.
 * @interface KeyRecipient
 * @property {string} id - Identificador de la pertenencia o de la invitación
 * @property {"membership"|"invitation"} kind - De cuál de los dos es el identificador
 * @property {string} name - Nombre, o el correo si todavía no lo ha dado
 * @property {string|null} [unitCode] - Vivienda, cuando la tiene asignada
 * @property {string} [meta] - Segunda línea bajo el nombre: el rol, o el correo de la invitación
 * @property {boolean} alreadyHas - Si ya tiene una llave viva de este destino
 */
export interface KeyRecipient {
  id: string;
  kind: 'membership' | 'invitation';
  name: string;
  unitCode?: string | null;
  meta?: string;
  alreadyHas: boolean;
}

interface KeyRecipientsPickerProps {
  recipients: KeyRecipient[];
  value: string[];
  onChange: (value: string[]) => void;
  /** Mientras se pregunta a la API quién tiene ya llave, para no dejar marcar a ciegas. */
  isLoading?: boolean;
  disabled?: boolean;
}

/**
 * A quién se le dan las llaves: la lista entera, con búsqueda y marcado múltiple.
 *
 * Sustituye al desplegable de un solo vecino, que obligaba a repetir el formulario entero una vez por
 * persona. Cuatro cosas que hacen el trabajo cómodo y que un `Select` no puede dar:
 *
 * 1. **Se ve la vivienda al lado del nombre.** Las llaves se reparten por vivienda —«el 3.º D»—, no por
 *    nombre de pila, y en un edificio hay apellidos repetidos.
 * 2. **Quien ya tiene llave sale marcado y bloqueado.** Es la pregunta con la que se llega aquí: a quién le
 *    falta. Sin esto se emiten llaves duplicadas sin darse cuenta, y una llave duplicada hay que revocarla a
 *    mano una por una.
 * 3. **Las invitaciones sin aceptar están en la misma lista**, con su etiqueta. Son la mitad del trabajo el
 *    día que se da de alta un edificio entero, y tenerlas en otra pantalla obliga a repartir dos veces.
 * 4. **«Marcar todos» actúa sobre lo que se está viendo**, no sobre la lista completa: con una búsqueda
 *    escrita, lo que se quiere es «todos estos», y marcar de paso a los que el filtro esconde sería justo lo
 *    contrario de lo que se ha pedido.
 * @param {KeyRecipientsPickerProps} props - Candidatos, selección actual y estado de carga
 * @returns {JSX.Element} El selector renderizado
 */
export default function KeyRecipientsPicker({
  recipients,
  value,
  onChange,
  isLoading = false,
  disabled = false,
}: KeyRecipientsPickerProps) {
  const t = useTranslations('Views.ClientArea.Communities.Keyrings.AssignKeys');

  const [search, setSearch] = useState('');

  /** Los candidatos que pasan el filtro: se busca por nombre y por vivienda, que es como se les llama. */
  const visible = useMemo(
    () =>
      recipients.filter((recipient) =>
        matchesSearch(`${recipient.name} ${recipient.unitCode ?? ''}`, search),
      ),
    [recipients, search],
  );

  /** De los visibles, a los que todavía se les puede dar la llave. */
  const selectable = useMemo(
    () => visible.filter((recipient) => !recipient.alreadyHas),
    [visible],
  );

  const allSelected =
    selectable.length > 0 && selectable.every((recipient) => value.includes(recipient.id));

  const toggleAll = () => {
    const ids = selectable.map((recipient) => recipient.id);

    /*
     * Se quitan o se añaden **solo los visibles**, conservando lo marcado que el filtro esconde.
     *
     * Alguien puede buscar «3º», marcarlos, buscar «4º» y marcar esos: si «marcar todos» reemplazara la
     * selección, el segundo grupo se llevaría por delante al primero sin avisar.
     */
    onChange(
      allSelected ? value.filter((id) => !ids.includes(id)) : [...new Set([...value, ...ids])],
    );
  };

  const toggle = (id: string) => {
    onChange(value.includes(id) ? value.filter((selected) => selected !== id) : [...value, id]);
  };

  return (
    <div className="key-picker">
      <div className="key-picker__head">
        <Input
          id="key-picker-search"
          name="recipientSearch"
          label={t('pickerSearchLabel')}
          noTranslate
          placeholder={t('pickerSearchPlaceholder')}
          className="input__full"
          value={search}
          icon={SearchIcon}
          onChange={(event) => setSearch(event.target.value)}
        />

        <div className="key-picker__actions">
          <p className="key-picker__count">
            {t('pickerSelected', { count: value.length, total: recipients.length })}
          </p>

          <button
            type="button"
            className="key-picker__toggle-all"
            onClick={toggleAll}
            disabled={disabled || isLoading || selectable.length === 0}
          >
            {allSelected ? t('pickerClearVisible') : t('pickerSelectVisible')}
          </button>
        </div>
      </div>

      {isLoading && <p className="key-picker__hint">{t('pickerLoading')}</p>}

      {visible.length === 0 ? (
        <p className="key-picker__empty">
          {recipients.length === 0 ? t('pickerNoRecipients') : t('pickerNoMatches')}
        </p>
      ) : (
        <ul className="key-picker__list">
          {visible.map((recipient) => {
            const checked = recipient.alreadyHas || value.includes(recipient.id);
            const inputId = `key-picker-${recipient.kind}-${recipient.id}`;

            return (
              <li key={inputId} className="key-picker__item">
                <label
                  className={`key-picker__row${recipient.alreadyHas ? ' key-picker__row--has' : ''}`}
                  htmlFor={inputId}
                >
                  <input
                    id={inputId}
                    type="checkbox"
                    className="key-picker__checkbox"
                    checked={checked}
                    /*
                     * Quien ya tiene llave sale marcado y bloqueado, no oculto: verlo con su marca es la
                     * respuesta a «¿le he dado ya la llave a este?», y esconderlo dejaría la duda.
                     */
                    disabled={disabled || recipient.alreadyHas}
                    onChange={() => toggle(recipient.id)}
                  />

                  <span className="key-picker__box" aria-hidden="true">
                    {checked && <CheckIcon />}
                  </span>

                  <span className="key-picker__who">
                    <span className="key-picker__name">{recipient.name}</span>
                    <span className="key-picker__meta">
                      {[recipient.unitCode ?? t('pickerNoUnit'), recipient.meta]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  </span>

                  {/*
                    La invitación se marca porque lo que recibe **no es lo mismo**: no una llave que ya abre,
                    sino un llavero que nacerá el día que acepte. Sin la etiqueta, quien reparte se queda
                    esperando a ver aparecer unas credenciales que todavía no existen.
                  */}
                  {recipient.kind === 'invitation' && (
                    <Badge variant="warning" text={t('pickerPending')} icon={MailIcon} />
                  )}

                  {recipient.alreadyHas && (
                    <Badge variant="neutral" text={t('pickerAlreadyHas')} icon={KeyRoundIcon} />
                  )}
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
