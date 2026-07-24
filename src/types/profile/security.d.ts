/** Credenciales requeridas para desactivar la autenticación en dos pasos. */
export interface TwoFactorDisablePayload {
  password: string;
  code: string;
}

/** Datos devueltos al iniciar el alta de autenticación en dos pasos. */
export interface TwoFactorSetupData {
  secret: string;
  qrDataUri: string;
  /** URI `otpauth://` equivalente al QR, por si el cliente quiere generar su propio código o mostrarla como alternativa de copiado. */
  otpauthUri?: string;
}
