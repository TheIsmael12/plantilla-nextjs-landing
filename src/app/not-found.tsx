import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

import { routing } from "@/i18n/routing";
import NotFound from "@/components/ui/errors/NotFound";

/**
 * `not-found` global de la raíz de la app: fuera de `[locale]`, Next.js no
 * tiene un locale de ruta que resolver, así que monta su propio
 * `<html>`/`<body>` y fuerza `routing.defaultLocale` para poder usar
 * `next-intl` (necesario para traducir {@link NotFound}) sin depender del
 * middleware de locales.
 * @returns {Promise<JSX.Element>} La página de error 404 global, en el locale por defecto
 */
export default async function GlobalNotFound() {
    const locale = routing.defaultLocale;
    const messages = await getMessages({ locale });

    return (
        <html lang={locale}>
            <body>
                <NextIntlClientProvider locale={locale} messages={messages}>
                    <main>
                        <NotFound />
                    </main>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
