"use client";

import { useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { FileTextIcon, PenLineIcon, UploadIcon } from "lucide-react";

import { uploadSignedContract } from "@/actions/client-portal/contracts-actions";
import { isErrorStatus } from "@/utils/httpStatusUtils";
import { notifyResponse } from "@/utils/toastUtils";
import { formatCommunityDateTime } from "@/utils/communityFormatUtils";

import Alert from "@/components/ui/alerts/Alert";
import Badge from "@/components/ui/buttons/Badge";
import Button from "@/components/ui/buttons/Button";
import EmptyState from "@/components/ui/errors/EmptyState";

import type { PendingContract } from "@/types/client-portal/contracts";

import "@/styles/04-components/client-area/pending-contracts.scss";

interface PendingContractsSectionProps {
  initialContracts: PendingContract[];
  locale: string;
}

/**
 * Los contratos que el cliente tiene pendientes de firmar (requisitos-servicios.md, sección 3.9.7.1).
 *
 * Antes esto no existía: la firma era algo que le ocurría al cliente por correo, y su área solo servía para
 * descargarse el contrato **ya firmado**. Quien perdía ese correo no tenía a dónde ir.
 *
 * Aquí tiene las tres cosas que puede hacer, en el orden en que se hacen: **leerlo**, **firmarlo** y, si
 * prefiere hacerlo en papel, **entregarlo**. Firmar electrónicamente es abrir la página del proveedor —es él
 * quien identifica al firmante, y eso es lo que hace que la firma valga—, así que aquí no se firma nada: se
 * lleva hasta donde se firma.
 *
 * Y lo que sube **no cierra el contrato**. Sigue apareciendo pendiente, con el aviso de que hay un documento
 * esperando: alguien de la empresa tiene que abrirlo y comprobar que está firmado de verdad. Decir «ya está»
 * cuando no lo está sería peor que no decir nada — el cliente se iría creyendo que ha terminado.
 * @param {PendingContractsSectionProps} props - Lo que hay pendiente y el locale
 * @returns {JSX.Element} La sección renderizada
 */
export default function PendingContractsSection({
  initialContracts,
  locale,
}: PendingContractsSectionProps) {
  const t = useTranslations("Views.ClientArea.Contracts");
  const tCommon = useTranslations("Views.ClientArea.Common");

  const [contracts, setContracts] = useState(initialContracts);
  const [isWorking, startWork] = useTransition();

  /*
   * Un `input` de fichero por contrato, escondido.
   *
   * Es lo que permite que el botón sea un botón y no una caja de subida: el navegador solo abre el
   * selector de ficheros desde un `input`, y una caja de arrastrar y soltar en cada fila convertiría una
   * lista de tres contratos en tres formularios.
   */
  const inputs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleUpload = (contractId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    startWork(async () => {
      const response = await uploadSignedContract(contractId, formData);

      notifyResponse(response, t("uploadError"));

      if (isErrorStatus(response.status)) return;

      setContracts(response.data ?? []);
    });
  };

  if (contracts.length === 0) {
    return (
      <EmptyState title={t("empty")} description={t("emptyDescription")} />
    );
  }

  return (
    <section className="pending-contracts">
      <p className="pending-contracts__intro">{t("description")}</p>

      <ul className="pending-contracts__list">
        {contracts.map((contract) => (
          <li key={contract.id} className="pending-contracts__item">
            <div className="pending-contracts__head">
              <div className="pending-contracts__title">
                <span className="pending-contracts__service">
                  {contract.serviceName}
                </span>
                <span className="pending-contracts__code">
                  {contract.quoteCode}
                </span>
              </div>

              {/*
                Hasta cuándo se puede firmar.
                Es el único dato de la fila con consecuencias: pasada esa fecha el contrato caduca y hay
                que rehacerlo, así que va en insignia y no en letra pequeña.
              */}
              {contract.expiresAt && (
                <Badge
                  variant="warning"
                  text={t("expiresAt", {
                    date: formatCommunityDateTime(
                      contract.expiresAt,
                      locale,
                      tCommon("notAvailable"),
                    ),
                  })}
                />
              )}
            </div>

            {/*
              Lo que subió no valía, y por qué.
              Sin esto, descartarlo dejaba su pantalla exactamente igual que si el envío se hubiera
              perdido: la reacción natural es volver a subir lo mismo y que la cosa se repita.
            */}
            {!contract.hasPendingUpload && contract.rejectedAt && (
              <Alert
                type="warning"
                message={
                  contract.rejectedReason
                    ? t("rejectedWithReason", {
                        reason: contract.rejectedReason,
                      })
                    : t("rejected")
                }
              />
            )}

            {/* Ya ha entregado algo: se dice, para que no lo suba tres veces creyendo que no llegó. */}
            {contract.hasPendingUpload && (
              <Alert
                type="info"
                message={t("pendingReview", {
                  date: formatCommunityDateTime(
                    contract.uploadedAt,
                    locale,
                    tCommon("notAvailable"),
                  ),
                })}
              />
            )}

            <div className="pending-contracts__actions">
              <Button
                variant="outline"
                title="viewDocument"
                onClick={() =>
                  window.open(
                    `/api/client-portal/contracts/${contract.id}/pdf`,
                    "_blank",
                  )
                }
              >
                <FileTextIcon />
              </Button>

              {/*
                Firmar es ir a donde se firma.
                El botón solo sale si el proveedor ha dado su página: sin ella, un enlace que no lleva a
                ninguna parte es peor que no ofrecer el botón.
              */}
              {contract.signUrl && (
                <Button
                  variant="primary"
                  title="signContract"
                  onClick={() => window.open(contract.signUrl, "_blank")}
                >
                  <PenLineIcon />
                </Button>
              )}

              <Button
                variant="outline"
                title="uploadSignedContract"
                disabled={isWorking}
                onClick={() => inputs.current[contract.id]?.click()}
              >
                <UploadIcon />
              </Button>

              <input
                ref={(element) => {
                  inputs.current[contract.id] = element;
                }}
                type="file"
                accept="application/pdf"
                hidden
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) handleUpload(contract.id, file);
                  // Se limpia para que volver a elegir el mismo fichero dispare el `change` otra vez.
                  event.target.value = "";
                }}
              />
            </div>

            {/* A nombre de quién está la firma que toca ahora: firman en cadena, no a la vez. */}
            {contract.signerEmail && (
              <p className="pending-contracts__signer">
                {t("waitingFor", { email: contract.signerEmail })}
              </p>
            )}
          </li>
        ))}
      </ul>

      <p className="pending-contracts__note">{t("uploadNote")}</p>
    </section>
  );
}
