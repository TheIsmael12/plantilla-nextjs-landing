import * as Yup from "yup";

/**
 * Regla de fuerza de contraseña exigida por el backend (`IsStrongPassword`):
 * mínimo 8 caracteres, al menos una mayúscula, una minúscula, un número y un
 * carácter especial. Se valida aquí también para dar feedback inmediato en
 * el formulario, no solo tras el rechazo del backend.
 */
const strongPassword = Yup.string()
  .min(8, "auth.passwordMinLength")
  .matches(/[a-z]/, "auth.passwordLowercase")
  .matches(/[A-Z]/, "auth.passwordUppercase")
  .matches(/\d/, "auth.passwordNumber")
  .matches(/[^A-Za-z0-9]/, "auth.passwordSpecialChar")
  .required("auth.passwordRequired");

export const loginSchema = Yup.object({
  taxId: Yup.string().trim().required("auth.taxIdRequired"),
  password: Yup.string().required("auth.passwordRequired"),
});

export const forgotPasswordSchema = Yup.object({
  taxId: Yup.string().trim().required("auth.taxIdRequired"),
});

export const resetPasswordSchema = Yup.object({
  newPassword: strongPassword,
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "auth.passwordsMustMatch")
    .required("auth.passwordRequired"),
});

export const changeRequiredPasswordSchema = resetPasswordSchema;

export const changePasswordSchema = Yup.object({
  currentPassword: Yup.string().required("auth.passwordRequired"),
  newPassword: strongPassword,
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "auth.passwordsMustMatch")
    .required("auth.passwordRequired"),
});

/**
 * Regla de fuerza de contraseña del vecino (`IsStrongPassword` del backend de comunidad): mínimo 8 caracteres,
 * mayúscula, minúscula y número. **Sin carácter especial**, a diferencia de `strongPassword` (portal de
 * cliente): son dos backends de auth distintos con sus propias reglas, y relajarla aquí sin que el backend la
 * exija habría dejado pasar contraseñas válidas para el formulario y rechazadas por la API.
 */
const residentPassword = Yup.string()
  .min(8, "auth.passwordMinLength")
  .matches(/[a-z]/, "auth.passwordLowercase")
  .matches(/[A-Z]/, "auth.passwordUppercase")
  .matches(/\d/, "auth.passwordNumber")
  .required("auth.passwordRequired");

/** Esquema de la contraseña nueva del vecino (`POST /residents/auth/reset-password`). */
export const residentResetPasswordSchema = Yup.object({
  newPassword: residentPassword,
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "auth.passwordsMustMatch")
    .required("auth.passwordRequired"),
});

/**
 * Esquema para aceptar una invitación de vecino (`POST /residents/auth/accept-invitation`) cuando la cuenta
 * **ya existe pero todavía no tiene forma de entrar**: sus datos no se piden, solo la contraseña.
 */
export const residentAcceptInvitationSchema = Yup.object({
  newPassword: residentPassword,
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "auth.passwordsMustMatch")
    .required("auth.passwordRequired"),
});

/**
 * Esquema para aceptar una invitación cuando la cuenta **es nueva**: además de la contraseña, pide los datos
 * de la persona, igual que el alta directa desde la intranet, pero sin unidad —esa la fija la invitación—.
 */
export const residentAcceptInvitationNewAccountSchema = Yup.object({
  name: Yup.string().trim().min(1, "auth.nameRequired").required("auth.nameRequired"),
  phone: Yup.string().trim(),
  newPassword: residentPassword,
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "auth.passwordsMustMatch")
    .required("auth.passwordRequired"),
});
