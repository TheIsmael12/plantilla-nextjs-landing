import * as Yup from "yup";

export const disableTwoFactorSchema = Yup.object().shape({
  password: Yup.string().required("security.passwordRequired"),
  code: Yup.string().required("security.codeRequired")
});
