'use client';

import '@/styles/04-components/ui/inputs/tags-input.scss';

import { useState, type KeyboardEvent } from 'react';

import { useTranslations } from 'next-intl';

import type { TagsInputProps } from '@/types/ui/inputs/tags-input';

import { PlusIcon, XIcon } from 'lucide-react';

/**
 * Campo de lista de valores (correos, teléfonos, tags, números de serie...): cada valor
 * se añade por separado con "Enter" o el botón "+", se valida antes de añadirse
 * (`validate`) y se puede quitar de forma individual, hasta un máximo configurable
 * (`max`) — a diferencia de un `Input` con valores separados por comas, cada elemento
 * tiene su propio ciclo de alta/validación/baja.
 *
 * `layout` decide cómo se ven los valores ya añadidos: `tags` (por defecto) en línea, o
 * `rows` apilados hacia abajo con su número de orden, a modo de tabla. El campo de alta
 * con su "+" a la derecha es el mismo en los dos casos.
 * @param {TagsInputProps} props - Propiedades del campo
 * @returns {JSX.Element} El campo de lista de valores renderizado
 */
export default function TagsInput({
  id,
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
  max,
  validate,
  required,
  disabled,
  layout = 'tags',
  className,
  noTranslate,
}: TagsInputProps) {
  const labels = useTranslations('Labels');
  const placeholders = useTranslations('Placeholders');
  const tValidations = useTranslations('Validations');
  const tCommon = useTranslations('Common.TagsInput');

  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);

  const isFull = max !== undefined && value.length >= max;
  const isDisabled = disabled || isFull;

  const resolvedLabel = label ? (noTranslate ? label : labels(label)) : undefined;
  const resolvedPlaceholder = placeholder
    ? noTranslate
      ? placeholder
      : placeholders(placeholder)
    : undefined;

  const handleAdd = () => {
    const candidate = draft.trim();
    if (!candidate || isDisabled) return;

    if (value.includes(candidate)) {
      setError('tagsInputDuplicate');
      return;
    }

    const validationError = validate?.(candidate);
    if (validationError) {
      setError(validationError);
      return;
    }

    onChange([...value, candidate]);
    setDraft('');
    setError(undefined);
  };

  const handleRemove = (index: number) => {
    if (disabled) return;
    onChange(value.filter((_, i) => i !== index));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    handleAdd();
  };

  return (
    <article className="input__group">
      {resolvedLabel && (
        <label htmlFor={id} className={`label__title ${error ? 'label__error' : ''}`}>
          {resolvedLabel} <span>{required && '*'}</span>
        </label>
      )}

      <div className={`tags-input ${className ?? 'input__full'}`}>
        {value.length > 0 &&
          (layout === 'rows' ? (
            <ol className="tags-input__rows">
              {value.map((item, index) => (
                <li key={item} className="tags-input__row">
                  <span className="tags-input__row__index">{index + 1}</span>
                  <span className="tags-input__row__value">{item}</span>
                  <button
                    type="button"
                    className="tags-input__tag__remove"
                    aria-label={tCommon('remove', { value: item })}
                    disabled={disabled}
                    onClick={() => handleRemove(index)}
                  >
                    <XIcon aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ol>
          ) : (
            <ul className="tags-input__list">
              {value.map((item, index) => (
                <li key={item} className="tags-input__tag">
                  <span>{item}</span>
                  <button
                    type="button"
                    className="tags-input__tag__remove"
                    aria-label={tCommon('remove', { value: item })}
                    disabled={disabled}
                    onClick={() => handleRemove(index)}
                  >
                    <XIcon aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          ))}

        {!isFull && (
          <div className="tags-input__composer">
            <input
              id={id}
              type={type}
              className="input tags-input__input"
              value={draft}
              placeholder={resolvedPlaceholder}
              disabled={isDisabled}
              onChange={(event) => {
                setDraft(event.target.value);
                if (error) setError(undefined);
              }}
              onKeyDown={handleKeyDown}
            />
            <button
              type="button"
              className="tags-input__add"
              aria-label={tCommon('add')}
              disabled={isDisabled || !draft.trim()}
              onClick={handleAdd}
            >
              <PlusIcon aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      {max !== undefined && (
        <p className="tags-input__counter">{tCommon('counter', { count: value.length, max })}</p>
      )}

      {error && <p className="label__error">* {tValidations(error)}</p>}
    </article>
  );
}
