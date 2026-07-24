"use client";

import "@/styles/04-components/ui/toasts/toast.scss";

import { useEffect, useRef, useState } from "react";

import { useTranslations } from "next-intl";

import { TOAST_DEFAULT_POSITION } from "@/config/settings";
import { ALERT_ICONS } from "@/constants/ui/alerts";
import { subscribeToToasts, toast } from "@/lib/toast";
import type { ToasterProps, ToastItem } from "@/types/ui/toasts/toast";

import { XIcon } from "lucide-react";

/**
 * Contenedor de toasts flotantes: se suscribe a `lib/toast.ts` y renderiza la
 * pila activa en la esquina indicada por `position` (por defecto
 * {@link TOAST_DEFAULT_POSITION}, `config/settings.ts`), con autocierre
 * individual por temporizador. Se monta una única vez en
 * `app/[locale]/layout.tsx`; el resto de la app dispara toasts de forma
 * imperativa con `toast.success()`/`toast.error()`/etc., sin necesidad de
 * renderizar nada más.
 * @param {ToasterProps} props - Propiedades del componente
 * @returns {JSX.Element | null} La pila de toasts activos, o `null` si no hay ninguno
 */
export default function Toaster({ position = TOAST_DEFAULT_POSITION }: ToasterProps) {
  const t = useTranslations("Common.Toast");
  const [items, setItems] = useState<ToastItem[]>([]);
  const timers = useRef(new Map<number, number>());

  useEffect(() => subscribeToToasts(setItems), []);

  // Arranca un temporizador por toast nuevo (una sola vez) y limpia el de los
  // que ya se cerraron; si se reconstruyera en cada cambio, un toast a mitad
  // de su tiempo de vida vería su cuenta atrás reiniciada cada vez que
  // apareciera o desapareciera otro toast distinto.
  useEffect(() => {
    const activeIds = new Set(items.map((item) => item.id));

    timers.current.forEach((timer, id) => {
      if (!activeIds.has(id)) {
        window.clearTimeout(timer);
        timers.current.delete(id);
      }
    });

    items.forEach((item) => {
      if (timers.current.has(item.id)) return;
      timers.current.set(
        item.id,
        window.setTimeout(() => toast.dismiss(item.id), item.duration),
      );
    });
  }, [items]);

  if (items.length === 0) return null;

  return (
    <div
      className={`toaster toaster--${position}`}
      role="region"
      aria-label={t("region", { position: t(`positions.${position}`) })}
    >
      {items.map((item) => {
        const Icon = ALERT_ICONS[item.type];

        return (
          <div key={item.id} role="status" className={`toast toast--${item.type}`}>
            <Icon className="toast__icon" aria-hidden="true" />
            <p className="toast__message">{item.message}</p>
            <button
              type="button"
              className="toast__close"
              aria-label={t("close")}
              onClick={() => toast.dismiss(item.id)}
            >
              <XIcon aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
