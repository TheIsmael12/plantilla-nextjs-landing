import "@/styles/04-components/ui/sections/tab-panel.scss";

import type { TabPanelProps } from "@/types/ui/sections/tab-panel";

/**
 * Panel de contenido de una pestaña (`TabsComponent`): una tarjeta simple
 * (fondo + padding + esquinas redondeadas) sin el icono/descripción de
 * `SettingsSection`, pensada para el contenido de una pestaña que ya tiene
 * su propio título en la navegación (p. ej. Detalles/Sesiones del detalle de
 * usuario) y no necesita repetirlo.
 * @param {TabPanelProps} props - Propiedades del componente
 * @returns {JSX.Element} El panel renderizado
 */
export default function TabPanel({ title, actions, children, className }: TabPanelProps) {
  const hasHeader = title || actions;

  return (
    <section className={`tab-panel${className ? ` ${className}` : ""}`}>
      {hasHeader && (
        <div className="tab-panel__header">
          {title && <h2 className="tab-panel__title">{title}</h2>}
          {actions && <div className="tab-panel__actions">{actions}</div>}
        </div>
      )}
      {children && <div className="tab-panel__content">{children}</div>}
    </section>
  );
}
