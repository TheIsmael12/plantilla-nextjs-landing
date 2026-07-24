"use client";

import { useEffect, useState } from "react";

/**
 * Indica si el componente ya se ha montado en cliente. Se usa para evitar
 * parpadeos de hidratación en componentes cuyo render depende de estado solo
 * disponible en cliente (p. ej. el tema resuelto por `next-themes`), donde el
 * markup del servidor no puede coincidir con el del cliente.
 * @returns {boolean} `false` durante el render del servidor y el primer render de cliente, `true` a partir del primer efecto
 */
export function useIsMounted(): boolean {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // justificación: no hay ningún sistema externo con el que sincronizar aquí
    // — el propio hecho de que el efecto se haya ejecutado ya ES la señal de
    // que el componente está montado en cliente, es una de las pocas
    // excepciones legítimas a "no llames a setState dentro de un efecto".
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  return isMounted;
}