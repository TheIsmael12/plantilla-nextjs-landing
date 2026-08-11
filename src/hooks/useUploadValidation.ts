"use client";

import { useCallback } from "react";

import { useTranslations } from "next-intl";

import type { UploadZone } from "@/constants/ui/files";
import { toast } from "@/lib/toast";
import { validateUpload } from "@/utils/fileUtils";

/**
 * Filtra el fichero recién elegido por el límite de su zona de subida
 * ({@link UPLOAD_LIMITS}): si no cumple, avisa con un toast y devuelve `null`,
 * de forma que el llamador guarde la selección sin más comprobaciones.
 *
 * Se valida al **elegir** el fichero, no al enviar el formulario: así el
 * usuario se entera antes de rellenar el resto y no se gasta una subida de 20 MB
 * para recibir un error. La API vuelve a validarlo de todas formas — esto es
 * interfaz, no autorización.
 * @param {UploadZone} zone - Zona a la que va el fichero, con su límite y sus tipos
 * @returns {(file: File | null | undefined) => File | null} Devuelve el fichero si es válido, o `null` (avisando) si no
 */
export function useUploadValidation(
  zone: UploadZone,
): (file: File | null | undefined) => File | null {
  const t = useTranslations("Common.FileUpload");

  return useCallback(
    (file: File | null | undefined) => {
      if (!file) return null;

      const uploadError = validateUpload(file, zone);
      if (!uploadError) return file;

      toast.error(
        uploadError.key === "fileTooLarge"
          ? t("fileTooLargeForZone", { maxSize: uploadError.maxSizeMB })
          : t("invalidTypeForZone"),
      );

      return null;
    },
    [zone, t],
  );
}
