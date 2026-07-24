"use client";

import "@/styles/04-components/ui/inputs/otp-input.scss";

import { useRef } from "react";

import { useTranslations } from "next-intl";

import type { OtpInputProps } from "@/types/ui/inputs/otp-input";

const DIGIT_ONLY = /\D/g;

/**
 * Input segmentado para códigos numéricos (verificación MFA, 2FA). Soporta
 * pegado y autocompletado del código completo en cualquier casilla,
 * navegación con flechas y borrado hacia atrás entre casillas.
 * @param {OtpInputProps} props - Propiedades del input
 * @returns {JSX.Element} Las casillas del código y, si aplica, el mensaje de error
 */
export default function OtpInput({
  id,
  name,
  length = 6,
  value,
  onChange,
  error,
  touched,
  disabled,
  autoFocus,
}: OtpInputProps) {
  const tValidations = useTranslations("Validations");
  const tCommon = useTranslations("Common.OtpInput");
  const slotRefs = useRef<Array<HTMLInputElement | null>>([]);

  const digits = Array.from({ length }, (_, index) => value[index] ?? "");

  const focusSlot = (index: number) => {
    slotRefs.current[index]?.focus();
  };

  const commit = (nextDigits: string[]) => {
    onChange(nextDigits.join("").slice(0, length));
  };

  const handleChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const typed = e.target.value.replace(DIGIT_ONLY, "");

    if (!typed) {
      const next = [...digits];
      next[index] = "";
      commit(next);
      return;
    }

    // Puede llegar más de un dígito de golpe: pegado o autocompletado del
    // teclado del móvil al escribir en una sola casilla.
    const next = [...digits];
    let cursor = index;
    for (const digit of typed) {
      if (cursor >= length) break;
      next[cursor] = digit;
      cursor += 1;
    }
    commit(next);
    focusSlot(Math.min(cursor, length - 1));
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const next = [...digits];
        next[index] = "";
        commit(next);
        return;
      }

      if (index > 0) {
        e.preventDefault();
        const next = [...digits];
        next[index - 1] = "";
        commit(next);
        focusSlot(index - 1);
      }
      return;
    }

    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      focusSlot(index - 1);
      return;
    }

    if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      focusSlot(index + 1);
    }
  };

  const handlePaste = (
    index: number,
    e: React.ClipboardEvent<HTMLInputElement>,
  ) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(DIGIT_ONLY, "");
    if (!pasted) return;

    const next = [...digits];
    let cursor = index;
    for (const digit of pasted) {
      if (cursor >= length) break;
      next[cursor] = digit;
      cursor += 1;
    }
    commit(next);
    focusSlot(Math.min(cursor, length - 1));
  };

  return (
    <article className="otp-input__group">
      <div className={`otp-input ${error && touched ? "otp-input--error" : ""}`}>
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              slotRefs.current[index] = el;
            }}
            id={index === 0 ? id : undefined}
            name={index === 0 ? name : undefined}
            className="otp-input__slot"
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={length}
            value={digit}
            disabled={disabled}
            autoFocus={autoFocus && index === 0}
            aria-label={tCommon("digitLabel", { current: index + 1, total: length })}
            aria-invalid={Boolean(error && touched)}
            onChange={(e) => handleChange(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={(e) => handlePaste(index, e)}
            onFocus={(e) => e.target.select()}
          />
        ))}
      </div>

      {error && touched && (
        <p className="label__error">* {tValidations(error)}</p>
      )}
    </article>
  );
}
