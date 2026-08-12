'use client';

import { useState } from 'react';

import { useTranslations } from 'next-intl';

import { DownloadIcon } from 'lucide-react';

import Button from '@/components/ui/buttons/Button';

import { notifyResponse } from '@/utils/toastUtils';

import type { FetchResponse } from '@/types/responses';
import type { PortalDocumentFile } from '@/lib/portalDocuments';

interface DocumentDownloadButtonProps {
  /** Acción de servidor que trae el documento en base64. */
  download: () => Promise<FetchResponse<PortalDocumentFile>>;
  /** Nombre con el que se guarda el fichero, sin extensión (p. ej. `FAC-000123`). */
  filename: string;
  /** Estilo del botón; por defecto `outline`, para que no compita con la acción principal de la pantalla. */
  variant?: 'primary' | 'outline';
}

/**
 * Botón para descargar el PDF de una factura o de un presupuesto.
 *
 * La descarga no es un enlace `<a href>` porque el documento es privado: hay que pedirlo al endpoint
 * autenticado, que comprueba que es de este cliente. La acción de servidor lo devuelve en base64, aquí se
 * reconstruye como `Blob`, y se pincha en un enlace temporal para que el navegador haga lo que sabe hacer
 * con un fichero —guardarlo con su nombre— en vez de abrirlo en una pestaña con una URL ilegible.
 *
 * El `objectURL` se revoca siempre, también si el clic falla: cada uno que se queda vivo retiene el PDF
 * entero en memoria hasta que se recarga la página.
 * @param {DocumentDownloadButtonProps} props - Acción de descarga y nombre del fichero
 * @returns {JSX.Element} El botón de descarga
 */
export default function DocumentDownloadButton({
  download,
  filename,
  variant = 'outline',
}: DocumentDownloadButtonProps) {
  const tErrors = useTranslations('Common.Errors');

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = () => {
    setIsDownloading(true);

    void (async () => {
      const response = await download();

      if (!response.data) {
        notifyResponse(response, tErrors('unexpectedError'));
        setIsDownloading(false);
        return;
      }

      const bytes = Uint8Array.from(atob(response.data.base64), (character) =>
        character.charCodeAt(0),
      );
      const objectUrl = URL.createObjectURL(
        new Blob([bytes], { type: response.data.mimeType || 'application/pdf' }),
      );

      try {
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = `${filename}.pdf`;
        link.click();
      } finally {
        URL.revokeObjectURL(objectUrl);
        setIsDownloading(false);
      }
    })();
  };

  return (
    <Button
      variant={variant}
      title={isDownloading ? 'downloading' : 'downloadPdf'}
      onClick={handleDownload}
      disabled={isDownloading}
    >
      {!isDownloading && <DownloadIcon />}
    </Button>
  );
}
