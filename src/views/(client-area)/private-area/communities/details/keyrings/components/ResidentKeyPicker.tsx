'use client';

import { useMemo, useState } from 'react';

import { useTranslations } from 'next-intl';

import { CheckIcon, KeyRoundIcon, SearchIcon } from 'lucide-react';

import Badge from '@/components/ui/buttons/Badge';
import Input from '@/components/ui/inputs/Input';

import { matchesSearch } from '@/utils/searchTextUtils';

import type { PortalResident } from '@/types/client-portal/community';

import '@/styles/04-components/client-area/community-key-picker.scss';

interface ResidentKeyPickerProps {
  residents: PortalResident[];
  /** Pertenencias que ya tienen una llave viva del destino elegido: no se les puede volver a dar. */
  alreadyHave: Set<string>;
  value: string[];
  onChange: (value: string[]) => void;
  /** Mientras se pregunta a la API quién tiene ya llave, para no dejar marcar a ciegas. */
  isLoading?: boolean;
  disabled?: boolean;
}

/**
 * A quién se le da la llave: lista de vecinos con búsqueda, marcado múltiple y quién ya la tiene.
 *
 * Sustituye al desplegable de un solo vecino, que obligaba a repetir el formulario entero una vez por
 * persona. Tres cosas que hacen el trabajo cómodo y que un `Select` no puede dar:
 *
 * 1. **Se ve la vivienda al lado del nombre.** Las llaves se reparten por vivienda —«el 3.º D»—, no por
 *    nombre de pila, y en un edificio hay apellidos repetidos.
 * 2. **Quien ya tiene llave sale marcado y bloqueado.** Es la pregunta con la que se llega aquí: a quién le
 *    falta. Sin esto se emiten llaves duplicadas sin darse cuenta, y una llave duplicada hay que revocarla a
 *    mano una por una.
 * 3. **«Marcar todos» actúa sobre lo que se está viendo**, no sobre la lista completa: con una búsqueda
 *    escrita, lo que se quiere es «todos estos», y marcar de paso a los que el filtro esconde sería justo lo
 *    contrario de lo que se ha pedido.
 * @param {ResidentKeyPickerProps} props - Vecinos, quién ya tiene llave y la selección actual
 * @returns {JSX.Element} El selector de vecinos renderizado
 */
export default function ResidentKeyPicker({
  residents,
  alreadyHave,
  value,
  onChange,
  isLoading = false,
  disabled = false,
}: ResidentKeyPickerProps) {
  const t = useTranslations('Views.ClientArea.Communities.Keyrings.CredentialsSection');
  const tRole = useTranslations('Views.ClientArea.Communities.ResidentRole');

  const [search, setSearch] = useState('');

  /** Los vecinos que pasan el filtro, con su texto de búsqueda ya compuesto. */
  const visible = useMemo(
    () =>
      residents.filter((resident) =>
        matchesSearch(`${resident.name} ${resident.communityUnitCode ?? ''}`, search),
      ),
    [residents, search],
  );

  /** De los visibles, a los que todavía se les puede dar la llave. */
  const selectable = useMemo(
    () => visible.filter((resident) => !alreadyHave.has(resident.membershipId)),
    [visible, alreadyHave],
  );

  const allSelected =
    selectable.length > 0 &&
    selectable.every((resident) => value.includes(resident.membershipId));

  const toggleAll = () => {
    const ids = selectable.map((resident) => resident.membershipId);

    /*
     * Se quitan o se añaden **solo los visibles**, conservando lo marcado que el filtro esconde.
     *
     * Alguien puede buscar «3º», marcarlos, buscar «4º» y marcar esos: si «marcar todos» reemplazara la
     * selección, el segundo grupo se llevaría por delante al primero sin avisar.
     */
    onChange(
      allSelected
        ? value.filter((id) => !ids.includes(id))
        : [...new Set([...value, ...ids])],
    );
  };

  const toggle = (membershipId: string) => {
    onChange(
      value.includes(membershipId)
        ? value.filter((id) => id !== membershipId)
        : [...value, membershipId],
    );
  };

  return (
    <div className="key-picker">
      <div className="key-picker__head">
        <Input
          id="key-picker-search"
          name="residentSearch"
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
            {t('pickerSelected', { count: value.length, total: residents.length })}
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
          {residents.length === 0 ? t('pickerNoResidents') : t('pickerNoMatches')}
        </p>
      ) : (
        <ul className="key-picker__list">
          {visible.map((resident) => {
            const has = alreadyHave.has(resident.membershipId);
            const checked = has || value.includes(resident.membershipId);

            return (
              <li key={resident.membershipId} className="key-picker__item">
                <label
                  className={`key-picker__row${has ? ' key-picker__row--has' : ''}`}
                  htmlFor={`key-picker-${resident.membershipId}`}
                >
                  <input
                    id={`key-picker-${resident.membershipId}`}
                    type="checkbox"
                    className="key-picker__checkbox"
                    checked={checked}
                    /*
                     * Quien ya tiene llave sale marcado y bloqueado, no oculto: verlo con su marca es la
                     * respuesta a «¿le he dado ya la llave a este?», y esconderlo dejaría la duda.
                     */
                    disabled={disabled || has}
                    onChange={() => toggle(resident.membershipId)}
                  />

                  <span className="key-picker__box" aria-hidden="true">
                    {checked && <CheckIcon />}
                  </span>

                  <span className="key-picker__who">
                    <span className="key-picker__name">{resident.name}</span>
                    <span className="key-picker__meta">
                      {resident.communityUnitCode ?? t('pickerNoUnit')} · {tRole(resident.role)}
                    </span>
                  </span>

                  {has && (
                    <Badge
                      variant="neutral"
                      text={t('pickerAlreadyHas')}
                      icon={KeyRoundIcon}
                    />
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
