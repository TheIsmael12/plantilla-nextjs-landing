import "@/styles/04-components/ui/inputs/input.scss";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { InputProps } from "@/types/ui/inputs/input";

import { EyeIcon, EyeOffIcon, SearchIcon } from "lucide-react";

/**
 * Campo de formulario base del sistema de diseño: resuelve `label`/`placeholder`/`error`
 * como claves de traducción (namespaces `Labels`/`Placeholders`/`Validations`) salvo que
 * `noTranslate` sea `true`, e incorpora el toggle de mostrar/ocultar cuando `type="password"`.
 * @param {InputProps} props - Propiedades del campo
 * @returns {JSX.Element} El grupo de label + input + mensaje de error
 */
export default function Input({
  id,
  name,
  label,
  ariaLabel,
  accept,
  required,
  type = "text",
  placeholder,
  error,
  touched,
  value = "",
  onChange,
  onBlur,
  onKeyDown,
  readonly,
  min,
  max,
  maxLength,
  minLength,
  disabled,
  className,
  icon: Icon,
  noTranslate,
  autoComplete = "off",
}: InputProps) {
  const t = useTranslations("Common");
  const labels = useTranslations("Labels");
  const placeholders = useTranslations("Placeholders");
  const tValidations = useTranslations("Validations");

  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const ResolvedIcon = Icon ?? (type === "search" ? SearchIcon : undefined);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

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

      <section className={className ? `${className}` : ""}>
        <input
          id={id}
          name={name}
          type={isPassword && showPassword ? "text" : type}
          value={value}
          placeholder={
            placeholder
              ? noTranslate
                ? placeholder
                : placeholders(placeholder)
              : undefined
          }
          onChange={onChange}
          readOnly={readonly}
          min={min}
          max={max}
          maxLength={maxLength ? maxLength : undefined}
          minLength={minLength ? minLength : undefined}
          required={required}
          accept={accept}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          aria-label={ariaLabel}
          aria-invalid={Boolean(error && touched)}
          className={
            `input ${error && touched ? "input__error " : ""}` +
            (isPassword ? " input__password " : "") +
            (ResolvedIcon ? " input__icon " : "") +
            (className ? className : "")
          }
          disabled={disabled}
          autoComplete={autoComplete}
        />

        {isPassword && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className={`input__password__eye ${readonly ? "input__password__eye--disabled" : ""}`}
            aria-label={showPassword ? t("hidePassword") : t("showPassword")}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}

        {ResolvedIcon && <ResolvedIcon className="input__icon__svg" />}
      </section>

      {error && touched && (
        <p className="label__error">* {tValidations(error)}</p>
      )}
    </article>
  );
}
