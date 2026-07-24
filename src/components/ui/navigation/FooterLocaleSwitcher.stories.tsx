import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";

import FooterLocaleSwitcher from "./FooterLocaleSwitcher";

const meta = {
  title: "Components/UI/Navigation/FooterLocaleSwitcher",
  component: FooterLocaleSwitcher,
  parameters: {
    layout: "centered",
    nextjs: {
      appDirectory: true,
      navigation: { pathname: "/" },
    },
    docs: {
      description: {
        component:
          "Selector de idioma del footer: envuelve `ChangeLocale` (con `hideSelectedFromList`) conectado a `usePathname`/`useRouter` de `@/i18n/navigation`, para navegar a la misma página ya traducida al elegir otro idioma.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof FooterLocaleSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const OnlyOffersTheOtherLanguage: Story = {
  name: "Interacción: el listado solo ofrece el otro idioma",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox");

    // El idioma activo por defecto en las stories es "es" (ver .storybook/preview.tsx).
    await expect(trigger).toHaveTextContent("ES");

    await userEvent.click(trigger);

    const listbox = within(document.body).getByRole("listbox");
    const options = within(listbox).getAllByRole("option");

    await expect(options).toHaveLength(1);
    await expect(options[0]).toHaveTextContent("EN");
  },
};
