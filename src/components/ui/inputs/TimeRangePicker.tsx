"use client";

import "@/styles/04-components/ui/inputs/time-range-picker.scss";

import { useState } from "react";

import { useTranslations } from "next-intl";

import type { TimeRangePickerProps } from "@/types/ui/inputs/time-range-picker";

import { ClockIcon } from "lucide-react";

/** Una hora válida del reloj de 24 horas, con los dos puntos ya puestos. */
const HHMM = /^([01]\d|2[0-3]):([0-5]\d)$/;

/**
 * Parte lo tecleado en hora y minutos, quedándose solo con los dígitos.
 *
 * Con tres dígitos hay que decidir: `930` son las nueve y media, no las noventa y tres. La regla es
 * mirar si los dos primeros dígitos son una hora del reloj; si no lo son, el primero es la hora.
 * Así `0830` es 08:30 y `930` es 9:30, que es como se teclea una hora cuando se llevan cincuenta
 * tramos seguidos y no se va saltando al separador.
 * @param {string} text - Lo que el usuario acaba de teclear
 * @returns {{hh: string, mm: string}} Los dos trozos, todavía sin rellenar
 */
function splitTime(text: string): { hh: string; mm: string } {
  const digits = text.replace(/\D/g, "").slice(0, 4);

  if (digits.length <= 2) return { hh: digits, mm: "" };

  return Number(digits.slice(0, 2)) <= 23
    ? { hh: digits.slice(0, 2), mm: digits.slice(2) }
    : { hh: digits.slice(0, 1), mm: digits.slice(1, 3) };
}

/**
 * Lo tecleado, con los dos puntos ya puestos, tal y como se ve mientras se escribe.
 * @param {string} text - Lo que el usuario acaba de teclear
 * @returns {string} El texto normalizado, como mucho `HH:MM`
 */
function withTimeFormat(text: string): string {
  const { hh, mm } = splitTime(text);

  return mm === "" ? hh : `${hh}:${mm}`;
}

/**
 * Completa lo tecleado a una hora válida, o devuelve `null` si no hay forma.
 *
 * `9` se entiende como las 09:00 y `9:3` como las 09:30, porque es lo que quiere decir quien lo
 * escribe. Lo que no se hace es adivinar sobre horas imposibles: `99` no es ninguna hora, y
 * convertirla en algo sería peor que rechazarla.
 * @param {string} text - Lo tecleado
 * @returns {string|null} La hora en `HH:MM`, o `null` si no lo es
 */
function toValidTime(text: string): string | null {
  const { hh, mm } = splitTime(text);
  if (hh === "") return null;

  const complete = `${hh.padStart(2, "0")}:${(mm || "0").padEnd(2, "0")}`;

  return HHMM.test(complete) ? complete : null;
}

/**
 * Un tramo horario «de … a …» como un solo campo.
 *
 * Sustituye a la pareja de `<input type="time">` que había antes, y no por estética: el campo
 * nativo deja que **el navegador** elija el formato, así que el mismo tramo se veía en 24 horas en
 * un equipo y con AM/PM en otro, y el desplegable del sistema operativo tapaba media pantalla en un
 * modal. Aquí se teclea `0830` y queda `08:30`, siempre igual y siempre en 24 horas, que es como se
 * escribe un horario de portal.
 *
 * El aspecto es a propósito el mismo que tenía: dos campos cortos con la flecha en medio. Lo que
 * cambia es que el componente **sabe que son un tramo**: avisa cuando el fin no va después del
 * inicio, en vez de dejar que lo descubra la API al guardar.
 *
 * Un tramo que cruza la medianoche —el garaje de 22:00 a 06:00— no es un error, pero tampoco es lo
 * normal, así que hay que pedirlo con `allowOvernight`. Sin eso, `22:00–06:00` casi siempre es un
 * `06:00–22:00` mal tecleado.
 * @param {TimeRangePickerProps} props - Propiedades del componente
 * @returns {JSX.Element} El tramo renderizado
 */
export default function TimeRangePicker({
  id = "time-range",
  name,
  label,
  startTime,
  endTime,
  onChange,
  startLabel,
  endLabel,
  allowOvernight = false,
  disabled,
  error,
  className,
}: TimeRangePickerProps) {
  const t = useTranslations("Common.TimeRange");

  /*
   * Lo tecleado se guarda aparte del valor: mientras alguien escribe «08» el tramo todavía no es
   * una hora, y avisar al padre de un valor a medio escribir le haría guardar las 08:00 en cuanto
   * pulsara la primera tecla. Al padre solo le llega lo que ya es una hora.
   *
   * Y se guarda **junto al tramo del que nació**: así, cuando el tramo cambia desde fuera, lo
   * tecleado deja de valer solo, sin tener que sincronizarlo desde un efecto.
   */
  const range = `${startTime}|${endTime}`;
  const [draft, setDraft] = useState({ start: startTime, end: endTime, range });

  const values = draft.range === range ? draft : { start: startTime, end: endTime };

  const handleChange = (edge: "start" | "end", text: string) => {
    const formatted = withTimeFormat(text);
    setDraft({ ...values, range, [edge]: formatted });

    if (HHMM.test(formatted)) {
      onChange({
        startTime: edge === "start" ? formatted : startTime,
        endTime: edge === "end" ? formatted : endTime,
      });
    }
  };

  /**
   * Al salir del campo se completa lo tecleado, o se devuelve a la última hora buena.
   *
   * Dejar `08:` escrito en pantalla sería mentir: parece guardado y no lo está.
   * @param {"start"|"end"} edge - Cuál de los dos extremos se acaba de dejar
   * @returns {void}
   */
  const handleBlur = (edge: "start" | "end") => {
    const completed = toValidTime(values[edge]);
    const value = completed ?? (edge === "start" ? startTime : endTime);

    setDraft({ ...values, range, [edge]: value });

    if (completed && completed !== (edge === "start" ? startTime : endTime)) {
      onChange({
        startTime: edge === "start" ? completed : startTime,
        endTime: edge === "end" ? completed : endTime,
      });
    }
  };

  const isInverted = !allowOvernight && HHMM.test(startTime) && HHMM.test(endTime) && endTime <= startTime;
  const message = error ?? (isInverted ? t("endBeforeStart") : undefined);

  return (
    <div className={`time-range${className ? ` ${className}` : ""}`}>
      {label && (
        <span className="time-range__label" id={`${id}-label`}>
          {label}
        </span>
      )}

      <div
        className={`time-range__field${message ? " time-range__field--error" : ""}`}
        role="group"
        aria-labelledby={label ? `${id}-label` : undefined}
      >
        <ClockIcon className="time-range__icon" aria-hidden="true" />

        <input
          id={`${id}-start`}
          className="time-range__input"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          maxLength={5}
          placeholder="00:00"
          aria-label={startLabel ?? t("start")}
          aria-invalid={message ? true : undefined}
          value={values.start}
          disabled={disabled}
          onChange={(event) => handleChange("start", event.target.value)}
          onBlur={() => handleBlur("start")}
        />

        <span className="time-range__separator" aria-hidden="true">
          →
        </span>

        <input
          id={`${id}-end`}
          className="time-range__input"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          maxLength={5}
          placeholder="00:00"
          aria-label={endLabel ?? t("end")}
          aria-invalid={message ? true : undefined}
          value={values.end}
          disabled={disabled}
          onChange={(event) => handleChange("end", event.target.value)}
          onBlur={() => handleBlur("end")}
        />
      </div>

      {/* Solo para Formik: el valor que cuenta es el que ya ha pasado por `onChange`. */}
      {name && (
        <>
          <input type="hidden" name={`${name}Start`} value={startTime} readOnly />
          <input type="hidden" name={`${name}End`} value={endTime} readOnly />
        </>
      )}

      {message && <span className="time-range__error">{message}</span>}
    </div>
  );
}
