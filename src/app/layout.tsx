import '@/styles/globals.scss'

import { PropsWithChildren } from 'react';

/**
 * Layout raíz de Next.js: delega toda la maquetación al layout por locale y
 * se limita a pasar los hijos, ya que el `<html>`/`<body>` se define ahí.
 * @param {PropsWithChildren} props Contenido hijo a renderizar
 * @returns {React.ReactNode} El contenido hijo renderizado
 */
export default function RootLayout({
  children
}: PropsWithChildren) {
  return children;
}
