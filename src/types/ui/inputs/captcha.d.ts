/**
 * API mínima que expone el script de Cloudflare Turnstile en `window.turnstile`,
 * y la única que usa {@link Captcha}: renderizar el widget en un contenedor.
 * @interface CaptchaWidgetApi
 * @property {(container: HTMLElement, options: { sitekey: string, callback: (token: string) => void, "expired-callback"?: () => void, "error-callback"?: () => void }) => string} render - Pinta el widget y devuelve su identificador
 */
interface CaptchaWidgetApi {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      callback: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
    },
  ) => string;
}

/**
 * Props de {@link Captcha}.
 * @interface CaptchaProps
 * @property {(token: string) => void} onVerify - Recibe el token cuando el visitante resuelve el reto
 * @property {() => void} [onExpire] - Se invoca cuando el token caduca o el widget falla, para que el llamador lo descarte
 * @property {string} [className] - Clases CSS adicionales del contenedor
 */
interface CaptchaProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  className?: string;
}
