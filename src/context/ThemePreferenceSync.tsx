"use client";

import { useEffect, useRef } from "react";

import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";

/**
 * Aplica el tema guardado en las preferencias del cliente.
 *
 * `next-themes` solo mira `localStorage`, que es del navegador; la preferencia
 * de tema es de la **persona**, y viaja en la sesión. Sin este puente las dos
 * cosas se separan: quien eligió oscuro vería el portal en claro al entrar
 * desde otro ordenador, desde otro navegador o tras limpiar los datos del
 * sitio, y la tarjeta marcada en la pantalla de preferencias no se
 * correspondería con lo que muestra la pantalla.
 *
 * Se aplica una vez por valor y no en cada render: así un cambio hecho desde
 * otra pestaña —que llega al refrescarse la sesión— también se aplica, pero
 * cambiar el tema desde la pantalla de preferencias no se pisa a sí mismo.
 * @returns {null} No pinta nada: solo sincroniza
 */
export default function ThemePreferenceSync() {
  const { data: session } = useSession();
  const { setTheme } = useTheme();

  const applied = useRef<string | null>(null);
  const preference = session?.user?.preferences?.theme;

  useEffect(() => {
    if (!preference || applied.current === preference) return;

    applied.current = preference;
    setTheme(preference);
  }, [preference, setTheme]);

  return null;
}
