import type { Metadata } from "next";

import { ThemeProvider } from "next-themes";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale, getMessages } from "next-intl/server";

import { Fraunces, Public_Sans } from "next/font/google";

import OrganizationJsonLd from "@/components/seo/OrganizationJsonLd";
import CookieConsentController from "@/components/ui/cookies/CookieConsentController";

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

    return (

        <html lang={locale} suppressHydrationWarning className={`${fraunces.variable} ${publicSans.variable}`}>
            <head>
                <OrganizationJsonLd locale={locale} />
            </head>
            <body>
                <NextIntlClientProvider locale={locale} messages={messages}>
                    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                        {children}
                        <CookieConsentController />
                    </ThemeProvider>
                </NextIntlClientProvider>
            </body>
        </html>

    )

}

