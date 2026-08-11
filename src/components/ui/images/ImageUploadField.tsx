"use client";

import "@/styles/04-components/ui/images/image-upload-field.scss";

import { useRef, useState } from "react";

import { useTranslations } from "next-intl";

import { ImageIcon, Trash2Icon } from "lucide-react";

import BackendImage from "@/components/ui/images/BackendImage";
import Button from "@/components/ui/buttons/Button";
import ModalComponent from "@/components/ui/modals/ModalComponent";

import { UPLOAD_LIMITS, uploadAccept, type UploadZone } from "@/constants/ui/files";
import { useUploadValidation } from "@/hooks/useUploadValidation";

/**
 * Props de {@link ImageUploadField}.
 * @interface ImageUploadFieldProps
 * @property {string | null} src - URL de la imagen que hay ahora, o `null` si no hay ninguna
 * @property {string} alt - Texto alternativo de la imagen; describe qué se ve, no «logo»
 * @property {UploadZone} [zone] - Zona de subida cuyos límites se aplican y se anuncian; por defecto `companyLogo`
 * @property {(file: File) => void} onUpload - Se llama con el fichero **ya validado** (tipo y tamaño)
 * @property {() => void} [onRemove] - Se llama al confirmar el borrado; sin ella no se ofrece quitar la imagen
 * @property {boolean} [isBusy] - Hay una subida o un borrado en marcha: deshabilita todo y cambia el texto del botón
 * @property {boolean} [disabled] - Sin permiso para cambiarla: se ve la imagen y no se ofrece ninguna acción
 * @property {string} [confirmRemoveTitle] - Título del modal de confirmación al quitar
 * @property {string} [confirmRemoveDescription] - Texto del modal de confirmación al quitar
 */
export interface ImageUploadFieldProps {
  src: string | null;
  alt: string;
  zone?: UploadZone;
  onUpload: (file: File) => void;
  onRemove?: () => void;
  isBusy?: boolean;
  disabled?: boolean;
  confirmRemoveTitle?: string;
  confirmRemoveDescription?: string;
}

/**
 * Campo para subir una imagen: la que hay, los límites, elegir otra y quitarla.
 *
 * Es el mecanismo que la intranet tiene para el logo de la empresa, aquí como **componente** en vez de suelto
 * dentro de una pantalla: la vista previa, la validación al elegir, el aviso de formatos y la confirmación
 * antes de borrar son siempre los mismos, y repetirlos en cada sitio es como se acaban comportando distinto.
 *
 * Dos detalles que no son de adorno:
 *
 * - **Los formatos y el tamaño se dicen antes de abrir el diálogo de ficheros**, y salen de `UPLOAD_LIMITS`, no
 *   de un texto escrito a mano. Enterarse de que el límite son 2 MB después de elegir un PNG de 8 es gastar la
 *   subida entera para recibir un error, y un texto fijo se queda desfasado en cuanto cambia el límite.
 * - **Se valida al elegir, no al enviar**, con el mismo hook que la intranet. La API lo vuelve a comprobar de
 *   todos modos: esto es interfaz, no autorización.
 *
 * Quitar la imagen pasa por una confirmación porque no se puede deshacer: quien la borre tendrá que volver a
 * buscar el fichero original, que a veces no está a mano.
 * @param {ImageUploadFieldProps} props - Imagen actual, zona de subida y qué hacer al subir o quitar
 * @returns {JSX.Element} El campo de imagen renderizado
 */
export default function ImageUploadField({
  src,
  alt,
  zone = "companyLogo",
  onUpload,
  onRemove,
  isBusy = false,
  disabled = false,
  confirmRemoveTitle,
  confirmRemoveDescription,
}: ImageUploadFieldProps) {
  const t = useTranslations("Common.ImageUpload");

  const inputRef = useRef<HTMLInputElement>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const validateSelection = useUploadValidation(zone);
  const limits = UPLOAD_LIMITS[zone];

  const handleChange = () => {
    const file = validateSelection(inputRef.current?.files?.[0]);

    // El input se vacía siempre: si no, elegir el mismo fichero otra vez no dispara `change` y parece
    // que la aplicación ha ignorado el clic.
    if (inputRef.current) inputRef.current.value = "";
    if (file) onUpload(file);
  };

  return (
    <div className="image-upload">
      <BackendImage
        src={src}
        alt={alt}
        className="image-upload__preview"
        fallback={<ImageIcon />}
      />

      {!disabled && (
        <div className="image-upload__actions">
          <p className="image-upload__hint">
            {t("hint", {
              formats: limits.extensions.join(", "),
              maxSizeMB: limits.maxSizeMB,
            })}
          </p>

          <div className="image-upload__buttons">
            <Button
              variant="outline"
              title={isBusy ? "changingPhoto" : "changePhoto"}
              onClick={() => inputRef.current?.click()}
              disabled={isBusy}
            />

            {src && onRemove && (
              <Button
                variant="error"
                title="removePhoto"
                onClick={() => setIsConfirmOpen(true)}
                disabled={isBusy}
              >
                <Trash2Icon />
              </Button>
            )}
          </div>

          {/*
            `sr-only` y no `hidden`: un input oculto con `hidden` no es enfocable, así que quien navega con
            teclado no puede llegar a él ni oír qué formatos acepta. Se abre desde el botón de al lado.
          */}
          <input
            ref={inputRef}
            type="file"
            accept={uploadAccept(zone)}
            onChange={handleChange}
            disabled={isBusy}
            className="sr-only"
            aria-label={t("chooseImage")}
          />
        </div>
      )}

      {isConfirmOpen && onRemove && (
        <ModalComponent
          isOpen
          title={confirmRemoveTitle ?? t("confirmRemoveTitle")}
          isLoading={isBusy}
          confirmVariant="error"
          confirmText="delete"
          isLoadingText="deleting"
          onClose={() => setIsConfirmOpen(false)}
          onCancel={() => setIsConfirmOpen(false)}
          onConfirm={() => {
            setIsConfirmOpen(false);
            onRemove();
          }}
        >
          <p>{confirmRemoveDescription ?? t("confirmRemoveDescription")}</p>
        </ModalComponent>
      )}
    </div>
  );
}
