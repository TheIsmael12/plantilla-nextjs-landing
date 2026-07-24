import "@/styles/04-components/ui/sections/settings-section.scss";

import type { SettingsSectionProps } from "@/types/ui/sections/settings-section";

/**
 * Sección de ajustes con cabecera opcional (icono, título, descripción y
 * acciones) y un área de contenido; la cabecera solo se renderiza si hay algo
 * que mostrar. Pensada para poder apilar varias en la misma página (p. ej.
 * `profile/preferences`): el icono ayuda a identificar cada una de un vistazo
 * y la descripción siempre queda visible junto al título, sin dar por hecho
 * que el usuario entiende de qué trata la sección solo por su nombre.
 * @param {SettingsSectionProps} props - Propiedades del componente
 * @returns {JSX.Element} La sección de ajustes renderizada
 */
export default function SettingsSection({
  title,
  description,
  icon: Icon,
  actions,
  children,
}: SettingsSectionProps) {
  const hasHeader = title || description || actions;

  return (
    <section className="settings-section">
      {hasHeader && (
        <div className="settings-section__header">
          {Icon && (
            <div className="settings-section__icon">
              <Icon aria-hidden="true" />
            </div>
          )}

          <div className="settings-section__heading">
            {title && <h3 className="settings-section__title">{title}</h3>}
            {description && (
              <p className="settings-section__description">{description}</p>
            )}
          </div>

          {actions && (
            <div className="settings-section__actions">{actions}</div>
          )}
        </div>
      )}
      {children && <div className="settings-section__content">{children}</div>}
    </section>
  );
}
