import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import ImageUploadField from "./ImageUploadField";

const meta = {
  title: "UI/Images/ImageUploadField",
  component: ImageUploadField,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Campo para subir una imagen: la que hay ahora, los formatos y el tamaño que se admiten, elegir otra y quitarla con confirmación. Es el mismo mecanismo que la intranet usa para el logo de la empresa, empaquetado como componente para que la vista previa, la validación al elegir el fichero y el aviso de límites no se reescriban en cada pantalla. Los límites y los formatos salen de `UPLOAD_LIMITS[zone]`, así que el texto se actualiza solo cuando cambia el límite. La validación ocurre **al elegir** el fichero, con un aviso si no cumple; la API lo vuelve a comprobar de todas formas.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    src: {
      control: "text",
      description: "URL de la imagen actual, o `null` si todavía no hay ninguna.",
    },
    zone: {
      control: "select",
      options: ["companyLogo", "avatar"],
      description:
        "Zona de subida cuyos límites se aplican y se anuncian (formatos y tamaño máximo).",
    },
    isBusy: {
      control: "boolean",
      description:
        "Hay una subida o un borrado en marcha: deshabilita las acciones y el botón pasa a «Subiendo…».",
    },
    disabled: {
      control: "boolean",
      description:
        "Sin permiso para cambiarla: se sigue viendo la imagen y no se ofrece ninguna acción.",
    },
  },
  args: {
    src: null,
    alt: "Logo de la comunidad",
    onUpload: () => {},
  },
} satisfies Meta<typeof ImageUploadField>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Sin imagen todavía: se ve el hueco con su icono y el aviso de qué se puede subir. */
export const Vacio: Story = {};

/**
 * Con una imagen puesta.
 *
 * Aparece el botón de quitarla, que es lo que solo tiene sentido cuando hay algo que quitar.
 */
export const ConImagen: Story = {
  args: {
    src: "/images/logo.png",
    onRemove: () => {},
  },
};

/** Mientras sube o borra: todo deshabilitado, para que no se lance una segunda petición encima. */
export const Trabajando: Story = {
  args: {
    src: "/images/logo.png",
    isBusy: true,
    onRemove: () => {},
  },
};

/** Sin permiso para cambiarla: se ve la imagen y desaparecen las acciones, no se deshabilitan. */
export const SoloLectura: Story = {
  args: {
    src: "/images/logo.png",
    disabled: true,
    onRemove: () => {},
  },
};

/**
 * El avatar de una persona, para ver que los límites del aviso salen de la zona.
 *
 * Es la misma pieza con otra `zone`: el texto de formatos y tamaño cambia sin tocar nada más.
 */
export const ZonaAvatar: Story = {
  args: { zone: "avatar", alt: "Foto de perfil" },
};

/**
 * Funcionando de verdad: al elegir un fichero se ve en la vista previa, y al quitarlo desaparece.
 *
 * Usa una URL `blob:` local, que es lo mismo que hace la aplicación mientras la subida está en marcha; así la
 * historia demuestra el ciclo completo sin necesitar servidor.
 */
export const Interactivo: Story = {
  render: (args) => {
    const InteractiveField = () => {
      const [src, setSrc] = useState<string | null>(null);

      return (
        <ImageUploadField
          {...args}
          src={src}
          onUpload={(file) => setSrc(URL.createObjectURL(file))}
          onRemove={() => setSrc(null)}
        />
      );
    };

    return <InteractiveField />;
  },
};
