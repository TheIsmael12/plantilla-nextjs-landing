import "@/styles/04-components/ui/buttons/icon-button.scss";

import { useTranslations } from "next-intl";

import type { IconButtonProps } from "@/types/ui/buttons/icon-button";

/**
 * Botón circular de solo icono, sin fondo sólido ni borde en reposo (fondo
 * tenue del color de la variante al pasar el ratón), pensado para acciones
 * secundarias dentro de una tarjeta de lista (editar, eliminar, cancelar...)
 * — a diferencia de {@link Button}, que siempre pinta un fondo o borde
 * propio. Al no tener texto visible, `ariaLabel` es obligatorio en vez de
 * opcional.
 * @param {IconButtonProps} props - Propiedades del botón
 * @returns {JSX.Element} El elemento `<button>` renderizado
 */
export default function IconButton({
  children,
  ariaLabel,
  ariaLabelValues,
  variant = "neutral",
  size = "md",
  disabled = false,
  type = "button",
  onClick,
  className,
}: IconButtonProps) {
  const buttons = useTranslations("Buttons");

  /*
   * La etiqueta se resuelve una vez y se usa para el `title` y el `aria-label`, que dicen lo mismo.
   *
   * `ariaLabelValues` existe para las listas: veinte aspas seguidas con la etiqueta «Quitar» son veinte
   * botones indistinguibles para quien navega con lector de pantalla, porque el `aria-label` tapa el texto
   * que tienen al lado. Con los valores, cada una dice qué quita. Sin esto, la única salida era pasar el
   * texto ya traducido —y eso no es una clave, así que revienta con un `MISSING_MESSAGE`—.
   */
  const label = buttons(ariaLabel, ariaLabelValues);

  return (
    <button
      type={type}
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`icon-btn icon-btn--${variant} icon-btn--${size}${className ? ` ${className}` : ""}`}
    >
      {children}
    </button>
  );
}
