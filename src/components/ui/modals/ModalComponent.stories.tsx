import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import Input from "../inputs/Input";
import ModalComponent from "./ModalComponent";

import { CheckIcon, CopyIcon } from "lucide-react";

const meta = {
  title: "UI/Modals/ModalComponent",
  component: ModalComponent,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    isOpen: {
      control: "boolean",
      description: "Controla la visibilidad del modal.",
    },
    isLarge: {
      control: "boolean",
      description: "Activa la variante grande del modal (max-width 52rem).",
    },
    closeOnOutsideClick: {
      control: "boolean",
      description: "Cierra el modal al hacer clic fuera.",
    },
    isLoading: {
      control: "boolean",
      description: "Muestra el estado de carga en el botón confirmar.",
    },
    title: {
      control: "text",
      description: "Texto del encabezado del modal.",
    },
    confirmText: {
      control: "text",
      description: "Texto personalizado del botón confirmar.",
    },
    cancelText: {
      control: "text",
      description: "Texto personalizado del botón cancelar.",
    },
    isLoadingText: {
      control: "text",
      description: "Texto del botón confirmar mientras isLoading es true.",
    },
    children: {
      control: false,
      description:
        "Contenido estático o render-function que recibe FormikRenderProps.",
    },
    initialValues: {
      control: false,
      description:
        "Valores iniciales del formulario; activa el modo Formik junto con onSubmit.",
    },
    validationSchema: {
      control: false,
      description: "Schema de validación Yup.",
    },
    onSubmit: {
      control: false,
      description: "Handler de envío del formulario.",
    },
    onClose: { action: "onClose" },
    onConfirm: { action: "onConfirm" },
    onCancel: { action: "onCancel" },
  },
  args: {
    title: "Título del modal",
    isOpen: true,
    closeOnOutsideClick: true,
    isLoading: false,
    isLarge: false,
    onClose: fn(),
  },
} satisfies Meta<typeof ModalComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Confirmacion: Story = {
  name: "Confirmación",
  args: {
    title: "¿Confirmar acción?",
    onConfirm: fn(),
    onCancel: fn(),
  },
};

export const SoloConfirmar: Story = {
  name: "Solo confirmar",
  args: {
    title:
      "¿Estás seguro de que quieres realizar está acción, ten en cuenta que esta acción es irrebersible y puede que te quede sin dicho valor mas balioso imposible?",
    onConfirm: fn(),
  },
};

export const SoloCancelar: Story = {
  name: "Solo cancelar",
  args: {
    title: "Operación cancelada",
    onCancel: fn(),
  },
};

export const ConAccionExtra: Story = {
  name: "Con acción extra",
  args: {
    title: "Guarda tus códigos de backup",
    onConfirm: fn(),
    confirmText: "finish",
    onCancel: fn(),
    cancelText: "copy",
    cancelIcon: CopyIcon,
  },
};

export const ConContenido: Story = {
  name: "Con contenido",
  args: {
    title: "Información",
    onConfirm: fn(),
    onCancel: fn(),
    children: (
      <p style={{ margin: 0, lineHeight: 1.6 }}>
        Este modal muestra contenido personalizado. Puede incluir cualquier
        elemento React como textos, imágenes o componentes anidados.
      </p>
    ),
  },
};

export const Cargando: Story = {
  name: "Estado cargando",
  args: {
    title: "Procesando solicitud",
    isLoading: true,
    isLoadingText: "saving",
    onConfirm: fn(),
    onCancel: fn(),
  },
};

export const Grande: Story = {
  name: "Tamaño grande",
  args: {
    title: "Vista detallada",
    isLarge: true,
    onConfirm: fn(),
    onCancel: fn(),
    children: (
      <p style={{ margin: 0, lineHeight: 1.6 }}>
        Este modal usa la variante <code>isLarge</code> para albergar contenido
        extenso como tablas, formularios complejos o previsualizaciones.
      </p>
    ),
  },
};

export const SinCierreExterno: Story = {
  name: "Sin cierre exterior",
  args: {
    title: "Acción obligatoria",
    closeOnOutsideClick: false,
    confirmText: "acceptTerms",
    onConfirm: fn(),
  },
};

export const ConFormulario: Story = {
  name: "Con formulario",
  render: (args) => (
    <ModalComponent<{ nombre: string; email: string }>
      {...args}
      title="Nuevo usuario"
      initialValues={{ nombre: "", email: "" }}
      onSubmit={(values) => {
        console.log("submit", values);
      }}
      submitText="createUser"
      submittingText="creating"
    >
      {({ values, handleChange, handleBlur }) => (
        <>
          <Input
            id="nombre"
            name="nombre"
            label="Nombre"
            type="text"
            placeholder="Nombre completo"
            value={values.nombre}
            onChange={handleChange}
            onBlur={handleBlur}
            noTranslate
            className="input__full"
          />
          <Input
            id="email"
            name="email"
            label="Correo electrónico"
            type="email"
            placeholder="usuario@ejemplo.com"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            noTranslate
            className="input__full"
          />
        </>
      )}
    </ModalComponent>
  ),
};

export const ConFormularioSinTextosPersonalizados: Story = {
  name: "Con formulario (textos por defecto)",
  parameters: {
    docs: {
      description: {
        story:
          "Modo formulario con `children` estático (no render-function) y sin `submitText`/`submittingText`: el botón de envío usa las claves de traducción por defecto (\"confirm\"/\"loading\") tanto en reposo como mientras Formik está enviando (`isSubmitting`).",
      },
    },
  },
  render: (args) => (
    <ModalComponent<{ nota: string }>
      {...args}
      title="Formulario con textos por defecto"
      initialValues={{ nota: "" }}
      onSubmit={() => new Promise(() => {})}
    >
      <p>Contenido estático, no una render-function de Formik.</p>
    </ModalComponent>
  ),
  play: async () => {
    const canvas = within(document.body);

    const submitButton = await canvas.findByRole("button", { name: /confirmar/i });
    await userEvent.click(submitButton);

    await canvas.findByRole("button", { name: /cargando/i });
  },
};

export const CargandoTextoPorDefecto: Story = {
  name: "Estado cargando (texto por defecto)",
  args: {
    title: "Procesando solicitud",
    isLoading: true,
    onConfirm: fn(),
    onCancel: fn(),
  },
  play: async () => {
    const canvas = within(document.body);
    await canvas.findByRole("button", { name: /cargando/i });
  },
};

export const ConIconoDeConfirmar: Story = {
  name: "Con icono en confirmar",
  args: {
    title: "Confirmar con icono",
    onConfirm: fn(),
    confirmIcon: CheckIcon,
  },
  play: async () => {
    const canvas = within(document.body);
    const confirmButton = await canvas.findByRole("button", { name: /confirmar/i });
    expect(confirmButton.querySelector("svg")).toBeInTheDocument();
  },
};

export const CierrePorClickExterior: Story = {
  name: "Interacción: cierre al hacer click fuera",
  args: {
    title: "Cerrar con un click fuera",
    onConfirm: fn(),
    onCancel: fn(),
  },
  play: async ({ args }) => {
    const overlay = document.body.querySelector(".modal__overlay");
    if (!(overlay instanceof HTMLElement)) {
      throw new Error("No se encontró el overlay del modal");
    }

    await userEvent.click(overlay);

    await expect(args.onClose).toHaveBeenCalledTimes(1);
  },
};

export const Cerrado: Story = {
  name: "Modal cerrado (isOpen false)",
  args: {
    title: "No debería verse",
    isOpen: false,
    onConfirm: fn(),
  },
  play: async () => {
    expect(document.body.querySelector(".modal")).not.toBeInTheDocument();
  },
};
