import "@/styles/04-components/ui/navigations/stepper.scss";

import type { StepperProps } from "@/types/ui/navigations/stepper";

import { CheckIcon } from "lucide-react";

/**
 * Indicador de progreso de un formulario multi-paso (p. ej. el alta de
 * cliente): una fila de pasos numerados conectados por una línea, donde el
 * paso activo se resalta, los ya completados muestran un check y se pueden
 * volver a visitar, y los futuros quedan deshabilitados hasta alcanzarlos —
 * no se puede saltar adelante sin pasar por la validación de cada paso.
 * @param {StepperProps} props - Propiedades del componente
 * @returns {JSX.Element} El indicador de pasos renderizado
 */
export default function Stepper({
  steps,
  currentIndex,
  furthestIndex = currentIndex,
  onStepClick,
}: StepperProps) {
  return (
    <ol className="stepper">
      {steps.map((step, index) => {
        const isCompleted = index < furthestIndex;
        const isCurrent = index === currentIndex;
        const isReachable = index <= furthestIndex;
        const status = isCompleted ? "completed" : isCurrent ? "current" : "upcoming";

        return (
          <li key={step.key} className="stepper__item">
            <button
              type="button"
              className={`stepper__step stepper__step--${status}`}
              disabled={!isReachable || !onStepClick}
              aria-current={isCurrent ? "step" : undefined}
              onClick={() => onStepClick?.(index)}
            >
              <span className="stepper__index">
                {isCompleted ? <CheckIcon aria-hidden="true" /> : index + 1}
              </span>
              <span className="stepper__label">{step.label}</span>
            </button>

            {index < steps.length - 1 && (
              <span
                className={`stepper__connector${index < furthestIndex ? " stepper__connector--completed" : ""}`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
