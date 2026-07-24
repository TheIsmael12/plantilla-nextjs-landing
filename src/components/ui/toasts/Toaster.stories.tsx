import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { subscribeToToasts, toast } from "@/lib/toast";
import type { ToastItem, ToastPosition } from "@/types/ui/toasts/toast";

import Toaster from "./Toaster";

/**
 * El store de `lib/toast.ts` es un singleton de módulo compartido por todas
 * las historias de este archivo: si una historia anterior disparó un toast
 * con la duración por defecto (4s) y la prueba de interacción no lo cerró
 * explícitamente, seguiría activo al ejecutarse la siguiente. Se usa al
 * principio de cada `play` que necesite partir de un estado predecible.
 */
function clearAllToasts() {
  let current: ToastItem[] = [];
  const unsubscribe = subscribeToToasts((items) => {
    current = items;
  });
  unsubscribe();
  current.forEach((item) => toast.dismiss(item.id));
}

const meta = {
  title: "UI/Toasts/Toaster",
  component: Toaster,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Sistema de notificaciones flotantes (toasts) inspirado en `sonner`: se disparan de forma imperativa desde cualquier client component con `toast.success()`/`toast.error()`/`toast.warning()`/`toast.info()` (`lib/toast.ts`), sin necesidad de contexto ni estado propio. `Toaster` se monta una única vez en `app/[locale]/layout.tsx` y renderiza la pila de toasts activos (autocierre a los 4s, o al pulsar la cruz). Reutiliza los mismos colores e iconos por tipo que `Alert` (`ALERT_ICONS`), para que ambos se vean como parte del mismo sistema.",
      },
    },
  },
  argTypes: {
    position: {
      control: "select",
      options: [
        "top-left",
        "top-center",
        "top-right",
        "bottom-left",
        "bottom-center",
        "bottom-right",
      ],
      description: "Esquina/lado de la pantalla donde se apilan los toasts.",
    },
  },
  args: {
    position: "top-right",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

const buttonStyle = {
  padding: "0.5rem 1rem",
  borderRadius: 6,
  border: "1px solid #e2e5ea",
  cursor: "pointer",
  fontSize: 14,
};

function Demo({ position }: { position?: ToastPosition }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <button
        type="button"
        style={buttonStyle}
        onClick={() => toast.success("Preferencias actualizadas correctamente.")}
      >
        Disparar success
      </button>
      <button
        type="button"
        style={buttonStyle}
        onClick={() => toast.error("No se pudieron guardar los cambios.")}
      >
        Disparar error
      </button>
      <button
        type="button"
        style={buttonStyle}
        onClick={() => toast.warning("Tu sesión caducará en unos minutos.")}
      >
        Disparar warning
      </button>
      <button
        type="button"
        style={buttonStyle}
        onClick={() => toast.info("Hay una nueva actualización disponible.")}
      >
        Disparar info
      </button>

      <Toaster position={position} />
    </div>
  );
}

export const Default: Story = {
  name: "Disparadores interactivos",
  render: (args) => <Demo position={args.position} />,
};

export const Success: Story = {
  name: "Toast de éxito",
  render: (args) => <Demo position={args.position} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText("Disparar success"));
  },
};

export const ErrorToast: Story = {
  name: "Toast de error",
  render: (args) => <Demo position={args.position} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText("Disparar error"));
  },
};

export const WarningToast: Story = {
  name: "Toast de advertencia",
  render: (args) => <Demo position={args.position} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText("Disparar warning"));
  },
};

export const InfoToast: Story = {
  name: "Toast de información",
  render: (args) => <Demo position={args.position} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText("Disparar info"));
  },
};

export const AllVariants: Story = {
  name: "Todas las variantes a la vez",
  render: (args) => <Demo position={args.position} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText("Disparar success"));
    await userEvent.click(canvas.getByText("Disparar error"));
    await userEvent.click(canvas.getByText("Disparar warning"));
    await userEvent.click(canvas.getByText("Disparar info"));
  },
};

export const BottomCenter: Story = {
  name: "Posición: abajo centro",
  args: { position: "bottom-center" },
  render: (args) => <Demo position={args.position} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText("Disparar success"));
    await userEvent.click(canvas.getByText("Disparar info"));
  },
};

export const EmptyState: Story = {
  name: "Estado vacío (sin toasts)",
  render: (args) => <Toaster position={args.position} />,
  parameters: {
    docs: {
      description: {
        story:
          "Sin toasts activos, `Toaster` no renderiza ningún nodo en el DOM (devuelve `null`): no hay región `role=\"region\"` que anunciar hasta que se dispare el primer toast.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    clearAllToasts();
    const canvas = within(canvasElement);

    // `clearAllToasts` dispara `toast.dismiss()` para cada toast residual de
    // una historia anterior, pero eso actualiza el estado de `Toaster` de
    // forma asíncrona: hay que esperar al re-render antes de comprobar que
    // el DOM ha quedado vacío, igual que en el resto de historias que
    // comprueban una desaparición.
    await waitFor(() => {
      expect(canvas.queryByRole("region")).not.toBeInTheDocument();
      expect(canvas.queryByRole("status")).not.toBeInTheDocument();
    });
  },
};

export const ManualDismiss: Story = {
  name: "Interacción: cerrar manualmente",
  parameters: {
    docs: {
      description: {
        story:
          "Prueba de interacción: al pulsar la cruz de cierre de un toast, éste desaparece inmediatamente sin esperar al autocierre por temporizador.",
      },
    },
  },
  render: (args) => <Demo position={args.position} />,
  play: async ({ canvasElement }) => {
    clearAllToasts();
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByText("Disparar success"));
    const toastEl = await canvas.findByRole("status");
    const closeButton = within(toastEl).getByRole("button", { name: /cerrar/i });

    await userEvent.click(closeButton);

    await waitFor(() => expect(canvas.queryByRole("status")).not.toBeInTheDocument());
  },
};

export const KeyboardDismiss: Story = {
  name: "Interacción: cerrar con teclado",
  parameters: {
    docs: {
      description: {
        story:
          "Prueba de interacción: el botón de cierre es un `<button>` nativo con `aria-label`, por lo que es alcanzable con el teclado y se activa con Enter (o Espacio) igual que con el ratón.",
      },
    },
  },
  render: (args) => <Demo position={args.position} />,
  play: async ({ canvasElement }) => {
    clearAllToasts();
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByText("Disparar error"));
    const toastEl = await canvas.findByRole("status");
    const closeButton = within(toastEl).getByRole("button", { name: /cerrar/i });

    closeButton.focus();
    expect(closeButton).toHaveFocus();
    await userEvent.keyboard("{Enter}");

    await waitFor(() => expect(canvas.queryByRole("status")).not.toBeInTheDocument());
  },
};

function AutoDismissDemo({ position }: { position?: ToastPosition }) {
  return (
    <div>
      <button
        type="button"
        style={buttonStyle}
        onClick={() =>
          toast.success("Este toast se autocierra a los 50 ms.", { duration: 50 })
        }
      >
        Disparar toast de autocierre rápido
      </button>

      <Toaster position={position} />
    </div>
  );
}

export const AutoDismiss: Story = {
  name: "Interacción: autocierre por temporizador",
  parameters: {
    docs: {
      description: {
        story:
          "Prueba de interacción: usando una `duration` corta (50 ms) en vez de esperar los 4s por defecto, se comprueba que el toast desaparece solo, sin intervención del usuario.",
      },
    },
  },
  render: (args) => <AutoDismissDemo position={args.position} />,
  play: async ({ canvasElement }) => {
    clearAllToasts();
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByText("Disparar toast de autocierre rápido"));
    await canvas.findByRole("status");

    await waitFor(
      () => expect(canvas.queryByRole("status")).not.toBeInTheDocument(),
      { timeout: 2000 },
    );
  },
};

const ALL_POSITIONS: ToastPosition[] = [
  "top-left",
  "top-center",
  "top-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
];

function AllPositionsDemo() {
  return (
    <div>
      <button
        type="button"
        style={buttonStyle}
        onClick={() => toast.info("Toast visible en las 6 posiciones a la vez.")}
      >
        Disparar en todas las posiciones
      </button>

      {ALL_POSITIONS.map((position) => (
        <Toaster key={position} position={position} />
      ))}
    </div>
  );
}

export const AllPositions: Story = {
  name: "Las 6 posiciones montadas a la vez",
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "Escenario artificial (en la app real solo se monta un `Toaster`) que monta las 6 posiciones simultáneamente para documentar de un vistazo dónde se apila cada una en la esquina/lado correspondiente.",
      },
    },
  },
  render: () => <AllPositionsDemo />,
  play: async ({ canvasElement }) => {
    clearAllToasts();
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByText("Disparar en todas las posiciones"));

    const toasts = await canvas.findAllByRole("status");
    expect(toasts).toHaveLength(ALL_POSITIONS.length);
  },
};
