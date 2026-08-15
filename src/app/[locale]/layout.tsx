import type { Metadata } from "next";

import { headers } from "next/headers";

import { getServerSession } from "next-auth/next";
import { ThemeProvider } from "next-themes";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale, getMessages } from "next-intl/server";

import { Fraunces, Public_Sans } from "next/font/google";

import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import GoogleAnalytics from "@/components/seo/GoogleAnalytics";
import OrganizationJsonLd from "@/components/seo/OrganizationJsonLd";
import CookieConsentController from "@/components/ui/cookies/CookieConsentController";
import Toaster from "@/components/ui/toasts/Toaster";
import SessionAuthProvider from "@/context/SessionAuthProvider";

import { authOptions } from "@/lib/authOptions";
import { generateTranslatedMetadata } from "@/lib/generateMetadata";

const fraunces = Fraunces({
    subsets: ["latin"],
    variable: "--font-heading",
    weight: ["500", "600", "700"],
    style: ["normal"],
    display: "swap",
});

const publicSans = Public_Sans({
    subsets: ["latin"],
    variable: "--font-body",
    weight: ["400", "500", "600", "700"],
    display: "swap",
});

interface LocaleLayoutProps {
    children: React.ReactNode;
    params: Promise<{ locale: string }>
}

/**
 * Metadatos de cada página bajo `[locale]`: se recalculan en cada petición
 * (no de forma estática), así que cada ruta obtiene su propio título/
 * descripción/keywords a partir de la cabecera `x-canonical-pathname` que
 * inyecta `proxy.ts`, sin que cada `page.tsx` tenga que exportar su propio
 * `generateMetadata`.
 * @param {{ params: Promise<{ locale: string }> }} props Los parámetros de ruta con el locale
 * @returns {Promise<Metadata>} Los metadatos de la página actual
 */
export async function generateMetadata({
    params,
}: Pick<LocaleLayoutProps, "params">): Promise<Metadata> {
    const { locale } = await params;
    return generateTranslatedMetadata({ locale });
}

/**
 * Layout raíz por locale: fija el idioma de la petición, carga los mensajes
 * de i18n y envuelve la app en los providers de traducciones, tema y
 * consentimiento de cookies.
 * @param {LocaleLayoutProps} props Contenido hijo y los parámetros de ruta con el locale
 * @returns {Promise<JSX.Element>} El documento HTML renderizado
 */
export default async function LocaleLayout({
    children,
    params,
}: LocaleLayoutProps) {

    const { locale } = await params;

    setRequestLocale(locale);

    const messages = await getMessages();

    /*
     * El tema, igual que el idioma, se resuelve en el servidor, y con `forcedTheme` y no solo
     * `defaultTheme`: el script anti-flash de `next-themes` da prioridad a `localStorage` sobre
     * `defaultTheme`, así que si el navegador ya tenía otro tema guardado (de antes de iniciar sesión, o
     * de otra cuenta en el mismo dispositivo) `defaultTheme` no bastaba — se seguía viendo el tema viejo
     * del `localStorage` del dispositivo en vez del guardado en las preferencias de la persona.
     * `forcedTheme` sí gana siempre a `localStorage`, así que con sesión el tema de la persona manda desde
     * el primer frame. Sin sesión (visitante, páginas públicas) no se fuerza nada.
     *
     * Mientras `forcedTheme` tiene valor, `next-themes` ignora cualquier `setTheme` en cliente: por eso
     * `PortalThemeSection` llama `router.refresh()` al guardar, para que este layout se re-renderice con
     * el nuevo valor y `forcedTheme` cambie de verdad — sin eso el toggle de preferencias dejaría de
     * pintarse en el momento (fix anterior, más simple, que causaba esa regresión).
     */
    const session = await getServerSession(authOptions);
    const savedTheme = session?.user?.preferences?.theme;

    // El nonce que `proxy.ts` generó para esta petición (ver `config/csp.ts`):
    // sin estampárselo a este `<script>`, la CSP con `'nonce-…'` en vez de
    // `'unsafe-inline'` lo bloquearía en silencio — un script sin el nonce
    // exacto de la petición no se ejecuta, no lanza ningún error visible.
    const nonce = (await headers()).get("x-nonce") ?? undefined;

    return (

        <html lang={locale} suppressHydrationWarning className={`${fraunces.variable} ${publicSans.variable}`}>
            <head>
                {/*
                  Registra la política Trusted Types "default" antes de que cargue nada más.
                  La CSP de producción (`config/csp.ts`) lleva `require-trusted-types-for 'script'`:
                  sin una política llamada justo "default", el propio runtime de React/Next
                  (hidratación, algún `innerHTML` interno) queda bloqueado con
                  «This document requires 'TrustedHTML' assignment» — no es solo software de
                  terceros, rompe el bundle propio. Con "default" registrada, el navegador la usa
                  automáticamente para cualquier asignación que no pase ya por una política explícita.
                  Se define aquí y no en un componente cliente: un componente se ejecuta después de la
                  hidratación, que es justo lo que hay que cubrir.
                */}
                <script
                    nonce={nonce}
                    dangerouslySetInnerHTML={{
                        __html: `if (window.trustedTypes && window.trustedTypes.createPolicy) {
  try {
    window.trustedTypes.createPolicy("default", {
      createHTML: (s) => s,
      createScript: (s) => s,
      createScriptURL: (s) => s,
    });
  } catch (e) {}
}`,
                    }}
                />
                <OrganizationJsonLd locale={locale} />
                <BreadcrumbJsonLd locale={locale} />
            </head>
            <body>
                <NextIntlClientProvider locale={locale} messages={messages}>
                    <SessionAuthProvider>
                        <ThemeProvider
                            attribute="class"
                            defaultTheme={savedTheme ?? "system"}
                            forcedTheme={savedTheme}
                            nonce={nonce}
                            enableSystem
                        >
                            {children}
                            <CookieConsentController />
                            <Toaster />
                        </ThemeProvider>
                    </SessionAuthProvider>
                </NextIntlClientProvider>
                <GoogleAnalytics nonce={nonce} />
            </body>
        </html>

    )

}

