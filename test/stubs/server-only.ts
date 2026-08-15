/**
 * Sustituto de `server-only` para las pruebas.
 *
 * El paquete real lo resuelve el compilador de Next y **no está instalado**, así que sin este fichero cualquier
 * módulo que lo importe no se puede ni cargar desde una prueba. Su única función es fallar en tiempo de
 * compilación si el módulo acaba en un bundle de cliente; aquí no hay bundle, así que no hace falta nada.
 */
export {};
