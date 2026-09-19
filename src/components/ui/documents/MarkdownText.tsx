import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import '@/styles/04-components/documents/markdownText.scss';

/**
 * Texto largo de un documento (notas, condiciones de contrato) escrito en
 * Markdown desde la intranet, renderizado tal cual en el área de cliente.
 *
 * Sin `rehypeSlug` a diferencia de {@link BlogPostBody}: aquí no hay tabla de
 * contenidos que enlazar a los encabezados. `react-markdown` no interpreta
 * HTML embebido por defecto, así que el contenido queda saneado sin pasos
 * adicionales.
 * @param {MarkdownTextProps} props - Propiedades del componente
 * @returns {JSX.Element} El texto renderizado
 */
export default function MarkdownText({ text }: MarkdownTextProps) {
  return (
    <div className="markdown-text">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
    </div>
  );
}
