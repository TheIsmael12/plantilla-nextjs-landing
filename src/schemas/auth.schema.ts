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
