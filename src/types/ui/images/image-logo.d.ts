/**
 * Props de {@link ImageLogo}.
 * @interface ImageLogoProps
 * @property {("default"|"small")} [size] - Variante de tamaño predefinida: "default" usa `logo(.png|-dark.png)`, "small" usa `logo-small(.png|-dark.png)`
 * @property {("default"|"light"|"dark")} [style] - Variante de color: "default" sigue el tema activo (`next-themes`), "light"/"dark" fuerzan una variante concreta independientemente del tema
 * @property {string} [alt] - Texto alternativo de accesibilidad; por defecto "App Logo"
 * @property {boolean} [priority] - Si la imagen debe precargarse con prioridad; por defecto `true`
 * @property {string} [className] - Clases CSS adicionales aplicadas al contenedor del logo; úsala para fijar el tamaño (`width`/`height`) en el sitio de uso
 */
export interface ImageLogoProps {
  size?: "default" | "small";
  style?: "default" | "light" | "dark";
  alt?: string;
  priority?: boolean;
  className?: string;
}
