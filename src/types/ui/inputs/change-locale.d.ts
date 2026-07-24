import type { AppLocale } from "@/config/locales";

/**
 * Opción de idioma disponible en {@link ChangeLocale}, también reutilizada por
 * `config/settings.ts` para tipar el catálogo `LANGUAGES`.
 * @interface LanguageOption
 * @property {AppLocale} value - Locale de la aplicación asociado a la opción
 * @property {string} label - Nombre del idioma mostrado junto a la bandera
 * @property {string} flag - Ruta de la imagen de bandera (`public/images/assets/flags/`)
 */
export interface LanguageOption {
  value: AppLocale;
  label: string;
  flag: string;
}

/**
 * Props de {@link ChangeLocale}.
 * @interface ChangeLocaleProps
 * @property {string} [id] - Id del trigger, usado para asociar el `label` y el listbox
 * @property {string} [name] - Nombre del campo, usado por el input oculto para Formik
 * @property {string} [label] - Etiqueta accesible del combobox; no se pinta visualmente, solo se usa como `aria-label`/`aria-labelledby`
 * @property {string} [description] - Breve explicación visible bajo el selector; a diferencia de `label`, sí se pinta
 * @property {AppLocale} value - Locale seleccionado actualmente (prop controlada)
 * @property {LanguageOption[]} options - Idiomas disponibles, con su bandera
 * @property {(value: AppLocale) => void} onChange - Handler invocado con el locale elegido
 * @property {boolean} [disabled] - Deshabilita el selector e impide abrir el listbox
 * @property {boolean} [hideSelectedFromList] - Oculta la opción ya seleccionada del listado desplegable (el trigger la sigue mostrando); pensado para selectores de tipo "cambiar a otro idioma" (p. ej. el footer), donde no tiene sentido ofrecer el idioma activo como destino. Por defecto `false`, para no romper el comportamiento de tipo `<select>` (opción actual visible y reseleccionable) que ya usan otros consumidores.
 * @property {string} [className] - Clases CSS adicionales del contenedor
 */
export interface ChangeLocaleProps {
  id?: string;
  name?: string;
  label?: string;
  description?: string;
  value: AppLocale;
  options: LanguageOption[];
  onChange: (value: AppLocale) => void;
  disabled?: boolean;
  hideSelectedFromList?: boolean;
  className?: string;
}
