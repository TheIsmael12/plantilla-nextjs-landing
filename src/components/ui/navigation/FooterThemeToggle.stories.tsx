import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";

import FooterThemeToggle from "./FooterThemeToggle";

const meta = {
  title: "Components/UI/Navigation/FooterThemeToggle",
  component: FooterThemeToggle,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Control segmentado de 3 estados (claro/sistema/oscuro) sobre `next-themes`, usado en `Footer`. Antes de montar en cliente los 3 botones aparecen deshabilitados y sin estado activo, ya que el tema resuelto solo se conoce en el navegador.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof FooterThemeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SwitchesTheme: Story = {
  name: "Interacción: cambia entre claro, sistema y oscuro",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const lightButton = await canvas.findByRole("button", { name: /tema claro|light theme/i });
    const systemButton = canvas.getByRole("button", { name: /tema del sistema|system theme/i });
    const darkButton = canvas.getByRole("button", { name: /tema oscuro|dark theme/i });

    // Tras montar, los 3 botones quedan habilitados.
    await expect(lightButton).toBeEnabled();
    await expect(systemButton).toBeEnabled();
    await expect(darkButton).toBeEnabled();

    await userEvent.click(darkButton);
    await expect(darkButton).toHaveAttribute("aria-pressed", "true");
    await expect(lightButton).toHaveAttribute("aria-pressed", "false");

    await userEvent.click(systemButton);
    await expect(systemButton).toHaveAttribute("aria-pressed", "true");
    await expect(darkButton).toHaveAttribute("aria-pressed", "false");
  },
};
