/** Plataforma para la que una app de autenticación ofrece un enlace de descarga. */
export type AuthenticatorPlatform = "ios" | "android" | "desktop";

/** App de autenticación en dos pasos recomendada, con sus enlaces de descarga por plataforma. */
export interface AuthenticatorApp {
  name: string;
  links: Record<AuthenticatorPlatform, string | undefined>;
}

export const AUTHENTICATOR_APPS: AuthenticatorApp[] = [
  {
    name: "Google Authenticator",
    links: {
      ios: "https://apps.apple.com/app/google-authenticator/id388497605",
      android: "https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2",
      desktop: undefined,
    },
  },
  {
    name: "Microsoft Authenticator",
    links: {
      ios: "https://apps.apple.com/app/microsoft-authenticator/id983156458",
      android: "https://play.google.com/store/apps/details?id=com.azure.authenticator",
      desktop: undefined,
    },
  },
];
