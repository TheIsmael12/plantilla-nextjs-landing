"use client";

import "@/styles/04-components/ui/modals/backup-codes-modal.scss";

import { useState } from "react";

import { useTranslations } from "next-intl";

import { copyToClipboard } from "@/utils/clipboardUtils";
import { downloadTextFile } from "@/utils/fileDownloadUtils";

import Button from "@/components/ui/buttons/Button";
import ModalComponent from "@/components/ui/modals/ModalComponent";

import type { BackupCodesModalProps } from "@/types/ui/modals/backup-codes-modal";

import { CheckIcon, CopyIcon, DownloadIcon } from "lucide-react";

/**
 * Muestra un lote de códigos de recuperación una única vez (tras activar o
 * regenerar la verificación en dos pasos, §7.1 requisitos.md), con opción de
 * copiarlos o descargarlos como fichero de texto antes de cerrar el modal —
 * no habrá otra oportunidad de verlos.
 * @param {BackupCodesModalProps} props - Propiedades del modal
 * @returns {JSX.Element} El modal de códigos de recuperación
 */
export default function BackupCodesModal({ codes, onClose }: BackupCodesModalProps) {
  const t = useTranslations("Views.Profile.Security.TwoFactor.BackupCodes");

  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    setCopied(await copyToClipboard(codes.join("\n")));
  };

  const handleDownload = () => {
    downloadTextFile(t("fileName"), codes.join("\n"));
  };

  return (
    <ModalComponent
      title={t("title")}
      isOpen
      onClose={onClose}
      closeOnOutsideClick={false}
      onConfirm={onClose}
      confirmVariant="primary"
      confirmText="done"
    >
      <div className="backup-codes-modal">
        <p className="backup-codes-modal__description">{t("description")}</p>

        <ul className="backup-codes-modal__list">
          {codes.map((code) => (
            <li key={code} className="backup-codes-modal__code">
              {code}
            </li>
          ))}
        </ul>

        <div className="backup-codes-modal__actions">
          <Button
            title={copied ? "copied" : "copy"}
            variant="outline"
            onClick={handleCopy}
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
          </Button>

          <Button title="download" variant="outline" onClick={handleDownload}>
            <DownloadIcon />
          </Button>
        </div>
      </div>
    </ModalComponent>
  );
}
