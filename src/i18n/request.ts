import { cookies } from "next/headers";

import { getRequestConfig } from "next-intl/server";

import { DEFAULT_LOCALE } from "@/config/locales";

async function loadMessages(locale: string) {
  const messages = await import(`@/i18n/locales/${locale}`);
  return messages.default || messages;
}

export default getRequestConfig(async () => {

  const store = await cookies();
  const locale = store.get("NEXT_LOCALE")?.value || DEFAULT_LOCALE;

  return {
    locale,
    messages: await loadMessages(locale),
  };
});
