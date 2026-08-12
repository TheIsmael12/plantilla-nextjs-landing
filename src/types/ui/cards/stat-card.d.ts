import type { LucideIcon } from "lucide-react";

/**
 * Variantes visuales soportadas por {@link StatCard}: `neutral` para
 * métricas sin carga semántica (p. ej. nº de facturas), y el resto para
 * comunicar de un vistazo si el número es bueno/malo/requiere atención
 * (p. ej. `danger` para importe vencido) — misma paleta que {@link Badge}/{@link Alert}.
 * @typedef {("neutral"|"info"|"success"|"warning"|"danger")} StatCardVariant
 */
export type StatCardVariant = "neutral" | "info" | "success" | "warning" | "danger";

/**
 * Props de {@link StatCard}.
 * @interface StatCardProps
 * @property {string} label - Etiqueta corta de la métrica (p. ej. "Total facturado")
 * @property {string} value - Valor ya formateado a mostrar en grande (p. ej. "12.450,00 €"); el componente no formatea números ni divisas
 * @property {string} [description] - Texto secundario opcional bajo el valor (p. ej. "24 facturas")
 * @property {LucideIcon} [icon] - Icono opcional mostrado junto a `label`
 * @property {StatCardVariant} [variant] - Variante visual; por defecto "neutral"
 * @property {string} [className] - Clases CSS adicionales para la raíz
 */
export interface StatCardProps {
  label: string;
  value: string;
  description?: string;
  icon?: LucideIcon;
  variant?: StatCardVariant;
  className?: string;
}
