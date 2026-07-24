import { notFound } from "next/navigation";

/**
 * Comodín de `(intranet)`: cualquier ruta no reconocida dentro del área
 * privada cae aquí y dispara el `not-found.tsx` de este mismo segmento (con
 * el shell de la intranet), en vez del genérico de la raíz de `[locale]`.
 * @returns {never} Nunca devuelve: `notFound()` interrumpe el render
 */
export default function IntranetCatchAll() {
  notFound();
}
