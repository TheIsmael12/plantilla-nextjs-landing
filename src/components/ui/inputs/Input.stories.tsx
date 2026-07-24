import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { LockIcon, MailIcon, UserIcon } from "lucide-react";
import { expect, fn, userEvent, within } from "storybook/test";

import type { InputProps } from "@/types/ui/inputs/input";

import Input from "./Input";

/**
 * Envoltorio con estado propio: mantiene `value` sincronizado con lo que
 * escribe el usuario para que las pruebas de interacción (escribir en el
 * campo, alternar la contraseña) reflejen el uso real del componente
 * controlado, a la vez que sigue delegando en el `onChange` de los args
 * (fn de acciones).
 */
function ControlledInput(args: InputProps) {
  const [value, setValue] = useState(args.value ?? "");

  return (
    <Input
      {...args}
      value={value}
      onChange={(event) => {
        setValue(event.target.value);
        args.onChange(event);
      }}
    />
  );
}

const meta = {
  title: "UI/Inputs/Input",
  component: Input,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Campo de formulario base del sistema de diseño. Resuelve `label`/`placeholder`/`error` como claves de traducción (namespaces `Labels`/`Placeholders`/`Validations` de next-intl) salvo que `noTranslate` sea `true`, incorpora el toggle de mostrar/ocultar cuando `type=\"password\"` y añade un icono por defecto (lupa) cuando `type=\"search\"`. El resto de componentes de campo del sistema (Select, DatePicker, OtpInput...) comparten sus clases `label__title`/`label__error` para mantener una apariencia consistente.",
      },
    },
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ minWidth: 320 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    label: {
      control: "text",
      description:
        "Clave de traducción del namespace `Labels`, o texto literal si `noTranslate` es `true`. Si se omite, no se renderiza `<label>` (usa `ariaLabel` para mantener un nombre accesible).",
    },
    placeholder: {
      control: "text",
      description:
        "Clave de traducción del namespace `Placeholders`, o texto literal si `noTranslate` es `true`.",
    },
    ariaLabel: {
      control: "text",
      description:
        "`aria-label` del input nativo. Imprescindible cuando no hay `label` visible.",
    },
    type: {
      control: "select",
      options: [
        "text",
        "email",
        "password",
        "number",
        "tel",
        "url",
        "search",
        "date",
      ],
      description: "Tipo HTML del input",
    },
    value: {
      control: "text",
      description: "Valor controlado del campo; por defecto una cadena vacía.",
    },
    error: {
      control: "text",
      description:
        "Clave de traducción del namespace `Validations`. Requiere `touched=true` para mostrarse.",
    },
    touched: {
      control: "boolean",
      description:
        "Marca el campo como interactuado, habilitando la visualización del error.",
    },
    disabled: {
      control: "boolean",
      description: "Deshabilita el campo impidiendo cualquier interacción.",
    },
    readonly: {
      control: "boolean",
      description: "Muestra el valor pero impide su edición.",
    },
    required: {
      control: "boolean",
      description:
        "Marca el campo como obligatorio con un asterisco (*) junto al label.",
    },
    noTranslate: {
      control: "boolean",
      description:
        "Si es true, los valores de `label` y `placeholder` se usan directamente sin pasar por next-intl.",
    },
    icon: {
      control: false,
      description:
        "Componente de icono renderizado en el interior del campo (lucide-react u compatible). Si no se indica y `type` es `search`, se usa `SearchIcon` por defecto.",
    },
    min: {
      control: "number",
      description: "Valor mínimo (tipos `number`/`date`).",
    },
    max: {
      control: "number",
      description: "Valor máximo (tipos `number`/`date`).",
    },
    minLength: {
      control: "number",
      description: "Longitud mínima del texto.",
    },
    maxLength: {
      control: "number",
      description: "Longitud máxima del texto.",
    },
    accept: {
      control: "text",
      description: "Atributo `accept` nativo (tipos de fichero aceptados).",
    },
    autoComplete: {
      control: "text",
      description: 'Atributo `autoComplete` nativo; por defecto "off".',
    },
    className: {
      control: "text",
      description:
        'Clases CSS adicionales. Por defecto el ancho es automático; pasa "input__full" (100%) o "input__md" (min-width: 22rem) para los otros dos anchos.',
    },
    onChange: { action: "changed" },
    onBlur: { action: "blurred" },
    onKeyDown: { action: "keydown" },
  },
  args: {
    id: "input-story",
    name: "input-story",
    label: "Etiqueta",
    noTranslate: true,
    onChange: fn(),
    onBlur: fn(),
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Nombre",
    type: "text",
    placeholder: "Escribe tu nombre",
  },
};

export const Required: Story = {
  name: "Obligatorio",
  args: {
    label: "Nombre",
    type: "text",
    placeholder: "Este campo es requerido",
    required: true,
  },
};

export const WithError: Story = {
  name: "Con error",
  args: {
    label: "Correo electrónico",
    type: "email",
    value: "usuario-sin-arroba",
    error: "emailInvalid",
    touched: true,
  },
};

export const WithIcon: Story = {
  name: "Con icono",
  args: {
    label: "Correo electrónico",
    type: "email",
    placeholder: "Tu correo electrónico",
    icon: MailIcon,
  },
};

export const WithIconAndError: Story = {
  name: "Con icono y error",
  args: {
    label: "Usuario",
    type: "text",
    value: "",
    icon: UserIcon,
    error: "required",
    touched: true,
  },
};

export const WithoutLabelWithAriaLabel: Story = {
  name: "Sin etiqueta visible (con aria-label)",
  parameters: {
    docs: {
      description: {
        story:
          "Cuando no hay `label` visible, `ariaLabel` mantiene un nombre accesible correcto para lectores de pantalla.",
      },
    },
  },
  args: {
    label: undefined,
    ariaLabel: "Buscar usuarios",
    type: "search",
    placeholder: "Buscar...",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("searchbox", {
      name: "Buscar usuarios",
    });
    await expect(input).toBeInTheDocument();
  },
};

export const WithTranslation: Story = {
  name: "Con traducción (next-intl)",
  parameters: {
    docs: {
      description: {
        story:
          "Sin `noTranslate`, `label` y `placeholder` se resuelven como claves de los namespaces `Labels`/`Placeholders` a través de next-intl, en vez de mostrarse tal cual.",
      },
    },
  },
  args: {
    id: "email-i18n",
    name: "email-i18n",
    label: "email",
    placeholder: "email",
    noTranslate: false,
    icon: MailIcon,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText("Correo electrónico"),
    ).toBeInTheDocument();
    await expect(
      canvas.getByPlaceholderText("tu@correo.com"),
    ).toBeInTheDocument();
  },
};

export const Email: Story = {
  args: {
    id: "email",
    name: "email",
    label: "Correo electrónico",
    type: "email",
    placeholder: "usuario@ejemplo.com",
    icon: MailIcon,
    autoComplete: "email",
  },
};

export const Password: Story = {
  name: "Contraseña",
  args: {
    id: "password",
    name: "password",
    label: "Contraseña",
    type: "password",
    placeholder: "Introduce tu contraseña",
    autoComplete: "current-password",
  },
};

export const PasswordWithError: Story = {
  name: "Contraseña con error",
  args: {
    id: "password-error",
    name: "password-error",
    label: "Contraseña",
    type: "password",
    value: "abc",
    icon: LockIcon,
    error: "passwordMin",
    touched: true,
    autoComplete: "new-password",
  },
};

export const PasswordVisibilityInteraction: Story = {
  name: "Interacción: mostrar/ocultar contraseña",
  parameters: {
    docs: {
      description: {
        story:
          "Prueba de interacción: al hacer clic en el icono del ojo, el campo cambia de `type=\"password\"` a `type=\"text\"` y el `aria-label` del botón pasa de «Mostrar contraseña» a «Ocultar contraseña».",
      },
    },
  },
  args: {
    id: "password-toggle",
    name: "password-toggle",
    label: "Contraseña",
    type: "password",
    value: "MiContraseñaSecreta",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const toggle = canvas.getByRole("button", { name: /mostrar contraseña/i });
    let input = canvas.getByLabelText("Contraseña") as HTMLInputElement;
    expect(input).toHaveAttribute("type", "password");

    await userEvent.click(toggle);

    input = canvas.getByLabelText("Contraseña") as HTMLInputElement;
    await expect(input).toHaveAttribute("type", "text");
    await expect(
      canvas.getByRole("button", { name: /ocultar contraseña/i }),
    ).toBeInTheDocument();
  },
};

export const PasswordReadonly: Story = {
  name: "Contraseña de solo lectura",
  parameters: {
    docs: {
      description: {
        story:
          "Con `readonly`, el botón de mostrar/ocultar contraseña se deshabilita visualmente (`input__password__eye--disabled`) aunque sigue siendo pulsable, ya que el propio campo no permite editar su valor.",
      },
    },
  },
  args: {
    id: "password-readonly",
    name: "password-readonly",
    label: "Contraseña",
    type: "password",
    value: "MiContraseñaSecreta",
    readonly: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole("button", { name: /mostrar contraseña/i });

    await expect(toggle).toHaveClass("input__password__eye--disabled");
  },
};

export const Search: Story = {
  name: "Búsqueda",
  args: {
    id: "search",
    name: "search",
    label: "Buscar",
    type: "search",
    placeholder: "Buscar...",
  },
};

export const Disabled: Story = {
  name: "Deshabilitado",
  args: {
    label: "Campo deshabilitado",
    type: "text",
    value: "Este campo no se puede editar",
    disabled: true,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText("Campo deshabilitado");

    await expect(input).toBeDisabled();

    await userEvent.type(input, "más texto");

    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

export const Readonly: Story = {
  name: "Solo lectura",
  args: {
    label: "Campo de solo lectura",
    type: "text",
    value: "Este valor no se puede modificar",
    readonly: true,
  },
};

export const NumberWithLimits: Story = {
  name: "Número con límites",
  args: {
    id: "age",
    name: "age",
    label: "Edad",
    type: "number",
    placeholder: "Entre 18 y 99",
    min: 18,
    max: 99,
  },
};

export const TextWithLengthLimits: Story = {
  name: "Texto con límites de longitud",
  args: {
    id: "username",
    name: "username",
    label: "Nombre de usuario",
    type: "text",
    placeholder: "Entre 3 y 12 caracteres",
    minLength: 3,
    maxLength: 12,
  },
};

export const TypingInteraction: Story = {
  name: "Interacción: escritura",
  parameters: {
    docs: {
      description: {
        story:
          "Prueba de interacción: al escribir en el campo se invocan `onChange` y `onKeyDown`, y el valor mostrado se actualiza.",
      },
    },
  },
  render: (args) => <ControlledInput {...args} />,
  args: {
    label: "Nombre",
    type: "text",
    value: "",
    onKeyDown: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText("Nombre") as HTMLInputElement;

    await userEvent.type(input, "Ana");

    await expect(args.onChange).toHaveBeenCalled();
    await expect(args.onKeyDown).toHaveBeenCalled();
    await expect(input).toHaveValue("Ana");
  },
};

export const BlurInteraction: Story = {
  name: "Interacción: blur",
  parameters: {
    docs: {
      description: {
        story:
          "Prueba de interacción: al salir del campo (blur) se invoca `onBlur`, usado por Formik para marcar `touched`.",
      },
    },
  },
  args: {
    label: "Nombre",
    type: "text",
    placeholder: "Escribe y sal del campo",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText("Nombre");

    await userEvent.click(input);
    await userEvent.tab();

    await expect(args.onBlur).toHaveBeenCalled();
  },
};

export const AllStates: Story = {
  name: "Todos los estados",
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div
      style={{ display: "flex", flexDirection: "column", gap: 24, width: 320 }}
    >
      <Input {...args} label="Normal" placeholder="Estado normal" />
      <Input
        {...args}
        label="Obligatorio"
        placeholder="Campo requerido"
        required
      />
      <Input
        {...args}
        label="Con error"
        value=""
        error="required"
        touched
      />
      <Input {...args} label="Deshabilitado" value="No editable" disabled />
      <Input {...args} label="Solo lectura" value="No modificable" readonly />
    </div>
  ),
};

export const AllTypes: Story = {
  name: "Todos los tipos",
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div
      style={{ display: "flex", flexDirection: "column", gap: 24, width: 320 }}
    >
      <Input {...args} label="Texto" type="text" placeholder="text" />
      <Input {...args} label="Correo" type="email" placeholder="email" />
      <Input {...args} label="Contraseña" type="password" placeholder="password" />
      <Input {...args} label="Número" type="number" placeholder="number" />
      <Input {...args} label="Teléfono" type="tel" placeholder="tel" />
      <Input {...args} label="URL" type="url" placeholder="url" />
      <Input {...args} label="Búsqueda" type="search" placeholder="search" />
      <Input {...args} label="Fecha" type="date" />
    </div>
  ),
};

export const WidthVariants: Story = {
  name: "Variantes de ancho",
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "Por defecto (sin `className`) el ancho es automático. Con `className=\"input__full\"` ocupa el 100% de su contenedor; con `className=\"input__md\"` tiene un `min-width: 22rem`.",
      },
    },
  },
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, width: 480 }}>
      <Input {...args} label="Ancho automático (por defecto)" placeholder="Ancho automático" />
      <Input
        {...args}
        label="Ancho completo"
        placeholder="Ocupa todo el ancho disponible"
        className="input__full"
      />
      <Input {...args} label="Ancho medio" placeholder="min-width: 22rem" className="input__md" />
    </div>
  ),
};
