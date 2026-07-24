import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import NotificationBell from "./NotificationBell";

const meta = {
  title: "UI/Navigations/NotificationBell",
  component: NotificationBell,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Botón de campana para notificaciones ubicado en la navbar. Placeholder — la lógica de notificaciones se añadirá en una iteración posterior.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof NotificationBell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "Por defecto",
};
