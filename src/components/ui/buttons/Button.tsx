import "@/styles/04-components/ui/buttons/button.scss";

import { useTranslations } from "next-intl";

import type { ButtonProps } from "@/types/ui/buttons/button";

/**
 * Botón base del sistema de diseño: resuelve `title`/`ariaLabel` como claves
 * de traducción del namespace `Buttons` en vez de recibir texto ya traducido,
 * para que ningún componente de negocio tenga que llamar a `useTranslations` solo por esto.
 * @param {ButtonProps} props - Propiedades del botón
 * @returns {JSX.Element} El elemento `<button>` renderizado
 */
export default function Button({
  title,
  type = "button",
  size = "md",
  variant,
  disabled = false,
  children,
  iconPosition = "left",
  onClick,
  ariaLabel,
  className,
}: ButtonProps) {
  const buttons = useTranslations("Buttons");

  return (
    <button
      title={title ? buttons(title) : undefined}
      type={type}
      onClick={onClick}
      className={`btn ${variant ? `btn--${variant}` : ""} btn--${size} ${disabled ? "btn--disabled" : ""} ${className || ""}`.trim()}
      disabled={disabled}
      aria-label={ariaLabel ? buttons(ariaLabel) : undefined}
    >
      {iconPosition === "left" && children} {title && buttons(title)} {iconPosition === "right" && children}
    </button>
  );
}
