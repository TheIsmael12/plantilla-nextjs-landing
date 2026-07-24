import {
  InfoIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  AlertCircleIcon,
  OctagonAlertIcon,
  BellIcon,
  type LucideIcon,
} from "lucide-react";

import type { AlertType } from "@/types/ui/alerts/alert";

/**
 * Icono asociado a cada {@link AlertType}, usado por `components/ui/alerts/Alert.tsx`.
 */
export const ALERT_ICONS: Record<AlertType, LucideIcon> = {
  info: InfoIcon,
  success: CheckCircleIcon,
  warning: AlertTriangleIcon,
  error: AlertCircleIcon,
  danger: OctagonAlertIcon,
  neutral: BellIcon,
};
