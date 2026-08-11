/**
 * Un paso de {@link Stepper}.
 * @interface StepperStep
 * @property {string} key - Identificador único del paso
 * @property {string} label - Texto ya traducido mostrado bajo el número del paso
 */
export interface StepperStep {
  key: string;
  label: string;
}

/**
 * Props de {@link Stepper}.
 * @interface StepperProps
 * @property {StepperStep[]} steps - Pasos a representar, en el orden en que se completan
 * @property {number} currentIndex - Índice (base 0) del paso activo
 * @property {number} [furthestIndex] - Índice (base 0) del paso más avanzado ya alcanzado; los pasos hasta aquí se muestran como completados y son clicables. Por defecto igual a `currentIndex` (no permite saltar adelante)
 * @property {(index: number) => void} [onStepClick] - Handler invocado al pulsar un paso ya alcanzado (anterior al actual o el propio actual); si se omite, los pasos no son clicables
 */
export interface StepperProps {
  steps: StepperStep[];
  currentIndex: number;
  furthestIndex?: number;
  onStepClick?: (index: number) => void;
}
