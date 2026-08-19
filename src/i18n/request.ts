import { cookies } from "next/headers";

import { getRequestConfig } from "next-intl/server";

import { DEFAULT_LOCALE, LOCALE_COOKIE_NAME } from "@/config/locales";

async function loadMessages(locale: string) {
  const messages = await import(`@/i18n/locales/${locale}`);
  return messages.default || messages;
}

export default getRequestConfig(async () => {

  const store = await cookies();
  const locale = store.get(LOCALE_COOKIE_NAME)?.value || DEFAULT_LOCALE;

  return {
    locale,
    messages: await loadMessages(locale),
  };
});
