"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

/** Preferencias de formato/localización configurables por el usuario. */
export interface UserPreferences {
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: "12h" | "24h";
  firstDayOfWeek: "monday" | "sunday";
  theme: "light" | "dark" | "system";
}

interface PreferencesContextValue {
  preferences: UserPreferences;
  setPreferences: (preferences: UserPreferences) => void;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  language: "es",
  timezone: "Europe/Madrid",
  dateFormat: "DD/MM/YYYY",
  timeFormat: "24h",
  firstDayOfWeek: "monday",
  theme: "system",
};

const PreferencesContext = createContext<PreferencesContextValue | undefined>(undefined);

/**
 * Provee las preferencias de formato/localización del usuario (idioma, zona
 * horaria, formato de fecha/hora, primer día de la semana y tema) al árbol
 * de componentes, consumibles mediante {@link usePreferences}.
 * @param {{children: ReactNode, initialPreferences?: UserPreferences}} props Contenido hijo y preferencias iniciales (p. ej. las ya cargadas con la sesión)
 * @returns {JSX.Element} El proveedor de contexto renderizado
 */
export default function PreferencesProvider({
  children,
  initialPreferences,
}: {
  children: ReactNode;
  initialPreferences?: UserPreferences;
}) {
  const [preferences, setPreferences] = useState<UserPreferences>(
    initialPreferences ?? DEFAULT_PREFERENCES,
  );

  return (
    <PreferencesContext.Provider value={{ preferences, setPreferences }}>
      {children}
    </PreferencesContext.Provider>
  );
}

/**
 * Lee las preferencias del usuario provistas por el {@link PreferencesProvider}
 * más cercano, o los valores por defecto si no hay ninguno en el árbol.
 * @returns {PreferencesContextValue} Las preferencias actuales y su setter
 */
export function usePreferences(): PreferencesContextValue {
  const context = useContext(PreferencesContext);
  return context ?? { preferences: DEFAULT_PREFERENCES, setPreferences: () => {} };
}
