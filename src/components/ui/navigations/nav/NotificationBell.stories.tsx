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
          "Botón de campana decorativo de la navbar pública, sin lógica: fuera del área privada no hay sesión con la que pedir notificaciones. La campana real del portal, con contador y desplegable, es `ClientNotificationBell`.",
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
