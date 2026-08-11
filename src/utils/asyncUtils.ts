/**
 * Manejador de rechazo para una promesa que se lanza sin esperar su resultado: la carga de un
 * catálogo dentro de un efecto, una descarga, un `signOut`.
 *
 * Las acciones de servidor normalizan sus errores a {@link FetchResponse} y no rechazan, así que
 * un rechazo aquí significa algo inesperado —la red caída, una excepción del propio servidor de
 * Next, un `AbortError`—. Sin este manejador el fallo se convierte en un *unhandled rejection*
 * que aparece en la consola sin decir de dónde viene; con él queda registrado con el sitio que lo
 * provocó, y el componente se queda con su estado inicial (lista vacía, catálogo sin cargar), que
 * es exactamente lo que ya hacía.
 *
 * No sustituye a mostrar el error al usuario: donde el fallo sí deba verse en pantalla, hay que
 * capturarlo y pasarlo a un estado de error, no usar esto.
 * @param {string} context - Dónde ocurrió, para poder localizarlo en el log (normalmente el componente)
 * @returns {(error: unknown) => void} El manejador listo para pasar a `.catch()`
 */
export function logAsyncFailure(context: string): (error: unknown) => void {
  return (error: unknown) => {
    console.error(
      `[${context}]`,
      error instanceof Error ? `${error.name}: ${error.message}` : error,
    );
  };
}
