import { CheckIcon } from 'lucide-react';

import '@/styles/04-components/careers/careersDetail.scss';

/**
 * En qué punto va una candidatura, como una línea de tiempo vertical.
 *
 * **No reutiliza `Stepper`**, y no es por gusto: ese componente es el indicador de un formulario por pasos
 * —pasos numerados en una fila horizontal, con las etiquetas debajo de cada círculo, sin partir palabra y
 * pulsables para volver atrás—. Aplicado aquí hacía tres cosas mal a la vez:
 *
 * - **Se salía de la caja.** Los nombres de los estados son frases («Te hemos hecho una oferta», «No
 *   seguimos adelante»), no rótulos de tres letras como «Permisos». Cinco de esas en una fila, sin poder
 *   partirse y dentro de una tarjeta de 38rem, desbordaban por la derecha sin barra de desplazamiento: se
 *   perdía justo el final del proceso, que es lo que se ha venido a mirar.
 * - **Pedía que lo pulsaras.** Cada paso era un `<button>`, y un botón invita a pulsarlo. Aquí no hay nada
 *   que pulsar: es el estado de un expediente, no un formulario a medio rellenar.
 * - **Numeraba.** «1, 2, 3, 4, 5» habla de pasos que da quien mira; estos los da la empresa.
 *
 * En vertical no hay nada que desbordar —cada estado tiene su línea entera— y el orden se lee de arriba
 * abajo, que es como se lee un historial. El estado actual va marcado y con su punto lleno; los pasados,
 * con su marca de hecho; los que quedan, apagados.
 * @param {ApplicationProgressProps} props - Pasos y en cuál se está
 * @returns {JSX.Element} La línea de tiempo renderizada
 */
export default function ApplicationProgress({ steps, currentIndex }: ApplicationProgressProps) {
    return (
        <ol className="careers__progress">
            {steps.map((step, index) => {
                const state =
                    index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'upcoming';

                return (
                    <li
                        key={step.key}
                        className={`careers__progress-step careers__progress-step--${state}`}
                        aria-current={state === 'current' ? 'step' : undefined}
                    >
                        {/*
                          El punto y la línea que baja de él van en el mismo elemento: así la línea se
                          dibuja entre dos puntos consecutivos y no hay que pintar un conector suelto que
                          luego haya que ocultar en el último paso.
                        */}
                        <span className="careers__progress-marker" aria-hidden="true">
                            {state === 'done' && <CheckIcon />}
                        </span>

                        <span className="careers__progress-label">{step.label}</span>
                    </li>
                );
            })}
        </ol>
    );
}
