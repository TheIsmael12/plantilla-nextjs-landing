import NotFound from '@/components/ui/errors/NotFound';

/**
 * Página 404 del sitio público: se renderiza tanto para rutas que no
 * existen bajo un locale como cuando una página llama a `notFound()`
 * (por ejemplo, un slug de servicio inválido). Hereda `Navbar`/`Footer`
 * del layout público.
 * @returns {JSX.Element} La página 404 renderizada
 */
export default function PublicNotFound() {
    return (
        <main>
            <NotFound className="not-found--embedded" />
        </main>
    )
}
