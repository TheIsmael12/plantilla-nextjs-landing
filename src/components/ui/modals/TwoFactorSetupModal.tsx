"use client";

import "@/styles/04-components/ui/modals/two-factor-setup-modal.scss";

import { useEffect, useState } from "react";

import { useTranslations } from "next-intl";

import { setupTwoFactor, verifyTwoFactorSetup } from "@/actions/profile/security-actions";
import { AUTHENTICATOR_APPS, type AuthenticatorPlatform } from "@/constants/authenticatorApps";
import { HTTPStatus } from "@/constants/httpStatus";
import { copyToClipboard } from "@/utils/clipboardUtils";
import { parseUserAgent } from "@/utils/userAgentUtils";

import ModalComponent from "@/components/ui/modals/ModalComponent";
import OtpCodeModal from "@/components/ui/modals/OtpCodeModal";

import type { TwoFactorSetupModalProps } from "@/types/ui/modals/two-factor-setup-modal";
import type { TwoFactorSetupData } from "@/types/profile/security";

import { CheckIcon, CopyIcon, DownloadIcon } from "lucide-react";

type Step = "loading" | "scan" | "confirm";

/**
 * Detecta la plataforma del usuario a partir de `navigator.userAgent`
 * (reutilizando `parseUserAgent`, `utils/userAgentUtils.ts`) para elegir el
 * enlace de descarga correcto en el catálogo de apps autenticadoras.
 * `desktop` por defecto: ni SSR ni un SO no reconocido tienen enlace de
 * tienda móvil que ofrecer.
 * @returns {AuthenticatorPlatform} La plataforma detectada
 */
function detectPlatform(): AuthenticatorPlatform {
  /* v8 ignore next -- guarda de SSR: en este entorno de test (Chromium real
   * vía `@storybook/addon-vitest`) `navigator` siempre existe; forzarlo a
   * `undefined` a nivel global para cubrir esta rama arriesgaría desestabilizar
   * el resto de la suite (otras librerías/el propio runner lo referencian
   * durante el render de otros componentes en la misma pestaña). */
  if (typeof navigator === "undefined") return "desktop";

  const { os } = parseUserAgent(navigator.userAgent);
  if (os === "iOS") return "ios";
  if (os === "Android") return "android";
  return "desktop";
}

/**
 * Alta de la verificación en dos pasos en 2 pasos: primero pide el secreto y
 * el QR a `setupTwoFactor()` y los muestra junto a una explicación de cómo
 * configurarlo y un catálogo de apps autenticadoras recomendadas, con su
 * enlace de descarga según la plataforma detectada (`step: "scan"`); luego
 * reutiliza `OtpCodeModal` para confirmar con el código generado por la
 * aplicación autenticadora (`step: "confirm"`) — el mismo modal de código de
 * 6 dígitos que usa el reto MFA del login.
 * @param {TwoFactorSetupModalProps} props - Propiedades del modal
 * @returns {JSX.Element} El modal de alta de verificación en dos pasos
 */
export default function TwoFactorSetupModal({ onClose, onVerified }: TwoFactorSetupModalProps) {
  const t = useTranslations("Views.Profile.Security.TwoFactor.Setup");
  const tErrors = useTranslations("Common.Errors");

  const [step, setStep] = useState<Step>("loading");
  const [setupData, setSetupData] = useState<TwoFactorSetupData | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [copied, setCopied] = useState(false);
  const [platform] = useState(detectPlatform);

  // Sin `isOpen`: este componente solo existe montado mientras el modal debe
  // mostrarse (lo controla el padre), así que arranca la petición una sola
  // vez, sin necesidad de resetear estado en cada apertura.
  useEffect(() => {
    let active = true;

    setupTwoFactor().then((response) => {
      if (!active) return;

      if (response.data) {
        setSetupData(response.data);
      } else {
        setError(response.message ?? tErrors("unexpectedError"));
      }
      setStep("scan");
    });

    return () => {
      active = false;
    };
  }, [tErrors]);

  const handleCopySecret = async () => {
    /* v8 ignore next -- guarda defensiva inalcanzable vía interacción real: el
     * botón que invoca este handler solo se renderiza dentro de
     * `{setupData && (...)}`, y `setupData` nunca vuelve a `null` una vez
     * fijado, así que en la práctica siempre es verdadero al llegar aquí. */
    if (!setupData) return;
    setCopied(await copyToClipboard(setupData.secret));
  };

  const handleVerify = async (code: string): Promise<string | void> => {
    const response = await verifyTwoFactorSetup(code);

    if (response.status === HTTPStatus.OK) {
      await onVerified();
      return;
    }

    return response.message ?? tErrors("unexpectedError");
  };

  if (step === "confirm") {
    return (
      <OtpCodeModal
        isOpen
        title={t("confirmTitle")}
        description={t("confirmDescription")}
        onClose={onClose}
        onSubmit={handleVerify}
      />
    );
  }

  return (
    <ModalComponent
      title={t("scanTitle")}
      isOpen
      isLarge
      onClose={onClose}
      closeOnOutsideClick={false}
      onConfirm={setupData ? () => setStep("confirm") : undefined}
      confirmVariant="primary"
      confirmText="continue"
      footerError={error}
    >
      <div className="two-factor-setup-modal">
        {step === "loading" && (
          <p className="two-factor-setup-modal__loading">{t("loadingSetup")}</p>
        )}

        {setupData && (
          <>
            <ol className="two-factor-setup-modal__steps">
              <li>{t("step1")}</li>
              <li>{t("step2")}</li>
              <li>{t("step3")}</li>
            </ol>

            <div className="two-factor-setup-modal__body">
              <div className="two-factor-setup-modal__apps">
                <p className="two-factor-setup-modal__section-title">{t("appsTitle")}</p>

                <ul className="two-factor-setup-modal__apps-list">
                  {AUTHENTICATOR_APPS.map((app) => {
                    const link = app.links[platform];

                    return (
                      <li key={app.name} className="two-factor-setup-modal__app">
                        <span className="two-factor-setup-modal__app-name">{app.name}</span>

                        {link ? (
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="two-factor-setup-modal__app-link"
                          >
                            <DownloadIcon />
                            {t("download")}
                          </a>
                        ) : (
                          <span className="two-factor-setup-modal__app-unavailable">
                            {t("mobileOnly")}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="two-factor-setup-modal__qr-section">
                <p className="two-factor-setup-modal__section-title">{t("scanDescription")}</p>

                <div className="two-factor-setup-modal__qr">
                  {/* eslint-disable-next-line @next/next/no-img-element -- data URI, no se beneficia de next/image */}
                  <img src={setupData.qrDataUri} alt="" width={180} height={180} />
                </div>

                <p className="two-factor-setup-modal__manual">{t("manualEntry")}</p>

                <button
                  type="button"
                  className="two-factor-setup-modal__secret"
                  onClick={handleCopySecret}
                >
                  <span>{setupData.secret}</span>
                  {copied ? <CheckIcon /> : <CopyIcon />}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </ModalComponent>
  );
}
