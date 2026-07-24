import { defineRouting } from "next-intl/routing";

import { locales, pathnames } from "@/config/pathnames";
import { DEFAULT_LOCALE } from "@/config/locales";

export const routing = defineRouting({
  locales,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: "as-needed",
  pathnames,
});
