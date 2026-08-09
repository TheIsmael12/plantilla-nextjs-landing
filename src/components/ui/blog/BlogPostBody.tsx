import ReactMarkdown from 'react-markdown';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';

import '@/styles/04-components/blog/blogPostBody.scss';

/**
 * Cuerpo de un post, convertido de Markdown a HTML. `react-markdown` no
 * renderiza HTML embebido por defecto (sin `rehype-raw`), así que el
 * contenido queda saneado sin pasos adicionales. `rehype-slug` genera el
 * `id` de cada encabezado con el mismo algoritmo (github-slugger) que usa
 * el backend para calcular `headings[].anchor`, así que los enlaces de
 * {@link BlogPostToc} apuntan al lugar correcto sin configuración adicional.
 * @param {BlogPostBodyProps} props - Propiedades del componente
 * @returns {JSX.Element} El cuerpo del post renderizado
 */
export default function BlogPostBody({ body }: BlogPostBodyProps) {
  return (
    <div className="blog__prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug]}
        components={{
          a: ({ href, children }) => (
            <a href={href} target={href?.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {body}
      </ReactMarkdown>
    </div>
  );
}
