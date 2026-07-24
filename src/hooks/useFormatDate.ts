"use client";

import { useMemo } from "react";

import { useLocale } from "next-intl";

/**
 * API devuelta por {@link useFormatDate}.
 * @interface UseFormatDateResult
 * @property {(date: Date | string) => string} formatDate - Formatea solo la parte de fecha (día, mes y año)
 * @property {(date: Date | string) => string} formatTime - Formatea solo la parte de hora (hora y minutos)
 * @property {(date: Date | string) => string} formatDateTime - Formatea fecha y hora combinadas
 */
export interface UseFormatDateResult {
  formatDate: (date: Date | string) => string;
  formatTime: (date: Date | string) => string;
  formatDateTime: (date: Date | string) => string;
}

/**
 * Formatea fechas según la preferencia activa del usuario
 * @returns {UseFormatDateResult} Funciones de formateo de fecha/hora/fecha-hora
 */
export default function useFormatDate(): UseFormatDateResult {
  const locale = useLocale();

  return useMemo(() => {
    const toDate = (date: Date | string): Date =>
      date instanceof Date ? date : new Date(date);

    return {
      formatDate: (date) =>
        new Intl.DateTimeFormat(locale, { dateStyle: "short" }).format(toDate(date)),
      formatTime: (date) =>
        new Intl.DateTimeFormat(locale, { timeStyle: "short" }).format(toDate(date)),
      formatDateTime: (date) =>
        new Intl.DateTimeFormat(locale, {
          dateStyle: "short",
          timeStyle: "short",
        }).format(toDate(date)),
    };
  }, [locale]);
}