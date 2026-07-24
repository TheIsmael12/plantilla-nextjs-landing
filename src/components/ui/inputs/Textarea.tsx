import "@/styles/04-components/ui/inputs/input.scss";
import "@/styles/04-components/ui/inputs/textarea.scss";

import { useTranslations } from "next-intl";

import { TextareaProps } from "@/types/ui/inputs/textarea";

/**
 * Campo de texto multilínea del sistema de diseño: misma resolución de
 * `label`/`placeholder`/`error` que {@link Input} (namespaces
 * `Labels`/`Placeholders`/`Validations`, salvo que `noTranslate` sea
 * `true`), pensado para mensajes largos donde un `Input` de una sola línea
 * se queda corto (p. ej. el campo de mensaje de {@link ContactForm}).
 * @param {TextareaProps} props - Propiedades del campo
 * @returns {JSX.Element} El grupo de label + textarea + mensaje de error
 */
export default function Textarea({
  id,
  name,
  label,
  ariaLabel,
  required,
  placeholder,
  error,
  touched,
  value = "",
  onChange,
  onBlur,
  onKeyDown,
  rows = 5,
  maxLength,
  minLength,
  disabled,
  readonly,
  className,
  noTranslate,
  autoComplete = "off",
}: TextareaProps) {
  const labels = useTranslations("Labels");
  const placeholders = useTranslations("Placeholders");
  const tValidations = useTranslations("Validations");

  return (
    <article className="input__group">
      {label && (
        <label
          htmlFor={id}
          className={`label__title ${error && touched ? "label__error" : ""}`}
        >
          {noTranslate ? label : labels(label)} <span>{required && "*"}</span>
        </label>
      )}

      <textarea
        id={id}
        name={name}
        value={value}
        placeholder={
          placeholder
            ? noTranslate
              ? placeholder
              : placeholders(placeholder)
            : undefined
        }
        onChange={onChange}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        readOnly={readonly}
        rows={rows}
        maxLength={maxLength}
        minLength={minLength}
        required={required}
        aria-label={ariaLabel}
        aria-invalid={Boolean(error && touched)}
        className={
          `textarea ${error && touched ? "textarea__error " : ""}` +
          (className ? className : "")
        }
        disabled={disabled}
        autoComplete={autoComplete}
      />

      {error && touched && (
        <p className="label__error">* {tValidations(error)}</p>
      )}
    </article>
  );
}
